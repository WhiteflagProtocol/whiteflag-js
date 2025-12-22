'use strict';
/**
 * @module crypto/cipher
 * @summary Whiteflag JS encryption and decryption functions
 */
export {
    WfCryptoMethod,
    encrypt,
    decrypt,
    deriveKey
};

/* Dependencies */
import { WfVersion } from '@whiteflag/core';
import { hexToU8a } from '@whiteflag/util';

/* Module imports */
import { zeroise } from './common.ts';
import { hkdf } from './hash.ts';
import { createAesKey } from './keys.ts';

/* Whiteflag specification */
import cryptoSpec_v1 from '../static/v1/wf-crypto-params.json' with { type: 'json' };

/* Constants */
const BYTELENGTH = 8;

/* MODULE DECLARATIONS */
/**
 * Whiteflag encryption methods, defining the encryption methods
 * for Whiteflag messages as specified by the Whiteflag standard
 * @enum WfCryptoMethod
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 */
enum WfCryptoMethod {
    /** Whiteflag encryption method 1: negotiated key */
    ECDH = '1',
    /** Whiteflag encryption method 2: pre-shared key */
    PSK = '2'
}
/**
 * Whiteflag encryption parameters for each method
 */
const PARAMS = compileCryptoParams();

/* MODULE FUNCTIONS */
/**
 * Encrypts a message based on the specified encyrption method
 * @function encrypt
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be encrypted
 * @param method the Whiteflag encryption method
 * @param key the input key material for the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
async function encrypt(message: Uint8Array<ArrayBuffer>,
                       method: WfCryptoMethod,
                       key: CryptoKey,
                       iv?: Uint8Array<ArrayBuffer>,
                       version = WfVersion.v1
                    ): Promise<Uint8Array> {
    /* Choose encryption based on encryption method */
    switch (method) {
        case WfCryptoMethod.ECDH:
        case WfCryptoMethod.PSK: {
            const parameters = getAesParameters(method, iv, version);
            return encryptAes(message, key, parameters);
        }
        default: {
            throw new Error(`Invalid encryption method: ${method}`);
        }
    }
}
/**
 * Decrypts a message based on the specified encyrption method
 * @function decrypt
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be decyrpted
 * @param method the Whiteflag encryption method
 * @param key the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
async function decrypt(message: Uint8Array<ArrayBuffer>,
                       method: WfCryptoMethod,
                       key: CryptoKey,
                       iv?: Uint8Array<ArrayBuffer>,
                       version = WfVersion.v1
                    ): Promise<Uint8Array> {
    /* Choose decryption based on encryption method */
    switch (method) {
        case WfCryptoMethod.ECDH:
        case WfCryptoMethod.PSK: {
            const parameters = getAesParameters(method, iv, version);
            return decryptAes(message, key, parameters);
        }
        default: {
            throw new Error(`Invalid encryption method: ${method}`);
        }
    }
}
/**
 * Derives the encryption key based on the Whiteflag encryption method
 * @function deriveKey
 * @wfversion v1-draft.7
 * @wfreference 5.2.3 Encryption Key and Authentication Token Derivation
 * @param ikm the raw input key material
 * @param info information to bind the key, e.g. the blockchain address of the originator
 * @param method the Whiteflag encryption method
 * @param version the Whiteflag protocol version
 * @returns the encryption key
 */
async function deriveKey(ikm: Uint8Array<ArrayBuffer>,
                         method: WfCryptoMethod,
                         info: Uint8Array<ArrayBuffer>,
                         version = WfVersion.v1
                    ): Promise<CryptoKey> {
    /* Derive raw key with HKDF */
    const salt = hexToU8a(PARAMS[method][version].salt);
    const keyLength = PARAMS[method][version].keyLength;
    const rawKey = await hkdf(ikm, salt, info, keyLength);
    zeroise(ikm);

    /* Create encryption key object based on encryption method */
    switch (method) {
        case WfCryptoMethod.ECDH:
        case WfCryptoMethod.PSK: {
            return createAesKey(rawKey, PARAMS[method][version].algorithm);
        }
        default: {
            throw new Error(`Invalid encryption method: ${method}`);
        }
    }
}

/* PRIVATE MODULE DECLARATIONS */
/**
 * Defines an object with field encoding definitions
 * @private
 * @interface WfFieldEncoding
 */
interface WfCryptoParams {
    [key: string]: {            // Encryption method
        [key: string]: {        // Whiteflag version
            algorithm: string,  // Encryption algorithm
            keyLength: number,  // Byte length of the encryption key
            ivLength: number,   // Byte length of the initialisation vector
            ctrLength: number   // Byte length of the counter block part used as counter
            salt: string        // Salt for HKDF key generation
        }
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Compiles an object with all valid field type definitions
 * @private
 * @returns an object with field type definitions
 */
function compileCryptoParams(): WfCryptoParams {
    const params: WfCryptoParams = {};
    for (const method of Object.values(WfCryptoMethod)) {
        params[method] = {};

        /* Whiteflag version 1 */ {
            const version = WfVersion.v1;
            params[method][version] = cryptoSpec_v1[method];
        }
    }
    return params;
}
/**
 * Encrypts data using AES
 * @private
 * @param data the data to be encrypted
 * @param key the encryption key
 * @param parameters the AES encryption parameters
 * @returns the encrypted binary data
 */
async function encryptAes(data: Uint8Array<ArrayBuffer>,
                          key: CryptoKey,
                          parameters: AesCtrParams | AesCbcParams | AesGcmParams
                        ): Promise<Uint8Array> {
    const encrypted = await crypto.subtle.encrypt(
        parameters, key, data
    );
    return new Uint8Array(encrypted);
}
/**
 * Decrypts data using AES
 * @private
 * @param data the data to be encrypted
 * @param key the encryption key
 * @param parameters the AES encryption parameters
 * @returns the decrypted binary data
 */
async function decryptAes(data: Uint8Array<ArrayBuffer>,
                          key: CryptoKey,
                          parameters: AesCtrParams | AesCbcParams | AesGcmParams
                        ): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
        parameters, key, data
    );
    return new Uint8Array(decrypted);
}
/**
 * Creates the algortihm parameter object for AES based on the Whiteflag encryption method
 * @private
 * @param method the Whiteflag encryption method
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 * @returns the AES algortihm parameter object
 */
function getAesParameters(method: WfCryptoMethod,
                          iv?: Uint8Array<ArrayBuffer>,
                          version = WfVersion.v1
                        ): AesCtrParams | AesCbcParams | AesGcmParams {
    /* Compile encryption parameters based on encryption method */
    switch (method) {
        case WfCryptoMethod.ECDH:
        case WfCryptoMethod.PSK: {
            if (!iv) {
                throw new Error(`Encryption method ${method} requires an initialisation vector`);
            }
            if (iv.length !== PARAMS[method][version].ivLength) {
                throw new Error(`Invalid initialisation vector length for encryption method ${method}`);
            }
            return {
                name: PARAMS[method][version].algorithm,
                counter: iv,
                length: PARAMS[method][version].ctrLength * BYTELENGTH
            };
        }
        default: {
            throw new Error(`Invalid encryption method: ${method}`);
        }
    }
}
