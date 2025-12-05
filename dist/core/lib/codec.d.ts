/**
 * @module core/codec
 * @summary Whiteflag JS message field encoding and decoding module
 * @since v1.0 (Whiteflag specification v1-draft.7)
 */
export { WfFieldType, encodeField, decodeField };
import { BinaryBuffer } from '@whiteflag/util';
/**
 * Defines Whiteflag field types
 * @enum WfFieldType
 */
declare enum WfFieldType {
    BIN = "bin",
    DEC = "dec",
    HEX = "hex",
    UTF8 = "utf-8",
    DATETIME = "datetime",
    DURATION = "duration",
    LAT = "lat",
    LONG = "long"
}
/**
 * Enodes a Whiteflag message field
 * @param fieldStr the message field value
 * @param fieldType the message field type: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param wfVersion the version of the Whiteflag specification
 * @returns a binary buffer with the compressed encoded field
 */
declare function encodeField(fieldStr: string, fieldType: WfFieldType, wfVersion?: number): BinaryBuffer;
/**
 * Decodes a Whiteflag message field
 * @param buffer a binary buffer with the encoded field
 * @param fieldType the message field type: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param wfVersion the version of the Whiteflag specification
 * @returns a string with the decoded field value
 */
declare function decodeField(buffer: BinaryBuffer, fieldType: WfFieldType, wfVersion?: number): string;
