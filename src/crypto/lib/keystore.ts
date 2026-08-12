'use strict';
/**
 * @module crypto/keystore
 * @summary Whiteflag JS cryptographic keystore module
 */
export {
    KeyId,
    KeyStoreCtrl,
    KeyStoreAccess,
    getWfKeyId
}

/* Dependecies */
import { WfKeyType, WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { ByteArray, Base64url, isBase64u, isByteArray, Mutex } from '@whiteflagprotocol/util';
import { b64uToU8a, hexToU8a, mapToU8a, strToU8a, u8aToB64u, u8aToMap } from '@whiteflagprotocol/util';

/* Package modules */
import { hash, hkdf } from './hash.ts';
import {
    EncryptedData,
    generateDEK,
    encryptData,
    decryptData
} from './encrypt.ts';

/* Constants */
const KEY_LENGTH = 32;
const KEYID_LENGTH = 16;
const MEK_DEFAULT = hexToU8a('7134c1d69c028774749d908b225538962e02b60d34dff85bafad4f06619d092c');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('9a4e59814a4ff35c144b69497662be365992853082f4e28f1b69e68adbc187dc');
const KEK_SALT = hexToU8a('524a64503fab03b4af21537fb85080e4c8b281f3a870885293c12f00b6c50f25');
const MEK_INFO = strToU8a('MEK-WfKeyStore');
const DEK_INFO = strToU8a('DEK-WfKeyStore');

/* PRIVATE MODULE DATA */
/** The master encryption key */
let _masterKey: ByteArray = MEK_DEFAULT;
/** The keystore object holding all encrypted key data objects */
let _keyStore: Map<KeyId,EncryptedData> = new Map();
/** Sealing the keystore control prevents importing keys and changing master encryption key */
let _ctrlSeal: boolean = false;
/** Mutex object to protect the keystore from possibly conflicting read-write operations */
let _mutex: Mutex = new Mutex();

/* MODULE DECLARATIONS */
/** A unique value to identify a key in the keystore */
type KeyId = Base64url;

/**
 * The keystore access control to import and export cryptographic keys and secrets
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to control access to the Whiteflag keystore, by setting the
 * master encryption key, and importing and exporting the encrypted keystore
 * data. It is therefore part of the main programming interface. It does not
 * expose functions providing access to keystore, because that is only
 * required for classes internally to manage their keys. In order to prevent
 * tampering with the keystore after the initialization, the keystore
 * control may be sealed. Once sealed, it cannot be unsealed and only exports
 * of encrypted keys are possible.
 */
class KeyStoreCtrl {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('KeyStoreCtrl');
    /** Property to keep a single instance of the class */
    static #instance: KeyStoreCtrl;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the keystore control
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== KeyStoreCtrl.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag keystore control');
        }
        Object.freeze(this);
    }
    /**
     * Gets the controls of the keystore
     * @returns the keystore control singular instance
     */
    public static getInstance(): KeyStoreCtrl {
        return this.#instance ??= new KeyStoreCtrl(this.#sit);
    }

    /* PUBLIC CLASS METHODS */
    /** 
     * Seals the keystore control, preventing importing keys and changing the master key
     * @returns `true` if sealed, else `false`
     */
    public seal(): boolean {
        _ctrlSeal = true;
        return _ctrlSeal;
    }
    /** 
     * Indicates if the keystore control is sealed
     * @returns `true` if sealed, else `false`
    */
    public isSealed(): boolean {
        return _ctrlSeal;
    }
    /**
     * Sets the master encryption key to access the keystore
     * @param masterKey the new master encryption key
     * @returns `true` is master encryption key is successfully set, else `false` (e.g. when sealed)
     */
    public async setMasterKey(masterKey: ByteArray): Promise<boolean> {
        if (this.isSealed()) return false;
        if (!isByteArray(masterKey)) throw new TypeError('Provided master key is not an 8-bit unsigned integer typed array');

        /* Lock keystore and re-key */
        let keyStore: Map<KeyId,EncryptedData>;
        try {
            await _mutex.lock();

            /* Generate new master key and re-encrypt keys */
            const mek =  await generateMEK(masterKey);
            keyStore = await recryptData(mek);

            /* Swap keystore and master key */
            _keyStore = keyStore;
            _masterKey = mek;
        } catch(err) {
            return handleError(err, 'Could not re-encrypt keys with new master key');
        } finally {
            _mutex.unlock();
        }
        return true;
    };
    /**
     * Imports the encrypted serialized keystore data
     * @param ekdo the encrypted keystore data object
     * @returns `true` if the import was successfull, else `false` (e.g. when sealed)
     */
    public async import(ekdo: EncryptedData): Promise<boolean> {
        if (this.isSealed()) return false;

        /* Lock keystore and perform import */
        let results: boolean[];
        let keyStore: Map<KeyId,EncryptedData>;
        try {
            await _mutex.lock();

            /* Decrypt imported keystore */
            const dek = await generateDEK(_masterKey, DEK_INFO, DEK_SALT);
            const data = await decryptData(dek, ekdo);
            keyStore = u8aToMap(data);

            /* Upsert keys from imported keystore */
            const batch: Promise<boolean>[] = [];
            for (const [kid, ekdo] of keyStore) {
                const kek = await generateKEK(kid);
                const rawKey = await decryptData(kek, ekdo);
                batch.push(upsertKey(kid, rawKey));
            }
            results = await Promise.all(batch);
        } catch(err) {
            return handleError(err, 'Could not import keystore');
        } finally {
            _mutex.unlock();
        }
        /* Return success */
        return results.every(result => result);
    }
    /**
     * Exports the encrypted serialized keystore data
     * @returns a data object with the encrypted keystore and initialization vector
     */
    public async export(): Promise<EncryptedData> {
        /* Encode and encrypt the keystore */
        let ekdo: EncryptedData;
        try {
            await _mutex.lock();
            const dek = await generateDEK(_masterKey, DEK_INFO, DEK_SALT);
            const data = mapToU8a(_keyStore);
            ekdo = await encryptData(dek, data);
        } catch(err) {
            return handleError(err, 'Could not export keystore');
        } finally {
            _mutex.unlock();
        }
        /* Return the encrypted keystore */
        return ekdo;
    }
}
/**
 * The keystore access to store and retrieve cryptographic keys and secrets
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to access the Whiteflag keystore, and should only be used by
 * specific classes that actually need to store and retrieve their keys.
 * Therefore it is not part of the main programming interface.
 */
