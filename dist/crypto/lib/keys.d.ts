/**
 * @module crypto/keys
 * @summary Whiteflag JS crypto key functions
 */
export { createAesKey, createHmacKey };
/**
 * Generates an AES encryption and decryption key
 * @function createAesKey
 * @param rawKey the raw key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
declare function createAesKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
/**
 * Generates an HMAC signing key
 * @function createHmacKey
 * @param rawKey the raw key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @returns the HMAC signing key
 */
declare function createHmacKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
