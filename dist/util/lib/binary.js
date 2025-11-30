"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryBuffer = void 0;
exports.cropBits = cropBits;
exports.shiftRight = shiftRight;
exports.shiftLeft = shiftLeft;
const encoding_1 = require("./encoding");
const BYTELENGTH = 8;
class BinaryBuffer {
    buffer;
    length;
    constructor(buffer, nBits = 0) {
        this.length = this.bitLength(buffer.byteLength, nBits);
        this.buffer = cropBits(buffer, this.length);
    }
    static fromU8a(u8array, nBits = 0) {
        return new BinaryBuffer(u8array, nBits);
    }
    static fromHex(hexString, nBits = 0) {
        if (!(0, encoding_1.isHex)(hexString))
            throw new TypeError('Invalid hexadecimal string');
        return new BinaryBuffer((0, encoding_1.hexToU8a)(hexString), nBits);
    }
    appendHex(hexString, nBits = 0) {
        if (!(0, encoding_1.isHex)(hexString))
            throw new TypeError('Invalid hexadecimal string');
        return this.appendU8a((0, encoding_1.hexToU8a)(hexString), nBits);
    }
    appendU8a(u8array, nBits = 0) {
        const bitLength = this.length;
        this.buffer = this.concatinate(this.buffer, bitLength, u8array, nBits);
        this.length = bitLength + this.bitLength(u8array.byteLength, nBits);
        return this;
    }
    extract(startBit, nBits) {
        if (startBit < 0)
            throw RangeError('Starting bit cannot be less than 0');
        if (startBit >= this.length)
            throw RangeError('Starting bit is larger than binary buffer length');
        let bitLength = nBits;
        if (nBits < 0)
            bitLength = this.length - startBit;
        if (startBit + nBits > this.length)
            bitLength = this.length - startBit;
        const startByte = Math.floor(startBit / BYTELENGTH);
        const byteLength = this.byteLength(bitLength);
        const shift = startBit % BYTELENGTH;
        const buffer = new Uint8Array(this.buffer.slice(startByte, startByte + byteLength + 1));
        return cropBits(shiftLeft(buffer, shift), bitLength);
    }
    toU8a() {
        return new Uint8Array(this.buffer);
    }
    toHex() {
        return (0, encoding_1.u8aToHex)(this.buffer);
    }
    bitLength(byteLength, nBits) {
        const bitLength = byteLength * BYTELENGTH;
        if (nBits < 1)
            return Math.max(bitLength + nBits, 0);
        if (nBits > bitLength)
            return bitLength;
        return nBits;
    }
    byteLength(nBits) {
        return Math.ceil(nBits / BYTELENGTH);
    }
    concatinate(u8array1, nBits1, u8array2, nBits2) {
        const bitLength1 = this.bitLength(u8array1.byteLength, nBits1);
        const bitLength2 = this.bitLength(u8array2.byteLength, nBits2);
        const bitLength = bitLength1 + bitLength2;
        const byteLength = this.byteLength(bitLength);
        const shift = bitLength1 % BYTELENGTH;
        const bArray1 = cropBits(u8array1, bitLength1);
        const bArray2 = shiftRight(cropBits(u8array2, bitLength2), shift);
        const buffer = new Uint8Array(byteLength);
        buffer.set(bArray1);
        if (shift === 0) {
            const offset = bArray1.byteLength;
            const slice = bArray2.slice(0, buffer.byteLength - offset);
            buffer.set(slice, offset);
        }
        else {
            const offset = bArray1.byteLength;
            const slice = bArray2.slice(1, buffer.byteLength - offset + 1);
            buffer.set(slice, offset);
            buffer[bArray1.byteLength - 1] |= bArray2[0];
        }
        return buffer;
    }
}
exports.BinaryBuffer = BinaryBuffer;
function cropBits(u8array, nBits) {
    if (nBits === 0)
        return new Uint8Array(u8array);
    let byteLength;
    let clearBits;
    if (nBits > 0) {
        byteLength = Math.ceil(nBits / BYTELENGTH);
        clearBits = BYTELENGTH - (nBits % BYTELENGTH);
    }
    else {
        byteLength = u8array.byteLength - Math.floor(-nBits / BYTELENGTH);
        clearBits = -nBits % BYTELENGTH;
    }
    if (byteLength > u8array.byteLength)
        return new Uint8Array(u8array);
    if (byteLength < 1)
        return new Uint8Array(0);
    let buffer = new Uint8Array(u8array.slice(0, byteLength));
    if (clearBits < BYTELENGTH)
        buffer[byteLength - 1] &= (0xFF << clearBits);
    return buffer;
}
function shiftRight(u8array, shift) {
    if (shift < 0)
        return shiftLeft(u8array, -shift);
    const byteLength = u8array.byteLength + 1;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF >>> (BYTELENGTH - mod));
    if (mod === 0)
        return new Uint8Array(u8array);
    let buffer = new Uint8Array(byteLength);
    for (let byteIndex = (byteLength - 1); byteIndex > 0; byteIndex--) {
        buffer[byteIndex] |= ((0xFF & u8array[byteIndex - 1] & mask) << (BYTELENGTH - mod));
        buffer[byteIndex - 1] = ((0xFF & u8array[byteIndex - 1]) >>> mod);
    }
    return buffer;
}
function shiftLeft(u8array, shift) {
    if (shift < 0)
        return shiftRight(u8array, -shift);
    const byteLength = u8array.byteLength;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF << (BYTELENGTH - mod));
    if (mod === 0)
        return new Uint8Array(u8array);
    let buffer = new Uint8Array(u8array.byteLength);
    for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
        buffer[byteIndex] = ((0xFF & u8array[byteIndex]) << mod);
    }
    for (let byteIndex = 0; byteIndex < (byteLength - 1); byteIndex++) {
        buffer[byteIndex] |= ((0xFF & u8array[byteIndex + 1] & mask) >>> (BYTELENGTH - mod));
    }
    return cropBits(buffer, -(shift % BYTELENGTH));
}
