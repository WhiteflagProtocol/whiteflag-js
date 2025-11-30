/**
 * @module core/codec
 * @summary Whiteflag JS codec module
 */
declare const BINRADIX = 2;
declare const DECRADIX = 10;
declare const HEXRADIX = 16;
declare const BYTELENGTH = 8;
/**
 * Converts a string with characters representing Binary, Decimal and Hexadecimal values
 * to a character string representing their the binary encoding
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @param nBits size of field in compressed binary encoding in bits
 * @returns representation of the binary encoding of the field
 */
declare function encodeBDX2BinStr(fieldStr: string, nBits: number): string;
/**
 * Converts a string of 1-byte UTF-8 characters to a character string
 * representing the binary encoding of 8-bit bytes
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @param nBits size of field in compressed binary encoding in bits
 * @returns representation of the binary encoding of the field
 */
declare function encodeUTF2BinStr(fieldStr: string, nBits: number): string;
/**
 * Converts a string with datetime, time periode and lat long coordinates
 * to a character string representing the binary encoding
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @returns representation of the binary encoding of the field
 */
declare function encodeDatum2BinStr(fieldStr: string): string;
/**
 * Converts a character string representing the binary encoding to a buffer
 * @private
 * @param binStr representation of the binary encoding
 * @returns binary encoding
 */
declare function encodeBinStr2Buffer(binStr: string): Uint8Array;
/**
 * Converts a binary buffer/array to a character string representation
 * of the binary encoding of a message
 * @private
 * @param buffer binary encoding of a message
 * @returns representation of the binary encoding
 */
declare function decodeBin2BinStr(buffer: Uint8Array): string;
/**
 * Converts a substring of the character string representation
 * of the binary encoding of a message to the uncompressed field value
 * @private
 * @param binStr representation of the binary encoding
 * @param beginBit position in string from where to convert
 * @param endBit position in string before which conversion stops
 * @param type 'utf', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @returns decoded/uncompressed field value
 */
declare function decodeBinStr(binStr: string, beginBit: number, endBit: number, type: string): string;