class KeyStoreAccess {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('KeyStoreAccess');
    /** Property to keep a single instance of the class */
    static #instance: KeyStoreAccess;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the keystore access object
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== KeyStoreAccess.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag keystore access object');
        }
        Object.freeze(this);
    }
    /**
     * Gets access to the keystore
     * @returns the keystore access singular instance
     */
    public static getInstance(): KeyStoreAccess {
        if (!KeyStoreAccess.#instance) {
            KeyStoreAccess.#instance = new KeyStoreAccess(this.#sit);
        }
        return KeyStoreAccess.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Gets a key from the keystore
     * @param kid the unique base64url key identifier
     * @returns the binary raw key from the keystore, or `null` if no key
     * @throws if the keystore is not accessible
     */
    public async getKey(kid: KeyId | null): Promise<ByteArray | null> {
        if (!kid) return null;
        try {
            await _mutex.track();
            return await getKey(kid);
        } finally {
            _mutex.untrack();
        }
    }
    /**
     * Upserts a key in the keystore
     * @param kid the unique base64url key identifier
     * @param key the binary raw key to be stored in the keystore
     * @returns the key identifier
     * @throws if the keystore is not accessible
     */
    public async upsertKey(kid: KeyId, key: ByteArray): Promise<KeyId> {
        try {
            await _mutex.track();
            await upsertKey(kid, key);
            return kid;
        } finally {
            _mutex.untrack();
        }
    }
    /**
     * Removes a key from the keystore
     * @param kid the unique base64url identifier of the key to be remnoved
     * @returns `true` if succesfull, else `false`
     * @throws if the keystore is not accessible
     */
    public async removeKey(kid: KeyId): Promise<boolean> {
        try {
            await _mutex.track();
            return await removeKey(kid);
        } finally {
            _mutex.untrack();
        }
    }
}

