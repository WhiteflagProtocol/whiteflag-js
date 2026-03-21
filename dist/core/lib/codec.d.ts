/**
 * @module core/codec
 * @summary Whiteflag JS core encoding and decoding module
 */
export { WfCodec, encodeField, decodeField, isValidValue };
import { WfVersion } from '@whiteflagprotocol/common';
import { BinaryBuffer } from '@whiteflagprotocol/util';
/**
 * Whiteflag field encodings, defining the encoding of Whiteflag
 * message fields as defined by the Whiteflag specification
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding
 */
declare enum WfCodec {
    /** Binary field */
    BIN = "binary",
    /** Decimal field */
    DEC = "decimal",
    /** HExadecimal field */
    HEX = "hexadecimal",
    /** UTF-8 / ASCII text field */
    UTF8 = "utf-8",
    /** Datetime field */
    DATETIME = "datetime",
    /** Duration field */
    DURATION = "duration",
    /** Latitude field */
    LAT = "latitude",
    /** Longitude field */
    LONG = "longitude"
}
/**
 * Encodes a Whiteflag message field
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding, 4.1.3 Message Compression
 * @param value the message field value
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a binary buffer with the compressed encoded field
 */
declare function encodeField(value: string, codec: WfCodec, version?: WfVersion): BinaryBuffer;
/**
 * Decodes a Whiteflag message field
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding, 4.1.3 Message Compression
 * @param buffer a binary buffer with the encoded field
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a string with the decoded field value
 */
declare function decodeField(buffer: BinaryBuffer, codec: WfCodec, version?: WfVersion): string;
/**
 * Checks if the field value is valid
 * @param value the field value
 * @param codec the field encoding
 * @param version the Whiteflag protocol version
 * @returns `true` if valid, else `false`
 */
declare function isValidValue(value: any, codec: WfCodec, version?: WfVersion): boolean;
