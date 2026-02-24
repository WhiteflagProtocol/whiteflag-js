'use strict';
export { WfAccount };
import { WfKeyType, WfError, WfErrorCode, handleError } from '@whiteflagprotocol/common';
import { getWfKeyId, KeyStoreAccess } from '@whiteflagprotocol/crypto';
const keystore = KeyStoreAccess.getInstance();
class WfAccount {
    blockchain;
    address;
    publicKey = new Uint8Array(0);
    #privateKeyId = '';
    constructor(blockchain, address, publicKey, privateKeyId) {
        if (!blockchain)
            throw new TypeError('Missing blockchain');
        if (!address)
            throw new TypeError('Missing address');
        this.blockchain = blockchain;
        this.address = address;
        if (publicKey)
            this.publicKey = publicKey;
        if (privateKeyId)
            this.#privateKeyId = privateKeyId;
    }
    static async fromAddress(blockchain, address) {
        let account;
        try {
            account = new WfAccount(blockchain, address);
        }
        catch (err) {
            return handleError(err, 'Cannot create account from address', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    static async fromPublicKey(blockchain, publicKey) {
        let account;
        try {
            const address = await blockchain.deriveAddress(publicKey);
            account = new WfAccount(blockchain, address, publicKey);
        }
        catch (err) {
            return handleError(err, 'Cannot create account from public key', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    static async fromSecret(blockchain, secret) {
        let account;
        try {
            const keypair = await blockchain.createKeypair(secret);
            const publicKey = keypair[1];
            const address = await blockchain.deriveAddress(publicKey);
            const privateKey = new Uint8Array(keypair[0]);
            const privateKeyId = await getPrivateKeyId(address);
            await storePrivateKey(privateKeyId, privateKey);
            account = new WfAccount(blockchain, address, publicKey, privateKeyId);
        }
        catch (err) {
            return handleError(err, 'Cannot create new account', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    static async create(blockchain) {
        return this.fromSecret(blockchain);
    }
    isSelf() {
        return (this.#privateKeyId.length > 0);
    }
    async getBinAddress() {
        return this.blockchain.getBinAddress(this.address);
    }
    async createSignature(data) {
        if (!this.#privateKeyId)
            throw new WfError(`No private key avaible to create signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        let signature;
        try {
            const privateKey = await getPrivateKey(this.#privateKeyId);
            signature = await this.blockchain.requestSignature(data, privateKey);
        }
        catch (err) {
            return handleError(err, `Cannot create signature for account ${this.address}`, WfErrorCode.SIGNATURE);
        }
        return signature;
    }
    async verifySignature(data, signature) {
        if (!this.publicKey)
            throw new WfError(`No public key avaible to verify signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.verifySignature(data, signature, this.publicKey);
    }
}
async function getPrivateKeyId(address) {
    return getWfKeyId(WfKeyType.ACCOUNT_PRIVATEKEY, address);
}
async function getPrivateKey(privateKeyId) {
    const privateKey = await keystore.getKey(privateKeyId);
    if (privateKey === null)
        throw new Error('Key store did not return private key');
    return privateKey;
}
async function storePrivateKey(privateKeyId, privateKey) {
    const stored = await keystore.upsertKey(privateKeyId, privateKey);
    if (!stored)
        throw new Error('Key store did not store private key');
    return stored;
}
