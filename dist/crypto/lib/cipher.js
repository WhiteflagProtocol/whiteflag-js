'use strict';
export { encryptMsg, decryptMsg, deriveKey };
import { WfCryptoMethod, WfVersion, noNumber } from '@whiteflagprotocol/common';
import { hexToU8a, zeroise } from '@whiteflagprotocol/util';
import { hkdf } from "./hash.js";
import { createAesKey } from "./keys.js";
import { BYTELENGTH } from "./constants.js";
import cryptoSpec_v1 from '../static/v1/wf-crypto-params.json' with { type: 'json' };
const PARAMS = compileCryptoParams();
async function encryptMsg(message, method, key, iv, version = WfVersion.v1) {
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
async function decryptMsg(message, method, key, iv, version = WfVersion.v1) {
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
async function deriveKey(ikm, method, info, version = WfVersion.v1) {
    const salt = hexToU8a(PARAMS[method][version].salt);
    const keyLength = PARAMS[method][version].keyLength;
    const rawKey = await hkdf(ikm, salt, info, keyLength);
    zeroise(ikm);
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
function compileCryptoParams() {
    const params = {};
    for (const method of Object.values(WfCryptoMethod)) {
        params[method] = {};
        {
            const version = WfVersion.v1;
            params[method][version] = cryptoSpec_v1[method];
        }
    }
    return params;
}
async function encryptAes(data, key, parameters) {
    const encrypted = await crypto.subtle.encrypt(parameters, key, data);
    return new Uint8Array(encrypted);
}
async function decryptAes(data, key, parameters) {
    const decrypted = await crypto.subtle.decrypt(parameters, key, data);
    return new Uint8Array(decrypted);
}
function getAesParameters(method, iv, version = WfVersion.v1) {
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
