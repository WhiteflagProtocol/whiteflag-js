'use strict';
/**
 * @module util/checks
 * @summary Whiteflag JS utility type and encoding checks module
 */
export {
    isArray,
    isNumber,
    isObject,
    isString,
    isSerializable,
    isBase58,
    isBase64,
    isBase64u,
    isByteArray,
    isHex
}

/* Package modules */
import { ByteArray, serializable } from './types.ts';
import { BASE58_CHARS, BASE64_CHARS, BASE64U_CHARS, HEX_CHARS } from './encoding.ts';

/* Constants */
export const BIGINT = 'bigint';
export const BOOLEAN = 'boolean';
export const FUNCTION = 'function';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';
export const SYMBOL = 'symbol';
const EMPTYSTR = '';
const REGEX_BASE58 = new RegExp(`^(?:[${BASE58_CHARS}]+)$`);
const REGEX_BASE64 =  new RegExp(`^(?:[${BASE64_CHARS}]{4})*(?:[${BASE64_CHARS}]{2}==|[${BASE64_CHARS}]{3}=)?$`);
const REGEX_BASE64U =  new RegExp(`^(?:[${BASE64U_CHARS}]+)$`);
const REGEX_HEXSTRING = new RegExp(`^(0x|0X)?(?:[${HEX_CHARS}]{2})+$`);

/* MODULE FUNCTIONS */
/**
 * Checks if something is an array
 * @param arr something that might be an array
 * @returns `true` if array, else `false`
 */
function isArray(arr: unknown): arr is any[] {
    return Array.isArray(arr);
}
/**
 * Checks if something is a finite number
 * @param num something that might be a number
 * @returns `true` if finite number, else `false`
 */
function isNumber(num: unknown): num is number {
    return (typeof num === NUMBER && Number.isFinite(num)); 
}
/**
 * Checks if something is an object
 * @param obj something that might be an object
 * @returns `true` if object, else `false`
 */
function isObject(obj: unknown): obj is object {
    return (typeof obj === OBJECT && !!obj);
}
/**
 * Checks if something is a string
 * @param str something that might be a string
 * @returns `true` if string, else `false`
 */
function isString(str: unknown): str is string {
    return (typeof str === STRING); 
}
/**
 * Checks if a primitive value is serializable
 * @param value a value that might be serializable
 * @returns `true` if serializable, else `false`
 */
function isSerializable(value: unknown): value is serializable {
    /* Check null */
    if (value === null) return true;

    /* Serializable primitives */
    switch (typeof value) {
        case STRING:
        case BOOLEAN: {
            return true;
        }
        case NUMBER: {
            if (Number.isFinite(value)) return true;
        }
    }
    /* Arrays of serializable primitives */
    if (isArray(value)) {
        if (value.every(item => isSerializable(item))) return true;
    }
    /* Not serializable */
    return false;
}
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
