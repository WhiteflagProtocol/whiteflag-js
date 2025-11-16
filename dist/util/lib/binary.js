"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryArray = void 0;
const convert_1 = require("./convert");
class BinaryArray {
    buffer;
    constructor(buffer) {
        this.buffer = buffer;
    }
    static fromHex(hexString) {
        return new BinaryArray((0, convert_1.hexToU8a)(hexString));
    }
    toHex() {
        return (0, convert_1.u8aToHex)(this.buffer);
    }
}
exports.BinaryArray = BinaryArray;
