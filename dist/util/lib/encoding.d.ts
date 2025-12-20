/**
 * @module util/encoding
 * @summary Whiteflag JS common encodings and data conversions
 */
export { isObject, isString, isBase64, isBase64u, isHex, noHexPrefix, objToB64u, b64uToObj, b64ToB64u, b64uToB64, b64uToHex, b64uToString, b64uToU8a, hexToB64u, hexToString, hexToU8a, stringToB64u, stringToHex, stringToU8a, u8aToB64u, u8aToHex, u8aToString, };
/**
 * Checks if something is an object
 * @function isObject
 * @param obj something that might be an object
 * @returns true if object, else false
 */
declare function isObject(obj: any): boolean;
/**
 * Checks if something is a string
 * @function isString
 * @param charString something that might be a string
 * @returns true if string, else false
 */
declare function isString(charString: any): boolean;
/**
 * Checks if a string is base64 encoded
 * @param base64 a string that might be base64 encoded
 * @returns true if base64 encoded, else false
 */
declare function isBase64(base64: string): boolean;
/**
 * Checks if a string is base64url encoded
 * @param base64u a string that might be base64url encoded
 * @returns true if base64url encoded, else false
 */
declare function isBase64u(base64u: string): boolean;
/**
 * Checks if a string is hexadecimal encoded
 * @param hexString a string that might be hexadecimal encoded
 * @returns true if hexadecimal encoded, else false
 */
declare function isHex(hexString: string): boolean;
/**
 * Removes the '0x' hex prefix if present
 * @param hexString a hexadecimal encoded string
 * @returnsthe the string without the hex prefix
 */
declare function noHexPrefix(hexString: string): string;
/**
 * Creates a base64URL encoded JSON string from an object
 * @function objToB64u
 * @param obj the object to be encoded
 * @returns a base64URL encoded JSON string
 */
declare function objToB64u(obj: Object): string;
/**
 * Creates an object from a base64URL encoded JSON string
 * @function b64uToObj
 * @param base64u a base64URL encoded JSON string
 * @returns an object with the data from the JSON object
 */
declare function b64uToObj(base64u: string): Object;
/**
 * Convert base64 to base64url
 * @param base64 a base64 encoded string
 * @returns a base64url encoded string
 */
declare function b64ToB64u(base64: string): string;
/**
 * Convert base64url to base64
 * @param base64u a base64url encoded string
 * @returns a base64 encoded string
 */
declare function b64uToB64(base64u: string): string;
/**
 * Creates hexadecimal string from a base64url encoded string
 * @function b64uToHex
 * @param b64uString a base64url encoded string
 * @returns a hexadecimal encoded string
 */
declare function b64uToHex(b64uString: string): string;
/**
 * Creates a standard string from a base64url encoded string
 * @function b64uToString
 * @param b64uString a base64url encoded string
 * @returns a standard string
 */
declare function b64uToString(b64uString: string): string;
/**
 * Creates a UInt8 typed array from a base64url encoded string
 * @function b64uToU8a
 * @param b64uString a base64url encoded string
 * @returns a UInt8 typed array
 */
declare function b64uToU8a(b64uString: string): Uint8Array;
/**
 * Creates a base64url encoded string from a hexadecimal string
 * @function hexToB64u
 * @param hexString a hexadecimal string
 * @returns a base64url encoded string
 */
declare function hexToB64u(hexString: string): string;
/**
 * Creates a regular string from a hexadecimal string
 * @function hexToString
 * @param hexString a hexadecimal string
 * @returns a regular string
 */
declare function hexToString(hexString: string): string;
/**
 * Creates a UInt8 typed array from a hexadecimal string
 * @function hexToU8a
 * @param hexString a hexadecimal string
 * @returns an array of 8-bit unsigned integers
 */
declare function hexToU8a(hexString: string): Uint8Array<ArrayBuffer>;
/**
 * Creates a base64url encoded string from a regular string
 * @function stringToB64u
 * @param charString a regular character string
 * @returns a base64url encoded string
 */
declare function stringToB64u(charString: string): string;
/**
 * Creates a hexadecimal string from a regular string
 * @function stringToHex
 * @param charString a regular character string
 * @returns a hexadecimal string
 */
declare function stringToHex(charString: string): string;
/**
 * Creates a UInt8 typed array from a regular string
 * @function stringToU8a
 * @param charString a regular character string
 * @returns an array of 8-bit unsigned integers
 */
declare function stringToU8a(charString: string): Uint8Array<ArrayBuffer>;
/**
 * Creates a base64url encoded string from a UInt8 typed array
 * @function u8aToB64u
 *  @param u8array an array of 8-bit unsigned integers
 * @returns a base64url encoded string
 */
declare function u8aToB64u(u8array: Uint8Array): string;
/**
 * Creates a hexadecimal string from an Uint8Array
 * @function u8aToHex
 * @param u8array an array of 8-bit unsigned integers
 * @returns a hexadecimal string
 */
declare function u8aToHex(u8array: Uint8Array): string;
/**
 * Creates a standard string from a UInt8 typed array
 * @function u8aToString
 * @param u8array a UInt8 typed array
 * @returns a standard string
 */
declare function u8aToString(u8array: Uint8Array): string;
