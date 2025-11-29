"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryArray = void 0;
const encoding_1 = require("./encoding");
const BYTELENGTH = 8;
class BinaryArray {
    buffer;
    length;
    constructor(buffer, bitLength = 0) {
        this.length = bitLength;
        const bufLength = buffer.length * BYTELENGTH;
        if (bitLength < 1)
            this.length = bufLength + bitLength;
        if (Math.abs(bitLength) > bufLength)
            this.length = bufLength;
        this.buffer = buffer;
    }
    static fromUInt8Array(u8array, bitLength = 0) {
        return new BinaryArray(u8array, bitLength);
    }
    static fromHex(hexString) {
        if (!(0, encoding_1.isHex)(hexString))
            throw new Error('Invalid hexadecimal string');
        return new BinaryArray((0, encoding_1.hexToU8a)(hexString));
    }
    toUInt8Array() {
        return new Uint8Array(this.buffer);
    }
    toHex() {
        return (0, encoding_1.u8aToHex)(this.buffer);
    }
}
exports.BinaryArray = BinaryArray;
