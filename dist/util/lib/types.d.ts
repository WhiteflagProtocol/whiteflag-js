/**
 * @module util/types
 * @summary Whiteflag JS utility type definitions module
 */
export { primitive, serializable, Serializable, byte, ByteArray, Base58, Base64, Base64url, Hex, Time, Iso8601, posixtime, ecmatime, Json };
/** Any primitive type */
type primitive = string | number | boolean | bigint | symbol | null | undefined;
/** Serializable primitive types */
type serializable = string | number | boolean | serializable[] | null;
/** Serializable data object */
type Serializable = {
    [key: string]: Serializable | serializable | undefined;
};
/** A number representing a byte */
type byte = number;
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
/** Time representations */
type Time = ecmatime | posixtime | Iso8601 | Date;
/** A string with an ISO 8601 datetime */
type Iso8601 = string;
/** POSIX epoch datetime Time in seconds */
type posixtime = number;
/** ECMA epoch datetime in milliseconds */
type ecmatime = number;
/** A string with with a JSON object */
type Json = string;
