'use strict';
/**
 * @module core/lib/blockchain
 * @summary Whiteflag JS blockchain test implementation
 */

/* Dependencies */
import {
    hash,
    sign,
    verify,
    generateSignKeyPair
} from '@whiteflagprotocol/crypto';
import {
    b58ToU8a,
    b64ToB64u,
    b64uToU8a,
    hexToU8a,
    u8aToB64u,
    isBase58,
    isBase64,
    isBase64u,
    isHex,
    noHexPrefix,
    stringToU8a
} from '@whiteflagprotocol/util';

/**
 * Implementation of WfBlockchain interface for testing
 * @class WfBlockchain
 * @remarks This class is to create a ficitive blockchain for testing
 * purposes, using ES256 as the default signing algorithm and the base64url
 * encoding of the first 16 bits of the SHA-256 hash of the public key as the
 * address.
 */
export class Blockchain {
    /* CONSTRUCTOR */
    /**
     * Constructor for a blockchian object
     * @param {string} [name] the name of the blockchain
     * @param {string} [alg] the identifier of the signature algorithm of the blockchain
     */
    constructor(name = null, alg = null) {
        this.name = name || 'testchain';
        this.signAlgorithm = alg || 'ES256';
    }

    /* METHODS */
    /**
     * Creates a new key pair for this blockchain
     * @param {Uint8Array} secret optinal secret to create account from
     * @returns {Promise} resolves to a new blockchain key pair
     */
    async createKeypair(secret = null) {
        const keypair = await generateSignKeyPair(this.signAlgorithm);
        return keypair;
    }
    /**
     * Derives the blockchain address of an account from its public key
     * @param {string} address the blockchain address in the regular encoding for this blockchain
     * @returns {Promise} resolves to the binary blockchain address
     */
    async deriveAddress(publicKey) {
        const hashedPubkey = await hash(publicKey, 16);
        return u8aToB64u(hashedPubkey);
    }
    /**
     * Returns the binary blockchain address
     * @param {string} address the blockchain address in the regular encoding for this blockchain
     * @returns {Promise} the binary blockchain address
     */
    async getBinAddress(address) {
        if (isHex(address)) return hexToU8a(noHexPrefix(address));
        if (isBase58(address)) return b58ToU8a(address);
        if (isBase64(address)) return b64uToU8a(b64ToB64u(address));
        if (isBase64u(address)) return b64uToU8a(address);
        return stringToU8a(address);
    }
    /**
     * Requests a signature using the blockchain's signature algorithm
     * @param {Uint8Array} data the binary data to sign
     * @param {CryptoKeyPair} keypair the private key of the account to sign the data with
     * @returns {Promise} resolves to the binary signature
     */
    async requestSignature(data, keypair) {
        const signature = await sign(data, keypair, this.signAlgorithm);
        return new Uint8Array(signature);
    }
    /**
     * Verifies a signature using the blockchain's signature algorithm
     * @param {Uint8Array} data the binary data that has been signed
     * @param {Uint8Array} signature the binary signature
     * @param {CryptoKey} publicKey the binary public key of the account used to create the signature
     * @returns {Promise} resolves to true if the signature is valid, else false
     */
    async verifySignature(data, signature, publicKey) {
        return verify(data, signature, publicKey, this.signAlgorithm);
    }
};
