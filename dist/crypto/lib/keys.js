'use strict';
export { ExtCryptoKey, createExtKey, useExtKey, exportExtKey, createKeyPair, createExtKeyPair, generateEcdhKeyPair, generateSignKeyPair, createAesKey, createHmacKey, createEcdhPubkey, createSignPubkey };
import { getSignParams, SignAlgorithm } from "./sign.js";
import { generateEcdhRawKeyPair } from "./ecdh.js";
import { BYTELENGTH, DEFAULT_WF_ECDHCURVE, DEFAULT_WF_ENCRYPTALG, DEFAULT_HASHALG, ECDH, HMAC } from "./constants.js";
const RAWKEY = 'raw';
const EXTRACTABLE = true;
const NOTEXTRACTABLE = false;
let _keymap = new WeakMap();
class ExtCryptoKey {
    algorithm;
    extractable;
    type;
    usages;
    constructor(type, algorithm, extractable = NOTEXTRACTABLE, usages = []) {
        this.type = type;
        this.algorithm = algorithm;
        this.usages = usages;
        this.extractable = extractable;
        Object.freeze(this);
    }
}
function createExtKey(rawKey, type, algorithm, extractable, usages) {
    const key = new ExtCryptoKey(type, algorithm, extractable, usages);
    _keymap.set(key, rawKey);
    return key;
}
function useExtKey(key) {
    const rawKey = _keymap.get(key);
    if (!rawKey)
        throw ReferenceError('Could not retrieve raw key');
    return rawKey;
}
function exportExtKey(key) {
    if (!key.extractable)
        throw new Error('Cannot export a non-extractable key');
    return useExtKey(key);
}
function createKeyPair(privateKey, publicKey) {
    if (privateKey.type !== 'private')
        throw new TypeError(`Cannot use ${privateKey.type} key as private key`);
    if (publicKey.type !== 'public')
        throw new TypeError(`Cannot use ${publicKey.type} key as public key`);
    if (publicKey.algorithm.name !== privateKey.algorithm.name) {
        throw new TypeError('Private key algorithm does not match public key algorithm');
    }
    return {
        privateKey: privateKey,
        publicKey: publicKey
    };
}
function createExtKeyPair(privateKey, publicKey) {
    return createKeyPair(privateKey, publicKey);
}
async function generateEcdhKeyPair(curve = DEFAULT_WF_ECDHCURVE) {
    const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair(curve);
    const ecdhAlgorithm = { name: ECDH, namedCurve: curve };
    return createExtKeyPair(createExtKey(rawPrivateKey, 'private', ecdhAlgorithm, NOTEXTRACTABLE, ['deriveBits', 'deriveKey']), createExtKey(rawPublicKey, 'public', ecdhAlgorithm, EXTRACTABLE, ['deriveBits', 'deriveKey']));
}
async function generateSignKeyPair(algorithm = SignAlgorithm.ES256, extractable = NOTEXTRACTABLE) {
    const keyPair = await crypto.subtle.generateKey(getSignParams(algorithm), extractable, ['sign', 'verify']);
    if (!Object.hasOwn(keyPair, 'privateKey'))
        throw new TypeError('Generated key pair is missing private key');
    if (!Object.hasOwn(keyPair, 'publicKey'))
        throw new TypeError('Generated key pair is missing public key');
    return keyPair;
}
async function createAesKey(rawKey, algorithm = DEFAULT_WF_ENCRYPTALG, extractable = NOTEXTRACTABLE) {
    const aesAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, aesAlgorithm, extractable, ['encrypt', 'decrypt']);
}
async function createHmacKey(rawKey, algorithm = DEFAULT_HASHALG, extractable = NOTEXTRACTABLE) {
    const hmacAlgorithm = {
        name: HMAC,
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, hmacAlgorithm, extractable, ['sign']);
}
async function createEcdhPubkey(rawKey, curve = DEFAULT_WF_ECDHCURVE, extractable = NOTEXTRACTABLE) {
    const ecdhAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    };
    return createExtKey(rawKey, 'public', ecdhAlgorithm, extractable, ['deriveBits', 'deriveKey']);
}
async function createSignPubkey(rawKey, algorithm, extractable = NOTEXTRACTABLE) {
    const signAlgorithm = getSignParams(algorithm);
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, signAlgorithm, extractable, ['verify']);
}
