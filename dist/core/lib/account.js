'use strict';
export { WfAccount };
import { WfErrorCode, WfProtocolError } from '@whiteflagprotocol/common';
class WfAccount {
    blockchain;
    address;
    publicKey = null;
    #privateKey = null;
    constructor(blockchain, address, publicKey, privateKey) {
        if (!blockchain)
            throw new TypeError('Cannot create an account without a blockchain');
        if (!address)
            throw new TypeError('Cannot create an account without an address');
        this.blockchain = blockchain;
        this.address = address;
        if (publicKey)
            this.publicKey = publicKey;
        if (privateKey)
            this.#privateKey = privateKey;
    }
    static async fromAddress(blockchain, address) {
        return new WfAccount(blockchain, address);
    }
    static async fromPublicKey(blockchain, publicKey) {
        const address = await blockchain.deriveAddress(publicKey);
        return new WfAccount(blockchain, address, publicKey);
    }
    static async fromSecret(blockchain, secret) {
        const keypair = await blockchain.createKeypair(secret);
        const privateKey = keypair[0];
        const publicKey = keypair[1];
        const address = await blockchain.deriveAddress(publicKey);
        return new WfAccount(blockchain, address, publicKey, privateKey);
    }
    static async create(blockchain) {
        return this.fromSecret(blockchain);
    }
    async getBinAddress() {
        return this.blockchain.getBinAddress(this.address);
    }
    createSignature(data) {
        if (!this.#privateKey)
            throw new WfProtocolError(`No private key avaible to create signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.requestSignature(data, this.#privateKey);
    }
    verifySignature(data, signature) {
        if (!this.publicKey)
            throw new WfProtocolError(`No public key avaible to verify signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.verifySignature(data, signature, this.publicKey);
    }
}
