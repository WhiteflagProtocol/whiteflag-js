'use strict';
export { isBase58, isBase64, isBase64u, isByteArray, isHex, noHexPrefix, b58ToU8a, b64ToB64u, b64ToHex, b64ToStr, b64ToU8a, b64uToB64, b64uToHex, b64uToStr, b64uToU8a, hexToB64, hexToB64u, hexToStr, hexToU8a, strToB64, strToB64u, strToHex, strToU8a, u8aToB58, u8aToB64, u8aToB64u, u8aToHex, u8aToStr, };
import { Buffer } from 'node:buffer';
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
const REGEX_BASE64 = new RegExp(`^(?:[${BASE64_CHARS}]{4})*(?:[${BASE64_CHARS}]{2}==|[${BASE64_CHARS}]{3}=)?$`);
const REGEX_BASE64U = new RegExp(`^(?:[${BASE64U_CHARS}]+)$`);
const REGEX_HEXSTRING = new RegExp(`^(0x|0X)?(?:[${HEX_CHARS}]{2})+$`);
function isBase58(str) {
    return REGEX_BASE58.test(str);
}
function isBase64(str) {
    if (str === EMPTYSTR)
        return true;
    return REGEX_BASE64.test(str);
}
function isBase64u(str) {
    if (str === EMPTYSTR)
        return true;
    return REGEX_BASE64U.test(str);
}
function isByteArray(buffer) {
    if (buffer instanceof Uint8Array)
        return true;
    return false;
}
function isHex(str) {
    return REGEX_HEXSTRING.test(str);
}
function noHexPrefix(hexStr) {
    if (hexStr.startsWith(HEXPREFIX)) {
        return hexStr.substring(2).toLowerCase();
    }
    return hexStr.toLowerCase();
}
function b58ToU8a(b58Str) {
    if (b58Str === EMPTYSTR)
        return new Uint8Array(0);
    let lead = 0;
    for (let i = 0; i < b58Str.length && b58Str[i] === BASE58_CHARS[0]; i++) {
        lead++;
    }
    let byteArray = [];
    for (const char of b58Str) {
        const index = BASE58_CHARS.indexOf(char);
        if (index === -1)
            throw new TypeError(`String contains an illegal Base58 character`);
        let carry = index;
        for (let i = 0; i < byteArray.length; i++) {
            carry += byteArray[i] * BASE58RADIX;
            byteArray[i] = carry & 0xFF;
            carry = carry >> BYTELENGTH;
        }
        while (carry > 0) {
            byteArray.push(carry & 0xFF);
            carry = carry >> BYTELENGTH;
        }
    }
    while (lead--)
        byteArray.push(0);
    return new Uint8Array(byteArray.reverse());
}
function b64ToB64u(b64Str) {
    return b64Str
        .replace(/=/g, EMPTYSTR)
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function b64ToHex(b64Str) {
    return Buffer.from(b64Str, BASE64ENCODING).toString(HEXENCODING);
}
function b64ToStr(b64Str) {
    return Buffer.from(b64Str, BASE64ENCODING).toString(UTF8);
}
function b64ToU8a(b64Str) {
    return new Uint8Array(Buffer.from(b64Str, BASE64ENCODING));
}
function b64uToB64(b64uStr) {
    let b64Str = b64uStr
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    switch (b64Str.length % 4) {
        case 2:
            b64Str += "==";
            break;
        case 3:
            b64Str += "=";
            break;
    }
    ;
    return b64Str;
}
function b64uToHex(b64uStr) {
    return b64ToHex(b64uToB64(b64uStr));
}
function b64uToStr(b64uStr) {
    return b64ToStr(b64uToB64(b64uStr));
}
function b64uToU8a(b64uStr) {
    return b64ToU8a(b64uToB64(b64uStr));
}
function hexToB64(hexStr) {
    return Buffer.from(hexStr, HEXENCODING).toString(BASE64ENCODING);
}
function hexToB64u(hexStr) {
    return b64ToB64u(hexToB64(hexStr));
}
function hexToStr(hexStr) {
    return u8aToStr(hexToU8a(hexStr));
}
function hexToU8a(hexStr) {
    const hex = noHexPrefix(hexStr);
    const u8array = new Uint8Array(hex.length / HEXBYTELENGTH);
    for (let i = 0; i < hex.length; i += HEXBYTELENGTH) {
        u8array[i / HEXBYTELENGTH] = parseInt(hex.slice(i, i + HEXBYTELENGTH), HEXRADIX);
    }
    return u8array;
}
function strToB64(charStr) {
    return Buffer.from(charStr, UTF8).toString(BASE64ENCODING);
}
function strToB64u(charStr) {
    return b64ToB64u(strToB64(charStr));
}
function strToHex(charStr) {
    let hexStr = EMPTYSTR;
    for (let i = 0; i < charStr.length; i++) {
        hexStr += charStr
            .charCodeAt(i).toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0');
    }
    return hexStr.toLowerCase();
}
function strToU8a(charStr) {
    return Uint8Array.from(charStr, char => char.charCodeAt(0));
}
function u8aToB58(u8array) {
    if (u8array.length === 0)
        return EMPTYSTR;
    let lead = 0;
    for (let i = 0; i < u8array.length && u8array[i] === 0; i++) {
        lead++;
    }
    let b58array = [];
    for (const byte of u8array) {
        let carry = byte;
        for (let i = 0; i < b58array.length; i++) {
            carry += b58array[i] << BYTELENGTH;
            b58array[i] = carry % BASE58RADIX;
            carry = (carry / BASE58RADIX) | 0x00;
        }
        while (carry > 0) {
            b58array.push(carry % BASE58RADIX);
            carry = (carry / BASE58RADIX) | 0x00;
        }
    }
    let b58Str = b58array.map(index => {
        return BASE58_CHARS[index];
    }).reverse().join(NOSEPARATOR);
    while (lead--)
        b58Str = BASE58_CHARS[0] + b58Str;
    return b58Str;
}
function u8aToB64(u8array) {
    return Buffer.from(u8array).toString(BASE64ENCODING);
}
function u8aToB64u(u8array) {
    return b64ToB64u(u8aToB64(u8array));
}
function u8aToHex(u8array) {
    let hexArray = [];
    for (const byte of u8array) {
        hexArray.push(byte
            .toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0'));
    }
    return hexArray.join(NOSEPARATOR).toLowerCase();
}
function u8aToStr(u8array) {
    return String.fromCharCode(...u8array);
}
