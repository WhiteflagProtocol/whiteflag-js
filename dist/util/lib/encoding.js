"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = isObject;
exports.isString = isString;
exports.isBase64 = isBase64;
exports.isBase64u = isBase64u;
exports.isHex = isHex;
exports.noHexPrefix = noHexPrefix;
exports.objToB64u = objToB64u;
exports.b64uToObj = b64uToObj;
exports.b64ToB64u = b64ToB64u;
exports.b64uToB64 = b64uToB64;
exports.b64uToHex = b64uToHex;
exports.b64uToString = b64uToString;
exports.b64uToU8a = b64uToU8a;
exports.hexToB64u = hexToB64u;
exports.hexToString = hexToString;
exports.hexToU8a = hexToU8a;
exports.stringToB64u = stringToB64u;
exports.stringToHex = stringToHex;
exports.stringToU8a = stringToU8a;
exports.u8aToB64u = u8aToB64u;
exports.u8aToHex = u8aToHex;
exports.u8aToString = u8aToString;
const NOSEPARATOR = '';
const HEXBYTELENGTH = 2;
const HEXRADIX = 16;
const HEXPREFIX = '0x';
const REGEX_BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const REGEX_BASE64U = /^(?:[A-Za-z0-9_-]+)$/;
const REGEX_HEXSTRING = /^(0x|0X)?(?:[a-fA-F0-9]{2})+$/;
function isObject(obj) {
    return (typeof obj === 'object' || obj instanceof Object);
}
function isString(charString) {
    return (typeof charString === 'string' || charString instanceof String);
}
function isBase64(base64) {
    return REGEX_BASE64.test(base64);
}
function isBase64u(base64u) {
    return REGEX_BASE64U.test(base64u);
}
function isHex(hexString) {
    return REGEX_HEXSTRING.test(hexString);
}
function noHexPrefix(hexString) {
    if (hexString.startsWith(HEXPREFIX)) {
        return hexString.substring(2).toLowerCase();
    }
    return hexString.toLowerCase();
}
function objToB64u(obj) {
    return stringToB64u(JSON.stringify(obj));
}
function b64uToObj(base64u) {
    return JSON.parse(b64uToString(base64u));
}
function b64ToB64u(base64) {
    return base64
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function b64uToB64(base64u) {
    let base64 = base64u
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    switch (base64.length % 4) {
        case 2:
            base64 += "==";
            break;
        case 3:
            base64 += "=";
            break;
    }
    ;
    return base64;
}
function b64uToHex(b64uString) {
    return stringToHex(b64uToString(b64uString));
}
function b64uToString(b64uString) {
    return atob(b64uToB64(b64uString));
}
function b64uToU8a(b64uString) {
    return stringToU8a(b64uToString(b64uString));
}
function hexToB64u(hexString) {
    return u8aToB64u(hexToU8a(hexString));
}
function hexToString(hexString) {
    return u8aToString(hexToU8a(hexString));
}
function hexToU8a(hexString) {
    const hex = noHexPrefix(hexString);
    const u8array = new Uint8Array(hex.length / HEXBYTELENGTH);
    for (let i = 0; i < hex.length; i += HEXBYTELENGTH) {
        u8array[i / HEXBYTELENGTH] = parseInt(hex.slice(i, i + HEXBYTELENGTH), HEXRADIX);
    }
    return u8array;
}
function stringToB64u(charString) {
    return b64ToB64u(btoa(charString));
}
function stringToHex(charString) {
    let hexString = '';
    for (let i = 0; i < charString.length; i++) {
        hexString += charString
            .charCodeAt(i).toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0');
    }
    return hexString.toLowerCase();
}
function stringToU8a(charString) {
    return Uint8Array.from(charString, char => char.charCodeAt(0));
}
function u8aToB64u(u8array) {
    return stringToB64u(u8aToString(u8array));
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
function u8aToString(u8array) {
    return String.fromCharCode(...u8array);
}
