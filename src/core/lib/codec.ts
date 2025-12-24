'use strict';
/**
 * @module core/codec
 * @summary Whiteflag JS message field encoding and decoding module
 */
export {
    WfCodec,
    encodeField,
    decodeField,
    isValidValue
};

/* Dependencies */
import { BinaryBuffer } from '@whiteflagprotocol/util';

/* Module imports */
import { WfVersion } from './versions.ts';

/* Whiteflag specification */
import fieldSpec_v1 from '../static/v1/wf-field-encoding.json' with { type: 'json' };

/* Constants */
const NOCHAR = '';
const HEXRADIX = 16;
const BYTELENGTH = 8;
const QUADBIT = 4;

/* MODULE DECLARATIONS */
/**
 * Whiteflag field encodings, defining the encoding of Whiteflag
 * message fields as defined by the Whiteflag specification
 * @enum WfCodec
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding
 */
enum WfCodec {
    /** Binary field */
    BIN = 'binary',
    /** Decimal field */
    DEC = 'decimal',
    /** HExadecimal field */
    HEX = 'hexadecimal',
    /** UTF-8 / ASCII text field */
    UTF8 = 'utf-8',
    /** Datetime field */
    DATETIME = 'datetime',
    /** Duration field */
    DURATION = 'duration',
    /** Latitude field */
    LAT = 'latitude',
    /** Longitude field */
    LONG = 'longitude'
}
/**
 * Whiteflag field specification
 */
const FIELDS = compileFieldCodecs();

/* MODULE FUNCTIONS */
/**
 * Encodes a Whiteflag message field
 * @function encodeField
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding, 4.1.3 Message Compression
 * @param value the message field value
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a binary buffer with the compressed encoded field
 */
function encodeField(value: string, codec: WfCodec, version = WfVersion.v1): BinaryBuffer {
    /* Check field value */
    if (!isValidValue(value, codec, version)) {
        throw new Error(`Value of ${codec} field does not match ${FIELDS[codec][version].pattern} pattern`);
    }
    /* Choose codec based on field encoding */
    switch (codec) {
        case WfCodec.BIN: {
            return encodeBin(value);
        }
        case WfCodec.DEC:
        case WfCodec.HEX: {
            return encodeBDX(value);
        }
        case WfCodec.UTF8: {
            return encodeUTF(value);
        }
        case WfCodec.DATETIME: {
            return encodeDatum(value);
        }
        case WfCodec.DURATION: {
            return encodeDatum(value);
        }
        case WfCodec.LAT: {
            return encodeLatLong(value);
        }
        case WfCodec.LONG: {
            return encodeLatLong(value);
        }
        default: {
            throw new Error(`Invalid message field encoding: ${codec}`);
        }
    }
}
/**
 * Decodes a Whiteflag message field
 * @function decodeField
 * @wfversion v1-draft.7
 * @wfreference 4.1.2 Message Encoding, 4.1.3 Message Compression
 * @param buffer a binary buffer with the encoded field
 * @param codec the message field encoding: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param version the version of the Whiteflag specification
 * @returns a string with the decoded field value
 */
function decodeField(buffer: BinaryBuffer, codec: WfCodec, version = WfVersion.v1): string {
    /* Check binary encoding */
    if (FIELDS[codec][version].length > 0
     && buffer.length !== FIELDS[codec][version].length) {
        throw new Error(`Invalid ${codec} binary field length: ${buffer.length} bits`);
    }
    /* Choose decoding based on field encoding */
    switch (codec) {
        case WfCodec.BIN: {
            return decodeBin(buffer);
        }
        case WfCodec.DEC:
        case WfCodec.HEX: {
            return decodeBDX(buffer);
        }
        case WfCodec.UTF8: {
            return decodeUTF(buffer);
        }
        case WfCodec.DATETIME: {
            return decodeDatetime(buffer);
        }
        case WfCodec.DURATION: {
            return decodeDuration(buffer);
        }
        case WfCodec.LAT: {
            return decodeLat(buffer);
        }
        case WfCodec.LONG: {
            return decodeLong(buffer);
        }
        default: {
            throw new Error(`Invalid message field encoding: ${codec}`);
        }
    }
}
/**
 * Checks if the field value is valid
 * @function isValidValue
 * @param value the field value
 * @param codec the field encoding
 * @param version the Whiteflag protocol version
 * @returns true if valid, else false
 */
function isValidValue(value: string, codec: WfCodec, version = WfVersion.v1): boolean {
    return FIELDS[codec][version].regex.test(value);
}

/* PRIVATE MODULE DECLARATIONS */
/**
 * Defines an object with field encoding definitions
 * @private
 * @interface WfFieldEncoding
 */
