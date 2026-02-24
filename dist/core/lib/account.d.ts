/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export { WfAccount };
import { Blockchain } from '@whiteflagprotocol/common';
import { Hex } from '@whiteflagprotocol/util';
/** A blockchain address in the encoding specified for that blockchain */
export type Address = string;
/**
 * The account used by an originator to send Whiteflag messages
 * @class WfAccount
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a blockchain account.
 * Note that some blockchains lack the concept of an account, whereas
 * Whiteflag assumes an identifiable originator that has one or more accounts
 * on a blockchain. An account for Whiteflag is nothing else than a key pair
 * for signing blockchain transactions, with some related information,
 * e.g. an address, balance etc.
 */
declare class WfAccount {
    #private;
    /** The blockchain of the account */
    readonly blockchain: Blockchain;
    /** The address of the account */
    readonly address: Address;
    /** The public key of the account */
    readonly publicKey: Uint8Array;
    /**
     * Constructor to create a blockchain account
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @param publicKey the public key of the account
     * @param privateKeyId the key store identifier of the private key of the account
     */
    constructor(blockchain: Blockchain, address: Address, publicKey?: Uint8Array, privateKeyId?: Hex);
    /**
     * Creates a new account from the blockchain address
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @returns the newly created blockchain account
     */
    static fromAddress(blockchain: Blockchain, address: Address): Promise<any>;
    /**
     * Creates a new account from the public key
     * @param blockchain the blockchain of which this is an account
     * @param publicKey the public key of the account
     * @returns the newly created blockchain account
     */
    static fromPublicKey(blockchain: Blockchain, publicKey: Uint8Array): Promise<any>;
    /**
     * Creates a new account from an existing key pair
     * @param blockchain the blockchain of which this is an account
     * @param secret a secret as used by the blockchain to create a keypair from
     * @returns the newly created blockchain account
     */
    static fromSecret(blockchain: Blockchain, secret?: string): Promise<any>;
    /**
     * Creates a new account by generating a key pair
     * @param blockchain the blockchain of which this is an account
     * @returns the newly created blockchain account
     */
    static create(blockchain: Blockchain): Promise<any>;
    /**
     * Checks if this account is own account
     * @returns true if the account has a private key, else false
     */
    isSelf(): boolean;
    /**
     * Provides the binary address of the account
     * @returns the binary address
     */
    getBinAddress(): Promise<Uint8Array>;
    /**
     * Signs data with the account's private key
     * @param data the binary data to sign
     * @returns the binary signature
     */
    createSignature(data: Uint8Array): Promise<Uint8Array>;
    /**
     * Verifies signature with the account's public key
     * @param data the binary data that has been signed
     * @param signature the binary signature
     * @returns true if the signature is valid, else false
     */
    verifySignature(data: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
