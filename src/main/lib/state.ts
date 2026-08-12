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
import { Address, WfRuntimeError, handleError, noString } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';
import { EncryptedData, KeyStoreCtrl, generateDEK, encryptData, decryptData, hkdf } from '@whiteflagprotocol/crypto';
import { ByteArray, CollectionData, DataCollection, DataId, posixtime, Hex, Serializable } from '@whiteflagprotocol/util';
import { delay, objectHas, getPosixEpoch, hexToU8a, objToU8a, strToU8a, u8aToObj } from '@whiteflagprotocol/util';

/* Package modules */
import { WfBlockchainState } from './blockchain.ts';
import { WfEvent, WfEventEmitter } from './events.ts';

/* Constants */
const DELAYTIME = 50;
const KEY_LENGTH = 32;
const MEK_INFO = strToU8a('MEK-WfState');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('927ef470db1b182131ec04c30f7fe4d954215bb0a42e0a2015821a76d7030741');

/* Related singleton classes */
const wfKeystore = KeyStoreCtrl.getInstance();
const wfEvent: WfEventEmitter = WfEventEmitter.getInstance();

/* PRIVATE MODULE DATA */
/** The master encryption key */
let _masterKey: ByteArray;
/** Blockchain state */
let _blockchains = DataCollection.create() as DataCollection<WfBlockchainState>;
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
    /** The POSIX epoch timestamp */
    _timestamp: posixtime;
    /** Plain or encrypted data object with the blockchain state */
    blockchains: CollectionData | EncryptedData;
    /** Plain or encrypted data object with the known originators */
    originators: CollectionData | EncryptedData;
    /** Plain or encrypted data object with the known blockchain accounts */
    accounts: CollectionData | EncryptedData;
    /** Encrypted keystore data object */
    secrets: EncryptedData;
}
/**
 * The Whiteflag state
 * @remarks This singleton class defines an object that holds the current
 * Whiteflag state. It holds account data, keeps track of other originators
 * and processes incoming messages.
 */
class WfState {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('WfState');
    /** Property to keep a single instance of the class */
    static #instance: WfState;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the Whiteflag state
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== WfState.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag state');
        }
        Object.freeze(this);
    }
    /**
     * Initializes the Whiteflag state
     * @param masterKey the raw master encryption key
     * @param data the Whiteflag state data object
     * @returns the Whiteflag state singular instance
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
            return handleError(err, 'Cannot set Whiteflag state master encryption key');
        }
        /* Import state data */
        try {
            if (data) await importData(data);
        } catch(err) {
            return handleError(err, 'Error importing Whiteflag state data');
        }
        /* Seal keystore control and create state */
        wfKeystore.seal();
        this.#instance = new WfState(this.#sit);
        wfEvent.emit(WfEvent.STATE_INITIALIZED, this.#instance);
        return this.#instance;
    }
    /**
     * Gets the Whiteflag state
     * @returns the Whiteflag state singular instance
     * @throws if the Whiteflag state has not been initialized
     */
    public static getInstance(): WfState {
        if (!this.#instance) {
            throw new WfRuntimeError('Whiteflag state has not been been initialized');
        }
        return this.#instance;
    }
    /**
     * Waits for the initialized Whiteflag state
     * @returns the Whiteflag state singular instance
     * @remarks This is a safer method to get the Whiteflag state
     * instance, because it waits for the Whiteflag state to have been
     * initialized.
     */
    public static async readyInstance(): Promise<WfState> {
        while (!this.#instance) await delay(DELAYTIME);
        return this.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Exports the Whiteflag state
     * @param encrypt indicates if the export must be encrypted
     * @returns the Whiteflag state data object
     */
    public async export(encrypt: boolean = true): Promise<WfStateData> {
        /* Gather state data collections */
        const batch = [
            exportCollection(_blockchains, encrypt, 'WfBlockchainState'),   // [0]
            exportCollection(_originators, encrypt, 'WfOriginatorState'),   // [1]
            exportCollection(_accounts, encrypt, 'WfAccountState'),         // [2]
            wfKeystore.export()                                             // [3]
        ]
        /* Export all data collections */
        let data: Array<any> = [];
        try {
            data = await Promise.all(batch);
        } catch(err) {
            return handleError(err, 'Cannot export Whiteflag state');
        }
        /* Return the full exportable state */
        return {
            _timestamp: getPosixEpoch(),
            blockchains: data[0],
            originators: data[1], 
            accounts: data[2],
            secrets: data[3]
        }
    }
    /**
     * Checks for the blockchain state in the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns `true` if the blockchain exists in the state, else `false`
     */
    public hasBlockchain(blockchain: string): boolean {
        return _blockchains.exists(blockchain);
    }
    /**
     * Get a blockchain state from the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns the blockchain state, or `null` if not found
     */
    public getBlockchain(blockchain: string): WfBlockchainState | null {
        return _blockchains.retrieve(blockchain);
    }
    /**
     * Upserts a blockchain state in the Whiteflag state
     * @param status the blockchain status
     * @returns the blockchain state data item identifier, i.e. the blockchain name
     */
    public upsertBlockchain(status: WfBlockchainState): string {
        return _blockchains.upsert(status);
    }
    /**
     * Creates a new empty blockchain state, if not yet existing
     * @param blockchain the name of the new blockchain
     * @returns the blockchain state data item identifier, or null if none created
     */
    public createBlockchain(blockchain: string): string | null {
        if (_blockchains.exists(blockchain)) return null;
        return _blockchains.upsert(
            WfBlockchainState.create(blockchain)
        );
    }
    /**
     * Checks for the account in the Whiteflag state
     * @param address the address of the account
     * @returns `true` if the account exists in the state, else `false`
     */
    public hasAccount(address: Address): boolean {
        return _accounts.exists(address);
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
    const success = await wfKeystore.setMasterKey(rawKey)
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
    if (data.blockchains) {
        _blockchains = await importCollection(data.blockchains) as DataCollection<WfBlockchainState>;
    }
    if (data.originators) {
        _originators = await importCollection(data.originators) as DataCollection<WfOriginator>;
    }
    if (data.accounts) {
        _accounts = await importCollection(data.accounts) as DataCollection<WfAccount>;
    }
    /* Import keystore */
    if (data.secrets) {
        const success = await wfKeystore.import(data.secrets);
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
 * @returns a data object with the encrypted collection and initialization vector
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
 * @param data a data object with the encrypted data and initialization vector
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
