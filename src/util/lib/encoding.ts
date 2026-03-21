'use strict';
/**
 * @module util/encoding
 * @summary Whiteflag JS encoding and data conversions utility module
 * @todo Replace `Buffer` with the new native `Uint8Array` methods
 */
export {
    isBase58,
    isBase64,
    isBase64u,
    isByteArray,
    isHex,
    noHexPrefix,
    b58ToU8a,
    b64ToB64u,
    b64ToHex,
    b64ToStr,
    b64ToU8a,
    b64uToB64,
    b64uToHex,
    b64uToStr,
    b64uToU8a,
    hexToB64,
    hexToB64u,
    hexToStr,
    hexToU8a,
    strToB64,
    strToB64u,
    strToHex,
    strToU8a,
    u8aToB58,
    u8aToB64,
    u8aToB64u,
    u8aToHex,
    u8aToStr,
};

/* Dependencies */
import { Buffer } from 'node:buffer';

/* Module imports */
import { ByteArray, Base58, Base64, Base64url, Hex } from './types.ts';

/* Constants */
const EMPTYSTR = '';
const NOSEPARATOR = EMPTYSTR;
const BYTELENGTH = 8;
const UTF8 = 'utf8';
const HEXENCODING = 'hex';
const HEXRADIX = 16;
const HEXBYTELENGTH = 2;
const HEXPREFIX = '0x';
const HEX_CHARS = 'a-fA-F0-9';
const BASE58RADIX = 58;
const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE64ENCODING = 'base64';
const BASE64_CHARS = 'A-Za-z0-9+/';
const BASE64U_CHARS = 'A-Za-z0-9_-';
const REGEX_BASE58 = new RegExp(`^(?:[${BASE58_CHARS}]+)$`);
const REGEX_BASE64 =  new RegExp(`^(?:[${BASE64_CHARS}]{4})*(?:[${BASE64_CHARS}]{2}==|[${BASE64_CHARS}]{3}=)?$`);
const REGEX_BASE64U =  new RegExp(`^(?:[${BASE64U_CHARS}]+)$`);
const REGEX_HEXSTRING = new RegExp(`^(0x|0X)?(?:[${HEX_CHARS}]{2})+$`);

/* MODULE FUNCTIONS */
/**
 * Checks if a string contains base58 encoded data
 * @param str a string that might be base58 encoded
 * @returns `true` if base58 encoded, else `false`
 */
function isBase58(str: string): boolean {
    return REGEX_BASE58.test(str);
}
/**
 * Checks if a string contains base64 encoded data
 * @param str a string that might be base64 encoded
 * @returns `true` if base64 encoded, else `false`
 */
function isBase64(str: string): boolean {
    if (str === EMPTYSTR) return true;     // Empty string is valid base64
    return REGEX_BASE64.test(str);
}
/**
 * Checks if a string contains base64url encoded data
 * @param str a string that might be base64url encoded
 * @returns `true` if base64url encoded, else `false`
 */
function isBase64u(str: string): boolean {
    if (str === EMPTYSTR) return true;     // Empty string is valid base64url
    return REGEX_BASE64U.test(str);
}
/**
 * Checks if a buffer is an 8-bit unsigned integer typed array
 * @param buffer the buffer that might respresent a byte array
 * @returns `true` 8-bit unsigned integer typed array, else `false`
 */

function isByteArray(buffer: ByteArray): boolean {
    if (buffer instanceof Uint8Array) return true;
    return false;
}
/**
 * Checks if a string contains hexadecimal encoded data
 * @param str a string that might be hexadecimal encoded
 * @returns `true` if hexadecimal encoded, else `false`
 */
function isHex(str: string): boolean {
    return REGEX_HEXSTRING.test(str);
}
/**
 * Removes the '0x' hex prefix if present
 * @param hexStr a hexadecimal encoded string
 * @returns the the string without the hex prefix
 */
