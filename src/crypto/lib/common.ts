'use strict';
/**
 * @module crypto/common
 * @summary Whiteflag JS common cryptographic functions
 */
export {
    zeroise
};

/* MODULE FUNCTIONS */
/**
 * Basic zeroisation function
 * @function zeroise
 * @param u8array typed array to zeroise
 * @returns the zeroised typed array
 */
function zeroise(u8array: Uint8Array): Uint8Array {
    return u8array.fill(0);
}
