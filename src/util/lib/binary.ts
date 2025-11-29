/**
 * @module util/binary
 * @summary Whiteflag JS binary array class
 */
export { BinaryArray };

/* Dependencies */
import { isHex,
         hexToU8a,
         u8aToHex } from "./encoding";

/* Constants */
/**
 * Seperator in compact serialised JWS
 * @Constant
 */
const BYTELENGTH = 8;

/* MODULE DECLARATIONS */
/**
 * A class representing a binary array
 * @class BinArray
 */
class BinaryArray {
    /**
     * @property buffer the binary content
     */
    private buffer: Uint8Array;
    /**
     * @property the number of bits in the array
     */
    public length: number;

    /**
     * Constructor for a Binary Array
     * @param buffer the Uint8Array typed array to create the Binary Array from
     * @param bitLength the bit length of the array
     */
    private constructor(buffer: Uint8Array, bitLength: number = 0) {
        this.length = bitLength;
        const bufLength = buffer.length * BYTELENGTH;
        if (bitLength < 1) this.length = bufLength + bitLength;
        if (Math.abs(bitLength) > bufLength) this.length = bufLength;
        this.buffer = buffer;
    }
    /**
     * Creates a Binary Array from a UInt8 typed array
     * @param buffer an array of 8-bit unsigned integers
     * @param bitLength the number of bits to use, or 0 for the full array
     * @returns a new Binary Array
     */
    public static fromUInt8Array(u8array: Uint8Array, bitLength: number = 0): BinaryArray {
        return new BinaryArray(u8array, bitLength);
    }
    /**
     * Creates a Binary Array from a hexadecimal string
     * @param hexString hexadecimal string
     * @returns a new Binary Array
     */
    public static fromHex(hexString: string): BinaryArray {
        if (!isHex(hexString)) throw new Error('Invalid hexadecimal string');
        return new BinaryArray(hexToU8a(hexString));
    }
    /**
     * Gives the value of the Binary Array as a UInt8 typed array
     * @returns  an array of 8-bit unsigned integers
     */
    public toUInt8Array(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
    /**
     * Gives the value of the Binary Array as a hexadecimal string
     * @returns a hexadecimal string
     */
    public toHex(): string {
        return u8aToHex(this.buffer);
    }
}