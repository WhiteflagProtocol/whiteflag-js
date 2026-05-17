'use strict';
/**
 * @module util/types
 * @summary Whiteflag JS utility type definitions module
 */
export {
    isNumber,
    isString,
    isObject,
    isSerializable
}

/* Constants */
export const BOOLEAN = 'boolean';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';

/* MODULE DECLARATIONS */
/** Any primitive type */
export type primitive = string | number | boolean | bigint | symbol | null | undefined;
/** Serializable primitive types */
export type serializable = string | string[] | number | number[] | boolean | boolean[] | null;
/** Serializable data object */
export type Serializable = { [key: string]: Serializable | serializable | undefined; };
/** A Uint8Array byte array */
export type ByteArray = Uint8Array<ArrayBuffer>;
/** A string with base58 encoded data */
export type Base58 = string;
/** A string with base64 encoded data */
export type Base64 = string;
/** A string with base64url encoded data */
export type Base64url = string;
/** A string with hexadecimal encoded data */
export type Hex = string;
/** A string with an ISO 8601 datetime */
export type Iso8601 = string;
/** POSIX epoch datetime Time in seconds */
export type posixtime = number;
/** ECMA epoch datetime in milliseconds */
export type ecmatime = number;
/** A string with with a JSON object */
export type Json = string;

/* MODULE FUNCTIONS */
/**
 * Checks if something is a finite number
 * @param num something that might be a number
 * @returns `true` if finite number, else `false`
 */
function isNumber(num: unknown): boolean {
    return (typeof num === NUMBER && Number.isFinite(num)); 
}
/**
 * Checks if something is a string
 * @param str something that might be a string
 * @returns `true` if string, else `false`
 */
function isString(str: unknown): boolean {
    return (typeof str === STRING); 
}
/**
 * Checks if something is an object
 * @param obj something that might be an object
 * @returns `true` if object, else `false`
 */
function isObject(obj: unknown): boolean {
    return (typeof obj === OBJECT || obj instanceof Object);
}
/**
 * Checks if something is serializable
 * @param entity something that might be serializable
 * @returns `true` if string, else `false`
 */
function isSerializable(entity: unknown): boolean {
    /* Check null */
    if (entity === null) return true;

    /* Serializable primitives */
    switch (typeof entity) {
        case STRING:
        case NUMBER:
        case BOOLEAN: {
            return true
        }
    }
    /* Arrays of serializable primitives */
    if (Array.isArray(entity)) {
        if (entity.every(item => isSerializable(item))) return true;
    }
    /* Not serializable */
    return false;
}
