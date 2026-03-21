/**
 * @module util/encoding
 * @summary Whiteflag JS encoding and data conversions utility module
 * @todo Replace `Buffer` with the new native `Uint8Array` methods
 */
export { isBase58, isBase64, isBase64u, isByteArray, isHex, noHexPrefix, b58ToU8a, b64ToB64u, b64ToHex, b64ToStr, b64ToU8a, b64uToB64, b64uToHex, b64uToStr, b64uToU8a, hexToB64, hexToB64u, hexToStr, hexToU8a, strToB64, strToB64u, strToHex, strToU8a, u8aToB58, u8aToB64, u8aToB64u, u8aToHex, u8aToStr, };
import { ByteArray, Base58, Base64, Base64url, Hex } from './types.ts';
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
/**
 * Removes the '0x' hex prefix if present
 * @param hexStr a hexadecimal encoded string
 * @returns the the string without the hex prefix
 */
declare function noHexPrefix(hexStr: Hex): string;
/**
 * Creates a byte array from a base58 encoded string
 * @param b58Str a base58 encoded string
 * @returns an 8-bit unsigned integer typed array
 */
declare function b58ToU8a(b58Str: Base58): ByteArray;
/**
 * Converts base64 to base64url
 * @param b64Str a base64 encoded string
 * @returns a base64url encoded string
 */
declare function b64ToB64u(b64Str: Base64): Base64url;
/**
 * Creates a hexadecimal string from a base64 encoded string
 * @param b64Str a base64 encoded string
 * @returns a hexadecimal encoded string
 */
declare function b64ToHex(b64Str: Base64): Hex;
/**
 * Creates a regular character string from a base64 encoded string
 * @param b64Str a base64 encoded string
 * @returns a regular character string
 */
declare function b64ToStr(b64Str: Base64): string;
/**
 * Creates a byte array from a base64 encoded string
 * @param b64Str a base64url encoded string
 * @returns an 8-bit unsigned integer typed array
 */
declare function b64ToU8a(b64Str: Base64url): ByteArray;
/**
 * Converts base64url to base64
 * @param b64uStr a base64url encoded string
 * @returns a base64 encoded string
 */
declare function b64uToB64(b64uStr: Base64url): Base64;
/**
 * Creates hexadecimal string from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns a hexadecimal encoded string
 */
declare function b64uToHex(b64uStr: Base64url): Hex;
/**
 * Creates a regular character string from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns a regular character string
 */
declare function b64uToStr(b64uStr: Base64url): string;
/**
 * Creates a byte array from a base64url encoded string
 * @param b64uStr a base64url encoded string
 * @returns an 8-bit unsigned integer typed array
 */
declare function b64uToU8a(b64uStr: Base64url): ByteArray;
/**
 * Creates a base64 encoded string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a base64 encoded string
 */
declare function hexToB64(hexStr: Hex): Base64url;
/**
 * Creates a base64url encoded string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a base64url encoded string
 */
declare function hexToB64u(hexStr: Hex): Base64url;
/**
 * Creates a regular character string from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns a regular character string
 */
declare function hexToStr(hexStr: Hex): string;
/**
 * Creates a byte array from a hexadecimal string
 * @param hexStr a hexadecimal string
 * @returns an 8-bit unsigned integer typed array
 */
declare function hexToU8a(hexStr: Hex): ByteArray;
/**
 * Creates a base64 encoded string from a regular character string
 * @param charStr a regular character string
 * @returns a base64 encoded string
 */
declare function strToB64(charStr: string): Base64;
/**
 * Creates a base64url encoded string from a regular character string
 * @param charStr a regular character string
 * @returns a base64url encoded string
 */
declare function strToB64u(charStr: string): Base64url;
/**
 * Creates a hexadecimal string from a regular character string
 * @param charStr a regular character string
 * @returns a hexadecimal string
 */
declare function strToHex(charStr: string): Hex;
/**
 * Creates a byte array from a regular character string
 * @param charStr a regular character string
 * @returns an 8-bit unsigned integer typed array
 */
declare function strToU8a(charStr: string): ByteArray;
/**
 * Creates a base58 encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base58 encoded string
 */
declare function u8aToB58(u8array: Uint8Array): Base58;
/**
 * Creates a base64 encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base64 encoded string
 */
declare function u8aToB64(u8array: Uint8Array): Base64url;
/**
 * Creates a base64url encoded string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a base64url encoded string
 */
declare function u8aToB64u(u8array: Uint8Array): Base64url;
/**
 * Creates a hexadecimal string from an Uint8Array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a hexadecimal string
 */
declare function u8aToHex(u8array: Uint8Array): Hex;
/**
 * Creates a regular character string from a byte array
 * @param u8array an 8-bit unsigned integer typed array
 * @returns a regular character string
 */
declare function u8aToStr(u8array: Uint8Array): string;
