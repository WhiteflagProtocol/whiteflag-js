'use strict';
/**
 * @module crypto/cipher
 * @summary Whiteflag JS message encryption module
 */
export {
    encryptMsg,
    decryptMsg,
    deriveKey
};

/* Dependencies */
import { WfCryptoMethod, WfVersion, noNumber } from '@whiteflagprotocol/common';
import { ByteArray, hexToU8a, zeroise } from '@whiteflagprotocol/util';

/* Module imports */
import { hkdf } from './hash.ts';
import { createAesKey } from './keys.ts';
import { BYTELENGTH } from './constants.ts';

/* Whiteflag specification */
import cryptoSpec_v1 from '../static/v1/wf-crypto-params.json' with { type: 'json' };

/* MODULE DECLARATIONS */
/** AES Parameters */
export type AesParams = AesCtrParams | AesCbcParams | AesGcmParams;

/** Whiteflag encryption parameters for each method */
const PARAMS = compileCryptoParams();

/* MODULE FUNCTIONS */
/**
 * Encrypts a Whiteflag message based on the specified encryption method
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be encrypted
 * @param method the Whiteflag encryption method
 * @param key the input key material for the encryption key
 * @param iv the initialization vector, if required for the method
 * @param version the Whiteflag protocol version
 */
async function encryptMsg(message: ByteArray,
                          method: WfCryptoMethod,
                          key: CryptoKey,
                          iv?: ByteArray,
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
 * Decrypts a Whiteflag message based on the specified encryption method
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be decrypted
 * @param method the Whiteflag encryption method
 * @param key the encryption key
 * @param iv the initialization vector, if required for the method
 * @param version the Whiteflag protocol version
 */
async function decryptMsg(message: ByteArray,
                          method: WfCryptoMethod,
                          key: CryptoKey,
                          iv?: ByteArray,
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
 * @wfversion v1-draft.7
 * @wfreference 5.2.3 Encryption Key and Authentication Token Derivation
 * @param ikm the raw input key material
 * @param method the Whiteflag encryption method
 * @param info information to bind the key, e.g. the blockchain address of the originator
 * @param version the Whiteflag protocol version
 * @returns the encryption key
 */
async function deriveKey(ikm: ByteArray,
                         method: WfCryptoMethod,
                         info: ByteArray,
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
 * Encryption parameters of the Whiteflag specification
 * @private
 */
interface WfCryptoParams {
    [key: string]: {                // Encryption method
        [key: string]: {            // Whiteflag version
            $description: string;   // Description of the encryption method
            algorithm: string;      // Encryption algorithm
            keyLength: number;      // Byte length of the encryption key
            salt: string;           // Salt for HKDF key generation
            ivLength?: number;      // Byte length of the initialization vector
            ctrLength?: number;     // Byte length of the counter block part used as counter
        }
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Compiles an object with all encryption parameters
 * @private
 * @returns an object with encryption parameters
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
async function encryptAes(data: ByteArray,
                          key: CryptoKey,
                          parameters: AesParams
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
async function decryptAes(data: ByteArray,
                          key: CryptoKey,
                          parameters: AesParams
                        ): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
        parameters, key, data
    );
    return new Uint8Array(decrypted);
}
/**
 * Creates the algorithm parameter object for AES based on the Whiteflag encryption method
 * @private
 * @param method the Whiteflag encryption method
 * @param iv the initialization vector, if required for the method
 * @param version the Whiteflag protocol version
 * @returns the AES algorithm parameter object
 */
function getAesParameters(method: WfCryptoMethod,
                          iv?: ByteArray,
                          version = WfVersion.v1
                        ): AesParams {
    /* Compile encryption parameters based on encryption method */
    switch (method) {
        case WfCryptoMethod.ECDH:
        case WfCryptoMethod.PSK: {
            if (!iv) {
                throw new Error(`Encryption method ${method} requires an initialization vector`);
            }
            if (iv.length !== PARAMS[method][version].ivLength) {
                throw new Error(`Invalid initialization vector length for encryption method ${method}`);
            }
            return {
                name: PARAMS[method][version].algorithm,
                counter: iv,
                length: (PARAMS[method][version].ctrLength || noNumber('AES counter length')) * BYTELENGTH
            };
        }
        default: {
            throw new Error(`Invalid encryption method: ${method}`);
        }
    }
}
