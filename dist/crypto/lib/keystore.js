'use strict';
export { KeyStoreCtrl, KeyStoreAccess, getWfKeyId };
import { WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { isBase64u, isByteArray, Mutex } from '@whiteflagprotocol/util';
import { b64uToU8a, hexToU8a, mapToU8a, strToU8a, u8aToB64u, u8aToMap } from '@whiteflagprotocol/util';
import { hash, hkdf } from "./hash.js";
import { generateDEK, encryptData, decryptData } from "./encrypt.js";
const KEY_LENGTH = 32;
const KEYID_LENGTH = 16;
const MEK_DEFAULT = hexToU8a('7134c1d69c028774749d908b225538962e02b60d34dff85bafad4f06619d092c');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('9a4e59814a4ff35c144b69497662be365992853082f4e28f1b69e68adbc187dc');
const KEK_SALT = hexToU8a('524a64503fab03b4af21537fb85080e4c8b281f3a870885293c12f00b6c50f25');
const MEK_INFO = strToU8a('MEK-WfKeyStore');
const DEK_INFO = strToU8a('DEK-WfKeyStore');
let _masterKey = MEK_DEFAULT;
let _keyStore = new Map();
let _ctrlSeal = false;
let _mutex = new Mutex();
class KeyStoreCtrl {
    static #sit = Symbol('KeyStoreCtrl');
    static #instance;
    constructor(sit) {
        if (sit !== KeyStoreCtrl.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag keystore control');
        }
        Object.freeze(this);
    }
    static getInstance() {
        return this.#instance ??= new KeyStoreCtrl(this.#sit);
    }
    seal() {
        _ctrlSeal = true;
        return _ctrlSeal;
    }
    isSealed() {
        return _ctrlSeal;
    }
    async setMasterKey(masterKey) {
        if (this.isSealed())
            return false;
        if (!isByteArray(masterKey))
            throw new TypeError('Provided master key is not an 8-bit unsigned integer typed array');
        let keyStore;
        try {
            await _mutex.lock();
            const mek = await generateMEK(masterKey);
            keyStore = await recryptData(mek);
            _keyStore = keyStore;
            _masterKey = mek;
        }
        catch (err) {
            return handleError(err, 'Could not re-encrypt keys with new master key');
        }
        finally {
            _mutex.unlock();
        }
        return true;
    }
    ;
    async import(ekdo) {
        if (this.isSealed())
            return false;
        let results;
        let keyStore;
        try {
            await _mutex.lock();
            const dek = await generateDEK(_masterKey, DEK_INFO, DEK_SALT);
            const data = await decryptData(dek, ekdo);
            keyStore = u8aToMap(data);
            const batch = [];
            for (const [kid, ekdo] of keyStore) {
                const kek = await generateKEK(kid);
                const rawKey = await decryptData(kek, ekdo);
                batch.push(upsertKey(kid, rawKey));
            }
            results = await Promise.all(batch);
        }
        catch (err) {
            return handleError(err, 'Could not import keystore');
        }
        finally {
            _mutex.unlock();
        }
        return results.every(result => result);
    }
    async export() {
        let ekdo;
        try {
            await _mutex.lock();
            const dek = await generateDEK(_masterKey, DEK_INFO, DEK_SALT);
            const data = mapToU8a(_keyStore);
            ekdo = await encryptData(dek, data);
        }
        catch (err) {
            return handleError(err, 'Could not export keystore');
        }
        finally {
            _mutex.unlock();
        }
        return ekdo;
    }
}
class KeyStoreAccess {
    static #sit = Symbol('KeyStoreAccess');
    static #instance;
    constructor(sit) {
        if (sit !== KeyStoreAccess.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag keystore access object');
        }
        Object.freeze(this);
    }
    static getInstance() {
        if (!KeyStoreAccess.#instance) {
            KeyStoreAccess.#instance = new KeyStoreAccess(this.#sit);
        }
        return KeyStoreAccess.#instance;
    }
    async getKey(kid) {
        try {
            await _mutex.track();
            return await getKey(kid);
        }
        finally {
            _mutex.untrack();
        }
    }
    async upsertKey(kid, key) {
        try {
            await _mutex.track();
            await upsertKey(kid, key);
            return kid;
        }
        finally {
            _mutex.untrack();
        }
    }
    async removeKey(kid) {
        try {
            await _mutex.track();
            return await removeKey(kid);
        }
        finally {
            _mutex.untrack();
        }
    }
}
async function getWfKeyId(type, info, length = KEYID_LENGTH) {
    const kid = await hash(strToU8a(type + info), length);
    return u8aToB64u(kid);
}
async function generateMEK(mek) {
    return hkdf(mek, MEK_SALT, MEK_INFO, KEY_LENGTH);
}
async function generateKEK(kid, mek = _masterKey) {
    const info = b64uToU8a(kid);
    return generateDEK(mek, info, KEK_SALT);
}
async function getKey(kid) {
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = _keyStore.get(id);
    if (!ekdo)
        return null;
    return decryptData(kek, ekdo).catch(err => handleError(err, 'Could not decrypt key in keystore'));
}
async function upsertKey(kid, key) {
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = await encryptData(kek, key);
    try {
        _keyStore.set(id, ekdo);
        return true;
    }
    catch (err) {
        return handleError(err, 'Could not upsert key in keystore');
    }
}
async function removeKey(kid) {
    const id = checkKeyId(kid);
    return _keyStore.delete(id);
}
async function recryptData(newMek) {
    let keyStore = new Map();
    for (const [kid, ekdo] of _keyStore) {
        const currentKek = await generateKEK(kid);
        const rawKey = await decryptData(currentKek, ekdo);
        const newKek = await generateKEK(kid, newMek);
        const newEkdo = await encryptData(newKek, rawKey);
        keyStore.set(kid, newEkdo);
    }
    return keyStore;
}
function checkKeyId(kid) {
    if (!isBase64u(kid))
        throw new TypeError('Provided key identifier is not Base64url encoded');
    return kid;
}
