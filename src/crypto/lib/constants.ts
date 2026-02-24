'use strict';
/**
 * @module crypto/constants
 * @summary Whiteflag JS cryptographic constants module
 */

/* MODULE CONSTANTS */
/* General */
export const BYTELENGTH = 8;
export const HEXENCODING = 'hex';
/* Keys */
export const RAWKEY = 'raw';
export const EXTRACTABLE = true;
export const NOTEXTRACTABLE = false;
/* Algorithm names */
export const AES_CTR = 'AES-CTR';
export const AES_GCM = 'AES-GCM';
export const ECDH = 'ECDH';
export const ECDSA = 'ECDSA';
export const Ed25519 = 'Ed25519';
export const ES256_CURVE = 'P-256';
export const HMAC = 'HMAC';
export const RSA_SSA_PSS = 'RSA-PSS'
export const RSA_SSA_PKCS1 = 'RSASSA-PKCS1-v1_5';
export const SHA_256 = 'SHA-256'
/* Default algorithms */
export const DEFAULT_HASHLEN = 32;
export const DEFAULT_HASHALG = SHA_256;
export const DEFAULT_DATA_ENCRYPTALG = AES_GCM;
export const DEFAULT_WF_ENCRYPTALG = AES_CTR;
export const DEFAULT_WF_ECDHCURVE = 'brainpoolP256r1';
/* Algorithm parameters */
export const AES_GCM_IVLENGTH = 96;
export const AES_GCM_TAGLENGTH = 96;
export const RSA_MODLENGTH = 4096;
export const RSA_PUBEXP = new Uint8Array([ 0x01, 0x00, 0x01 ]);