/* MODULE FUNCTIONS */
/**
 * Creates a unique identifier for a key or secret stored in the vault
 * @param type the type of the key or secret, i.e. its usage for Whiteflag
 * @param info additional information about the key or secret, e.g. the address of the account it is bound to
 * @param length the length of the key id, default is 16 bytes (128 bits)
 * @returns the base64url key id
 * @remarks Any unique base64url value works as a key identifier for the
 * keystore, but this function is to ensure that all Whiteflag packages,
 * classes and functions create the key identifier in a similar manner.
 */
async function getWfKeyId(type: WfKeyType, info: string, length: number = KEYID_LENGTH): Promise<KeyId> {
    const kid = await hash(strToU8a(type + info), length);
    return u8aToB64u(kid);
}

/* PRIVATE FUNCTIONS */
/**
 * Generates the master encryption key from basic key material
 * @private
 * @param mek the raw master encryption key input material
 * @returns the master encryption key object
 */
async function generateMEK(mek: ByteArray): Promise<ByteArray> {
    return hkdf(mek, MEK_SALT, MEK_INFO, KEY_LENGTH);
}
/**
 * Generates the key encryption key
 * @private
 * @param kid the key identifier
 * @param mek the master encryption key
 * @returns the key encryption key object
 */
async function generateKEK(kid: KeyId, mek: ByteArray = _masterKey): Promise<CryptoKey> {
    const info = b64uToU8a(kid);
    return generateDEK(mek, info, KEK_SALT);
}
/**
 * Gets a key from the keystore
 * @param kid the unique base64url key identifier
 * @returns the binary raw key from the keystore, or `null` if no key
 */
async function getKey(kid: KeyId): Promise<ByteArray | null> {
    /* Check key id and fetch key from the keystore */
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = _keyStore.get(id) as EncryptedData;

    /* Decrypt and return key */
    if (!ekdo) return null;
    return decryptData(kek, ekdo).catch(err => handleError(err, 'Could not decrypt key in keystore'));
}
/**
 * Upserts a key in the keystore
 * @param kid the unique base64url key identifier
 * @param key the binary raw key to be stored in the keystore
 * @returns `true` if succesfull, else `false`
 */
async function upsertKey(kid: KeyId, key: ByteArray): Promise<boolean> {
    /* Check key id and encrypt key */
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = await encryptData(kek, key);

    /* Upsert the encrypted key in the keystore */
    try {
        _keyStore.set(id, ekdo);
        return true;
    } catch(err) {
        return handleError(err, 'Could not upsert key in keystore');
    }
}
/**
 * Removes a key from the keystore
 * @param kid the unique key identifier to be remnoved
 * @returns `true` if succesfull, else `false`
 */
async function removeKey(kid: KeyId): Promise<boolean> {
    /* Check key id and delete key */
    const id = checkKeyId(kid);
    return _keyStore.delete(id);
}
/**
 * Re-encrypts the current keystore with a new master encryption key
 * @private
 * @param mek the new master encryptipn key
 * @returns a new keystore
 */
async function recryptData(newMek: ByteArray): Promise<Map<KeyId,EncryptedData>> {
    let keyStore: Map<KeyId,EncryptedData> = new Map();
    for (const [kid, ekdo] of _keyStore) {
        const currentKek = await generateKEK(kid);
        const rawKey = await decryptData(currentKek, ekdo);
        const newKek = await generateKEK(kid, newMek);
        const newEkdo = await encryptData(newKek, rawKey);
        keyStore.set(kid, newEkdo);
    }
    return keyStore;
}
/**
 * Checks if the key identifier is base64url encoded
 * @param kid the key identifier
 * @returns the base64url encoded key identifier
 * @throws if the key identifier is not base64url encoded
 */
function checkKeyId(kid: Base64url): KeyId {
    if (!isBase64u(kid)) throw new TypeError('Provided key identifier is not Base64url encoded');
    return kid;
}