function noHexPrefix(hexStr: Hex): string {
    if (hexStr.startsWith(HEXPREFIX)) {
        return hexStr.substring(2).toLowerCase();
    }
    return hexStr.toLowerCase();
}
/**
 * Creates a byte array from a base58 encoded string
 * @param b58Str a base58 encoded string
 * @returns an 8-bit unsigned integer typed array
 */
function b58ToU8a(b58Str: Base58): ByteArray {
    /* Check for empty string */
    if (b58Str === EMPTYSTR) return new Uint8Array(0);

    /* Count leading ones (zero's) */
    let lead = 0;
    for (let i = 0; i < b58Str.length && b58Str[i] === BASE58_CHARS[0]; i++) {
        lead++;
    }
    /* Run through characters of the base58 string */
    let byteArray: number[] = [];
    for (const char of b58Str) {
        const index = BASE58_CHARS.indexOf(char);
        if (index === -1) throw new TypeError(`String contains an illegal Base58 character`);

        /* Calculate each byte in the byte array*/
        let carry = index;
        for (let i = 0; i < byteArray.length; i++) {
            carry += byteArray[i] * BASE58RADIX;
            byteArray[i] = carry & 0xFF;
            carry = carry >> BYTELENGTH;
        }
        /* Consume until nothing to carry over */
        while (carry > 0) {
            byteArray.push(carry & 0xFF);
            carry = carry >> BYTELENGTH;
        }
    }
    /* Add leading zero's and return result */
    while (lead--) byteArray.push(0);
    return new Uint8Array(byteArray.reverse());
}
/**
 * Converts base64 to base64url
 * @param b64Str a base64 encoded string
 * @returns a base64url encoded string
 */
