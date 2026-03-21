/**
 * @module main/state
 * @summary Whiteflag JS state module
 */
export { WfState, WfStateData };
import { Address } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';
import { EncryptedData } from '@whiteflagprotocol/crypto';
import { CollectionData, DataId, Hex, Serializable } from '@whiteflagprotocol/util';
import { WfBlockchainStatus } from './blockchain.ts';
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
     */
    static getInstance(): WfState;
    /**
     * Waits for the initialized Whiteflag protocol state
     * @returns the Whiteflag protocol state singular instance
     */
    static readyInstance(): Promise<WfState>;
    /**
     * Exports the Whiteflag protocol state
     * @param encrypt indicates if the export must be encrypted
     * @returns the Whiteflag state data object
     */
    export(encrypt?: boolean): Promise<WfStateData>;
    /**
     * Get a blockchain state from the Whiteflag state
     * @param blockchain the name of the blockchain
     * @returns the blockchain state, or `null` if not found
     */
    getBlockchainStatus(blockchain: string): WfBlockchainStatus | null;
    /**
     * Upserts a blockchain account in the Whiteflag state
     * @param status the blockchain status
     * @returns the blockchain state data item identifier, i.e. the blockchain name
     */
    upsertBlockchainStatus(status: WfBlockchainStatus): string;
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
