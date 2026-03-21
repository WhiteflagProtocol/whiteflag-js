'use strict';
export { encryptData, decryptData, generateDEK };
import { handleError } from '@whiteflagprotocol/common';
import { isBase64, objectHas, b64ToU8a, hexToU8a, u8aToB64 } from '@whiteflagprotocol/util';
import { hkdf } from "./hash.js";
import { createAesKey } from "./keys.js";
import { random } from "./random.js";
import { AES_GCM, AES_GCM_IVLENGTH, AES_GCM_TAGLENGTH, BYTELENGTH } from "./constants.js";
const KEY_LENGTH = 32;
const DEK_SALT = hexToU8a('6a1abfc3ccb7e1b27979fcd0d96433292d3bdaed42500e27e33dab4cbf8742fa');
async function encryptData(key, plain, info) {
    let encrypted;
    const iv = random(AES_GCM_IVLENGTH / BYTELENGTH);
    try {
        encrypted = await crypto.subtle.encrypt(getAesParameters(iv), key, plain);
    }
    catch (err) {
        return handleError(err, 'Data encryption error');
    }
    return {
        info: info,
        iv: u8aToB64(iv),
        encrypted: u8aToB64(new Uint8Array(encrypted))
    };
}
async function decryptData(key, edo) {
    if (!objectHas(edo, 'iv') || !isBase64(edo?.iv))
        throw new TypeError('Encrypted data object does not contain a base64 encoded initialization vector');
    if (!objectHas(edo, 'encrypted') || !isBase64(edo?.encrypted))
        throw new TypeError('Encrypted data object does not contain base64 encoded encrypted data');
    let decrypted;
    try {
        const iv = b64ToU8a(edo.iv);
        decrypted = await crypto.subtle.decrypt(getAesParameters(iv), key, b64ToU8a(edo.encrypted));
    }
    catch (err) {
        return handleError(err, 'Data decryption error');
    }
    return new Uint8Array(decrypted);
}
async function generateDEK(mek, info, salt = DEK_SALT) {
    const rawDEK = await hkdf(mek, salt, info, KEY_LENGTH);
    return createAesKey(rawDEK, AES_GCM);
}
function getAesParameters(iv) {
    return {
        name: AES_GCM,
        iv: iv.buffer,
        tagLength: AES_GCM_TAGLENGTH
    };
}
