'use strict';
/**
 * @module crypto/keystore
 * @summary Whiteflag JS cryptographic keystore module
 */
export {
    KeyStoreCtrl,
    KeyStoreAccess,
    getWfKeyId
}

/* Dependecies */
import { WfKeyType, handleError } from '@whiteflagprotocol/common';
import { sleep } from '@whiteflagprotocol/util';
import {
    Hex,
    Base64,
    Base64url,
    isHex,
    isBase64u,
    noHexPrefix,
    b64ToU8a,
    b64uToObj,
    hexToU8a,
    objToB64u,
    objToU8a,
    stringToU8a,
    u8aToHex,
    u8aToB64,
    u8aToObj
} from "@whiteflagprotocol/util";

/* Module imports */
import { hash, hkdf } from "./hash.ts";
import { createAesKey } from './keys.ts';
import { random } from "./random.ts";
import { 
    AES_GCM,
    AES_GCM_IVLENGTH,
    AES_GCM_TAGLENGTH,
    BYTELENGTH
} from './constants.ts';

/* Constants */
const KEYID_LENGTH = 16;
const KEY_LENGTH = 32;
const MEK_DEFAULT = hexToU8a('7134c1d69c028774749d908b225538962e02b60d34dff85bafad4f06619d092c');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('9a4e59814a4ff35c144b69497662be365992853082f4e28f1b69e68adbc187dc');
const KEK_SALT = hexToU8a('524a64503fab03b4af21537fb85080e4c8b281f3a870885293c12f00b6c50f25');
const MEK_INFO = 'MEK-WfKeyStore'
const DEK_INFO = 'DEK-WfKeyStore'
const LOCK_SLEEPTIME = 50;

/* PRIVATE MODULE DATA */
/** The master encryption key */
let _masterKey: Uint8Array<ArrayBuffer> = MEK_DEFAULT;
/** The key store object holding all encrypted key data objects */
let _keyStore: Map<Hex,KeyStoreObject> = new Map();
/** Sealing the key store control prevents importing keys and changing master encryption key */
let _ctrlSeal: boolean = false;
/** Mutex variable to count active read-write operations, or set to -1 to lock */
let _mutex: number = 0;

/* MODULE DECLARATIONS */
/**
 * Represents an encrypted key in the vault
 * @interface KeyStoreObject
 * @remarks Uses base64 data encoding for safe and efficient use in objects
 */
interface KeyStoreObject {
    iv: Base64,
    data: Base64
}
/**
 * A class to control access to cryptographic keys and secrets
 * @class KeyStoreCtrl
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to control access to the Whiteflag keystore, by setting the
 * master encryption key, and to import and export the encrypted key store
 * data. It is therefore part of the main programming interface. It does not
 * expose functions providing access to keystore, because that is only
 * required for classes internally to manage their keys. In order to prevent
 * tampering with the key store after the initialisation, the key store
 * control may be sealed. Once sealed, it cannot be unsealed and only exports
 * are possible.
 */
class KeyStoreCtrl {
    /** Property to keep a single instance of the class */
    static #instance: KeyStoreCtrl;

