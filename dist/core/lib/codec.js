'use strict';
export { WfCodec, encodeField, decodeField, isValidValue };
import { BinaryBuffer } from '@whiteflagprotocol/util';
import { WfVersion } from "./versions.js";
import fieldSpec_v1 from '../static/v1/wf-field-encoding.json' with { type: 'json' };
const NOCHAR = '';
const HEXRADIX = 16;
const BYTELENGTH = 8;
const QUADBIT = 4;
var WfCodec;
(function (WfCodec) {
    WfCodec["BIN"] = "binary";
    WfCodec["DEC"] = "decimal";
    WfCodec["HEX"] = "hexadecimal";
    WfCodec["UTF8"] = "utf-8";
    WfCodec["DATETIME"] = "datetime";
    WfCodec["DURATION"] = "duration";
    WfCodec["LAT"] = "latitude";
    WfCodec["LONG"] = "longitude";
})(WfCodec || (WfCodec = {}));
const FIELDS = compileFieldCodecs();
function encodeField(value, codec, version = WfVersion.v1) {
    if (!isValidValue(value, codec, version)) {
        throw new Error(`Value of ${codec} field does not match ${FIELDS[codec][version].pattern} pattern`);
    }
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
function decodeField(buffer, codec, version = WfVersion.v1) {
    if (FIELDS[codec][version].length > 0
        && buffer.length !== FIELDS[codec][version].length) {
        throw new Error(`Invalid ${codec} binary field length: ${buffer.length} bits`);
    }
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
function isValidValue(value, codec, version = WfVersion.v1) {
    return FIELDS[codec][version].regex.test(value);
}
function compileFieldCodecs() {
    const codec = {};
    for (const type of Object.values(WfCodec)) {
        codec[type] = {};
        {
            const version = WfVersion.v1;
            codec[type][version] = fieldSpec_v1[type];
            codec[type][version].regex = new RegExp(codec[type][version].pattern);
        }
    }
    return codec;
}
function encodeBin(binStr) {
    const bitLength = binStr.length;
    const byteLength = Math.ceil(bitLength / BYTELENGTH);
    let buffer = new Uint8Array(byteLength);
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex++) {
        if (binStr.substring(bitIndex, bitIndex + 1) === '1') {
            const byteCursor = Math.floor(bitIndex / BYTELENGTH);
            const bitPosition = bitIndex % BYTELENGTH;
            buffer[byteCursor] |= (0x80 >>> bitPosition);
        }
    }
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
function decodeBin(buffer) {
    const bitLength = buffer.length;
    const byteArray = buffer.toU8a();
    let binStr = '';
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex++) {
        const byteCursor = Math.floor(bitIndex / BYTELENGTH);
        const bitPosition = bitIndex % BYTELENGTH;
        if ((byteArray[byteCursor] >>> (BYTELENGTH - bitPosition - 1) & 1) == 1) {
            binStr += '1';
        }
        else {
            binStr += '0';
        }
    }
    return binStr.toLowerCase();
}
function encodeBDX(bdxString) {
    const bitLength = bdxString.length * QUADBIT;
    const buffer = new Uint8Array(Math.ceil(bitLength / BYTELENGTH));
    for (let i = 0; i < buffer.length; i++) {
        const d = i * 2;
        buffer[i] |= parseInt(bdxString.substring(d, d + 1) + '0', HEXRADIX);
        buffer[i] |= parseInt('0' + bdxString.substring(d + 1, d + 2), HEXRADIX);
    }
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
function decodeBDX(buffer) {
    const bitLength = buffer.length - (buffer.length % QUADBIT);
    const byteArray = buffer.extractU8a(0, bitLength);
    let bdxString = '';
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex += BYTELENGTH) {
        const byteCursor = Math.floor(bitIndex / BYTELENGTH);
        const byte = (byteArray[byteCursor] >> QUADBIT) & 0xF;
        bdxString += byte.toString(HEXRADIX);
        if ((bitIndex + QUADBIT) < bitLength) {
            const byte = byteArray[byteCursor] & 0xF;
            bdxString += byte.toString(HEXRADIX);
        }
    }
    return bdxString.toLowerCase();
}
function encodeUTF(utfString) {
    const bitLength = utfString.length * BYTELENGTH;
    const buffer = new Uint8Array(utfString.length);
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = utfString.charCodeAt(i);
    }
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
function decodeUTF(buffer) {
    const bitLength = buffer.length - (buffer.length % BYTELENGTH);
    return String.fromCharCode(...buffer.extractU8a(0, bitLength));
}
function encodeDatum(datumStr) {
    return encodeBDX(datumStr.replace(/[-+:.A-Z]/g, NOCHAR));
}
function decodeDatum(buffer) {
    return decodeBDX(buffer);
}
function decodeDatetime(buffer) {
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
function decodeDuration(buffer) {
    const value = decodeDatum(buffer);
    return [
        'P',
        value.slice(0, 2), 'D',
        value.slice(2, 4), 'H',
        value.slice(4), 'M'
    ].join(NOCHAR);
}
function encodeLatLong(latlongStr) {
    let buffer = encodeDatum(latlongStr);
    if (latlongStr.startsWith('-')) {
        buffer.insertBytes([0x00], 1);
    }
    ;
    if (latlongStr.startsWith('+')) {
        buffer.insertBytes([0x80], 1);
    }
    return buffer;
}
function decodeLatLong(buffer) {
    const latlongStr = decodeDatum(buffer.extract(1, buffer.length));
    if (buffer.extractU8a(0, 1)[0] === 0x80) {
        return '+' + latlongStr;
    }
    if (buffer.extractU8a(0, 1)[0] === 0x00) {
        return '-' + latlongStr;
    }
    throw new SyntaxError('Invalid latlong encoding');
}
function decodeLat(buffer) {
    const value = decodeLatLong(buffer);
    return [
        value.slice(0, 3), '.',
        value.slice(3)
    ].join(NOCHAR);
}
function decodeLong(buffer) {
    const value = decodeLatLong(buffer);
    return [
        value.slice(0, 4), '.',
        value.slice(4)
    ].join(NOCHAR);
}
