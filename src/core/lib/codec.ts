/**
 * @module core/codec
 * @summary Whiteflag JS codec module
 */

/* Module constants */
const BINRADIX = 2;
const DECRADIX = 10;
const HEXRADIX = 16;
const BYTELENGTH = 8;

/**
 * Converts a string with characters representing Binary, Decimal and Hexadecimal values
 * to a character string representing their the binary encoding
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @param nBits size of field in compressed binary encoding in bits
 * @returns representation of the binary encoding of the field
 */
function encodeBDX2BinStr(fieldStr: string, nBits: number): string {
    const padding = Math.ceil(nBits / fieldStr.length);
    const padbits = new Array(padding).join('0');
    let binStr = '';

    // Run through characters of the string and convert to binary one by one
    // Treating all integers as hexadecimals always results in correct binary encoding
    for (const bdx of fieldStr) {
        const binCNum = parseInt(bdx, HEXRADIX).toString(BINRADIX);
        binStr += (padbits + binCNum).slice(-padding);
    }
    return binStr;
}

/**
 * Converts a string of 1-byte UTF-8 characters to a character string
 * representing the binary encoding of 8-bit bytes
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @param nBits size of field in compressed binary encoding in bits
 * @returns representation of the binary encoding of the field
 */
function encodeUTF2BinStr(fieldStr: string, nBits: number): string {
    const padbits = new Array(BYTELENGTH).join('0');
    let binStr = '';

    // Run through characters of the string and convert to binary one by one
    for (const char of fieldStr) {
        const binChar = char.charCodeAt(0).toString(BINRADIX);
        binStr += (padbits + binChar).slice(-BYTELENGTH);
    }
    // Add 0s to fill all nBits of the field with UTF-8 NULL character, unless nBits = 0
    if (nBits === 0) return binStr;

    const nullstr = new Array(nBits - binStr.length).join('0');
    return (binStr + nullstr);
}

/**
 * Converts a string with datetime, time periode and lat long coordinates
 * to a character string representing the binary encoding
 * @private
 * @param fieldStr unencoded/uncompressed field value
 * @returns representation of the binary encoding of the field
 */
function encodeDatum2BinStr(fieldStr: string): string {
    let sign = '';

    // Sign of lat long coordinates
    if (fieldStr.startsWith('-')) sign = '0';
    if (fieldStr.startsWith('+')) sign = '1';

    // Prepare string by removing fixed characters
    const fieldStrCl = fieldStr.replace(/[-+:.A-Z]/g, '');

    // Run through characters of the string and convert to binary one by one
    const padding = 4;
    const padbits = new Array(padding).join('0');
    let binStr = '';
    for (const char of fieldStrCl) {
        const binCNum = parseInt(char, DECRADIX).toString(BINRADIX);
        binStr += (padbits + binCNum).slice(-padding);
    }
    return (sign + binStr);
}

/**
 * Converts a character string representing the binary encoding to a buffer
 * @private
 * @param binStr representation of the binary encoding
 * @returns binary encoding
 */
function encodeBinStr2Buffer(binStr: string): Uint8Array {
    // Split the string in an array of strings representing 8-bit bytes
    const regexBytes = new RegExp('.{1,' + BYTELENGTH + '}', 'g');
    let binStrArr = binStr.match(regexBytes) || [];

    // Add trailing 0s to fill last byte
    const lastbyte = binStrArr.length - 1;
    const trailzero = new Array(BYTELENGTH - binStrArr[lastbyte].length + 1).join('0');
    binStrArr[lastbyte] += trailzero;

    // Convert the character string with binary representation to a binary buffer of 8-bit words
    const buffer = new Uint8Array(binStrArr.length);
    for (let i = 0; i < binStrArr.length; i++) {
        buffer[i] = parseInt(binStrArr[i], BINRADIX);
    }
    return buffer;
}

/**
 * Converts a binary buffer/array to a character string representation
 * of the binary encoding of a message
 * @private
 * @param buffer binary encoding of a message
 * @returns representation of the binary encoding
 */
function decodeBin2BinStr(buffer: Uint8Array): string {
    const padbits = new Array(BYTELENGTH).join('0');
    let binStr = '';

    // Run through characters of the string and convert to binary one by one
    for (const byte of buffer) {
        const binChars = byte.toString(BINRADIX);
        binStr += (padbits + binChars).slice(-BYTELENGTH);
    }
    return binStr;
}

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
function decodeBinStr(binStr: string, beginBit: number, endBit: number, type: string): string {
    let i = 0;
    let fieldStr = '';

    // Perform conversion, depending on used binary encoding
    switch (type) {
        case 'utf': {
            // Run through bytes of the substring and convert to UTF-8 one by one
            for (i = beginBit; i < endBit; i += BYTELENGTH) {
                fieldStr += String.fromCharCode(parseInt(binStr.substring(i, i + BYTELENGTH), BINRADIX));
            }
            break;
        }
        case 'bin': {
            // Run through 1-bit binary values and convert to characters one by one
            for (i = beginBit; i < endBit; i++) {
                fieldStr += parseInt(binStr.charAt(i), BINRADIX).toString(BINRADIX);
            }
            break;
        }
        case 'lat':
        case 'long': {
            // Convert the first bit of lat long coordinates into sign
            if (parseInt(binStr.charAt(beginBit), BINRADIX) === 0) fieldStr = '-';
            if (parseInt(binStr.charAt(beginBit), BINRADIX) === 1) fieldStr = '+';
            // Make sure BCD decoding below skips the sign bit; no break needed here!
            beginBit++;
        }
        // fallthrough  */
        case 'dec':
        case 'datetime':
        case 'duration': {
            // Run through 4-bit BCDs in the substring and convert to characters one by one
            for (i = beginBit; i < endBit; i += 4) {
                fieldStr += parseInt(binStr.substring(i, i + 4), BINRADIX).toString();
            }
            break;
        }
        case 'hex': {
            // Run through 4-bit HCDs in the substring and convert to characters one by one
            for (i = beginBit; i < endBit; i += 4) {
                fieldStr += parseInt(binStr.substring(i, i + 4), BINRADIX).toString(HEXRADIX);
            }
            break;
        }
        default: {
            throw new Error(`Internal Coding Error: wrong decoding type provided to decodeBinStr: ${type}`);
        }
    }
    // Re-insert fixed characters for certain field types i.a.w. specification
    switch (type) {
        case 'datetime':
            fieldStr = [
                fieldStr.slice(0, 4), '-',
                fieldStr.slice(4, 6), '-',
                fieldStr.slice(6, 8), 'T',
                fieldStr.slice(8, 10), ':',
                fieldStr.slice(10, 12), ':',
                fieldStr.slice(12), 'Z'
            ].join('');
            break;
        case 'duration':
            fieldStr = [
                'P',
                fieldStr.slice(0, 2), 'D',
                fieldStr.slice(2, 4), 'H',
                fieldStr.slice(4), 'M'
            ].join('');
            break;
        case 'lat':
            fieldStr = [fieldStr.slice(0, 3), '.', fieldStr.slice(3)].join('');
            break;
        case 'long':
            fieldStr = [fieldStr.slice(0, 4), '.', fieldStr.slice(4)].join('');
            break;
    }
    return fieldStr;
}