interface WfFieldEncoding {
    [key: string]: {            // Field type
        [key: string]: {        // Whiteflag version
            length: number,     // Field length, or 0 if variable
            pattern: string,    // Regular expresssion pattern
            regex: RegExp       // Regular expression for field value verification
        }
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Compiles an object with all valid field encoding definitions
 * @private
 * @returns an object with field encoding definitions
 */
function compileFieldCodecs(): WfFieldEncoding {
    const codec: WfFieldEncoding = {};
    for (const type of Object.values(WfCodec)) {
        codec[type] = {};

        /* Whiteflag version 1 */ {
            const version = WfVersion.v1;
            codec[type][version] = fieldSpec_v1[type] as any;
            codec[type][version].regex = new RegExp(codec[type][version].pattern);
        }
    }
    return codec;
}
/**
 * Encodes a binary field to a binary buffer
 * @private
 * @param binStr representation of the binary encoding
 * @returns a binary buffer with the encoded field
 */
function encodeBin(binStr: string): BinaryBuffer {
    /* Number of bytes required */
    const bitLength = binStr.length;
    const byteLength = Math.ceil(bitLength / BYTELENGTH);

    /* Add bits one by one */
    let buffer = new Uint8Array(byteLength);
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex++) {
        if (binStr.substring(bitIndex, bitIndex + 1) === '1') {
            const byteCursor = Math.floor(bitIndex / BYTELENGTH);
            const bitPosition = bitIndex % BYTELENGTH;
            buffer[byteCursor] |= (0x80 >>> bitPosition);
        }
    }
    /* Return the resulting binary buffer */
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
/**
 * Decodes a binary buffer with the compressed encoded field
 * to a field string with the binary value
 * @private
 * @param buffer a binary buffer with the encoded field
 * @return a string with the decoded binary field value
 */
function decodeBin(buffer: BinaryBuffer): string {
    const bitLength = buffer.length;
    const byteArray = buffer.toU8a();
    let binStr: string = '';

    /* Loop strough bits of binary buffer */
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex++) {
        const byteCursor = Math.floor(bitIndex / BYTELENGTH);
        const bitPosition = bitIndex % BYTELENGTH;
        if ((byteArray[byteCursor] >>> (BYTELENGTH - bitPosition - 1) & 1) == 1) {
            binStr += '1';
        } else {
            binStr += '0';
        }
    }
    return binStr.toLowerCase();
}
/**
 * Encodes a field string with a (hexa)decimal value
 * to a binary buffer with the compressed encoded field
 * @private
 * @param bdxString an unencoded/uncompressed (hexa)decimal field value
 * @returns a binary buffer with the encoded field
 */
function encodeBDX(bdxString: string): BinaryBuffer {
    /* Each digit needs 4 bits */
    const bitLength = bdxString.length * QUADBIT;
    const buffer = new Uint8Array(Math.ceil(bitLength / BYTELENGTH));

    /* Add pairs of 4-bits to the buffer */
    for (let i = 0; i < buffer.length; i++) {
        const d = i * 2;
        buffer[i] |= parseInt(bdxString.substring(d, d + 1) + '0', HEXRADIX);
        buffer[i] |= parseInt('0' + bdxString.substring(d + 1, d + 2), HEXRADIX);
    }
    /* Return the resulting binary buffer */
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
/**
 * Decodes a binary buffer with the compressed encoded field
 * to a field string with the (hexa)decimal value
 * @private
 * @param buffer a binary buffer with the encoded field
 * @return a string with the decoded (hexa)decimal field value
 */
function decodeBDX(buffer: BinaryBuffer): string {
    const bitLength = buffer.length - (buffer.length % QUADBIT);
    const byteArray = buffer.extractU8a(0, bitLength);
    let bdxString: string = '';

    /* Loop through the bits in the binary buffer */
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex += BYTELENGTH) {
        const byteCursor = Math.floor(bitIndex / BYTELENGTH);

        /* Add first 4 bits of the byte to the string */
        const byte = (byteArray[byteCursor] >> QUADBIT) & 0xF;
        bdxString += byte.toString(HEXRADIX);

        /* Add second 4 bits of byte to the string */
        if ((bitIndex + QUADBIT) < bitLength) {
            const byte = byteArray[byteCursor] & 0xF;
            bdxString += byte.toString(HEXRADIX);
        }
    }
    /* Return the resulting string */
    return bdxString.toLowerCase();
}
/**
 * Encodes a field with 1-byte UTF8-8 characters
 * to a binary buffer with the compressed encoded field
 * @private
 * @param utfString an unencoded/uncompressed UTF8 text field
 * @returns a binary buffer with the encoded field
 */
function encodeUTF(utfString: string): BinaryBuffer {
    /* Each character need a byte */
    const bitLength = utfString.length * BYTELENGTH;
    const buffer = new Uint8Array(utfString.length);

    /* Add the character code per byte */
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = utfString.charCodeAt(i);
    }
    /* Return the resulting binary buffer */
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
/**
 * Decodes a binary buffer with the compressed encoded field
 * to a field string with UTF8 text
 * @private
 * @param buffer a binary buffer with the encoded field
 * @return a string with the decoded UTF8 text field value
 */
function decodeUTF(buffer: BinaryBuffer): string {
    const bitLength = buffer.length - (buffer.length % BYTELENGTH);
    return String.fromCharCode(...buffer.extractU8a(0, bitLength));
}
/**
 * Encodes a field with a datetime, time periode and latlong coordinates
 * to a binary buffer with the compressed encoded field
 * @private
 * @param datumStr an unencoded/uncompressed datum field
 * @returns a binary buffer with the encoded field
 */
function encodeDatum(datumStr: string): BinaryBuffer {
    /* Encode field as BDX without fixed characters */
    return encodeBDX(datumStr.replace(/[-+:.A-Z]/g, NOCHAR));
}
/**
 * Decodes a binary buffer with the compressed encoded field
 * to a field string with a datetime, time periode and latlong values
 * without the fixed characters
 * @private
 * @param buffer a binary buffer with the encoded datum field
 * @returns a string with the decoded datum field value
 */
function decodeDatum(buffer: BinaryBuffer): string {
    /* Decode field as BDX without fixed characters */
    return decodeBDX(buffer);
}
/**
 * Decodes a binary buffer with the compressed encoded datetime field
 * to a field string with a datetime value with fixed characters
 * @private
 * @param buffer a binary buffer with the encoded datetime field
 * @returns a string with the decoded datetime field value
 */
function decodeDatetime(buffer: BinaryBuffer): string {
    const value = decodeDatum(buffer);
    return [
        value.slice(0, 4), '-',
        value.slice(4, 6), '-',
        value.slice(6, 8), 'T',
        value.slice(8, 10), ':',
        value.slice(10, 12), ':',
        value.slice(12), 'Z'
    ].join(NOCHAR);
}
/**
 * Decodes a binary buffer with the compressed encoded duration field
 * to a field string with a duration value with fixed characters
 * @private
 * @param buffer a binary buffer with the encoded duration field
 * @returns a string with the decoded duration field value
 */
function decodeDuration(buffer: BinaryBuffer): string {
    const value = decodeDatum(buffer);
    return [
        'P',
        value.slice(0, 2), 'D',
        value.slice(2, 4), 'H',
        value.slice(4), 'M'
    ].join(NOCHAR);
}
/**
 * Encodes a field with latlong coordinates
 * to a binary buffer with the compressed encoded field
 * @private
 * @param latlongStr an unencoded/uncompressed latlong field
 * @returns a binary buffer with the encoded field
 */
function encodeLatLong(latlongStr: string): BinaryBuffer {
    /* Encode field as BDX without fixed characters */
    let buffer = encodeDatum(latlongStr);

    /* Sign of latlong coordinates */
    if (latlongStr.startsWith('-')) {
        buffer.insertBytes([0x00], 1);
    };
    if (latlongStr.startsWith('+')) {
       buffer.insertBytes([0x80], 1);
    }
    /* Return the resulting binary buffer */
    return buffer;
}
/**
 * Decodes a binary buffer with the compressed encoded latlong field
 * to a field string with a latlong value without the fixed characters
 * @private
 * @param buffer a binary buffer with the encoded latlong field
 * @returns a string with the decoded latlong value
 */
function decodeLatLong(buffer: BinaryBuffer): string {
    /* Decode field as BDX without first bit */
    const latlongStr = decodeDatum(buffer.extract(1, buffer.length));

    /* Sign of latlong coordinates */
    if (buffer.extractU8a(0,1)[0] === 0x80) {
        return '+' + latlongStr;
    }
    if (buffer.extractU8a(0,1)[0] === 0x00) {
        return '-' + latlongStr;
    }
    throw new SyntaxError('Invalid latlong encoding');
}
/**
 * Decodes a binary buffer with the compressed encoded latitude field
 * to a field string with a latitude value with the fixed characters
 * @private
 * @param buffer a binary buffer with the encoded latitude field
 * @returns a string with the decoded latitude value
 */

function decodeLat(buffer: BinaryBuffer): string {
    const value = decodeLatLong(buffer);
    return [
        value.slice(0, 3), '.',
        value.slice(3)
    ].join(NOCHAR);
}
/**
 * Decodes a binary buffer with the compressed encoded longitude field
 * to a field string with a longitude value with the fixed characters
 * @private
 * @param buffer a binary buffer with the encoded longitude field
 * @returns a string with the decoded longitude value
 */
function decodeLong(buffer: BinaryBuffer): string {
    const value = decodeLatLong(buffer);
    return [
        value.slice(0, 4), '.',
        value.slice(4)
    ].join(NOCHAR);
}
