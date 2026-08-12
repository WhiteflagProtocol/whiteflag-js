'use strict';
export { WfState };
import { WfRuntimeError, handleError, noString } from '@whiteflagprotocol/common';
import { KeyStoreCtrl, generateDEK, encryptData, decryptData, hkdf } from '@whiteflagprotocol/crypto';
import { DataCollection } from '@whiteflagprotocol/util';
import { delay, objectHas, getPosixEpoch, hexToU8a, objToU8a, strToU8a, u8aToObj } from '@whiteflagprotocol/util';
import { WfBlockchainState } from "./blockchain.js";
import { WfEvent, WfEventEmitter } from "./events.js";
const DELAYTIME = 50;
const KEY_LENGTH = 32;
const MEK_INFO = strToU8a('MEK-WfState');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('927ef470db1b182131ec04c30f7fe4d954215bb0a42e0a2015821a76d7030741');
const wfKeystore = KeyStoreCtrl.getInstance();
const wfEvent = WfEventEmitter.getInstance();
let _masterKey;
let _blockchains = DataCollection.create();
let _originators = DataCollection.create();
let _accounts = DataCollection.create();
class WfState {
    static #sit = Symbol('WfState');
    static #instance;
    constructor(sit) {
        if (sit !== WfState.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag state');
        }
        Object.freeze(this);
    }
    static async init(masterKey, data) {
        if (this.#instance) {
            throw new WfRuntimeError('Whiteflag state has already been initialized');
        }
        try {
            await setMasterKey(masterKey);
        }
        catch (err) {
            return handleError(err, 'Cannot set Whiteflag state master encryption key');
        }
        try {
            if (data)
                await importData(data);
        }
        catch (err) {
            return handleError(err, 'Error importing Whiteflag state data');
        }
        wfKeystore.seal();
        this.#instance = new WfState(this.#sit);
        wfEvent.emit(WfEvent.STATE_INITIALIZED, this.#instance);
        return this.#instance;
    }
    static getInstance() {
        if (!this.#instance) {
            throw new WfRuntimeError('Whiteflag state has not been been initialized');
        }
        return this.#instance;
    }
    static async readyInstance() {
        while (!this.#instance)
            await delay(DELAYTIME);
        return this.#instance;
    }
    async export(encrypt = true) {
        const batch = [
            exportCollection(_blockchains, encrypt, 'WfBlockchainState'),
            exportCollection(_originators, encrypt, 'WfOriginatorState'),
            exportCollection(_accounts, encrypt, 'WfAccountState'),
            wfKeystore.export()
        ];
        let data = [];
        try {
            data = await Promise.all(batch);
        }
        catch (err) {
            return handleError(err, 'Cannot export Whiteflag state');
        }
        return {
            _timestamp: getPosixEpoch(),
            blockchains: data[0],
            originators: data[1],
            accounts: data[2],
            secrets: data[3]
        };
    }
    hasBlockchain(blockchain) {
        return _blockchains.exists(blockchain);
    }
    getBlockchain(blockchain) {
        return _blockchains.retrieve(blockchain);
    }
    upsertBlockchain(status) {
        return _blockchains.upsert(status);
    }
    createBlockchain(blockchain) {
        if (_blockchains.exists(blockchain))
            return null;
        return _blockchains.upsert(WfBlockchainState.create(blockchain));
    }
    hasAccount(address) {
        return _accounts.exists(address);
    }
    getAccount(address) {
        return _accounts.retrieve(address);
    }
    upsertAccount(account) {
        return _accounts.upsert(account);
    }
    getOriginator(address) {
        for (const originator of _originators.items()) {
            if (originator.ownsAccount(address))
                return originator;
        }
        return null;
    }
    getOriginatorById(id) {
        return _originators.retrieve(id);
    }
    upsertOriginator(originator) {
        return _originators.upsert(originator);
    }
}
async function setMasterKey(masterKey) {
    const rawKey = hexToU8a(masterKey);
    _masterKey = await generateMEK(rawKey);
    const success = await wfKeystore.setMasterKey(rawKey);
    if (!success)
        throw new Error('Could not set keystore master key');
    return true;
}
async function generateMEK(mek) {
    return hkdf(mek, MEK_SALT, MEK_INFO, KEY_LENGTH);
}
async function importData(data) {
    if (data.blockchains) {
        _blockchains = await importCollection(data.blockchains);
    }
    if (data.originators) {
        _originators = await importCollection(data.originators);
    }
    if (data.accounts) {
        _accounts = await importCollection(data.accounts);
    }
    if (data.secrets) {
        const success = await wfKeystore.import(data.secrets);
        if (!success)
            throw new Error('Could not import keystore data');
    }
    return true;
}
async function importCollection(data) {
    let collection;
    if (objectHas(data, 'encrypted')) {
        collection = await decryptCollection(data);
    }
    else {
        collection = data;
    }
    return DataCollection.fromObject(collection);
}
async function exportCollection(collection, encrypt, info) {
    const data = collection.toObject();
    if (!encrypt)
        return data;
    return encryptCollection(data, info);
}
async function encryptCollection(collection, info) {
    const dek = await generateDEK(_masterKey, strToU8a(info), DEK_SALT);
    const data = objToU8a(collection);
    return encryptData(dek, data, info);
}
async function decryptCollection(esdo) {
    const info = esdo?.info || noString('Encrypted data collection has no info property');
    const dek = await generateDEK(_masterKey, strToU8a(info), DEK_SALT);
    const collection = await decryptData(dek, esdo);
    return u8aToObj(collection);
}