function b64ToB64u(b64Str: Base64): Base64url {
    return b64Str
        .replace(/=/g, EMPTYSTR)
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
/**
 * Creates a hexadecimal string from a base64 encoded string
 * @param b64Str a base64 encoded string
 * @returns a hexadecimal encoded string
 */
function b64ToHex(b64Str: Base64): Hex {
    return Buffer.from(b64Str, BASE64ENCODING).toString(HEXENCODING);
}
/**
 * Creates a regular character string from a base64 encoded string
 * @param b64Str a base64 encoded string
 * @returns a regular character string
 */
function b64ToStr(b64Str: Base64): string {
    return Buffer.from(b64Str, BASE64ENCODING).toString(UTF8);
}
/**
 * Creates a byte array from a base64 encoded string
 * @param b64Str a base64url encoded string
 * @returns an 8-bit unsigned integer typed array
 */
function b64ToU8a(b64Str: Base64url): ByteArray {
    return new Uint8Array(Buffer.from(b64Str, BASE64ENCODING));
}
/**
 * Converts base64url to base64
 * @param b64uStr a base64url encoded string
 * @returns a base64 encoded string
 */
function b64uToB64(b64uStr: Base64url): Base64 {
    let b64Str: string = b64uStr
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    switch (b64Str.length % 4) {
        case 2: b64Str += "=="; break;
        case 3: b64Str += "="; break;
    };
    return b64Str;
}
/**
 * Creates hexadecimal string from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns a hexadecimal encoded string
 */
function b64uToHex(b64uStr: Base64url): Hex {
    return b64ToHex(b64uToB64(b64uStr));
}
/**
 * Creates a regular character string from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns a regular character string
 */
function b64uToStr(b64uStr: Base64url): string {
    return b64ToStr(b64uToB64(b64uStr));
}
/**
 * Creates a byte array from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns an 8-bit unsigned integer typed array
 */
function b64uToU8a(b64uStr: Base64url): ByteArray {
    return b64ToU8a(b64uToB64(b64uStr));
}
/**
 * Creates a base64 encoded string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a base64 encoded string
 */
function hexToB64(hexStr: Hex): Base64url {
    return Buffer.from(hexStr, HEXENCODING).toString(BASE64ENCODING);
}
/**
 * Creates a base64url encoded string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a base64url encoded string
 */
function hexToB64u(hexStr: Hex): Base64url {
    return b64ToB64u(hexToB64(hexStr));
}
/**
 * Creates a regular character string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a regular character string
 */
function hexToStr(hexStr: Hex): string {
    return u8aToStr(hexToU8a(hexStr));
}
/**
 * Creates a byte array from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns an 8-bit unsigned integer typed array
 */
function hexToU8a(hexStr: Hex): ByteArray {
    const hex = noHexPrefix(hexStr);
    const u8array = new Uint8Array(hex.length / HEXBYTELENGTH);
    for (let i = 0; i < hex.length; i += HEXBYTELENGTH) {
        u8array[i / HEXBYTELENGTH] = parseInt(hex.slice(i, i + HEXBYTELENGTH), HEXRADIX);
    }
    return u8array;
}
/**
 * Creates a base64 encoded string from a regular character string
 * @param charStr a regular character string
 * @returns a base64 encoded string
 */
function strToB64(charStr: string): Base64 {
    return Buffer.from(charStr, UTF8).toString(BASE64ENCODING);
}
/**
 * Creates a base64url encoded string from a regular character string
 * @param charStr a regular character string
 * @returns a base64url encoded string
 */
function strToB64u(charStr: string): Base64url {
    return b64ToB64u(strToB64(charStr));
}
/**
 * Creates a hexadecimal string from a regular character string
 * @param charStr a regular character string
 * @returns a hexadecimal string
 */
function strToHex(charStr: string): Hex {
    let hexStr: string = EMPTYSTR;
    for (let i = 0; i < charStr.length; i++) {
        hexStr += charStr
            .charCodeAt(i).toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0');
    }
    return hexStr.toLowerCase();
}
/**
 * Creates a byte array from a regular character string
 * @param charStr a regular character string
 * @returns an 8-bit unsigned integer typed array
 */
function strToU8a(charStr: string): ByteArray {
    return Uint8Array.from(charStr, char => char.charCodeAt(0));
}
/**
 * Creates a base58 encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base58 encoded string
 */
function u8aToB58(u8array: Uint8Array): Base58 {
    /* Check for empty string */
    if (u8array.length === 0) return EMPTYSTR;

    /* Count leading zero's (ones) */
    let lead = 0;
    for (let i = 0; i < u8array.length && u8array[i] === 0; i++) {
        lead++;
    }
    /* Run through bytes of the array */
    let b58array: number[] = [];
    for (const byte of u8array) {
        let carry = byte;
        /* Calculate each char index */
        for (let i = 0; i < b58array.length; i++) {
            carry += b58array[i] << BYTELENGTH;
            b58array[i] = carry % BASE58RADIX;
            carry = (carry / BASE58RADIX) | 0x00;
        }
        /* Consume until nothing to carry over */
        while (carry > 0) {
            b58array.push(carry % BASE58RADIX);
            carry = (carry / BASE58RADIX) | 0x00;
        }
    }
    /* Create string from the reverse array with char indexes */
    let b58Str = b58array.map(index => {
        return BASE58_CHARS[index];
    }).reverse().join(NOSEPARATOR);

    /* Add leading zero's and return result */
    while (lead--) b58Str = BASE58_CHARS[0] + b58Str;
    return b58Str;
}
/**
 * Creates a base64 encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base64 encoded string
 */
function u8aToB64(u8array: Uint8Array): Base64url {
    return Buffer.from(u8array).toString(BASE64ENCODING);
}
/**
 * Creates a base64url encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base64url encoded string
 */
function u8aToB64u(u8array: Uint8Array): Base64url {
    return b64ToB64u(u8aToB64(u8array));
}
/**
 * Creates a hexadecimal string from an Uint8Array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a hexadecimal string
 */
function u8aToHex(u8array: Uint8Array): Hex {
    let hexArray: Hex[] = [];
    for (const byte of u8array) {
        hexArray.push(byte
            .toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0')
        );
    }
    return hexArray.join(NOSEPARATOR).toLowerCase();
}
/**
 * Creates a regular character string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a regular character string
 */
function u8aToStr(u8array: Uint8Array): string {
    return String.fromCharCode(...u8array);
}
