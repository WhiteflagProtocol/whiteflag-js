/**
 * @module core/codec
 * @summary Whiteflag JS message field encoding and decoding module
 */
export { WfCodec, encodeField, decodeField, isValidValue };
import { BinaryBuffer } from '@whiteflag/util';
import { WfVersion } from './versions.ts';
/**
 * Whiteflag field encodings
 * @enum WfCodec
 * @wfver v1-draft.7
 */
declare enum WfCodec {
    BIN = "binary",
    DEC = "decimal",
    HEX = "hexadecimal",
    UTF8 = "utf-8",
    DATETIME = "datetime",
    DURATION = "duration",
    LAT = "latitude",
    LONG = "longitude"
}
/**
 * Enodes a Whiteflag message field
 * @function encodeField
 * @param value the message field value
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a binary buffer with the compressed encoded field
 * @wfver v1-draft.7
 */
declare function encodeField(value: string, codec: WfCodec, version?: WfVersion): BinaryBuffer;
/**
 * Decodes a Whiteflag message field
 * @function decodeField
 * @param buffer a binary buffer with the encoded field
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a string with the decoded field value
 * @wfver v1-draft.7
 */
declare function decodeField(buffer: BinaryBuffer, codec: WfCodec, version?: WfVersion): string;
/**
 * Check if the field value is valid
 * @function isValidValue
 * @param value the field value
 * @param codec the field encoding
 * @param version the Whiteflag protocol version
 * @returns true if valid, else false
 */
declare function isValidValue(value: string, codec: WfCodec, version?: WfVersion): boolean;
