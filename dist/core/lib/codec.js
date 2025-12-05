export { WfFieldType, encodeField, decodeField };
import { BinaryBuffer } from '@whiteflag/util';
import v1 from '../static/v1/wf-field-encoding.json' with { type: 'json' };
const NOCHAR = '';
const HEXRADIX = 16;
const BYTELENGTH = 8;
const QUADBIT = 4;
var WfFieldType;
(function (WfFieldType) {
    WfFieldType["BIN"] = "bin";
    WfFieldType["DEC"] = "dec";
    WfFieldType["HEX"] = "hex";
    WfFieldType["UTF8"] = "utf-8";
    WfFieldType["DATETIME"] = "datetime";
    WfFieldType["DURATION"] = "duration";
    WfFieldType["LAT"] = "lat";
    WfFieldType["LONG"] = "long";
})(WfFieldType || (WfFieldType = {}));
const CODEC = compileFieldCodec();
function encodeField(fieldStr, fieldType, wfVersion = 1) {
    if (!CODEC[fieldType][wfVersion].regex.test(fieldStr)) {
        throw new Error(`Value of ${fieldType} field does not match ${CODEC[fieldType][wfVersion].regex.toString()} pattern`);
    }
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
function decodeField(buffer, fieldType, wfVersion = 1) {
    if (CODEC[fieldType][wfVersion].length > 0
        && buffer.length !== CODEC[fieldType][wfVersion].length) {
        throw new Error(`Invalid ${fieldType} binary field length: ${buffer.length} bits`);
    }
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
function compileFieldCodec() {
    const fieldCodec = {};
    for (const type of Object.values(WfFieldType)) {
        fieldCodec[type] = {};
        fieldCodec[type][1] = v1[type];
        fieldCodec[type][1].regex = new RegExp(fieldCodec[type][1].pattern);
    }
    return fieldCodec;
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
        const ci = i * 2;
        buffer[i] |= parseInt(bdxString.substring(ci, ci + 1) + '0', HEXRADIX);
        buffer[i] |= parseInt('0' + bdxString.substring(ci + 1, ci + 2), HEXRADIX);
    }
    return BinaryBuffer.fromU8a(buffer, bitLength);
}
function decodeBDX(buffer) {
    const bitLength = buffer.length;
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
    return String.fromCharCode(...buffer.toU8a());
}
function encodeDatum(datumStr) {
    return encodeBDX(datumStr.replace(/[-+:.A-Z]/g, NOCHAR));
}
function decodeDatum(buffer) {
    return decodeBDX(buffer);
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
    throw new Error('Invalid latlong encoding');
}
