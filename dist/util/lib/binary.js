'use strict';
export { BinaryBuffer, cropBits, shiftRight, shiftLeft, zeroise };
import { isHex } from "./checks.js";
import { hexToU8a, u8aToHex } from "./encoding.js";
const BYTELENGTH = 8;
class BinaryBuffer {
    #buffer;
    #length;
    constructor(buffer = new Uint8Array(0), nBits = 0) {
        if (buffer.length > 0) {
            this.#length = this.#calcBitLength(buffer.byteLength, nBits);
            this.#buffer = cropBits(buffer, this.#length);
        }
        else {
            this.#length = 0;
            this.#buffer = buffer;
        }
    }
    get length() {
        return +this.#length;
    }
    static empty() {
        return new this();
    }
    static from(binBuffer) {
        return new this(binBuffer.toU8a(), binBuffer.length);
    }
    static fromBytes(bytes, nBits = 0) {
        return new this(new Uint8Array(bytes), nBits);
    }
    static fromHex(hexString, nBits = 0) {
        if (!isHex(hexString))
            throw new TypeError('Invalid hexadecimal string');
        return new this(hexToU8a(hexString), nBits);
    }
    static fromU8a(bin, nBits = 0) {
        return new this(bin, nBits);
    }
    append(binBuffer) {
        return this.appendU8a(binBuffer.toU8a(), binBuffer.length);
    }
    appendBytes(bytes, nBits = 0) {
        return this.appendU8a(new Uint8Array(bytes), nBits);
    }
    appendHex(hexString, nBits = 0) {
        if (!isHex(hexString))
            throw new TypeError('Invalid hexadecimal string');
        return this.appendU8a(hexToU8a(hexString), nBits);
    }
    appendU8a(bin, nBits = 0) {
        const bitLength = this.#length;
        this.#buffer = this.#concatinate(this.#buffer, bitLength, bin, nBits);
        this.#length = bitLength + this.#calcBitLength(bin.byteLength, nBits);
        return this;
    }
    crop(nBits) {
        if (nBits === 0)
            return this;
        let length = nBits;
        if (nBits > this.#length)
            length = this.#length;
        if (nBits < 0)
            length = this.#length + nBits;
        if (length < 0)
            length = 0;
        this.#buffer = cropBits(this.#buffer, nBits);
        this.#length = length;
        return this;
    }
    extract(startBit, endBit = -1) {
        const lastBit = endBit < 0 ? this.#length : endBit;
        const buffer = this.extractU8a(startBit, lastBit);
        const bitLength = lastBit - startBit;
        return new BinaryBuffer(buffer, bitLength);
    }
    extractHex(startBit, endBit = -1) {
        return u8aToHex(this.extractU8a(startBit, endBit));
    }
    extractU8a(startBit, endBit = -1) {
        const lastBit = endBit < 0 ? this.#length : endBit;
        if (startBit < 0)
            throw RangeError('Starting bit cannot be less than 0');
        if (startBit >= this.#length)
            throw RangeError('Starting bit is larger than binary buffer length');
        if (startBit > lastBit)
            throw RangeError('Starting bit is larger than ending bit');
        let bitLength = lastBit - startBit;
        if (lastBit > this.#length)
            bitLength = this.#length - startBit;
        const startByte = Math.floor(startBit / BYTELENGTH);
        const byteLength = this.#calcByteLength(bitLength);
        const shift = startBit % BYTELENGTH;
        const buffer = new Uint8Array(this.#buffer.slice(startByte, startByte + byteLength + (shift > 0 ? 1 : 0)));
        return cropBits(shiftLeft(buffer, shift), bitLength);
    }
    insertBytes(bytes, nBits = 0) {
        return this.insertU8a(new Uint8Array(bytes), nBits);
    }
    insertHex(hexString, nBits = 0) {
        if (!isHex(hexString))
            throw new TypeError('Invalid hexadecimal string');
        return this.insertU8a(hexToU8a(hexString), nBits);
    }
    insertU8a(bin, nBits = 0) {
        const bitLength = this.#length;
        this.#buffer = this.#concatinate(bin, nBits, this.#buffer, bitLength);
        this.#length = bitLength + this.#calcBitLength(bin.byteLength, nBits);
        return this;
    }
    shiftLeft(shift) {
        if (shift < 0)
            return this.shiftRight(-shift);
        if (shift >= this.#length) {
            this.#buffer = new Uint8Array(0);
            this.#length = 0;
            return this;
        }
        const bitLength = this.#length - shift;
        const byteShift = Math.floor(shift / BYTELENGTH);
        const buffer = new Uint8Array(this.#calcByteLength(bitLength) + 1);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = this.#buffer[i + byteShift];
        }
        this.#buffer = cropBits(shiftLeft(buffer, shift), bitLength);
        this.#length = bitLength;
        return this;
    }
    shiftRight(shift) {
        if (shift < 0)
            return this.shiftLeft(-shift);
        const byteShift = Math.ceil(shift / BYTELENGTH);
        const padding = new Uint8Array(byteShift);
        this.#buffer = this.#concatinate(padding, shift, this.#buffer, this.#length);
        this.#length = this.#length + shift;
        return this;
    }
    toU8a() {
        return new Uint8Array(this.#buffer);
    }
    toHex() {
        return u8aToHex(this.#buffer);
    }
    #calcBitLength(byteLength, nBits) {
        const bitLength = byteLength * BYTELENGTH;
        if (nBits < 1)
            return Math.max(bitLength + nBits, 0);
        if (nBits > bitLength)
            return bitLength;
        return nBits;
    }
    #calcByteLength(nBits) {
        return Math.ceil(nBits / BYTELENGTH);
    }
    #concatinate(bin1, nBits1, bin2, nBits2) {
        const bitLength1 = this.#calcBitLength(bin1.byteLength, nBits1);
        const bitLength2 = this.#calcBitLength(bin2.byteLength, nBits2);
        const bitLength = bitLength1 + bitLength2;
        const byteLength = this.#calcByteLength(bitLength);
        const shift = bitLength1 % BYTELENGTH;
        const bArray1 = cropBits(bin1, bitLength1);
        const bArray2 = shiftRight(cropBits(bin2, bitLength2), shift);
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
function cropBits(bin, nBits) {
    if (nBits === 0)
        return new Uint8Array(bin);
    let byteLength;
    let clearBits;
    if (nBits > 0) {
        byteLength = Math.ceil(nBits / BYTELENGTH);
        clearBits = BYTELENGTH - (nBits % BYTELENGTH);
    }
    else {
        byteLength = bin.byteLength - Math.floor(-nBits / BYTELENGTH);
        clearBits = -nBits % BYTELENGTH;
    }
    if (byteLength > bin.byteLength)
        return new Uint8Array(bin);
    if (byteLength < 1)
        return new Uint8Array(0);
    let buffer = new Uint8Array(bin.slice(0, byteLength));
    if (clearBits < BYTELENGTH)
        buffer[byteLength - 1] &= (0xFF << clearBits);
    return buffer;
}
function shiftRight(bin, shift) {
    if (shift < 0)
        return shiftLeft(bin, -shift);
    const byteLength = bin.byteLength + 1;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF >>> (BYTELENGTH - mod));
    if (mod === 0)
        return new Uint8Array(bin);
    let buffer = new Uint8Array(byteLength);
    for (let byteIndex = (byteLength - 1); byteIndex > 0; byteIndex--) {
        buffer[byteIndex] |= ((0xFF & bin[byteIndex - 1] & mask) << (BYTELENGTH - mod));
        buffer[byteIndex - 1] = ((0xFF & bin[byteIndex - 1]) >>> mod);
    }
    return buffer;
}
function shiftLeft(bin, shift) {
    if (shift < 0)
        return shiftRight(bin, -shift);
    const byteLength = bin.byteLength;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF << (BYTELENGTH - mod));
    if (mod === 0)
        return new Uint8Array(bin);
    let buffer = new Uint8Array(bin.byteLength);
    for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
        buffer[byteIndex] = ((0xFF & bin[byteIndex]) << mod);
    }
    for (let byteIndex = 0; byteIndex < (byteLength - 1); byteIndex++) {
        buffer[byteIndex] |= ((0xFF & bin[byteIndex + 1] & mask) >>> (BYTELENGTH - mod));
    }
    return cropBits(buffer, -(shift % BYTELENGTH));
}
function zeroise(bin) {
    return bin.fill(0);
}
