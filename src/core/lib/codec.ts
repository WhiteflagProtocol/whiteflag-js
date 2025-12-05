/**
 * @module core/codec
 * @summary Whiteflag JS message field encoding and decoding module
 * @since v1.0 (Whiteflag specification v1-draft.7)
 */
export {
    WfFieldType,
    encodeField,
    decodeField
};

/* Dependencies */
import { BinaryBuffer } from '@whiteflag/util';

/* Whiteflag static field definitions */
import v1 from '../static/v1/wf-field-encoding.json' with { type: 'json' };

/* Constants */
const NOCHAR = '';
const HEXRADIX = 16;
const BYTELENGTH = 8;
const QUADBIT = 4;

/* MODULE DECLARATIONS */
/**
 * Defines Whiteflag field types
 * @enum WfFieldType
 */
enum WfFieldType {
    BIN = 'bin',
    DEC = 'dec',
    HEX = 'hex',
    UTF8 = 'utf-8',
    DATETIME = 'datetime',
    DURATION = 'duration',
    LAT = 'lat',
    LONG = 'long'
}
/**
 * Defines Whiteflag fields
 */
const CODEC = compileFieldCodec();

/* MODULE FUNCTIONS */
/**
 * Enodes a Whiteflag message field
 * @param fieldStr the message field value
 * @param fieldType the message field type: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param wfVersion the version of the Whiteflag specification
 * @returns a binary buffer with the compressed encoded field
 */
function encodeField(fieldStr: string, fieldType: WfFieldType, wfVersion: number = 1): BinaryBuffer {
    /* Check field value */
    if (!CODEC[fieldType][wfVersion].regex.test(fieldStr)) {
        throw new Error(`Value of ${fieldType} field does not match ${CODEC[fieldType][wfVersion].regex.toString()} pattern`);
    }
    /* Choose encoding based on field type */
    switch (fieldType) {
        case WfFieldType.BIN: {
            return encodeBin(fieldStr);
        }
        case WfFieldType.DEC:
        case WfFieldType.HEX: {
            return encodeBDX(fieldStr);
        }
        case WfFieldType.UTF8: {
            return encodeUTF(fieldStr);
        }
        case WfFieldType.DATETIME: {
            return encodeDatum(fieldStr);
        }
        case WfFieldType.DURATION: {
            return encodeDatum(fieldStr);
        }
        case WfFieldType.LAT: {
            return encodeLatLong(fieldStr);
        }
        case WfFieldType.LONG: {
            return encodeLatLong(fieldStr);
        }
        default: {
            throw new Error(`Invalid message field type: ${fieldType}`);
        }
    }
}
/**
 * Decodes a Whiteflag message field
 * @param buffer a binary buffer with the encoded field
 * @param fieldType the message field type: 'utf-8', 'bin', 'dec', 'hex', 'datetime', 'duration', 'lat', 'long'
 * @param wfVersion the version of the Whiteflag specification
 * @returns a string with the decoded field value
 */
function decodeField(buffer: BinaryBuffer, fieldType: WfFieldType, wfVersion: number = 1): string {
    /* Check binary encoding */
    if (CODEC[fieldType][wfVersion].length > 0
     && buffer.length !== CODEC[fieldType][wfVersion].length) {
        throw new Error(`Invalid ${fieldType} binary field length: ${buffer.length} bits`);
    }
    /* Choose decoding based on field type */
    switch (fieldType) {
        case WfFieldType.BIN: {
            return decodeBin(buffer);
        }
        case WfFieldType.DEC:
        case WfFieldType.HEX: {
            return decodeBDX(buffer);
        }
        case WfFieldType.UTF8: {
            return decodeUTF(buffer);
        }
        case WfFieldType.DATETIME: {
            const fieldStr = decodeDatum(buffer);
            return [
                fieldStr.slice(0, 4), '-',
                fieldStr.slice(4, 6), '-',
                fieldStr.slice(6, 8), 'T',
                fieldStr.slice(8, 10), ':',
                fieldStr.slice(10, 12), ':',
                fieldStr.slice(12), 'Z'
            ].join(NOCHAR);
        }
        case WfFieldType.DURATION: {
            const fieldStr = decodeDatum(buffer);
            return [
                'P',
                fieldStr.slice(0, 2), 'D',
                fieldStr.slice(2, 4), 'H',
                fieldStr.slice(4), 'M'
            ].join(NOCHAR);
        }
        case WfFieldType.LAT:
            const fieldStr = decodeLatLong(buffer);
            return [
                fieldStr.slice(0, 3), '.',
                fieldStr.slice(3)
            ].join(NOCHAR);
        case WfFieldType.LONG: {
            const fieldStr = decodeLatLong(buffer);
            return [
                fieldStr.slice(0, 4), '.',
                fieldStr.slice(4)
            ].join(NOCHAR);
        }
        default: {
            throw new Error(`Invalid message field type: ${fieldType}`);
        }
    }
}

/* PRIVATE MODULE DECLARATIONS */
/**
 * Defines an object with field type definitions
 * @private
 * @interface WfFieldEncoding
 */
interface WfFieldEncoding {
    [key: string]: {            // Field type
        [key: number]: {        // Whiteflag version
            length: number      // Field length, or 0 if variable
            pattern: string;    // Regular expresssion pattern
            regex: RegExp;      // Regular expression for field value verification
        }
    }
}
/**
 * Compiles an object with all valid field type definitions
 * @private
 * @returns an object with field type definitions
 */
function compileFieldCodec(): WfFieldEncoding {
    const fieldCodec: WfFieldEncoding = {};
    for (const type of Object.values(WfFieldType)) {
        fieldCodec[type] = {};

        /* Currently, there is only one Whiteflag version */
        fieldCodec[type][1] = v1[type] as any;
        fieldCodec[type][1].regex = new RegExp(fieldCodec[type][1].pattern);
    }
    return fieldCodec;
}

/* PRIVATE MODULE FUNCTIONS */
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
        const ci = i * 2;
        buffer[i] |= parseInt(bdxString.substring(ci, ci + 1) + '0', HEXRADIX);
        buffer[i] |= parseInt('0' + bdxString.substring(ci + 1, ci + 2), HEXRADIX);
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
    const bitLength = buffer.length;
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
    return String.fromCharCode(...buffer.toU8a());
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
 * Decodes a binary buffer with the compressed encoded field
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
    throw new Error('Invalid latlong encoding');
}
