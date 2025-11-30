/**
 * @module crypto/hash
 * @summary Whiteflag JS hashing functions
 */
export { hkdf, hash, hmac };
/**
 * Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869
 * @function hkdf
 * @param ikm input key material
 * @param salt salt
 * @param info info
 * @param keylen output key length in octets
 * @returns generated key
 */
declare function hkdf(ikm: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, info: Uint8Array, keylen: number): Promise<Uint8Array>;
/**
 * Basic hashing function
 * @function hash
 * @param data data to hash
 * @param len the required output length in octets; default is 32
 * @param alg the hash algorithm to be used; default is SHA-256
 * @returns the hash value
 */
declare function hash(data: Uint8Array<ArrayBuffer>, len?: number, hashalg?: string): Promise<Uint8Array<ArrayBuffer>>;
/**
 * Hash-Based Message Authentication Code function
 * @function hmac
 * @param key the HMAC key
 * @param msg the message to authenticate
 * @param alg the hash algorithm to be used; default is SHA-256
 * @returns the message authentication code
 */
declare function hmac(key: Uint8Array<ArrayBuffer>, msg: Uint8Array<ArrayBuffer>, hashalg?: string): Promise<Uint8Array<ArrayBuffer>>;
