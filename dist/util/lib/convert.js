"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = isObject;
exports.isString = isString;
exports.toBase64u = toBase64u;
exports.toBase64 = toBase64;
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
function isObject(obj) {
    return (typeof obj === 'object' || obj instanceof Object);
}
function isString(charString) {
    return (typeof charString === 'string' || charString instanceof String);
}
function toBase64u(base64) {
    return base64
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function toBase64(b64uString) {
    let base64 = b64uString
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
    return atob(toBase64(b64uString));
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
    const u8array = new Uint8Array(hexString.length / HEXBYTELENGTH);
    for (let i = 0; i < hexString.length; i += HEXBYTELENGTH) {
        u8array[i / HEXBYTELENGTH] = parseInt(hexString.slice(i, i + HEXBYTELENGTH), HEXRADIX);
    }
    return u8array;
}
function stringToB64u(charString) {
    return toBase64u(btoa(charString));
}
function stringToHex(charString) {
    let hexString = '';
    for (let i = 0; i < charString.length; i++) {
        hexString += charString
            .charCodeAt(i).toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0');
    }
    return hexString;
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
    return hexArray.join(NOSEPARATOR);
}
function u8aToString(u8array) {
    return String.fromCharCode(...u8array);
}
