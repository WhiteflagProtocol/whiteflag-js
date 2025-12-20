'use strict';
/**
 * @module crypto/keys
 * @summary Whiteflag JS crypto key functions
 */
export {
    createAesKey,
    createHmacKey
};

/* Constants */
const BYTELENGTH = 8;
const RAWKEY = 'raw';
const NOTEXTRACTABLE = false;
const DEFAULT_HASHALG = 'SHA-256';
const DEFAULT_ENCRYPTALG = 'AES-CTR';

/* MODULE FUNCTIONS */
/**
 * Generates an AES encryption and decryption key
 * @function createAesKey
 * @param rawKey the raw key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
async function createAesKey(rawKey: Uint8Array<ArrayBuffer>,
                            algorithm: string = DEFAULT_ENCRYPTALG
                        ): Promise<CryptoKey> {
    const aesAlgorithm: AesKeyAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        aesAlgorithm,
        NOTEXTRACTABLE,
        ['encrypt', 'decrypt']
    );
}
/**
 * Generates an HMAC signing key
 * @function createHmacKey
 * @param rawKey the raw key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @returns the HMAC signing key
 */
async function createHmacKey(rawKey: Uint8Array<ArrayBuffer>,
                             algorithm: string = DEFAULT_HASHALG
                        ): Promise<CryptoKey> {
    const hmacAlgorithm: HmacImportParams = {
        name: 'HMAC',
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        hmacAlgorithm,
        NOTEXTRACTABLE,
        ['sign']
    );
}
