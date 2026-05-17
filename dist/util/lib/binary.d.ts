/**
 * @module util/binary
 * @summary Whiteflag JS binary buffer utility module
 */
export { BinaryBuffer, cropBits, shiftRight, shiftLeft, zeroise };
/**
 * A buffer for storing and manipulating binary data
 * @remarks Objects of this class represent a binary encoded piece of data,
 * e.g. a Whiteflag message, that can be manipulated at bit level. This class
 * provides the basic (not Whiteflag-specific) functionality for other
 * Whiteflag packages to encode and decode binary Whiteflag messages.
 */
declare class BinaryBuffer {
    #private;
    /** The number of used bits in the buffer */
    length: number;
    /**
     * Constructs a binary buffer
     * @param buffer the Uint8Array typed array to create the binary buffer from
     * @param nBits the bit length of the buffer
     */
    private constructor();
    /**
     * Creates an empty binary buffer
     * @returns a new binary buffer
     */
    static empty(): BinaryBuffer;
    /**
     * Creates a binary buffer from another binary buffer
     * @param binBuffer a binary buffer
     * @returns a new binary buffer
     */
    static from(binBuffer: BinaryBuffer): BinaryBuffer;
    /**
     * Creates a binary buffer from bytes in a number array
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromBytes(byteArray: Array<number>, nBits?: number): BinaryBuffer;
    /**
     * Creates a binary buffer from a hexadecimal string
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromHex(hexString: string, nBits?: number): BinaryBuffer;
    /**
     * Creates a binary buffer from a Uint8Array
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    static fromU8a(u8array: Uint8Array, nBits?: number): BinaryBuffer;
    /**
     * Appends another binary buffer to the binary buffer
     * @param binBuffer a binary buffer
     * @returns the updated binary buffer
     */
    append(binBuffer: BinaryBuffer): this;
    /**
     * Appends bytes from a number array to the binary buffer
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendBytes(byteArray: Array<number>, nBits?: number): this;
    /**
     * Appends a hexadecimal string to the binary buffer
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendHex(hexString: string, nBits?: number): this;
    /**
     * Appends a Uint8Array to the binary buffer
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    appendU8a(u8array: Uint8Array, nBits?: number): this;
    /**
     * Shortens the binary buffer to the length of the specified bits
     * @param nBits the number of used bits, or, if negative, the number of bits to remove
     * @returns the updated binary buffer
     */
    crop(nBits: number): this;
    /**
     * Extracts the specified bits from the binary buffer
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns a new binary buffer with the extracted bits
     */
    extract(startBit: number, endBit?: number): BinaryBuffer;
    /**
     * Extracts the specified bits from the binary buffer to a hexadecimal string
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns a hexadecimal string with the extracted data
     */
    extractHex(startBit: number, endBit?: number): string;
    /**
     * Extracts the specified bits from the binary buffer to a Uint8Array
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns an array of 8-bit unsigned integers with the extracted data
     */
    extractU8a(startBit: number, endBit?: number): Uint8Array;
    /**
     * Inserts bytes from a number array at the start of the binary buffer
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertBytes(byteArray: Array<number>, nBits?: number): this;
    /**
     * Inserts a hexadecimal string at the start of the binary buffer
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertHex(hexString: string, nBits?: number): this;
    /**
     * Inserts a Uint8Array at the start of the binary buffer
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    insertU8a(u8array: Uint8Array, nBits?: number): this;
    /**
     * Shifts bits in the buffer to the left, shrinking the buffer
     * @param shift the number of bits to shift to the left
     * @returns the shifted binary buffer
     */
    shiftLeft(shift: number): this;
    /**
     * Shifts bits in the buffer to the right, enlarging the buffer
     * @param shift the number of bits to shift to the right
     * @returns the shifted binary buffer
     */
    shiftRight(shift: number): this;
    /**
     * Gives the value of the binary buffer as a Uint8Array
     * @returns an array of 8-bit unsigned integers
     */
    toU8a(): Uint8Array;
    /**
     * Gives the value of the binary buffer as a hexadecimal string
     * @returns a hexadecimal string
     */
    toHex(): string;
}
/**
 * Shortens a Uint8Array to the length of the specified bits
 * @param u8array the Uint8Array containing the bitset
 * @param nBits the number of used bits, or, if negative, the number of bits to remove
 * @returns a new Uint8Array with the unused bits cleared
 */
declare function cropBits(u8array: Uint8Array, nBits: number): Uint8Array;
/**
 * Shifts bits in a Uint8Array to the right modulo 8
 * @param u8array the Uint8Array to be right shifted
 * @param shift the nummber of bits to be right shifted by modulo 8 bits
 * @returns a new Uint8Array with the right shifted bits
 */
declare function shiftRight(u8array: Uint8Array, shift: number): Uint8Array;
/**
 * Shifts bits in a Uint8Array to the left modulo 8
 * @param u8array the Uint8Array to be left shifted
 * @param shift the nummber of bits to be left shifted by modulo 8 bits
 * @returns a new Uint8Array with the left shifted bits
 */
declare function shiftLeft(u8array: Uint8Array, shift: number): Uint8Array;
/**
 * Basic zeroisation function
 * @param u8array typed array to zeroise
 * @returns the zeroised typed array
 */
declare function zeroise(u8array: Uint8Array): Uint8Array;
