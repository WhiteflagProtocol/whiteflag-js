"use strict";
const BINRADIX = 2;
const DECRADIX = 10;
const HEXRADIX = 16;
const BYTELENGTH = 8;
function encodeBDX2BinStr(fieldStr, nBits) {
    const padding = Math.ceil(nBits / fieldStr.length);
    const padbits = new Array(padding).join('0');
    let binStr = '';
    for (const bdx of fieldStr) {
        const binCNum = parseInt(bdx, HEXRADIX).toString(BINRADIX);
        binStr += (padbits + binCNum).slice(-padding);
    }
    return binStr;
}
function encodeUTF2BinStr(fieldStr, nBits) {
    const padbits = new Array(BYTELENGTH).join('0');
    let binStr = '';
    for (const char of fieldStr) {
        const binChar = char.charCodeAt(0).toString(BINRADIX);
        binStr += (padbits + binChar).slice(-BYTELENGTH);
    }
    if (nBits === 0)
        return binStr;
    const nullstr = new Array(nBits - binStr.length).join('0');
    return (binStr + nullstr);
}
function encodeDatum2BinStr(fieldStr) {
    let sign = '';
    if (fieldStr.startsWith('-'))
        sign = '0';
    if (fieldStr.startsWith('+'))
        sign = '1';
    const fieldStrCl = fieldStr.replace(/[-+:.A-Z]/g, '');
    const padding = 4;
    const padbits = new Array(padding).join('0');
    let binStr = '';
    for (const char of fieldStrCl) {
        const binCNum = parseInt(char, DECRADIX).toString(BINRADIX);
        binStr += (padbits + binCNum).slice(-padding);
    }
    return (sign + binStr);
}
function encodeBinStr2Buffer(binStr) {
    const regexBytes = new RegExp('.{1,' + BYTELENGTH + '}', 'g');
    let binStrArr = binStr.match(regexBytes) || [];
    const lastbyte = binStrArr.length - 1;
    const trailzero = new Array(BYTELENGTH - binStrArr[lastbyte].length + 1).join('0');
    binStrArr[lastbyte] += trailzero;
    const buffer = new Uint8Array(binStrArr.length);
    for (let i = 0; i < binStrArr.length; i++) {
        buffer[i] = parseInt(binStrArr[i], BINRADIX);
    }
    return buffer;
}
function decodeBin2BinStr(buffer) {
    const padbits = new Array(BYTELENGTH).join('0');
    let binStr = '';
    for (const byte of buffer) {
        const binChars = byte.toString(BINRADIX);
        binStr += (padbits + binChars).slice(-BYTELENGTH);
    }
    return binStr;
}
function decodeBinStr(binStr, beginBit, endBit, type) {
    let i = 0;
    let fieldStr = '';
    switch (type) {
        case 'utf': {
            for (i = beginBit; i < endBit; i += BYTELENGTH) {
                fieldStr += String.fromCharCode(parseInt(binStr.substring(i, i + BYTELENGTH), BINRADIX));
            }
            break;
        }
        case 'bin': {
            for (i = beginBit; i < endBit; i++) {
                fieldStr += parseInt(binStr.charAt(i), BINRADIX).toString(BINRADIX);
            }
            break;
        }
        case 'lat':
        case 'long': {
            if (parseInt(binStr.charAt(beginBit), BINRADIX) === 0)
                fieldStr = '-';
            if (parseInt(binStr.charAt(beginBit), BINRADIX) === 1)
                fieldStr = '+';
            beginBit++;
        }
        case 'dec':
        case 'datetime':
        case 'duration': {
            for (i = beginBit; i < endBit; i += 4) {
                fieldStr += parseInt(binStr.substring(i, i + 4), BINRADIX).toString();
            }
            break;
        }
        case 'hex': {
            for (i = beginBit; i < endBit; i += 4) {
                fieldStr += parseInt(binStr.substring(i, i + 4), BINRADIX).toString(HEXRADIX);
            }
            break;
        }
        default: {
            throw new SyntaxError(`Internal Coding Error: wrong decoding type provided to decodeBinStr: ${type}`);
        }
    }
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
