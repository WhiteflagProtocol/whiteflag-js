'use strict';
/**
 * @module util/types
 * @summary Whiteflag JS utility type definitions module
 */

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
/** A string with with a JSON object */
export type Json = string;
