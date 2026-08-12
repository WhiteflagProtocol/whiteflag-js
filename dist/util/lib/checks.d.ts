/**
 * @module util/checks
 * @summary Whiteflag JS utility type and encoding checks module
 */
export { isArray, isNumber, isObject, isString, isSerializable, isBase58, isBase64, isBase64u, isByteArray, isHex };
import { ByteArray, serializable } from './types.ts';
export declare const BIGINT = "bigint";
export declare const BOOLEAN = "boolean";
export declare const FUNCTION = "function";
export declare const NUMBER = "number";
export declare const OBJECT = "object";
export declare const STRING = "string";
export declare const SYMBOL = "symbol";
/**
 * Checks if something is an array
 * @param arr something that might be an array
 * @returns `true` if array, else `false`
 */
declare function isArray(arr: unknown): arr is any[];
/**
 * Checks if something is a finite number
 * @param num something that might be a number
 * @returns `true` if finite number, else `false`
 */
declare function isNumber(num: unknown): num is number;
/**
 * Checks if something is an object
 * @param obj something that might be an object
 * @returns `true` if object, else `false`
 */
declare function isObject(obj: unknown): obj is object;
/**
 * Checks if something is a string
 * @param str something that might be a string
 * @returns `true` if string, else `false`
 */
declare function isString(str: unknown): str is string;
/**
 * Checks if a primitive value is serializable
 * @param value a value that might be serializable
 * @returns `true` if serializable, else `false`
 */
declare function isSerializable(value: unknown): value is serializable;
/**
 * Checks if a string contains base58 encoded data
 * @param str a string that might be base58 encoded
 * @returns `true` if base58 encoded, else `false`
 */
declare function isBase58(str: string): boolean;
/**
 * Checks if a string contains base64 encoded data
 * @param str a string that might be base64 encoded
 * @returns `true` if base64 encoded, else `false`
 */
declare function isBase64(str: string): boolean;
/**
 * Checks if a string contains base64url encoded data
 * @param str a string that might be base64url encoded
 * @returns `true` if base64url encoded, else `false`
 */
declare function isBase64u(str: string): boolean;
/**
 * Checks if a buffer is an 8-bit unsigned integer typed array
 * @param buffer the buffer that might respresent a byte array
 * @returns `true` 8-bit unsigned integer typed array, else `false`
 */
declare function isByteArray(buffer: ByteArray): boolean;
/**
 * Checks if a string contains hexadecimal encoded data
 * @param str a string that might be hexadecimal encoded
 * @returns `true` if hexadecimal encoded, else `false`
 */
declare function isHex(str: string): boolean;
