'use strict';
export { WfAccount };
import { WfKeyType, WfRuntimeError, WfErrorCode, handleError, WfProtocolError } from '@whiteflagprotocol/common';
import { KeyStoreAccess, generateEcdhRawKeyPair, getWfKeyId } from '@whiteflagprotocol/crypto';
import { DataItem } from '@whiteflagprotocol/util';
import { b64ToStr, jsonToObj, hexToU8a, u8aToHex } from '@whiteflagprotocol/util';
const wfKeystore = KeyStoreAccess.getInstance();
class WfAccount extends DataItem {
    #data;
    constructor(data) {
        if (!data?.blockchain)
            throw new WfRuntimeError('Missing blockchain name in account data');
        if (!data?.address)
            throw new WfRuntimeError('Missing address in account data');
        if (!data?.binAddress)
            throw new WfRuntimeError('Missing binary address in account data');
        const ddat = Symbol('WfAccount');
        super(data, data.address, ddat);
        this.#data = super.getDataReference(ddat);
    }
    static deserialize(data, address) {
        return this.fromJson(b64ToStr(data), address);
    }
    static fromJson(data, address) {
        return this.fromObject(jsonToObj(data), address);
    }
    static fromObject(data, address) {
        if (data?.address !== address) {
            throw new WfRuntimeError(`Account address ${data?.address} does not match account identifier ${address}`);
        }
        return new this(data);
    }
    static async create(blockchain) {
        return this.fromSecret(blockchain);
    }
    static async fromAddress(blockchain, address) {
        let account;
        try {
            const binAddress = await blockchain.getBinAddress(address);
            account = new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress)
            });
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
            const binAddress = await blockchain.getBinAddress(address);
            account = new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress),
                publicKey: u8aToHex(publicKey)
            });
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
            const binAddress = await blockchain.getBinAddress(address);
            const privateKey = new Uint8Array(keypair[0]);
            const privateKeyId = await getWfKeyId(WfKeyType.ACCOUNT_PRIVATEKEY, address);
            await storePrivateKey(privateKeyId, privateKey);
            account = new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress),
                publicKey: u8aToHex(publicKey),
                privateKeyId: privateKeyId
            });
        }
        catch (err) {
            return handleError(err, 'Cannot create new account', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    isSelf() {
        return !!this.#data?.privateKeyId;
    }
    getBlockchainName() {
        return this.#data.blockchain;
    }
    getAddress() {
        return this.#data.address;
    }
    getBinAddress() {
        return hexToU8a(this.#data.binAddress);
    }
    getPublicKey() {
        if (!this.#data?.publicKey)
            return null;
        return hexToU8a(this.#data.publicKey);
    }
    async getPrivateKey() {
        if (!this.#data?.privateKeyId)
            return null;
        return wfKeystore.getKey(this.#data.privateKeyId);
    }
    async generateCryptoEcdhKeys() {
        if (!this.isSelf())
            throw new WfProtocolError('Can only generate ECDH key pair for own accounts', null, WfErrorCode.ACCOUNT);
        const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair();
        const keyId = await getWfKeyId(WfKeyType.ECDH_ENCRYPT, this.#data.address);
        this.#data.privateCryptoEcdhKeyId = await storePrivateKey(keyId, rawPrivateKey);
        this.#data.publicCryptoEcdhKey = u8aToHex(rawPublicKey);
    }
    async generateAuthEcdhKeys() {
        if (!this.isSelf())
            throw new WfProtocolError('Can only generate ECDH key pair for own accounts', null, WfErrorCode.ACCOUNT);
        const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair();
        const keyId = await getWfKeyId(WfKeyType.ECDH_AUTH, this.#data.address);
        this.#data.privateAuthEcdhKeyId = await storePrivateKey(keyId, rawPrivateKey);
        this.#data.publicAuthEcdhKey = u8aToHex(rawPublicKey);
    }
}
async function storePrivateKey(privateKeyId, privateKey) {
    const stored = await wfKeystore.upsertKey(privateKeyId, privateKey);
    if (!stored)
        throw new WfRuntimeError('Key store did not store private key of the account');
    return stored;
}
