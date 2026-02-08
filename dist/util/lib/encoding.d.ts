/**
 * @module util/encoding
 * @summary Whiteflag JS encoding and data conversions utility module
 */
export { isBase58, isBase64, isBase64u, isHex, noHexPrefix, b58ToU8a, b64ToB64u, b64uToB64, b64uToHex, b64uToString, b64uToU8a, hexToB64u, hexToString, hexToU8a, stringToB64u, stringToHex, stringToU8a, u8aToB58, u8aToB64u, u8aToHex, u8aToString, };
/** A string with base58 encoded data */
export type Base58 = string;
/** A string with base64 encoded data */
export type Base64 = string;
/** A string with base64url encoded data */
export type Base64url = string;
/** A string with hexadecimal encoded data */
export type Hex = string;
/** A string with with a JSON object */
export type JSON = string;
/**
 * Checks if a string contains base58 encoded data
 * @function isBase58
 * @param str a string that might be base58 encoded
 * @returns true if base58 encoded, else false
 */
declare function isBase58(str: string): boolean;
/**
 * Checks if a string contains base64 encoded data
 * @function isBase64
 * @param str a string that might be base64 encoded
 * @returns true if base64 encoded, else false
 */
declare function isBase64(str: string): boolean;
/**
 * Checks if a string contains base64url encoded data
 * @function isBase64u
 * @param str a string that might be base64url encoded
 * @returns true if base64url encoded, else false
 */
declare function isBase64u(str: string): boolean;
/**
 * Checks if a string contains hexadecimal encoded data
 * @function hexStr
 * @param str a string that might be hexadecimal encoded
 * @returns true if hexadecimal encoded, else false
 */
declare function isHex(str: string): boolean;
/**
 * Removes the '0x' hex prefix if present
 * @function hexStr
 * @param hexStr a hexadecimal encoded string
 * @returns the the string without the hex prefix
 */
declare function noHexPrefix(hexStr: Hex): string;
/**
 * Creates a byte array from a base58 encoded string
 * @function b58ToU8a
 * @param b58Str a base58 encoded string
 * @returns an 8-bit unsigned integer typed array
 */
declare function b58ToU8a(b58Str: Base58): Uint8Array<ArrayBuffer>;
/**
 * Convert base64 to base64url
 * @function b64ToB64u
 * @param b64Str a base64 encoded string
 * @returns a base64url encoded string
 */
declare function b64ToB64u(b64Str: Base64): Base64url;
/**
 * Convert base64url to base64
 * @function b64uToB64
 * @param b64uStr a base64url encoded string
 * @returns a base64 encoded string
 */
declare function b64uToB64(b64uStr: Base64url): Base64;
/**
 * Creates hexadecimal string from a base64url encoded string
 * @function b64uToHex
 * @param b64uStr a base64url encoded string
 * @returns a hexadecimal encoded string
 */
declare function b64uToHex(b64uStr: Base64url): Hex;
/**
 * Creates a regular character string from a base64url encoded string
 * @function b64uToString
 * @param b64uStr a base64url encoded string
 * @returns a regular character string
 */
declare function b64uToString(b64uStr: Base64url): string;
/**
 * Creates a byte array from a base64url encoded string
 * @function b64uToU8a
 * @param b64uStr a base64url encoded string
 * @returns an 8-bit unsigned integer typed array
 */
declare function b64uToU8a(b64uStr: Base64url): Uint8Array;
/**
 * Creates a base64url encoded string from a hexadecimal string
 * @function hexToB64u
 * @param hexStr a hexadecimal string
 * @returns a base64url encoded string
 */
declare function hexToB64u(hexStr: Hex): Base64url;
/**
 * Creates a regular character string from a hexadecimal string
 * @function hexToString
 * @param hexStr a hexadecimal string
 * @returns a regular character string
 */
declare function hexToString(hexStr: Hex): string;
/**
 * Creates a byte array from a hexadecimal string
 * @function hexToU8a
 * @param hexStr a hexadecimal string
 * @returns an 8-bit unsigned integer typed array
 */
declare function hexToU8a(hexStr: Hex): Uint8Array<ArrayBuffer>;
/**
 * Creates a base64url encoded string from a regular character string
 * @function stringToB64u
 * @param charStr a regular character string
 * @returns a base64url encoded string
 */
declare function stringToB64u(charStr: string): Base64url;
/**
 * Creates a hexadecimal string from a regular character string
 * @function stringToHex
 * @param charStr a regular character string
 * @returns a hexadecimal string
 */
declare function stringToHex(charStr: string): Hex;
/**
 * Creates a byte array from a regular character string
 * @function stringToU8a
 * @param charStr a regular character string
 * @returns an 8-bit unsigned integer typed array
 */
declare function stringToU8a(charStr: string): Uint8Array<ArrayBuffer>;
/**
 * Creates a base58 encoded string from a byte array
 * @function u8aToB58
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base58 encoded string
 */
declare function u8aToB58(u8array: Uint8Array): Base58;
/**
 * Creates a base64url encoded string from a byte array
 * @function u8aToB64u
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base64url encoded string
 */
declare function u8aToB64u(u8array: Uint8Array): Base64url;
/**
 * Creates a hexadecimal string from an Uint8Array
 * @function u8aToHex
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a hexadecimal string
 */
declare function u8aToHex(u8array: Uint8Array): Hex;
/**
 * Creates a regular character string from a byte array
 * @function u8aToString
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a regular character string
 */
declare function u8aToString(u8array: Uint8Array): string;
