/**
 * @module util/binary
 * @summary Whiteflag JS binary buffer class
 */
export {
    BinaryBuffer,
    cropBits,
    shiftRight,
    shiftLeft
};

/* Dependencies */
import { 
    isHex,
    hexToU8a,
    u8aToHex
} from './encoding.ts';

/* Constants */
/**
 * Seperator in compact serialised JWS
 * @Constant
 */
const BYTELENGTH = 8;

/* MODULE DECLARATIONS */
/**
 * A class representing a binary buffer
 * @class BinaryBuffer
 */
class BinaryBuffer {
    /* CLASS PROPERTIES */
    /**
     * @property the Uint8Array that holds the binary content
     */
    private buffer: Uint8Array;
    /**
     * @property the number of used bits in the buffer
     */
    public length: number;

    /* CONSTRUCTOR */
    /**
     * Constructor for a binary buffer
     * @param buffer the Uint8Array typed array to create the binary buffer from
     * @param nBits the bit length of the buffer
     */
    private constructor(buffer: Uint8Array, nBits: number = 0) {
        this.length = this.calcBitLength(buffer.byteLength, nBits);
        this.buffer = cropBits(buffer, this.length);
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a binary buffer from another binary buffer
     * @function from
     * @param binBuffer a binary buffer
     * @returns a new binary buffer
     */
    public static from(binBuffer: BinaryBuffer): BinaryBuffer {
        return new BinaryBuffer(binBuffer.toU8a(), binBuffer.length);
    }
    /**
     * Creates a binary buffer from bytes from a number array
     * @function fromBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromBytes(byteArray: Array<number>, nBits: number = 0): BinaryBuffer {
        return new BinaryBuffer(new Uint8Array(byteArray), nBits);
    }
    /**
     * Creates a binary buffer from a hexadecimal string
     * @function fromHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromHex(hexString: string, nBits: number = 0): BinaryBuffer {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return new BinaryBuffer(hexToU8a(hexString), nBits);
    }
    /**
     * Creates a binary buffer from a Uint8Array
     * @function fromU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits
     * @returns a new binary buffer
     */
    public static fromU8a(u8array: Uint8Array, nBits: number = 0): BinaryBuffer {
        return new BinaryBuffer(u8array, nBits);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Appends another binary buffer to the binary buffer
     * @function append
     * @param binBuffer a binary buffer
     * @returns the updated binary buffer
     */
    public append(binBuffer: BinaryBuffer): BinaryBuffer {
        return this.appendU8a(binBuffer.toU8a(), binBuffer.length);
    }
    /**
     * Appends bytes from a number array to the binary buffer
     * @function appendBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendBytes(byteArray: Array<number>, nBits: number = 0): BinaryBuffer {
        return this.appendU8a(new Uint8Array(byteArray), nBits);
    }
    /**
     * Appends a hexadecimal string to the binary buffer
     * @function appendHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendHex(hexString: string, nBits: number = 0): BinaryBuffer {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return this.appendU8a(hexToU8a(hexString), nBits);
    }
    /**
     * Appends a Uint8Array to the binary buffer
     * @function appendU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to append
     * @returns the updated binary buffer
     */
    public appendU8a(u8array: Uint8Array, nBits: number = 0): BinaryBuffer {
        const bitLength = this.length;
        this.buffer = this.concatinate(this.buffer, bitLength, u8array, nBits);
        this.length = bitLength + this.calcBitLength(u8array.byteLength, nBits);
        return this;
    }
    /**
     * Extracts the specified bits from the binary buffer
     * @param startBit the first bit to extract (inclusive)
     * @param endBit  the final bit of the extraction (exclusive)
     * @returns a new binary buffer with the extracted bits
     */
    public extract(startBit: number, endBit: number): BinaryBuffer {
        const buffer = this.extractU8a(startBit, endBit);
        const bitLength = endBit - startBit;
        return new BinaryBuffer(buffer, bitLength);
    }
    /**
     * Extracts the specified bits from the binary buffer to a hexadecimal string
     * @param startBit the first bit to extract (inclusive)
     * @param endBit  the final bit of the extraction (exclusive)
     * @returns a hexadecimal string with the extracted data
     */
    public extractHex(startBit: number, endBit: number): string {
        return u8aToHex(this.extractU8a(startBit, endBit));
    }
    /**
     * Extracts the specified bits from the binary buffer to a Uint8Array
     * @function extractU8a
     * @param startBit the first bit to extract (inclusive)
     * @param endBit the final bit of the extraction (exclusive)
     * @returns an array of 8-bit unsigned integers with the extracted data
     */
    public extractU8a(startBit: number, endBit: number): Uint8Array {
        /* Check range */
        if (startBit < 0) throw RangeError('Starting bit cannot be less than 0');
        if (startBit >= this.length) throw RangeError('Starting bit is larger than binary buffer length');
        if (startBit > endBit) throw RangeError('Starting bit is larger than ending bit');

        /* Calculate parameters */
        let bitLength = endBit - startBit;
        if (endBit > this.length) bitLength = this.length - startBit;
        const startByte = Math.floor(startBit / BYTELENGTH);
        const byteLength = this.calcByteLength(bitLength);
        const shift = startBit % BYTELENGTH;

        /* Create new byte array */
        const buffer = new Uint8Array(this.buffer.slice(startByte, startByte + byteLength + 1));
        return cropBits(shiftLeft(buffer, shift), bitLength);
    }
    /**
     * Inserts bytes from a number array at the start of the binary buffer
     * @function insertBytes
     * @param byteArray an array of numbers representing bytes
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertBytes(byteArray: Array<number>, nBits: number = 0): BinaryBuffer {
        return this.insertU8a(new Uint8Array(byteArray), nBits);
    }
    /**
     * Inserts a hexadecimal string at the start of the binary buffer
     * @function insertHex
     * @param hexString a hexadecimal string
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertHex(hexString: string, nBits: number = 0): BinaryBuffer {
        if (!isHex(hexString)) throw new TypeError('Invalid hexadecimal string');
        return this.insertU8a(hexToU8a(hexString), nBits);
    }
    /**
     * Inserts a Uint8Array at the start of the binary buffer
     * @function insertU8a
     * @param u8array an array of 8-bit unsigned integers
     * @param nBits the number of used bits to insert
     * @returns the updated binary buffer
     */
    public insertU8a(u8array: Uint8Array, nBits: number = 0): BinaryBuffer {
        const bitLength = this.length;
        this.buffer = this.concatinate(u8array, nBits, this.buffer, bitLength);
        this.length = bitLength + this.calcBitLength(u8array.byteLength, nBits);
        return this;
    }
    /**
     * Shifts bits in the buffer to the left, shrinking the buffer
     * @function shiftLeft
     * @param shift the number of bits to shift to the left
     * @returns the shifted binary buffer
     */
    public shiftLeft(shift: number): BinaryBuffer {
        if (shift < 0) return this.shiftRight(-shift);

        /* Left shift larger than lentgh gives empty buffer */
        if (shift >= this.length) {
            this.buffer = new Uint8Array(0);
            this.length = 0;
            return this;
        }
        /* Create new smaller buffer */
        const bitLength = this.length - shift;
        const byteShift =  Math.floor(shift / BYTELENGTH);
        const buffer = new Uint8Array(this.calcByteLength(bitLength) + 1);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = this.buffer[i + byteShift];
        }
        this.buffer = cropBits(shiftLeft(buffer, shift), bitLength);
        this.length = bitLength;
        return this;
    }
    /**
     * Shifts bits in the buffer to the right, enlarging the buffer
     * @function shiftRight
     * @param shift the number of bits to shift to the right
     * @returns the shifted binary buffer
     */
    public shiftRight(shift: number): BinaryBuffer {
        if (shift < 0) return this.shiftLeft(-shift);

        /* Create new larger buffer */
        const byteShift = Math.ceil(shift / BYTELENGTH);
        const padding = new Uint8Array(byteShift);
        this.buffer = this.concatinate(padding, shift, this.buffer, this.length);
        this.length = this.length + shift;
        return this;
    }
    /**
     * Gives the value of the binary buffer as a Uint8Array
     * @function toU8a
     * @returns an array of 8-bit unsigned integers
     */
    public toU8a(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
    /**
     * Gives the value of the binary buffer as a hexadecimal string
     * @function toHex
     * @returns a hexadecimal string
     */
    public toHex(): string {
        return u8aToHex(this.buffer);
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Calculates the number of bits to be stored in the buffer
     * @private
     * @param byteLength the actual byte length of the buffer containing the bitset
     * @param nBits the specified bit length of the buffer, or, if negative, the number of bits to remove
     * @returns the calculated bit length
     */
    private calcBitLength(byteLength: number, nBits: number): number {
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
    private calcByteLength(nBits: number): number {
        return Math.ceil(nBits / BYTELENGTH);
    }
    /**
     * Concatinates two bitsets
     * @private
     * @param u8array1 Uint8Array containing the first bitset
     * @param nBits1 number of bits in the first bitset, i.e. which bits to take from the first Uint8Array
     * @param u8array2 Uint8Array containing the second bitset
     * @param nBits2 number of bits in the second bitset, i.e. which bits to take from the second Uint8Array
     */
    private concatinate(u8array1: Uint8Array, nBits1: number, u8array2: Uint8Array, nBits2: number): Uint8Array {
        /* Calculate paramters */
        const bitLength1 = this.calcBitLength(u8array1.byteLength, nBits1);
        const bitLength2 = this.calcBitLength(u8array2.byteLength, nBits2);
        const bitLength = bitLength1 + bitLength2;
        const byteLength = this.calcByteLength(bitLength);
        const shift = bitLength1 % BYTELENGTH;

        /* Prepare byte arrays */
        const bArray1 = cropBits(u8array1, bitLength1);
        const bArray2 = shiftRight(cropBits(u8array2, bitLength2), shift);
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
 * Shortens a Uint8Array to the length of the specified bits
 * @function cropBits
 * @param u8array the Uint8Array containing the bitset
 * @param nBits the number of used bits, or, if negative, the number of bits to remove
 * @return a new Uint8Array with the unused bits cleared
 */
function cropBits(u8array: Uint8Array, nBits: number): Uint8Array {
    if (nBits === 0) return new Uint8Array(u8array);

    /* Determine resulting byte array length and bits to clear */
    let byteLength: number;
    let clearBits: number;
    if (nBits > 0) {
        byteLength = Math.ceil(nBits / BYTELENGTH);
        clearBits = BYTELENGTH - (nBits % BYTELENGTH);
    } else {
        byteLength = u8array.byteLength - Math.floor(-nBits / BYTELENGTH);
        clearBits = -nBits % BYTELENGTH;
    }
    /* Return the full buffer if byte length is larger than buffer length */
    if (byteLength > u8array.byteLength) return new Uint8Array(u8array);

    /* Return empty buffer if byte lentgh is zero */
    if (byteLength < 1) return new Uint8Array(0);

    /*  Create new buffer of byte length, and clear unused bits in last byte */
    let buffer = new Uint8Array(u8array.slice(0, byteLength));
    if (clearBits < BYTELENGTH) buffer[byteLength - 1] &= (0xFF << clearBits);
    return buffer;
}
/**
 * Shifts bits in a Uint8Array to the right modulo 8
 * @function shiftRight
 * @param u8array the Uint8Array to be right shifted
 * @param shift the nummber of bits to be right shifted by modulo 8 bits
 * @returns a new Uint8Array with the right shifted bits
 */
function shiftRight(u8array: Uint8Array, shift: number): Uint8Array {
    /* Check negative value */
    if (shift < 0) return shiftLeft(u8array, -shift);

    /* Calculate shift parameters */
    const byteLength = u8array.byteLength + 1;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF >>> (BYTELENGTH - mod));

    /* Create new byte array */
    if (mod === 0) return new Uint8Array(u8array);
    let buffer = new Uint8Array(byteLength);

    /* Fill bytes of new Uint8Array, starting at the end, and return result */
    for (let byteIndex = (byteLength - 1); byteIndex > 0; byteIndex--) {
        buffer[byteIndex] |= ((0xFF & u8array[byteIndex - 1] & mask) << (BYTELENGTH - mod));
        buffer[byteIndex - 1] = ((0xFF & u8array[byteIndex - 1]) >>> mod);
    }
    return buffer;
}
/**
 * Shifts bits in a Uint8Array to the left modulo 8
 * @function shiftLeft
 * @param u8array the Uint8Array to be left shifted
 * @param shift the nummber of bits to be left shifted by modulo 8 bits
 * @returns a new Uint8Array with the left shifted bits
 */
function shiftLeft(u8array: Uint8Array, shift: number): Uint8Array {
    /* Check negative value */
    if (shift < 0) return shiftRight(u8array, -shift);

    /* Calculate shift parameters */
    const byteLength = u8array.byteLength;
    const mod = shift % BYTELENGTH;
    const mask = (0xFF << (BYTELENGTH - mod));

    /* Create new byte array */
    if (mod === 0) return new Uint8Array(u8array);
    let buffer = new Uint8Array(u8array.byteLength);

    /* Fill bytes of new byte array in two passes and return result */
    for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
            buffer[byteIndex] = ((0xFF & u8array[byteIndex]) << mod);
    }
    for (let byteIndex = 0; byteIndex < (byteLength - 1); byteIndex++) {
        buffer[byteIndex] |= ((0xFF & u8array[byteIndex + 1] & mask) >>> (BYTELENGTH - mod));
    }
    return cropBits(buffer, -(shift % BYTELENGTH));
}
