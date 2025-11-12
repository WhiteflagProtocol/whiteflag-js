/**
 * @module util/binary
 * @summary Whiteflag JS binary array class
 */
export { BinaryArray };

/* Dependencies */
import { hexToU8a, u8aToHex } from "./convert";

/**
 * Binary Array
 * @class BinArray
 */
class BinaryArray {
    /**
     * @property buffer the binary content
     */
    private buffer: Uint8Array;

    /**
     * Constructor for a Binary Array
     * @param buffer the Uint8Array typed array to create the Binary Array from
     */
    private constructor(buffer: Uint8Array) {
        this.buffer = buffer;
    }

    /**
     * Creates a Binary Array from a hexadecimal string
     * @param hexString hexadecimal string
     * @returns a new Binary Array
     */
    public static fromHex(hexString: string): BinaryArray {
        return new BinaryArray(hexToU8a(hexString));
    }

    /**
     * Gives the value of the Binary Array as a hexadecimal string
     * @returns a hexadecimal string
     */
    toHex(): string {
        return u8aToHex(this.buffer);
    }
}