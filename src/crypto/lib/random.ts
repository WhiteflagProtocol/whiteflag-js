'use strict';
/**
 * @module crypto/random
 * @summary Whiteflag JS cryptographic random number generator module
 */
export {
    random
};

/* MODULE FUNCTIONS */
/**
 * Returns a random value of the given length
 * @param byteLength the lentgh of the byte array to return, default is 32 (256 bits)
 * @returns a byte array with a random value
 */
function random(byteLength: number = 32): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(byteLength));
}
