/**
 * @module main/state
 * @summary Whiteflag JS state module
 * @todo State closure?
 */
export { WfState, WfStateData };
import { Address } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';
import { EncryptedData } from '@whiteflagprotocol/crypto';
import { CollectionData, DataId, posixtime, Hex, Serializable } from '@whiteflagprotocol/util';
import { WfBlockchainState } from './blockchain.ts';
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
 * The Whiteflag protocol state
 * @remarks This singleton class defines an object that holds the current
 * Whiteflag state. It holds account data, keeps track of other originators
 * and processes incoming messages.
 */
declare class WfState {
    #private;
    /**
     * Constructs the Whiteflag protocol state
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Initializes the Whiteflag protocol state
     * @param masterKey the raw master encryption key
     * @param data the Whiteflag state data object
     * @returns the Whiteflag protocol state singular instance
     */
    static init(masterKey: Hex, data?: WfStateData): Promise<WfState>;
    /**
     * Gets the Whiteflag protocol state
     * @returns the Whiteflag protocol state singular instance
     * @throws if the Whiteflag state has not been initialized
     */
    static getInstance(): WfState;
    /**
     * Waits for the initialized Whiteflag protocol state
     * @returns the Whiteflag protocol state singular instance
     * @remarks This is a safer method to get the Whiteflag protocol state
     * instance, because it waits for the Whiteflag state to have been
     * initialized.
     */
    static readyInstance(): Promise<WfState>;
    /**
     * Exports the Whiteflag protocol state
     * @param encrypt indicates if the export must be encrypted
     * @returns the Whiteflag state data object
     */
    export(encrypt?: boolean): Promise<WfStateData>;
    /**
     * Checks for the blockchain state in the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns `true` if the blockchain exists in the state, else `false`
     */
    hasBlockchain(blockchain: string): boolean;
    /**
     * Get a blockchain state from the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns the blockchain state, or `null` if not found
     */
    getBlockchain(blockchain: string): WfBlockchainState | null;
    /**
     * Upserts a blockchain state in the Whiteflag state
     * @param status the blockchain status
     * @returns the blockchain state data item identifier, i.e. the blockchain name
     */
    upsertBlockchain(status: WfBlockchainState): string;
    /**
     * Creates a new empty blockchain state, if not yet existing
     * @param blockchain the name of the new blockchain
     * @returns the blockchain state data item identifier, or null if none created
     */
    createBlockchain(blockchain: string): string | null;
    /**
     * Checks for the account in the Whiteflag state
     * @param address the address of the account
     * @returns `true` if the account exists in the state, else `false`
     */
    hasAccount(address: Address): boolean;
    /**
     * Get a blockchain account from the Whiteflag state
     * @param address the address of the account
     * @returns the account, or `null` if not found
     */
    getAccount(address: Address): WfAccount | null;
    /**
     * Upserts a blockchain account in the Whiteflag state
     * @param account a Whiteflag blockchain account
     * @returns the account data item identifier, i.e. the blockchain address
     */
    upsertAccount(account: WfAccount): DataId | Address;
    /**
     * Upserts an originator in the Whiteflag state
     * @param address the address of the account
     * @returns the originator data item identifier
     */
    getOriginator(address: Address): WfOriginator | null;
    /**
     * Upserts an originator in the Whiteflag state
     * @param id the identifier of the originator
     * @returns the originator data item identifier
     */
    getOriginatorById(id: DataId): WfOriginator | null;
    /**
     * Upserts an originator in the Whiteflag state
     * @param originator a Whiteflag originator
     * @returns the originator data item identifier
     */
    upsertOriginator(originator: WfOriginator): DataId;
}
