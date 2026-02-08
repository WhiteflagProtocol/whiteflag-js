'use strict';
export { ExtCryptoKey, createKeyPair, createExtKeyPair, generateEcdhKeyPair, generateSignKeyPair, createAesKey, createHmacKey, createEcdhPubkey, createSignPubkey };
import { createECDH } from 'node:crypto';
import { hexToU8a, u8aToHex } from "@whiteflagprotocol/util";
import { getSignParams, SignAlgorithm } from "./sign.js";
import { BYTELENGTH, HEXENCODING, RAWKEY, EXTRACTABLE, NOTEXTRACTABLE, DEFAULT_ECDHCURVE, DEFAULT_ENCRYPTALG, DEFAULT_HASHALG, ECDH, HMAC } from "./constants.js";
class ExtCryptoKey {
    rawKey;
    type;
    extractable = EXTRACTABLE;
    algorithm;
    usages;
    constructor(rawKey, type, algorithm, usages) {
        this.rawKey = rawKey.buffer;
        this.type = type;
        this.algorithm = algorithm;
        this.usages = usages;
        Object.freeze(this);
    }
    toHex() {
        return u8aToHex(this.toU8a());
    }
    toU8a() {
        return new Uint8Array(this.rawKey);
    }
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
async function generateEcdhKeyPair(curve = DEFAULT_ECDHCURVE) {
    const ecdh = createECDH(curve);
    const ecdhAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    };
    const rawPublicKey = ecdh.generateKeys(HEXENCODING, 'compressed');
    const rawPrivateKey = ecdh.getPrivateKey(HEXENCODING);
    return createExtKeyPair(new ExtCryptoKey(hexToU8a(rawPrivateKey), 'private', ecdhAlgorithm, ['deriveBits', 'deriveKey']), new ExtCryptoKey(hexToU8a(rawPublicKey), 'public', ecdhAlgorithm, ['deriveBits', 'deriveKey']));
}
async function generateSignKeyPair(alg = SignAlgorithm.ES256) {
    const keyPair = await crypto.subtle.generateKey(getSignParams(alg), EXTRACTABLE, ['sign', 'verify']);
    if (!Object.hasOwn(keyPair, 'privateKey'))
        throw new TypeError('Generated key pair is missing private key');
    if (!Object.hasOwn(keyPair, 'publicKey'))
        throw new TypeError('Generated key pair is missing public key');
    return keyPair;
}
async function createAesKey(rawKey, algorithm = DEFAULT_ENCRYPTALG) {
    const aesAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, aesAlgorithm, NOTEXTRACTABLE, ['encrypt', 'decrypt']);
}
async function createHmacKey(rawKey, algorithm = DEFAULT_HASHALG) {
    const hmacAlgorithm = {
        name: HMAC,
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, hmacAlgorithm, NOTEXTRACTABLE, ['sign']);
}
async function createEcdhPubkey(rawKey, curve = DEFAULT_ECDHCURVE) {
    const ecdhAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    };
    return new ExtCryptoKey(rawKey, 'public', ecdhAlgorithm, ['deriveBits', 'deriveKey']);
}
async function createSignPubkey(rawKey, algorithm) {
    const signAlgorithm = getSignParams(algorithm);
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, signAlgorithm, NOTEXTRACTABLE, ['verify']);
}
