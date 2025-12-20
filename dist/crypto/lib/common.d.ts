/**
 * @module crypto/common
 * @summary Whiteflag JS common crypto functions
 */
export { zeroise };
/**
 * Basic zeroisation function
 * @function zeroise
 * @param u8array typed array to zeroise
 * @returns the zeroised typed array
 */
declare function zeroise(u8array: Uint8Array): Uint8Array;
