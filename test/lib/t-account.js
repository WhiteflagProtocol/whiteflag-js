'use strict';
/**
 * @module core/lib/account
 * @summary Whiteflag JS account test implementation
 */

/* Dependencies */
import { WfAccount } from '@whiteflagprotocol/core';
import { createKeyPair, createSignPubkey } from '@whiteflagprotocol/crypto';
import { u8aToHex } from '@whiteflagprotocol/util';

/* Constants */
const DUMMY_KEYID = '_FPC8ht-BjxkX2gmcKZiUg';

/**
 * Extended implementation of the WfAccount class for testing
 * @remarks This class is to create a fictive blockchain account for
 * testing purposes. This extended implementation is required because of
 * Web Crypto API restrictions in using raw cryptogtaphic keys of the
 * fictive blockchain.
 */
export class Account extends WfAccount {
    /* CLASS PROPERTIES */
    #publicKey;
    #privateKey;

    /* CONSTRUCTOR AND FACTORY METHODS */
    /**
     * Constructor to create a blockchain account
     * @param {string} blockchain the name of blockchain for which this is an account
     * @param {string} address the address of the account
     * @param {string} binAddress the hexadecimal encoded binary address of the account
     * @param {CryptoKey} [publicKey] the public key of the account
     * @param {CryptoKey} [privateKey] the private key of the account
     */
    constructor(blockchain, address, binAddress, publicKey = null, privateKey = null) {
        if (!blockchain) throw new Error('Cannot create a test account without a blockchain');
        if (!address) throw new Error('Cannot create a test account without an address');

        /* Instantiate as Whiteflag account class */
        super({
            blockchain: blockchain,
            address: address,
            binAddress: binAddress,
            privateKeyId: DUMMY_KEYID
        });
        /* Store additional Web Crypto API keys */
        this.#publicKey = publicKey;
        this.#privateKey = privateKey;
    }
    /**
     * Creates a new blockchain account by generating a key pair
     * @override
     * @param {Blockchain} blockchain the blockchain for which this is an account
     * @returns {Account} the newly created blockchain account
     */
    static async create(blockchain) {
        const keypair = await blockchain.createKeypair();
        return this.fromKeyPair(blockchain, keypair);
    }
    /**
     * Creates a new blockchain account from the blockchain address
     * @override
     * @param {Blockchain} blockchain the blockchain for which this is an account
     * @param {string} address the address of the account
     * @returns {Account} the newly created blockchain account
     */
    static async fromAddress(blockchain, address) {
        const binAddress = await blockchain.getBinAddress(address);
        return new this(blockchain.name, address, u8aToHex(binAddress));
    }
    /**
     * Creates a new blockchain account from the public key
     * @override
     * @param {Blockchain} blockchain the blockchain for which this is an account
     * @param {Uint8Array} [publicKey] the public key of the account
     * @returns {Account} the newly created blockchain account
     */
    static async fromPublicKey(blockchain, publicKey) {
        const pubkey = await createSignPubkey(publicKey, blockchain.signAlgorithm);
        const address = await blockchain.deriveAddress(publicKey);
        const binAddress = await blockchain.getBinAddress(address);
        return new this(blockchain.name, address, u8aToHex(binAddress), pubkey);
    }
    /**
     * Creates a new blockchain account from an existing key pair
     * @param {Blockchain} blockchain the blockchain for which this is an account
     * @param {CryptoKeyPair} keypair an object with both the private and the public key for the account
     * @returns {Account} the newly created blockchain account
     */
    static async fromKeyPair(blockchain, keypair) {
        const pubkey = await crypto.subtle.exportKey('raw', keypair.publicKey);
        const address = await blockchain.deriveAddress(pubkey);
        const binAddress = await blockchain.getBinAddress(address);
        return new this(blockchain.name, address, u8aToHex(binAddress), keypair.publicKey, keypair.privateKey);
    }
    /**
     * Provides the public key of the account
     * @override
     * @returns {CryptoKey} the private key, or `null` if the public key is unknown
     * @remarks This test account class returns w Web Crypto API key
     * as used by the fictive test blockchain, instead of a raw binary key.
     */
    getPublicKey() {
        if (!this.#publicKey) return null;
        return this.#publicKey;
    }
    /**
     * Provides the private key of the account
     * @override
     * @returns {CryptoKeyPair} the private key, or `null` if no private key available
     * @remarks This test account class returns w Web Crypto API key pair
     * as used by the fictive test blockchain, instead of a raw binary key.
     */
    async getPrivateKey() {
        if (!this.#privateKey) return null;
        return { privateKey: this.#privateKey, publicKey: this.#publicKey };
    }

    /* METHODS */
    /**
     * Signs data with the account's private key
     * @override
     * @param {Uint8Array} data the binary data to sign
     * @returns the binary signature
     */
    async createSignature(data) {
        if (!this.#privateKey) throw new Error('Test account does not have a private key');
        const keypair = createKeyPair(this.#privateKey, this.#publicKey);
        return this.blockchain.requestSignature(data, keypair);
    }
    /**
     * Verifies signature with the account's public key
     * @override
     * @param {Uint8Array} data the binary data that has been signed
     * @param {Uint8Array} signature the binary signature
     * @returns `true` if the signature is valid, else `false`
     */
    async verifySignature(data, signature) {
        if (!this.#publicKey) throw new Error('Test account does not have a public key');
        return this.blockchain.verifySignature(data, signature, this.#publicKey);
    }
}
