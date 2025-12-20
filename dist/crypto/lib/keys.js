'use strict';
export { createAesKey, createHmacKey };
const BYTELENGTH = 8;
const RAWKEY = 'raw';
const NOTEXTRACTABLE = false;
const DEFAULT_HASHALG = 'SHA-256';
const DEFAULT_ENCRYPTALG = 'AES-CTR';
async function createAesKey(rawKey, algorithm = DEFAULT_ENCRYPTALG) {
    const aesAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, aesAlgorithm, NOTEXTRACTABLE, ['encrypt', 'decrypt']);
}
async function createHmacKey(rawKey, algorithm = DEFAULT_HASHALG) {
    const hmacAlgorithm = {
        name: 'HMAC',
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(RAWKEY, rawKey.buffer, hmacAlgorithm, NOTEXTRACTABLE, ['sign']);
}
