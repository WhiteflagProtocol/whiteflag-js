/**
 * @module crypto/random
 * @summary Whiteflag JS cryptographic random number generator module
 */
export { random };
/**
 * Returns a random value of the given length
 * @param byteLength the lentgh of the byte array to return, default is 32 (256 bits)
 * @returns a byte array with a random value
 */
declare function random(byteLength?: number): Uint8Array<ArrayBuffer>;
