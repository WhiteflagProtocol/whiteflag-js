'use strict';
/**
 * @module crypto/encrypt
 * @summary Whiteflag JS generic data encryption module
 */
export {
    EncryptedData,
    encryptData,
    decryptData,
    generateDEK
}

/* Dependecies */
import { handleError } from '@whiteflagprotocol/common';
import { ByteArray, Base64, Serializable } from '@whiteflagprotocol/util';
import { isBase64, objectHas, b64ToU8a, hexToU8a, u8aToB64 } from '@whiteflagprotocol/util';

/* Module imports */
import { hkdf } from './hash.ts';
import { createAesKey } from './keys.ts';
import { random } from './random.ts';
import { 
    AES_GCM,
    AES_GCM_IVLENGTH,
    AES_GCM_TAGLENGTH,
    BYTELENGTH
} from './constants.ts';

/* Constants */
const KEY_LENGTH = 32;
const DEK_SALT = hexToU8a('6a1abfc3ccb7e1b27979fcd0d96433292d3bdaed42500e27e33dab4cbf8742fa');

/* MODULE DECLARATIONS */
/**
 * An encrypted data object
 * @remarks The Whiteflag generic data encryption function return this
 * object with encrypted data. All binary data is base64 encoded.
 */
interface EncryptedData extends Serializable {
    /** Optional information about the encrypted data */
    info?: string;
    /** The base64 encoded initialization vector used to encrypt the data */
    iv: Base64;
    /** The base64 encoded AES-256-GCM encrypted data */
    encrypted: Base64;
}

/* MODULE FUNCTIONS */
/**
 * Encrypts binary data using AES-256-GCM
 * @param key the cryptographic key object to encypt the data
 * @param plain the binary data to be encrypted
 * @param info optional additional information to be added to the returned object
 * @returns a data object with the encrypted data and initialization vector
 */
async function encryptData(key: CryptoKey, plain: ByteArray, info?: string): Promise<EncryptedData> {
    let encrypted: ArrayBuffer;
    const iv = random(AES_GCM_IVLENGTH / BYTELENGTH);

    /* Try to encrypt */
    try {
        encrypted = await crypto.subtle.encrypt(
            getAesParameters(iv), key, plain);
    } catch(err) {
        return handleError(err, 'Data encryption error');
    }
    /* Return result */
    return {
        info: info,
        iv: u8aToB64(iv),
        encrypted: u8aToB64(new Uint8Array(encrypted))
    }
}
/**
 * Decrypts binary data using AES-256-GCM
 * @param key the cryptographic key object to decrypt the data
 * @param edo a data object with the encrypted data and initialization vector
 * @returns the decrypted data
 */
async function decryptData(key: CryptoKey, edo: EncryptedData): Promise<ByteArray> {
    /* Check data */
    if (!objectHas(edo, 'iv') || !isBase64(edo?.iv)) throw new TypeError('Encrypted data object does not contain a base64 encoded initialization vector');
    if (!objectHas(edo, 'encrypted') || !isBase64(edo?.encrypted)) throw new TypeError('Encrypted data object does not contain base64 encoded encrypted data');

    /* Try to decrypt */
    let decrypted: ArrayBuffer;
    try {
        const iv = b64ToU8a(edo.iv);
        decrypted = await crypto.subtle.decrypt(
            getAesParameters(iv), key, b64ToU8a(edo.encrypted));
    } catch(err) {
        return handleError(err, 'Data decryption error');
    }
    /* Return result */
    return new Uint8Array(decrypted) 
}
/**
 * Generates the data encryption key from the master encryption key
 * @param info information that identifies the data encryption key
 * @param mek the master encryption key
 * @returns the data encryption key object
 */
async function generateDEK(mek: ByteArray, info: ByteArray, salt: ByteArray = DEK_SALT): Promise<CryptoKey> {
    const rawDEK = await hkdf(mek, salt, info, KEY_LENGTH);
    return createAesKey(rawDEK, AES_GCM);
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Creates the algorithm parameter object for AES-GCM encryption
 * @param iv the initialization vector
 * @returns the AES-GCM algorithm parameter object
 */
function getAesParameters(iv: ByteArray): AesGcmParams {
    return {
        name: AES_GCM,
        iv: iv.buffer,
        tagLength: AES_GCM_TAGLENGTH
    };
}
