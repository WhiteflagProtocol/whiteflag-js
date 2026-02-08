'use strict';
/**
 * @module core/lib/account
 * @summary Whiteflag JS account test implementation
 */

/* Dependencies */
import { createKeyPair, createSignPubkey } from '@whiteflagprotocol/crypto';

/**
 * Alternative implementation of WfAccount class for testing
 * @class Account
 * @remarks This class is to create a fictive blockchain account for testing
 * purposes, either only .
 */
export class Account {
    /* PROPERTIES */
    blockchain;
    address;
    publicKey;
    #privateKey;

    /* CONSTRUCTOR AND FACTORY METHODS */
    /**
     * Constructor to create a blockchain account
     * @param {Blockchain} blockchain the blockchain of which this is an account
     * @param {string} address the address of the account
     * @param {CryptoKey} [publicKey] the public key of the account
     * @param {CryptoKey} [privateKey] the private key of teh account
     */
    constructor(blockchain, address, publicKey = null, privateKey = null) {
        if (!blockchain) throw new Error('Cannot create a test account without a blockchain');
        if (!address) throw new Error('Cannot create a test account without an address');
        this.blockchain = blockchain;
        this.address = address;
        this.publicKey = publicKey;
        this.#privateKey = privateKey;
    }
    /**
     * Creates a new account from the blockchain address
     * @param {Blockchain} blockchain the blockchain of which this is an account
     * @param {string} address the address of the account
     * @returns the newly created blockchain account
     */
    static async fromAddress(blockchain, address) {
        return new Account(blockchain, address);
    }
    /**
     * Creates a new account from the public key
     * @param {Blockchain} blockchain the blockchain of which this is an account
     * @param {Uint8Array} [publicKey] the public key of the account
     * @returns the newly created blockchain account
     */
    static async fromPublicKey(blockchain, publicKey) {
        const pubkey = await createSignPubkey(publicKey, blockchain.signAlgorithm);
        const address = await blockchain.deriveAddress(publicKey);
        return new Account(blockchain, address, pubkey);
    }
    /**
     * Creates a new account from an existing key pair
     * @param {Blockchain} blockchain the blockchain of which this is an account
     * @param {CryptoKeyPair} keypair an object with both the private and the public key for the account
     * @returns the newly created blockchain account
     */
    static async fromKeyPair(blockchain, keypair) {
        const pubkey = await crypto.subtle.exportKey('raw', keypair.publicKey);
        const address = await blockchain.deriveAddress(pubkey);
        return new Account(blockchain, address, keypair.publicKey, keypair.privateKey);
    }
    /**
     * Creates a new account by generating a key pair
     * @param {Blockchain} blockchain the blockchain of which this is an account
     * @returns the newly created blockchain account
     */
    static async create(blockchain) {
        const keypair = await blockchain.createKeypair();
        return this.fromKeyPair(blockchain, keypair);
    }

    /* METHODS */
    /**
     * Provides the binary address of the account
     * @returns the binary address
     */
    async getBinAddress() {
        return this.blockchain.getBinAddress(this.address);
    }
    /**
     * Signs data with the account's private key
     * @param {Uint8Array} data the binary data to sign
     * @returns the binary signature
     */
    async createSignature(data) {
        if (!this.#privateKey) throw new Error('Test account does not have a private key');
        const keypair = createKeyPair(this.#privateKey, this.publicKey);
        return this.blockchain.requestSignature(data, keypair);
    }
    /**
     * Verifies signature with the account's public key
     * @param {Uint8Array} data the binary data that has been signed
     * @param {Uint8Array} signature the binary signature
     * @returns true if the signature is valid, else false
     */
    async verifySignature(data, signature) {
        if (!this.publicKey) throw new Error('Test account does not have a public key');
        return this.blockchain.verifySignature(data, signature, this.publicKey);
    }
}
