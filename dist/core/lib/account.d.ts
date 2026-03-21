/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export { WfAccount, WfAccountData };
import { Address, Blockchain } from '@whiteflagprotocol/common';
import { KeyId } from '@whiteflagprotocol/crypto';
import { ByteArray, Base64, DataItem, Hex, Json, Serializable } from '@whiteflagprotocol/util';
/**
 * Whiteflag account data structure as used by the `WfOriginator` class
 */
interface WfAccountData extends Serializable {
    /** The name identifying the blockchain of the account */
    readonly blockchain: string;
    /** The address of the account */
    readonly address: Address;
    /** The address of the account */
    readonly binAddress: Hex;
    /** The public key of the account */
    readonly publicKey?: Hex;
    /** The identifier of the private key of the account */
    readonly privateKeyId?: KeyId;
    /** The balance of the account */
    balance?: number;
    /** The identifier of the private ECDH key for encryption key negotiation */
    privateCryptoEcdhKeyId?: KeyId;
    /** The public ECDH key for encryption key negotiation */
    publicCryptoEcdhKey?: Hex;
    /** The identifier of the private ECDH key for auth secret negotiation */
    privateAuthEcdhKeyId?: KeyId;
    /** The public ECDH key for auth secret negotiation */
    publicAuthEcdhKey?: Hex;
}
/**
 * An account used by an originator to send Whiteflag messages
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a blockchain account.
 * Note that some blockchains lack the concept of an account, whereas
 * Whiteflag assumes an identifiable originator that has one or more accounts
 * on a blockchain. An account for Whiteflag is nothing else than a key pair
 * for signing blockchain transactions, with some related information,
 * e.g. an address, balance etc.
 * @todo Add ECDH key pair for encryption key negotiation
 * @todo Add ECDH key pair for authentication secret negotiation
 */
declare class WfAccount extends DataItem<WfAccountData> {
    #private;
    /**
     * Constructor to create a blockchain account
     * @param data the account data
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfAccountData);
    /**
     * Deserializes the blockchain account data
     * @param data the base64 encoded JSON serialized account data
     * @param address the account address as the unique identifier for this data item
     * @returns the blockchain account
     */
    static deserialize(data: Base64, address: Address): WfAccount;
    /**
     * Creates a blockchain account from a JSON serialized object
     * @param data the JSON serialized object
     * @param address the account address as the unique identifier for this data item
     * @returns a new data item
     */
    static fromJson(data: Json, address: Address): WfAccount;
    /**
     * Creates a blockchain account from a plain JavaScript object
     * @param data a plain JavaScript object with the account data
     * @param address the account address as the unique identifier for this data item
     * @returns a new blockchain account
     */
    static fromObject(data: WfAccountData, address: Address): WfAccount;
    /**
     * Creates a new blockchain account by generating a key pair
     * @param blockchain the blockchain for which this is an account
     * @returns the newly created blockchain account
     */
    static create(blockchain: Blockchain): Promise<WfAccount>;
    /**
     * Creates a new blockchain account from the blockchain address
     * @param blockchain the blockchain for which this is an account
     * @param address the address of the account
     * @returns the newly created blockchain account
     */
    static fromAddress(blockchain: Blockchain, address: Address): Promise<WfAccount>;
    /**
     * Creates a new blockchain account from the public key
     * @param blockchain the blockchain for which this is an account
     * @param publicKey the public key of the account
     * @returns the newly created blockchain account
     */
    static fromPublicKey(blockchain: Blockchain, publicKey: ByteArray): Promise<WfAccount>;
    /**
     * Creates a new blockchain account from an existing secret
     * @param blockchain the blockchain for which this is an account
     * @param secret a secret as used by the blockchain to create a key pair from
     * @returns the newly created blockchain account
     */
    static fromSecret(blockchain: Blockchain, secret?: string): Promise<WfAccount>;
    /**
     * Checks if this account is own account, i.e. if it holds a private key
     * @returns `true` if the account has a private key, else `false`
     */
    isSelf(): boolean;
    /**
     * Provides the blockchain name of the account
     * @returns a string with the blockchain name
     */
    getBlockchainName(): string;
    /**
     * Provides the address of the account
     * @returns the account address encoded as specified by the blockchain
     */
    getAddress(): Address;
    /**
     * Provides the binary address of the account
     * @returns a byte array with the binary address
     */
    getBinAddress(): ByteArray;
    /**
     * Provides the public key of the account
     * @returns a byte array with the private key, or `null` if the public key is unknown
     */
    getPublicKey(): ByteArray | null;
    /**
     * Provides the private key of the account
     * @returns a byte array with the private key, or `null` if no private key available
     */
    getPrivateKey(): Promise<ByteArray | null>;
    /**
     * Generates ECDH key pair for encryption key negotiation
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     */
    generateCryptoEcdhKeys(): Promise<void>;
    /**
     * Generates ECDH key pair for authentication secret negotiation
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     */
    generateAuthEcdhKeys(): Promise<void>;
}
