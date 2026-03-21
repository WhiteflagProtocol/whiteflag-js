'use strict';
/**
 * @module main/state
 * @summary Whiteflag JS state module
 */
export {
    WfState,
    WfStateData
};

/* Dependencies */
import { Address, handleError, WfRuntimeError } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';
import { EncryptedData, KeyStoreCtrl, generateDEK, encryptData, decryptData, hkdf } from '@whiteflagprotocol/crypto';
import { ByteArray, CollectionData, DataCollection, DataId, Hex, Serializable } from '@whiteflagprotocol/util';
import { sleep, noString, objectHas, hexToU8a, objToU8a, strToU8a, u8aToObj } from '@whiteflagprotocol/util';

/* Module imports */
import { WfBlockchainStatus } from './blockchain.ts';

/* Constants */
const KEY_LENGTH = 32;
const MEK_INFO = strToU8a('MEK-WfState');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('927ef470db1b182131ec04c30f7fe4d954215bb0a42e0a2015821a76d7030741');

/* Related singleton classes */
const keystore = KeyStoreCtrl.getInstance();

/* PRIVATE MODULE DATA */
/** The master encryption key */
let _masterKey: ByteArray;
/** Blockchain state */
let _blockchains = DataCollection.create() as DataCollection<WfBlockchainStatus>;
/** Known originators */
let _originators = DataCollection.create() as DataCollection<WfOriginator>;
/** Known blockchain accounts */
let _accounts = DataCollection.create() as DataCollection<WfAccount>;

/* MODULE DECLARATIONS */
/**
 * Whiteflag state data object as exported by the `WfState` class
 * @remarks The Whiteflag state returns this object when its data is
 * exported. The state data may be a plain data object or an encrypted
 * data object (the keystore data is always encrypted).
 */
interface WfStateData extends Serializable {
    _timestamp?: string;
    /** Plain or encrypted data object with the blockchain state */
    blockchains: CollectionData | EncryptedData;
    /** Plain or encrypted data object with the knwon originators */
    originators: CollectionData | EncryptedData;
    /** Plain or encrypted data object with the known blockchain accounts */
    accounts: CollectionData | EncryptedData;
    /** Encrypted keystore data object */
    secrets: EncryptedData;
}
/**
 * The Whiteflag protocol state
 * @remarks This singleton class defines an object that holds the current
 * Whiteflag state. It holds account data, keeps track of other originators
 * and processes incoming messages.
 */
class WfState {
    /** Singleton instantiation token */
    static #sit: Symbol = Symbol('WfState');
    /** Property to keep a single instance of the class */
    static #instance: WfState;

