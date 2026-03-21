'use strict';
export { WfOriginator };
import { WfKeyType, WfRuntimeError } from '@whiteflagprotocol/common';
import { KeyStoreAccess, getWfKeyId } from '@whiteflagprotocol/crypto';
import { DataItem } from '@whiteflagprotocol/util';
import { b64ToStr, hexToU8a, jsonToObj } from '@whiteflagprotocol/util';
const keystore = KeyStoreAccess.getInstance();
class WfOriginator extends DataItem {
    #data;
    constructor(data, id) {
        const ddat = Symbol('WfOriginator');
        super(data, id, ddat);
        this.#data = super.getDataReference(ddat);
    }
    static create(name) {
        return new WfOriginator({
            name: name,
            accounts: []
        });
    }
    static deserialize(data, id) {
        return this.fromJson(b64ToStr(data), id);
    }
    static fromJson(data, id) {
        return this.fromObject(jsonToObj(data), id);
    }
    static fromObject(data, id) {
        return new WfOriginator(data, id);
    }
    setName(name) {
        return this.#data.name = name;
    }
    getName() {
        return this.#data?.name;
    }
    addAccount(address) {
        if (this.ownsAccount(address)) {
            return +this.#data.accounts.length;
        }
        return +this.#data.accounts.push(address);
    }
    listAccounts() {
        return Array.from(this.#data.accounts);
    }
    ownsAccount(address) {
        return this.#data.accounts.includes(address);
    }
    async storePSK(psk) {
        const secretId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, this._id);
        this.#data.pskId = await storeSecret(secretId, hexToU8a(psk));
        return !!this.#data.pskId;
    }
    async removePSK() {
        if (this.#data.pskId)
            return keystore.removeKey(this.#data.pskId);
        return false;
    }
    async storePSS(pss) {
        const secretId = await getWfKeyId(WfKeyType.AUTH_PSS, this._id);
        this.#data.pssId = await storeSecret(secretId, hexToU8a(pss));
        return !!this.#data.pssId;
    }
    async removePSS() {
        if (this.#data.pssId)
            return keystore.removeKey(this.#data.pssId);
        return false;
    }
}
async function getSecret(secretId) {
    const secret = await keystore.getKey(secretId);
    return secret;
}
async function storeSecret(secretId, secret) {
    const stored = await keystore.upsertKey(secretId, secret);
    if (!stored)
        throw new WfRuntimeError('Key store did not store secret for the originator');
    return stored;
}
