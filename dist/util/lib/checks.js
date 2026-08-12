'use strict';
export { isArray, isNumber, isObject, isString, isSerializable, isBase58, isBase64, isBase64u, isByteArray, isHex };
import { BASE58_CHARS, BASE64_CHARS, BASE64U_CHARS, HEX_CHARS } from "./encoding.js";
export const BIGINT = 'bigint';
export const BOOLEAN = 'boolean';
export const FUNCTION = 'function';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';
export const SYMBOL = 'symbol';
const EMPTYSTR = '';
const REGEX_BASE58 = new RegExp(`^(?:[${BASE58_CHARS}]+)$`);
const REGEX_BASE64 = new RegExp(`^(?:[${BASE64_CHARS}]{4})*(?:[${BASE64_CHARS}]{2}==|[${BASE64_CHARS}]{3}=)?$`);
const REGEX_BASE64U = new RegExp(`^(?:[${BASE64U_CHARS}]+)$`);
const REGEX_HEXSTRING = new RegExp(`^(0x|0X)?(?:[${HEX_CHARS}]{2})+$`);
function isArray(arr) {
    return Array.isArray(arr);
}
function isNumber(num) {
    return (typeof num === NUMBER && Number.isFinite(num));
}
function isObject(obj) {
    return (typeof obj === OBJECT && !!obj);
}
function isString(str) {
    return (typeof str === STRING);
}
function isSerializable(value) {
    if (value === null)
        return true;
    switch (typeof value) {
        case STRING:
        case BOOLEAN: {
            return true;
        }
        case NUMBER: {
            if (Number.isFinite(value))
                return true;
        }
    }
    if (isArray(value)) {
        if (value.every(item => isSerializable(item)))
            return true;
    }
    return false;
}
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
