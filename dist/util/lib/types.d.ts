/**
 * @module util/types
 * @summary Whiteflag JS utility type definitions module
 */
export { isNumber, isString, isObject, isSerializable };
export declare const BOOLEAN = "boolean";
export declare const NUMBER = "number";
export declare const OBJECT = "object";
export declare const STRING = "string";
/** Any primitive type */
export type primitive = string | number | boolean | bigint | symbol | null | undefined;
/** Serializable primitive types */
export type serializable = string | string[] | number | number[] | boolean | boolean[] | null;
/** Serializable data object */
export type Serializable = {
    [key: string]: Serializable | serializable | undefined;
};
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
/**
 * Checks if something is a finite number
 * @param num something that might be a number
 * @returns `true` if finite number, else `false`
 */
declare function isNumber(num: unknown): boolean;
/**
 * Checks if something is a string
 * @param str something that might be a string
 * @returns `true` if string, else `false`
 */
declare function isString(str: unknown): boolean;
/**
 * Checks if something is an object
 * @param obj something that might be an object
 * @returns `true` if object, else `false`
 */
declare function isObject(obj: unknown): boolean;
/**
 * Checks if something is serializable
 * @param entity something that might be serializable
 * @returns `true` if string, else `false`
 */
declare function isSerializable(entity: unknown): boolean;
