'use strict';
/**
 * @module util/types
 * @summary Whiteflag JS utility type definitions module
 */
export {
    primitive,
    serializable,
    Serializable,
    ByteArray,
    Base58,
    Base64,
    Base64url,
    Hex,
    Iso8601,
    posixtime,
    ecmatime,
    Json,
    isArray,
    isNumber,
    isObject,
    isString,
    isSerializable
}

/* Constants */
export const BIGINT = 'bigint';
export const BOOLEAN = 'boolean';
export const FUNCTION = 'function';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';
export const SYMBOL = 'symbol';

/* MODULE DECLARATIONS */
/** Any primitive type */
type primitive = string | number | boolean | bigint | symbol | null | undefined;
/** Serializable primitive types */
type serializable = string | number | boolean | serializable[] | null;
/** Serializable data object */
type Serializable = { [key: string]: Serializable | serializable | undefined; };
/** A Uint8Array byte array */
type ByteArray = Uint8Array<ArrayBuffer>;
/** A string with base58 encoded data */
type Base58 = string;
/** A string with base64 encoded data */
type Base64 = string;
/** A string with base64url encoded data */
type Base64url = string;
/** A string with hexadecimal encoded data */
type Hex = string;
/** A string with an ISO 8601 datetime */
type Iso8601 = string;
/** POSIX epoch datetime Time in seconds */
type posixtime = number;
/** ECMA epoch datetime in milliseconds */
type ecmatime = number;
/** A string with with a JSON object */
type Json = string;

/* MODULE FUNCTIONS */
/**
 * Checks if something is an array
 * @param arr something that might be an array
 * @returns `true` if array, else `false`
 */
function isArray(arr: unknown): arr is Array<any> {
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