    /* CONSTRUCTOR AND STATIC FACTORY METHOD */
    /**
     * Constructs the Whiteflag protocol state
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== WfState.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag state');
        }
        Object.freeze(this);
    }
    /**
     * Initializes the Whiteflag protocol state
     * @param masterKey the raw master encryption key
     * @param data the Whiteflag state data object
     * @returns the Whiteflag protocol state singular instance
     */
    public static async init(masterKey: Hex, data?: WfStateData): Promise<WfState> {
        /* Cannot initialize again */
        if (this.#instance) {
            throw new WfRuntimeError('Whiteflag state has already been initialized');
        }
        /* Set master key */
        try {
            await setMasterKey(masterKey);
        } catch(err) {
            handleError(err, 'Cannot set Whiteflag state master encryption key');
        }
        /* Import state data */
        try {
            if (data) await importData(data);
        } catch(err) {
            handleError(err, 'Error importing Whiteflag state data');
        }
        /* Seal keystore control and create state */
        keystore.seal();
        return this.#instance = new WfState(this.#sit);
    }
    /**
     * Gets the Whiteflag protocol state
     * @returns the Whiteflag protocol state singular instance
     */
    public static getInstance(): WfState {
        if (!this.#instance) {
            throw new WfRuntimeError('Whiteflag state has not been been initialized');
        }
        return this.#instance;
    }
    /**
     * Waits for the initialized Whiteflag protocol state
     * @returns the Whiteflag protocol state singular instance
     */
    public static async readyInstance(): Promise<WfState> {
        while (!this.#instance) await sleep(50);
        return this.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Exports the Whiteflag protocol state
     * @param encrypt indicates if the export must be encrypted
     * @returns the Whiteflag state data object
     */
    public async export(encrypt: boolean = true): Promise<WfStateData> {
        /* Gather state data collections */
        const batch = [
            exportCollection(_blockchains, encrypt, 'WfBlockchainState'),   // [0]
            exportCollection(_originators, encrypt, 'WfOriginatorState'),   // [1]
            exportCollection(_accounts, encrypt, 'WfAccountState'),         // [2]
            keystore.export()                                               // [3]
        ]
        /* Export all data collections */
        let data: Array<any> = [];
        try {
            data = await Promise.all(batch);
        } catch(err) {
            handleError(err, 'Cannot export Whiteflag state');
        }
        /* Return the full exportable state */
        return {
            _timestamp: new Date().toISOString(),
            blockchains: data[0],
            originators: data[1], 
            accounts: data[2],
            secrets: data[3]
        }
    }
    /**
     * Get a blockchain state from the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns the blockchain state, or `null` if not found
     */
    public getBlockchainStatus(blockchain: string): WfBlockchainStatus | null {
        return _blockchains.retrieve(blockchain);
    }
    /**
     * Upserts a blockchain account in the Whiteflag state
     * @param status the blockchain status
     * @returns the blockchain state data item identifier, i.e. the blockchain name
     */
    public upsertBlockchainStatus(status: WfBlockchainStatus): string {
        return _blockchains.upsert(status);
    }
    /**
     * Get a blockchain account from the Whiteflag state
     * @param address the address of the account
     * @returns the account, or `null` if not found
     */
    public getAccount(address: Address): WfAccount | null {
        return _accounts.retrieve(address);
    }
    /**
     * Upserts a blockchain account in the Whiteflag state
     * @param account a Whiteflag blockchain account
     * @returns the account data item identifier, i.e. the blockchain address
     */
    public upsertAccount(account: WfAccount): DataId | Address {
        return _accounts.upsert(account);
    }
    /**
     * Upserts an originator in the Whiteflag state
     * @param address the address of the account
     * @returns the originator data item identifier
     */
    public getOriginator(address: Address): WfOriginator | null {
        for (const originator of _originators.items()) {
            if (originator.ownsAccount(address)) return originator;
        }
        return null;
    }
    /**
     * Upserts an originator in the Whiteflag state
     * @param id the identifier of the originator
     * @returns the originator data item identifier
     */
    public getOriginatorById(id: DataId): WfOriginator | null {
        return _originators.retrieve(id);
    }
    /**
     * Upserts an originator in the Whiteflag state
     * @param originator a Whiteflag originator
     * @returns the originator data item identifier
     */
    public upsertOriginator(originator: WfOriginator): DataId {
        return _originators.upsert(originator);
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Sets master keys
 * @private
 * @param masterKey the raw master encryption key
 * @returns true if successful
 */
async function setMasterKey(masterKey: Hex): Promise<boolean> {
    /* Set state master key */
    const rawKey = hexToU8a(masterKey);
    _masterKey = await generateMEK(rawKey);

    /* Set keystore master key*/
    const success = await keystore.setMasterKey(rawKey)
    if (!success) throw new Error('Could not set keystore master key');

    /* Done */
    return true;
}
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
 * Imports state data
 * @private
 * @param data the Whiteflag state data object
 * @returns true if successful
 */
async function importData(data: WfStateData): Promise<boolean> {
    /* Import collections */
    if (data?.blockchains) {
        _blockchains = await importCollection(data.blockchains) as DataCollection<WfBlockchainStatus>;
    }
    if (data?.originators) {
        _originators = await importCollection(data.originators) as DataCollection<WfOriginator>;
    }
    if (data?.accounts) {
        _accounts = await importCollection(data.accounts) as DataCollection<WfAccount>;
    }
    /* Import keystore */
    if (data?.secrets) {
        const success = await keystore.import(data?.secrets);
        if (!success) throw new Error('Could not import keystore data')
    }
    /* Done */
    return true;
}
/**
 * Creates a collection for import into the Whiteflag state
 * @param data an object with the plain or encrypted collection data
 * @returns the imported collection
 */
async function importCollection(data: CollectionData | EncryptedData): Promise<DataCollection<any>> {
    /* Determine if data is encrypted */
    let collection: CollectionData;
    if (objectHas(data, 'encrypted')) {
        collection = await decryptCollection(data as EncryptedData);
    } else {
        collection = data as CollectionData;
    }
    /* Create data collection fom data */
    return DataCollection.fromObject(collection);
}
/**
 * Prepares a collection for export of the Whiteflag state
 * @private
 * @param collection the collection to be exported
 * @param encrypt indicates if the export must be encrypted
 * @param info information identifying the collection
 * @returns an object with the plain or encrypted collection data
 */
async function exportCollection(collection: DataCollection<any>, encrypt: boolean, info: string): Promise<CollectionData | EncryptedData> {
    const data = collection.toObject();
    if (!encrypt) return data;
    return encryptCollection(data, info);
}
/**
 * Encrypts a data collection
 * @private
 * @param collection the data collection to be encrypted
 * @param info information that identifies the data encryption key
 * @returns a data object with the encrypted collection and initialisation vector
 */
async function encryptCollection(collection: CollectionData, info: string): Promise<EncryptedData> {
    /* Get data encryption key */
    const dek = await generateDEK(_masterKey, strToU8a(info), DEK_SALT);

    /* Encode data and encrypt */
    const data = objToU8a(collection);
    return encryptData(dek, data, info);
}
/**
 * Decrypts a data collection
 * @private
 * @param data a data object with the encrypted data and initialisation vector
 * @returns the decrypted data collection encrypted
 */
async function decryptCollection(esdo: EncryptedData): Promise<CollectionData> {
    /* Get data encryption key */
    const info = esdo?.info || noString('Encrypted data collection has no info property');
    const dek = await generateDEK(_masterKey, strToU8a(info), DEK_SALT);

    /* Decrypt and decode collection data */
    const collection = await decryptData(dek, esdo);
    return u8aToObj(collection) as CollectionData;
}
