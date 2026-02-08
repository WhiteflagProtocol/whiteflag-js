'use strict';
/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export {
    WfAccount
};

/* Dependencies */
import { Blockchain, WfErrorCode, WfProtocolError } from '@whiteflagprotocol/common';

/* MODULE DECLARATIONS */
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
class WfAccount {
    /* CLASS PROPERTIES */

    /** The blockchain of the account */
    public blockchain: Blockchain;
    /** The address of the account */
    public readonly address: Address;
    /** The public key of the account */
    public readonly publicKey: Uint8Array | null = null;
    /** The private key of the account */
    readonly #privateKey: Uint8Array | null = null;

    /* CONSTRUCTOR */
    /**
     * Constructor to create a blockchain account
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @param publicKey the public key of the account
     * @param privateKey the private key of the account
     */
    constructor(blockchain: Blockchain, address: Address, publicKey?: Uint8Array, privateKey?: Uint8Array) {
        if (!blockchain) throw new TypeError('Cannot create an account without a blockchain');
        if (!address) throw new TypeError('Cannot create an account without an address');
        this.blockchain = blockchain;
        this.address = address;
        if (publicKey) this.publicKey = publicKey;
        if (privateKey) this.#privateKey = privateKey;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new account from the blockchain address
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @returns the newly created blockchain account
     */
    static async fromAddress(blockchain: Blockchain, address: Address) {
        return new WfAccount(blockchain, address);
    }
    /**
     * Creates a new account from the public key
     * @param blockchain the blockchain of which this is an account
     * @param {Uint8Array} [publicKey] the public key of the account
     * @returns the newly created blockchain account
     */
    static async fromPublicKey(blockchain: Blockchain, publicKey: Uint8Array) {
        const address = await blockchain.deriveAddress(publicKey);
        return new WfAccount(blockchain, address, publicKey);
    }
    /**
     * Creates a new account from an existing key pair
     * @param blockchain the blockchain of which this is an account
     * @param secret a secret as used by the blockchain to create a keypair from
     * @returns the newly created blockchain account
     */
    static async fromSecret(blockchain: Blockchain, secret?: string) {
        const keypair = await blockchain.createKeypair(secret);
        const privateKey = keypair[0];
        const publicKey = keypair[1];
        const address = await blockchain.deriveAddress(publicKey);
        return new WfAccount(blockchain, address, publicKey, privateKey);
    }
    /**
     * Creates a new account by generating a key pair
     * @param blockchain the blockchain of which this is an account
     * @returns the newly created blockchain account
     */
    static async create(blockchain: Blockchain) {
        return this.fromSecret(blockchain);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Provides the binary address of the account
     * @returns the binary address
     */
    async getBinAddress(): Promise<Uint8Array> {
        return this.blockchain.getBinAddress(this.address);
    }
    /**
     * Signs data with the account's private key
     * @param data the binary data to sign
     * @returns the binary signature
     */
    createSignature(data: Uint8Array): Promise<Uint8Array> {
        if (!this.#privateKey) throw new WfProtocolError(`No private key avaible to create signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.requestSignature(data, this.#privateKey);
    }
    /**
     * Verifies signature with the account's public key
     * @param data the binary data that has been signed
     * @param signature the binary signature
     * @returns true if the signature is valid, else false
     */
    verifySignature(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
        if (!this.publicKey) throw new WfProtocolError(`No public key avaible to verify signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.verifySignature(data, signature, this.publicKey);
    }
}
