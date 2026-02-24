'use strict';
export { KeyStoreCtrl, KeyStoreAccess, getWfKeyId };
import { handleError } from '@whiteflagprotocol/common';
import { sleep } from '@whiteflagprotocol/util';
import { isHex, isBase64u, noHexPrefix, b64ToU8a, b64uToObj, hexToU8a, objToB64u, objToU8a, stringToU8a, u8aToHex, u8aToB64, u8aToObj } from "@whiteflagprotocol/util";
import { hash, hkdf } from "./hash.js";
import { createAesKey } from "./keys.js";
import { random } from "./random.js";
import { AES_GCM, AES_GCM_IVLENGTH, AES_GCM_TAGLENGTH, BYTELENGTH } from "./constants.js";
const KEYID_LENGTH = 16;
const KEY_LENGTH = 32;
const MEK_DEFAULT = hexToU8a('7134c1d69c028774749d908b225538962e02b60d34dff85bafad4f06619d092c');
const MEK_SALT = hexToU8a('33a4cff8ca686550b82765ffaf69003b6be657aed9d97982790e9c334cc6cfbe');
const DEK_SALT = hexToU8a('9a4e59814a4ff35c144b69497662be365992853082f4e28f1b69e68adbc187dc');
const KEK_SALT = hexToU8a('524a64503fab03b4af21537fb85080e4c8b281f3a870885293c12f00b6c50f25');
const MEK_INFO = 'MEK-WfKeyStore';
const DEK_INFO = 'DEK-WfKeyStore';
const LOCK_SLEEPTIME = 50;
let _masterKey = MEK_DEFAULT;
let _keyStore = new Map();
let _ctrlSeal = false;
let _mutex = 0;
class KeyStoreCtrl {
    static #instance;
    constructor() { Object.freeze(this); }
    static getInstance() {
        if (!KeyStoreCtrl.#instance)
            KeyStoreCtrl.#instance = new KeyStoreCtrl();
        return KeyStoreCtrl.#instance;
    }
    seal() {
        _ctrlSeal = true;
        return _ctrlSeal;
    }
    isSealed() {
        return _ctrlSeal;
    }
    async setMasterKey(rawKey) {
        if (this.isSealed())
            return false;
        if (!isHex(rawKey))
            throw new TypeError('Provided keystore master key is not hexdecimal encoded');
        let keyStore;
        try {
            await lock();
            const newMek = await generateMEK(MEK_INFO, hexToU8a(rawKey));
            keyStore = await recryptData(newMek);
            _keyStore = keyStore;
            _masterKey = newMek;
        }
        catch (err) {
            return handleError(err, 'Could not re-encrypt keys with new master key');
        }
        finally {
            unlock();
        }
        return true;
    }
    ;
    async import(data) {
        if (this.isSealed())
            return false;
        if (!isBase64u(data))
            throw new TypeError('Provided keystore data is not base64url encoded');
        let results;
        let keyStore;
        try {
            await lock();
            const dek = await generateDEK();
            const encrypted = b64uToObj(data);
            const decrypted = await decryptData(dek, encrypted);
            keyStore = new Map(u8aToObj(decrypted));
            const batch = [];
            for (const [kid, ekdo] of keyStore) {
                const kek = await generateKEK(kid);
                const rawKey = await decryptData(kek, ekdo);
                batch.push(upsertKey(kid, rawKey));
            }
            results = await Promise.all(batch);
        }
        catch (err) {
            return handleError(err, 'Could not import key store');
        }
        finally {
            unlock();
        }
        return results.every(result => result);
    }
    async export() {
        let encrypted;
        try {
            await lock();
            const dek = await generateDEK();
            const data = objToU8a(Array.from(_keyStore));
            encrypted = await encryptData(dek, data);
        }
        catch (err) {
            return handleError(err, 'Could not export key store');
        }
        finally {
            unlock();
        }
        return objToB64u(encrypted);
    }
}
class KeyStoreAccess {
    static #instance;
    constructor() { Object.freeze(this); }
    static getInstance() {
        if (!KeyStoreAccess.#instance)
            KeyStoreAccess.#instance = new KeyStoreAccess();
        return KeyStoreAccess.#instance;
    }
    async getKey(kid) {
        try {
            await track();
            return await getKey(kid);
            ;
        }
        finally {
            untrack();
        }
    }
    async upsertKey(kid, key) {
        try {
            await track();
            return await upsertKey(kid, key);
        }
        finally {
            untrack();
        }
    }
    async removeKey(kid) {
        try {
            await track();
            return await removeKey(kid);
            ;
        }
        finally {
            untrack();
        }
    }
}
async function getWfKeyId(type, info, length = KEYID_LENGTH) {
    const kid = await hash(stringToU8a(type + info), length);
    return u8aToHex(kid);
}
async function lock() {
    await tracked();
    return _mutex = -1;
}
function unlock() {
    return _mutex = 0;
}
async function locked() {
    while (_mutex < 0)
        await sleep(LOCK_SLEEPTIME);
    return _mutex;
}
async function track() {
    await locked();
    return _mutex++;
}
function untrack() {
    return _mutex--;
}
async function tracked() {
    while (_mutex !== 0)
        await sleep(LOCK_SLEEPTIME);
    return _mutex;
}
async function generateMEK(info = MEK_INFO, mek) {
    return hkdf(mek, MEK_SALT, stringToU8a(info), KEY_LENGTH);
}
async function generateDEK(info = DEK_INFO, mek = _masterKey) {
    const rawDEK = await hkdf(mek, DEK_SALT, stringToU8a(info), KEY_LENGTH);
    return createAesKey(rawDEK, AES_GCM);
}
async function generateKEK(kid, mek = _masterKey) {
    const rawKEK = await hkdf(mek, KEK_SALT, hexToU8a(kid), KEY_LENGTH);
    return createAesKey(rawKEK, AES_GCM);
}
async function getKey(kid) {
    const id = checkKeyId(kid);
    const kek = await generateKEK(id);
    const ekdo = _keyStore.get(id);
    if (!ekdo)
        return null;
    try {
        return decryptData(kek, ekdo);
    }
    catch (err) {
        return handleError(err, 'Could not decrypt key in key store');
    }
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
        return handleError(err, 'Could not upsert key in key store');
    }
}
async function removeKey(kid) {
    const id = checkKeyId(kid);
    return _keyStore.delete(id);
}
async function encryptData(key, plain) {
    let encrypted;
    const iv = random(AES_GCM_IVLENGTH / BYTELENGTH);
    try {
        encrypted = await crypto.subtle.encrypt(getAesParameters(iv), key, plain);
    }
    catch (err) {
        return handleError(err, 'Key store encryption error');
    }
    const data = new Uint8Array(encrypted);
    return {
        iv: u8aToB64(iv),
        data: u8aToB64(data)
    };
}
async function decryptData(key, ekdo) {
    let decrypted;
    const iv = b64ToU8a(ekdo.iv);
    try {
        decrypted = await crypto.subtle.decrypt(getAesParameters(iv), key, b64ToU8a(ekdo.data));
    }
    catch (err) {
        return handleError(err, 'Key store decryption error');
    }
    return new Uint8Array(decrypted);
}
async function recryptData(newMek) {
    let keyStore = new Map();
    for await (const [kid, ekdo] of _keyStore) {
        const currentKek = await generateKEK(kid);
        const rawKey = await decryptData(currentKek, ekdo);
        const newKek = await generateKEK(kid, newMek);
        const newEkdo = await encryptData(newKek, rawKey);
        keyStore.set(kid, newEkdo);
    }
    return keyStore;
}
function getAesParameters(iv) {
    return {
        name: AES_GCM,
        iv: iv.buffer,
        tagLength: AES_GCM_TAGLENGTH
    };
}
function checkKeyId(kid) {
    if (!isHex(kid))
        throw new TypeError('Provided key identifier is not hexdecimal encoded');
    return noHexPrefix(kid);
}
