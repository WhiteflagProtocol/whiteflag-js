/**
 * @module util/binary
 * @summary Whiteflag JS binary buffer class
 */
export { BinaryBuffer, cropBits, shiftRight, shiftLeft };
/**
 * A class representing a binary buffer
 * @class BinaryBuffer
 */
declare class BinaryBuffer {
    /**
     * @property the Uint8Array that holds the binary content
     */
    private buffer;
    /**
     * @property the number of used bits in the buffer
     */
    length: number;
    /**
     * Constructor for a binary buffer
     * @param buffer the Uint8Array typed array to create the binary buffer from
     * @param nBits the bit length of the buffer
     */
    private constructor();
    /**
     * Creates a binary buffer from another binary buffer
     * @function from
     * @param binBuffer a binary buffer
     * @returns a new binary buffer
     */
    static from(binBuffer: BinaryBuffer): BinaryBuffer;
    /**
     * Creates a binary buffer from bytes from a number array
     * @function fromBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromBytes(byteArray: Array<number>, nBits?: number): BinaryBuffer;
    /**
     * Creates a binary buffer from a hexadecimal string
     * @function fromHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromHex(hexString: string, nBits?: number): BinaryBuffer;
    /**
     * Creates a binary buffer from a Uint8Array
     * @function fromU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromU8a(u8array: Uint8Array, nBits?: number): BinaryBuffer;
    /**
     * Appends another binary buffer to the binary buffer
     * @function append
     * @param binBuffer a binary buffer
     * @returns the updated binary buffer
     */
    append(binBuffer: BinaryBuffer): BinaryBuffer;
    /**
     * Appends bytes from a number array to the binary buffer
     * @function appendBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendBytes(byteArray: Array<number>, nBits?: number): BinaryBuffer;
    /**
     * Appends a hexadecimal string to the binary buffer
     * @function appendHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendHex(hexString: string, nBits?: number): BinaryBuffer;
    /**
     * Appends a Uint8Array to the binary buffer
     * @function appendU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendU8a(u8array: Uint8Array, nBits?: number): BinaryBuffer;
    /**
     * Extracts the specified bits from the binary buffer
     * @param startBit the first bit to extract (inclusive)
     * @param endBit  the final bit of the extraction (exclusive)
     * @returns a new binary buffer with the extracted bits
     */
    extract(startBit: number, endBit: number): BinaryBuffer;
    /**
     * Extracts the specified bits from the binary buffer to a hexadecimal string
     * @param startBit the first bit to extract (inclusive)
     * @param endBit  the final bit of the extraction (exclusive)
     * @returns a hexadecimal string with the extracted data
     */
    extractHex(startBit: number, endBit: number): string;
    /**
     * Extracts the specified bits from the binary buffer to a Uint8Array
     * @function extractU8a
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive)
     * @returns an array of 8-bit unsigned integers with the extracted data
     */
    extractU8a(startBit: number, endBit: number): Uint8Array;
    /**
     * Inserts bytes from a number array at the start of the binary buffer
     * @function insertBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertBytes(byteArray: Array<number>, nBits?: number): BinaryBuffer;
    /**
     * Inserts a hexadecimal string at the start of the binary buffer
     * @function insertHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertHex(hexString: string, nBits?: number): BinaryBuffer;
    /**
     * Inserts a Uint8Array at the start of the binary buffer
     * @function insertU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertU8a(u8array: Uint8Array, nBits?: number): BinaryBuffer;
    /**
     * Shifts bits in the buffer to the left, shrinking the buffer
     * @function shiftLeft
     * @param shift the number of bits to shift to the left
     * @returns the shifted binary buffer
     */
    shiftLeft(shift: number): BinaryBuffer;
    /**
     * Shifts bits in the buffer to the right, enlarging the buffer
     * @function shiftRight
     * @param shift the number of bits to shift to the right
     * @returns the shifted binary buffer
     */
    shiftRight(shift: number): BinaryBuffer;
    /**
     * Gives the value of the binary buffer as a Uint8Array
     * @function toU8a
     * @returns an array of 8-bit unsigned integers
     */
    toU8a(): Uint8Array;
    /**
     * Gives the value of the binary buffer as a hexadecimal string
     * @function toHex
     * @returns a hexadecimal string
     */
    toHex(): string;
    /**
     * Calculates the number of bits to be stored in the buffer
     * @private
     * @param byteLength the actual byte length of the buffer containing the bitset
     * @param nBits the specified bit length of the buffer, or, if negative, the number of bits to remove
     * @returns the calculated bit length
     */
    private calcBitLength;
    /**
     * Calculates the number of bytes required to hold a given number of bits
     * @private
     * @param nBits the number of used bits in the binary buffer
     * @returns the required byte length of the binary buffer
     */
    private calcByteLength;
    /**
     * Concatinates two bitsets
     * @private
     * @param u8array1 Uint8Array containing the first bitset
     * @param nBits1 number of bits in the first bitset, i.e. which bits to take from the first Uint8Array
     * @param u8array2 Uint8Array containing the second bitset
     * @param nBits2 number of bits in the second bitset, i.e. which bits to take from the second Uint8Array
     */
    private concatinate;
}
/**
 * Shortens a Uint8Array to the length of the specified bits
 * @function cropBits
 * @param u8array the Uint8Array containing the bitset
 * @param nBits the number of used bits, or, if negative, the number of bits to remove
 * @return a new Uint8Array with the unused bits cleared
 */
declare function cropBits(u8array: Uint8Array, nBits: number): Uint8Array;
/**
 * Shifts bits in a Uint8Array to the right modulo 8
 * @function shiftRight
 * @param u8array the Uint8Array to be right shifted
 * @param shift the nummber of bits to be right shifted by modulo 8 bits
 * @returns a new Uint8Array with the right shifted bits
 */
declare function shiftRight(u8array: Uint8Array, shift: number): Uint8Array;
/**
 * Shifts bits in a Uint8Array to the left modulo 8
 * @function shiftLeft
 * @param u8array the Uint8Array to be left shifted
 * @param shift the nummber of bits to be left shifted by modulo 8 bits
 * @returns a new Uint8Array with the left shifted bits
 */
declare function shiftLeft(u8array: Uint8Array, shift: number): Uint8Array;
