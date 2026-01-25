'use strict';
export { WfCryptoKey, createKeypair, createAesKey, createHmacKey, createEcdhPubkey };
import { u8aToHex } from "@whiteflagprotocol/util";
const BYTELENGTH = 8;
const RAWKEY = 'raw';
const NOTEXTRACTABLE = false;
const DEFAULT_HASHALG = 'SHA-256';
const DEFAULT_ENCRYPTALG = 'AES-CTR';
const DEFAULT_ECDHCURVE = 'brainpoolP256r1';
const ECDH = 'ECDH';
const HMAC = 'HMAC';
class WfCryptoKey {
    data;
    type;
    algorithm;
    usages;
    extractable = true;
    constructor(keyData, type, algorithm, usages) {
        this.data = keyData;
        this.type = type;
        this.algorithm = algorithm;
        this.usages = usages;
        Object.freeze(this);
    }
    toHex() {
        return u8aToHex(this.data);
    }
    toU8a() {
        return this.data;
    }
}
function createKeypair(privateKey, publicKey) {
    if (privateKey.type !== 'private')
        throw new Error(`Cannot use ${privateKey.type} key as private key`);
    if (publicKey.type !== 'public')
        throw new Error(`Cannot use ${publicKey.type} key as public key`);
    if (publicKey.algorithm.name !== privateKey.algorithm.name) {
        throw new Error('Private key algorithm does not match public key algorithm');
    }
    return {
        privateKey: privateKey,
        publicKey: publicKey,
    };
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
    return new WfCryptoKey(rawKey, 'public', ecdhAlgorithm, ['deriveBits', 'deriveKey']);
}
