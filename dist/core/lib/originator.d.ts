/**
 * @module core/originator
 * @summary Whiteflag JS core originator module
 */
export { WfOriginator, WfOriginatorData };
import { Address } from '@whiteflagprotocol/common';
import { KeyId } from '@whiteflagprotocol/crypto';
import { Base64, DataItem, DataId, Hex, Json, Serializable } from '@whiteflagprotocol/util';
/**
 * Whiteflag originator data structure as used by the `WfOriginator` class
 */
interface WfOriginatorData extends Serializable {
    /** The name of the originator */
    name: string;
    /** The blockchain accounts addresses of
     *  the originator */
    accounts: Address[];
    /** The identifier of the pre-sahered encryption
     *  key of the originator */
    pskId?: KeyId;
    /** The identifier of the pre-shared seceret for
     *  authentication of the originator */
    pssId?: KeyId;
}
/**
 * An organisation or person sending Whiteflag messages
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a Whiteflag participant, e.g. a person or
 * organisation, that sends Whiteflag messages on a blockchain. An originator
 * may use multiple blockchain accounts.
 */
declare class WfOriginator extends DataItem<WfOriginatorData> {
    #private;
    /**
     * Constructs an originator
     * @param data the serialized originator data
     * @param id a unique identifier for the originator; automatically generated if not specified
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfOriginatorData, id?: DataId);
    /**
     * Returns the originator name as a property
     */
    get name(): string;
    /**
     * Creates a new originator
     * @param name a human readible name for the originator
     * @returns the originator
     */
    static create(name: string): WfOriginator;
    /**
     * Deserializes the originator data
     * @param data the base64 encoded JSON serialized originator data
     * @returns the originator
     */
    static deserialize(data: Base64, id: DataId): WfOriginator;
    /**
     * Creates an originator from a JSON serialized object
     * @param data the JSON serialized object
     * @param id the unique identifier of the originator
     * @returns a new data item
     */
    static fromJson(data: Json, id?: DataId): WfOriginator;
    /**
     * Creates an originator from a plain JavaScript object
     * @param data a plain JavaScript object with the originator data
     * @param id the unique identifier of the originator
     * @returns a new blockchain account
     */
    static fromObject(data: WfOriginatorData, id?: DataId): WfOriginator;
    /**
     * Provides the name of the originator
     * @param name a human readible name for the originator
     * @returns the human readible name of the originator
     */
    setName(name: string): string;
    /**
     * Provides the name of the originator
     * @returns the human readible name of the originator
     */
    getName(): string;
    /**
     * Adds an account to the originator, if not yet owned
     * @param address the address of the account owned by the originator
     * @returns the number of accounts
     */
    addAccount(address: Address): number;
    /**
     * Lists the addresses of the accounts of the originator
     * @returns an array of account addresses
     */
    listAccounts(): Array<Address>;
    /**
     * Checks if the originator owns the specified account
     * @param address the address of the account
     * @returns `true` if the originator owns the account, else `false`
     */
    ownsAccount(address: Address): boolean;
    /**
     * Stores a pre-shared encryption key for this originator
     * @param psk a pre-shared key
     * @returns `true` if succesfully stored
     */
    storePSK(psk: Hex): Promise<boolean>;
    /**
     * Removes a pre-shared encryption key for this originator
     * @returns `true` if succesfully deleted
     */
    removePSK(): Promise<boolean>;
    /**
     * Stores a pre-shared authentication secret key for this originator
     * @param pss `true` if succesfully stored
     * @returns
     */
    storePSS(pss: Hex): Promise<boolean>;
    /**
     * Removes a pre-shared authentication secret key for this originator
     * @returns `true` if succesfully deleted
     */
    removePSS(): Promise<boolean>;
}
