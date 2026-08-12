'use strict';
/**
 * @module util/binary
 * @summary Whiteflag JS binary buffer utility module
 */
export {
    BinaryBuffer,
    cropBits,
    shiftRight,
    shiftLeft,
    zeroise
};

/* Package modules */
import { isHex } from './checks.ts';
import { ByteArray, byte } from './types.ts';
import { hexToU8a, u8aToHex } from './encoding.ts';

/* Constants */
const BYTELENGTH = 8;

/* MODULE DECLARATIONS */
/**
 * A buffer for storing and manipulating binary data
 * @remarks Objects of this class represent a binary encoded piece of data,
 * e.g. a Whiteflag message, that can be manipulated at bit level. This class
 * provides the basic (not Whiteflag-specific) functionality for other
 * Whiteflag packages to encode and decode binary Whiteflag messages.
 */
class BinaryBuffer {
    /* CLASS PROPERTIES */
    /** The byte array that holds the binary content */
    #buffer: ByteArray;
    /** The number of used bits in the buffer */
    #length: number;

    /* CONSTRUCTOR */
    /**
     * Constructs a binary buffer
     * @param buffer the Uint8Array byte array typed array to create the binary buffer from
     * @param nBits the bit length of the buffer
     */
    private constructor(buffer: ByteArray = new Uint8Array(0), nBits: number = 0) {
        if (buffer.length > 0) {
            this.#length = this.#calcBitLength(buffer.byteLength, nBits);
            this.#buffer = cropBits(buffer, this.#length);
        } else {
            this.#length = 0;
            this.#buffer = buffer;
        }
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the number of bits as a property
     */
    get length() {
        return +this.#length;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates an empty binary buffer
     * @returns a new binary buffer
     */
    public static empty(): BinaryBuffer {
        return new this();
    }
    /**
     * Creates a binary buffer from another binary buffer
     * @param binBuffer a binary buffer
     * @returns a new binary buffer
     */
    public static from(binBuffer: BinaryBuffer): BinaryBuffer {
        return new this(binBuffer.toU8a(), binBuffer.length);
    }
    /**
     * Creates a binary buffer from bytes in a number array
     * @param bytes an array of numbers representing bytes
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromBytes(bytes: byte[], nBits: number = 0): BinaryBuffer {
        return new this(new Uint8Array(bytes), nBits);
    }
    /**
     * Creates a binary buffer from a hexadecimal string
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromHex(hexString: string, nBits: number = 0): BinaryBuffer {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return new this(hexToU8a(hexString), nBits);
    }
    /**
     * Creates a binary buffer from a typed byte array
     * @param bin an array of 8-bit unsigned integers
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromU8a(bin: ByteArray, nBits: number = 0): BinaryBuffer {
        return new this(bin, nBits);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Appends another binary buffer to the binary buffer
     * @param binBuffer a binary buffer
     * @returns the updated binary buffer
     */
    public append(binBuffer: BinaryBuffer): this {
        return this.appendU8a(binBuffer.toU8a(), binBuffer.length);
    }
    /**
     * Appends bytes from a number array to the binary buffer
     * @param bytes an array of numbers representing bytes
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendBytes(bytes: byte[], nBits: number = 0): this {
        return this.appendU8a(new Uint8Array(bytes), nBits);
    }
    /**
     * Appends a hexadecimal string to the binary buffer
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendHex(hexString: string, nBits: number = 0): this {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return this.appendU8a(hexToU8a(hexString), nBits);
    }
    /**
     * Appends a typed byte array to the binary buffer
     * @param bin an array of 8-bit unsigned integers
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendU8a(bin: ByteArray, nBits: number = 0): this {
        const bitLength = this.#length;
        this.#buffer = this.#concatinate(this.#buffer, bitLength, bin, nBits);
        this.#length = bitLength + this.#calcBitLength(bin.byteLength, nBits);
        return this;
    }
    /**
     * Shortens the binary buffer to the length of the specified bits
     * @param nBits the number of used bits, or, if negative, the number of bits to remove
     * @returns the updated binary buffer
     */
    public crop(nBits: number) {
        if (nBits === 0) return this;

        /* Determine resulting buffer length */
        let length = nBits;
        if (nBits > this.#length) length = this.#length;
        if (nBits < 0) length = this.#length + nBits;
        if (length < 0) length = 0;

        /* Crop buffer and set new length */
        this.#buffer = cropBits(this.#buffer, nBits);
        this.#length = length;
        return this;
    }
    /**
     * Extracts the specified bits from the binary buffer
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns a new binary buffer with the extracted bits
     */
    public extract(startBit: number, endBit: number = -1): BinaryBuffer {
        const lastBit = endBit < 0 ? this.#length : endBit;
        const buffer = this.extractU8a(startBit, lastBit);
        const bitLength = lastBit - startBit;
        return new BinaryBuffer(buffer, bitLength);
    }
    /**
     * Extracts the specified bits from the binary buffer to a hexadecimal string
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns a hexadecimal string with the extracted data
     */
    public extractHex(startBit: number, endBit: number = -1): string {
        return u8aToHex(this.extractU8a(startBit, endBit));
    }
    /**
     * Extracts the specified bits from the binary buffer to a typed byte array
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive), negative means until end of buffer
     * @returns an array of 8-bit unsigned integers with the extracted data
     */
    public extractU8a(startBit: number, endBit: number = -1): ByteArray {
        /* Check range */
        const lastBit = endBit < 0 ? this.#length : endBit;
        if (startBit < 0) throw RangeError('Starting bit cannot be less than 0');
        if (startBit >= this.#length) throw RangeError('Starting bit is larger than binary buffer length');
        if (startBit > lastBit) throw RangeError('Starting bit is larger than ending bit');

        /* Calculate parameters */
        let bitLength = lastBit - startBit;
        if (lastBit > this.#length) bitLength = this.#length - startBit;
        const startByte = Math.floor(startBit / BYTELENGTH);
        const byteLength = this.#calcByteLength(bitLength);
        const shift = startBit % BYTELENGTH;

        /* Create and return new byte array */
        const buffer = new Uint8Array(this.#buffer.slice(
            startByte, startByte + byteLength + (shift > 0 ? 1 : 0)
        ));
        return cropBits(shiftLeft(buffer, shift), bitLength);
    }
    /**
     * Inserts bytes from a number array at the start of the binary buffer
     * @param bytes an array of numbers representing bytes
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertBytes(bytes: byte[], nBits: number = 0): this {
        return this.insertU8a(new Uint8Array(bytes), nBits);
    }
    /**
     * Inserts a hexadecimal string at the start of the binary buffer
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertHex(hexString: string, nBits: number = 0): this {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return this.insertU8a(hexToU8a(hexString), nBits);
    }
    /**
     * Inserts a typed byte array at the start of the binary buffer
     * @param bin an array of 8-bit unsigned integers
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertU8a(bin: ByteArray, nBits: number = 0): this {
        const bitLength = this.#length;
        this.#buffer = this.#concatinate(bin, nBits, this.#buffer, bitLength);
        this.#length = bitLength + this.#calcBitLength(bin.byteLength, nBits);
        return this;
    }
    /**
     * Shifts bits in the buffer to the left, shrinking the buffer
     * @param shift the number of bits to shift to the left
     * @returns the shifted binary buffer
     */
    public shiftLeft(shift: number): this {
        if (shift < 0) return this.shiftRight(-shift);

        /* Left shift larger than lentgh gives empty buffer */
        if (shift >= this.#length) {
            this.#buffer = new Uint8Array(0);
            this.#length = 0;
            return this;
        }
        /* Create new smaller buffer */
        const bitLength = this.#length - shift;
        const byteShift =  Math.floor(shift / BYTELENGTH);
        const buffer = new Uint8Array(this.#calcByteLength(bitLength) + 1);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = this.#buffer[i + byteShift];
        }
        this.#buffer = cropBits(shiftLeft(buffer, shift), bitLength);
        this.#length = bitLength;
        return this;
    }
    /**
     * Shifts bits in the buffer to the right, enlarging the buffer
     * @param shift the number of bits to shift to the right
     * @returns the shifted binary buffer
     */
    public shiftRight(shift: number): this {
        if (shift < 0) return this.shiftLeft(-shift);

        /* Create new larger buffer */
        const byteShift = Math.ceil(shift / BYTELENGTH);
        const padding = new Uint8Array(byteShift);
        this.#buffer = this.#concatinate(padding, shift, this.#buffer, this.#length);
        this.#length = this.#length + shift;
        return this;
    }
    /**
     * Gives the value of the binary buffer as a typed byte array
     * @returns an array of 8-bit unsigned integers
     */
    public toU8a(): ByteArray {
        return new Uint8Array(this.#buffer);
    }
    /**
     * Gives the value of the binary buffer as a hexadecimal string
     * @returns a hexadecimal string
     */
    public toHex(): string {
        return u8aToHex(this.#buffer);
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Calculates the number of bits to be stored in the buffer
     * @private
     * @param byteLength the actual byte length of the buffer containing the bitset
     * @param nBits the specified bit length of the buffer, or, if negative, the number of bits to remove
     * @returns the calculated bit length
     */
    #calcBitLength(byteLength: number, nBits: number): number {
        const bitLength = byteLength * BYTELENGTH;
        if (nBits < 1) return Math.max(bitLength + nBits, 0);
        if (nBits > bitLength) return bitLength;
        return nBits;
    }
    /**
     * Calculates the number of bytes required to hold a given number of bits
     * @private
     * @param nBits the number of used bits in the binary buffer
     * @returns the required byte length of the binary buffer
     */
    #calcByteLength(nBits: number): number {
        return Math.ceil(nBits / BYTELENGTH);
    }
    /**
     * Concatinates two bytea arrays
     * @private
     * @param bin1 the Uint8Array byte array containing the first bitset
     * @param nBits1 number of bits in the first bitset, i.e. which bits to take from the first Uint8Array
     * @param bin2 the Uint8Array byte array containing the second bitset
     * @param nBits2 number of bits in the second bitset, i.e. which bits to take from the second Uint8Array
     */
    #concatinate(bin1: ByteArray, nBits1: number, bin2: ByteArray, nBits2: number): ByteArray {
        /* Calculate paramters */
        const bitLength1 = this.#calcBitLength(bin1.byteLength, nBits1);
        const bitLength2 = this.#calcBitLength(bin2.byteLength, nBits2);
        const bitLength = bitLength1 + bitLength2;
        const byteLength = this.#calcByteLength(bitLength);
        const shift = bitLength1 % BYTELENGTH;

        /* Prepare byte arrays */
        const bArray1 = cropBits(bin1, bitLength1);
        const bArray2 = shiftRight(cropBits(bin2, bitLength2), shift);
        const buffer = new Uint8Array(byteLength);

        /* Add byte arrays to buffer */
        buffer.set(bArray1);
        if (shift === 0) {
            /* No overlapping byte */
            const offset = bArray1.byteLength;
            const slice = bArray2.slice(0, buffer.byteLength - offset);
            buffer.set(slice, offset);
        } else {
            /* Overlapping byte */
            const offset = bArray1.byteLength;
            const slice = bArray2.slice(1, buffer.byteLength - offset + 1);
            buffer.set(slice, offset);
            buffer[bArray1.byteLength - 1] |= bArray2[0];
        }
        return buffer;
    }
}

/* MODULE FUNCTIONS */
/**
 * Shortens a typed byte array to the length of the specified bits
 * @param bin the Uint8Array byte array containing the bitset
 * @param nBits the number of used bits, or, if negative, the number of bits to remove
 * @returns a new Uint8Array byte array with the unused bits cleared
 */
function cropBits(bin: ByteArray, nBits: number): ByteArray {
    if (nBits === 0) return new Uint8Array(bin);

    /* Determine resulting byte array length and bits to clear */
    let byteLength: number;
    let clearBits: number;
    if (nBits > 0) {
        byteLength = Math.ceil(nBits / BYTELENGTH);
        clearBits = BYTELENGTH - (nBits % BYTELENGTH);
    } else {
        byteLength = bin.byteLength - Math.floor(-nBits / BYTELENGTH);
        clearBits = -nBits % BYTELENGTH;
    }
    /* Return the full buffer if byte length is larger than buffer length */
    if (byteLength > bin.byteLength) return new Uint8Array(bin);

    /* Return empty buffer if byte lentgh is zero */
    if (byteLength < 1) return new Uint8Array(0);

    /*  Create new buffer of byte length, and clear unused bits in last byte */
    let buffer = new Uint8Array(bin.slice(0, byteLength));
    if (clearBits < BYTELENGTH) buffer[byteLength - 1] &= (0xFF << clearBits);
    return buffer;
}
/**
 * Shifts bits in a typed byte array to the right modulo 8
 * @param bin the Uint8Array byte array to be right shifted
 * @param shift the nummber of bits to be right shifted by modulo 8 bits
 * @returns a new Uint8Array byte array with the right shifted bits
 */
function shiftRight(bin: ByteArray, shift: number): ByteArray {
    /* Check negative value */
    if (shift < 0) return shiftLeft(bin, -shift);

    /* Calculate shift parameters */
    const byteLength = bin.byteLength + 1;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF >>> (BYTELENGTH - mod));

    /* Create new byte array */
    if (mod === 0) return new Uint8Array(bin);
    let buffer = new Uint8Array(byteLength);

    /* Fill bytes of new Uint8Array, starting at the end, and return result */
    for (let byteIndex = (byteLength - 1); byteIndex > 0; byteIndex--) {
        buffer[byteIndex] |= ((0xFF & bin[byteIndex - 1] & mask) << (BYTELENGTH - mod));
        buffer[byteIndex - 1] = ((0xFF & bin[byteIndex - 1]) >>> mod);
    }
    return buffer;
}
/**
 * Shifts bits in a typed byte array to the left modulo 8
 * @param bin the Uint8Array byte array to be left shifted
 * @param shift the nummber of bits to be left shifted by modulo 8 bits
 * @returns a new Uint8Array byte array with the left shifted bits
 */
function shiftLeft(bin: ByteArray, shift: number): ByteArray {
    /* Check negative value */
    if (shift < 0) return shiftRight(bin, -shift);

    /* Calculate shift parameters */
    const byteLength = bin.byteLength;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF << (BYTELENGTH - mod));

    /* Create new byte array */
    if (mod === 0) return new Uint8Array(bin);
    let buffer = new Uint8Array(bin.byteLength);

    /* Fill bytes of new byte array in two passes and return result */
    for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
            buffer[byteIndex] = ((0xFF & bin[byteIndex]) << mod);
    }
    for (let byteIndex = 0; byteIndex < (byteLength - 1); byteIndex++) {
        buffer[byteIndex] |= ((0xFF & bin[byteIndex + 1] & mask) >>> (BYTELENGTH - mod));
    }
    return cropBits(buffer, -(shift % BYTELENGTH));
}
/**
 * Basic zeroisation function
 * @param bin typed array to zeroise
 * @returns the zeroised typed array
 */
function zeroise(bin: ByteArray): ByteArray {
    return bin.fill(0);
}