    /* CONSTRUCTOR STATIC FACTORY METHOD */
    /**
     * Constructor for the keystore control object
     */
    private constructor() { Object.freeze(this); }
    /**
     * Static factory method always returning the same instance
     */
    public static getInstance() {
        if (!KeyStoreCtrl.#instance) KeyStoreCtrl.#instance = new KeyStoreCtrl();
        return KeyStoreCtrl.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /** 
     * Seals the key store control, preventing importing keys and changing the master key
     * @returns true if sealed, else false
     */
    public seal(): boolean {
        _ctrlSeal = true;
        return _ctrlSeal;
    }
    /** 
     * Indicates if the key store control is sealed
     * @returns true if sealed, else false
    */
    public isSealed(): boolean {
        return _ctrlSeal;
    }
    /**
     * Sets the master encryption key to access the keystore
     * @param rawKey the raw hexadecimal master key
     * @returns true is master encryption key is successfully set, else false (e.g. when sealed)
     */
    public async setMasterKey(rawKey: Hex): Promise<boolean> {
        if (this.isSealed()) return false;
        if (!isHex(rawKey)) throw new TypeError('Provided keystore master key is not hexdecimal encoded');

        /* Lock key store and re-key */
        let keyStore: Map<Hex,KeyStoreObject>;
        try {
            await lock();

            /* Generate new master key and re-encrypt keys */
            const newMek =  await generateMEK(MEK_INFO, hexToU8a(rawKey));
            keyStore = await recryptData(newMek);

            /* Swap key store and master key */
            _keyStore = keyStore;
            _masterKey = newMek;
        } catch(err) {
            return handleError(err, 'Could not re-encrypt keys with new master key');
        } finally {
            unlock();
        }
        return true;
    };
    /**
     * Imports the encrypted serialized keystore data
     * @param data the encrypted base64url encoded keystore data
     * @returns true if the import was successfull, else false (e.g. when sealed)
     */
    public async import(data: Base64url): Promise<boolean> {
        if (this.isSealed()) return false;
        if (!isBase64u(data)) throw new TypeError('Provided keystore data is not base64url encoded');

        /* Lock key store and perform import */
        let results: boolean[];
        let keyStore: Map<Hex,KeyStoreObject>;
        try {
            await lock();

            /* Decrypt imported key store */
            const dek = await generateDEK();
            const encrypted = b64uToObj(data) as KeyStoreObject;
            const decrypted = await decryptData(dek, encrypted);
            keyStore = new Map(u8aToObj(decrypted) as Array<any>);

            /* Upsert keys from imported key store */
            const batch: Promise<boolean>[] = [];
            for (const [kid, ekdo] of keyStore) {
                const kek = await generateKEK(kid);
                const rawKey = await decryptData(kek, ekdo);
                batch.push(upsertKey(kid, rawKey));
            }
            results = await Promise.all(batch);
        } catch(err) {
            return handleError(err, 'Could not import key store');
        } finally {
            unlock();
        }
        /* Return success */
        return results.every(result => result);
    }
    /**
     * Exports the encrypted serialsed keystore data
     * @returns the encrypted base64url encoded keystore data
     */
    public async export(): Promise<Base64url> {
        /* Encode and encrypt the keystore */
        let encrypted: KeyStoreObject;
        try {
            await lock();
            const dek = await generateDEK();
            const data = objToU8a(Array.from(_keyStore));
            encrypted = await encryptData(dek, data);
        } catch(err) {
            return handleError(err, 'Could not export key store');
        } finally {
            unlock();
        }
        /* Return the encrypted keystore as a Bas64url string */
        return objToB64u(encrypted);
    }
}
/**
 * A class to provide access to cryptographic keys and secrets
 * @class KeyStoreAccess
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to access the Whiteflag keystore, and should only be used by
 * specific classes that actually need to store and retrieve their keys.
 * Therefore it is not part of the main programming interface.
 */
class KeyStoreAccess {
    /** Property to keep a single instance of the class */
    static #instance: KeyStoreAccess;

    /* CONSTRUCTOR AND STATIC FACTORY METHOD */
    /**
     * Constructor for the keystore control object
     */
    private constructor() { Object.freeze(this); }
    /**
     * Static factory method always returning the same instance
     */
    public static getInstance() {
        if (!KeyStoreAccess.#instance) KeyStoreAccess.#instance = new KeyStoreAccess();
        return KeyStoreAccess.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Gets a key from the keystore
     * @param kid the unique hexadecimal key identifier
     * @returns the binary raw key from the keystore, or null if no key
     */
    public async getKey(kid: Hex): Promise<Uint8Array | null> {
        try {
            await track();
            return await getKey(kid);;
        } finally {
            untrack();
        }
    }
    /**
     * Upserts a key in the keystore
     * @param kid the unique hexadecimal key identifier
     * @param key the binary raw key to be stored in the keystore
     * @returns true if succesfull, else false
     */
    public async upsertKey(kid: Hex, key: Uint8Array<ArrayBuffer>): Promise<boolean> {
        try {
            await track();
            return await upsertKey(kid, key);
        } finally {
            untrack();
        }
    }
    /**
     * Removes a key from the keystore
     * @param kid the unique key identifier to be remnoved
     * @returns true if succesfull, else false
     */
    public async removeKey(kid: Hex): Promise<boolean> {
        try {
            await track();
            return await removeKey(kid);;
        } finally {
            untrack();
        }
    }
}

/* MODULE FUNCTIONS */
/**
 * Creates a unique identifier for a key or secret stored in the vault
 * @private
 * @param type the type of the key or secret, i.e. its usage for Whiteflag
 * @param info additional information about the key or secret, e.g. the address of the account it is bound to
 * @param length the length of the key id, default is 16 bytes (128 bits)
 * @returns the hexadecimal key id
 * @remarks Any unique hexedecimal key identifier works as a key identifier
 * for the key store, but this function is to ensure that all Whiteflag
 * packages, classes and functions create the key identifier in a similar
 * manner.
 */
async function getWfKeyId(type: WfKeyType, info: string, length = KEYID_LENGTH): Promise<Hex> {
    const kid = await hash(stringToU8a(type + info), length);
    return u8aToHex(kid);
}

/* PRIVATE FUNCTIONS */
/**
 * Locks the key store to prevent read-write operations
 * @private
 * @returns the resolved or rejected promise with the function result
 */
async function lock(): Promise<number> {
    await tracked();    // Wait until no more active read-write operations or locks
    return _mutex = -1;
}
/**
 * Locks the key store to prevent read-write operations
 * @private
 * @returns the resolved or rejected promise with the function result
 */
function unlock(): number {
    return _mutex = 0;
}
/**
 * Waits for the key store to unlock
 * @private
 * @returns the key store mutex value
 */
async function locked(): Promise<number> {
    while (_mutex < 0) await sleep(LOCK_SLEEPTIME);
    return _mutex;
}
/**
 * Set tracker for read-write operations
 * @private
 * @returns the key store mutex value
 */
async function track(): Promise<number> {
    await locked();      // Wait until no more lock
    return _mutex++;
}
/**
 * Unsets tracker for read-write operations
 * @private
 * @returns the key store mutex value
 */
function untrack(): number {
    return _mutex--;
}
/**
 * Waits for tracked read-write operations, including a lock, to finish
 * @private
 * @returns the key store mutex value
 */
async function tracked(): Promise<number> {
    while (_mutex !== 0) await sleep(LOCK_SLEEPTIME);
    return _mutex;
}
/**
 * Generates the master encrytion key
 * @private
 * @param info arbitrary inforamation that identifies the key
 * @param mek the raw master encryption key input material
 * @returns the master encryption key object
 */
async function generateMEK(info: string = MEK_INFO, mek: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    return hkdf(mek, MEK_SALT, stringToU8a(info), KEY_LENGTH);
}
/**
 * Generates the data encrytion key
 * @private
 * @param info arbitrary inforamation that identifies the key
 * @param mek the master encryption key
 * @returns the data encryption key object
 */
async function generateDEK(info: string = DEK_INFO, mek: Uint8Array<ArrayBuffer> = _masterKey): Promise<CryptoKey> {
    const rawDEK = await hkdf(mek, DEK_SALT, stringToU8a(info), KEY_LENGTH);
    return createAesKey(rawDEK, AES_GCM);
}
/**
 * Generates the key encrytion key
 * @private
 * @param kid the key identifier
 * @param mek the master encryption key
 * @returns the key encryption key object
 */
async function generateKEK(kid: Hex, mek: Uint8Array<ArrayBuffer> = _masterKey): Promise<CryptoKey> {
    const rawKEK = await hkdf(mek, KEK_SALT, hexToU8a(kid), KEY_LENGTH);
    return createAesKey(rawKEK, AES_GCM);
}
/**
 * Gets a key from the keystore
 * @param kid the unique hexadecimal key identifier
 * @returns the binary raw key from the keystore, or null if no key
 */
async function getKey(kid: Hex): Promise<Uint8Array | null> {
    /* Check key id and fetch key from the keystore */
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = _keyStore.get(id) as KeyStoreObject;

    /* Decrypt and return key */
    if (!ekdo) return null;
    try {
        return decryptData(kek, ekdo);
    } catch(err) {
        return handleError(err, 'Could not decrypt key in key store');
    }
}
/**
 * Upserts a key in the keystore
 * @param kid the unique hexadecimal key identifier
 * @param key the binary raw key to be stored in the keystore
 * @returns true if succesfull, else false
 */
async function upsertKey(kid: Hex, key: Uint8Array<ArrayBuffer>): Promise<boolean> {
    /* Check key id and encrypt key */
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = await encryptData(kek, key);

    /* Upsert the encrypted key in the keystore */
    try {
        _keyStore.set(id, ekdo);
        return true;
    } catch(err) {
        return handleError(err, 'Could not upsert key in key store');
    }
}
/**
 * Removes a key from the keystore
 * @param kid the unique key identifier to be remnoved
 * @returns true if succesfull, else false
 */
async function removeKey(kid: Hex): Promise<boolean> {
    /* Check key id and delete key */
    const id = checkKeyId(kid);
    return _keyStore.delete(id);
}
/**
 * Encrypts data to store in the keystore
 * @private
 * @param key the cryptographic key object (KEK or DEK) to encypt the key data
 * @param plain the plain key to be encrypted
 * @returns a key data object with the encrypted data and initialisation vector
 */
async function encryptData(key: CryptoKey, plain: Uint8Array<ArrayBuffer>): Promise<KeyStoreObject> {
    let encrypted: ArrayBuffer;
    const iv = random(AES_GCM_IVLENGTH / BYTELENGTH);

    /* Try to encrypt */
    try {
        encrypted = await crypto.subtle.encrypt(
            getAesParameters(iv), key, plain);
    } catch(err) {
        return handleError(err, 'Key store encryption error');
    }
    /* Return result */
    const data = new Uint8Array(encrypted);
    return {
        iv: u8aToB64(iv),
        data: u8aToB64(data)
    }
}
/**
 * Decypts data stored in the keystore
 * @private
 * @param key the cryptographic key object (KEK or DEK) to decrypt the key data
 * @param ekdo an encrypted key data object with the encrypted data and initialisation vector
 * @returns the decrypted key data
 */
async function decryptData(key: CryptoKey, ekdo: KeyStoreObject): Promise<Uint8Array<ArrayBuffer>> {
    let decrypted: ArrayBuffer;
    const iv = b64ToU8a(ekdo.iv);

    /* Try to decrypt */
    try {
        decrypted = await crypto.subtle.decrypt(
            getAesParameters(iv), key, b64ToU8a(ekdo.data));
    } catch(err) {
        return handleError(err, 'Key store decryption error');
    }
    /* Return result */
    return new Uint8Array(decrypted) 
}
/**
 * Re-encrypts the current key store with a new master encryption key
 * @private
 * @param mek the new master encryptipn key
 * @returns a new keystore
 */
async function recryptData(newMek: Uint8Array<ArrayBuffer>): Promise<Map<Hex,KeyStoreObject>> {
    let keyStore: Map<Hex,KeyStoreObject> = new Map();
    for await (const [kid, ekdo] of _keyStore) {
        const currentKek = await generateKEK(kid);
        const rawKey = await decryptData(currentKek, ekdo);
        const newKek = await generateKEK(kid, newMek);
        const newEkdo = await encryptData(newKek, rawKey);
        keyStore.set(kid, newEkdo);
    }
    return keyStore;
}
/**
 * Creates the algortihm parameter object for AES-GCM encryption
 * @private
 * @param iv the initialisation vector
 * @returns the AES-GCM algortihm parameter object
 */
function getAesParameters(iv: Uint8Array<ArrayBuffer>): AesGcmParams {
    return {
        name: AES_GCM,
        iv: iv.buffer,
        tagLength: AES_GCM_TAGLENGTH
    };
}
/**
 * Checks if the key identifier is hexadecimal encoded
 * @param kid the key identifier
 * @returns the hexadecimal key identifier without a hex prefix
 * @throws if the key identifier is not hexadecimal encoded
 */
function checkKeyId(kid: Hex): Hex {
    if (!isHex(kid)) throw new TypeError('Provided key identifier is not hexdecimal encoded');
    return noHexPrefix(kid);
}
