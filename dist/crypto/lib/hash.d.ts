/**
 * @module crypto/hash
 * @summary Whiteflag JS cryptographic hashing module
 */
export { hkdf, hash, hmac };
/**
 * Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869
 * @function hkdf
 * @param ikm the input key material
 * @param salt the salt for key
 * @param info optional information to bind the key
 * @param keylen output key length in octets
 * @returns the generated key
 */
declare function hkdf(ikm: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, info: Uint8Array<ArrayBuffer>, keylen: number): Promise<Uint8Array<ArrayBuffer>>;
/**
 * Basic hashing function
 * @function hash
 * @param data the data to hash
 * @param length the required output length in octets; default is 32
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the hash value
 */
declare function hash(data: Uint8Array<ArrayBuffer>, length?: number, algorithm?: AlgorithmIdentifier): Promise<Uint8Array<ArrayBuffer>>;
/**
 * Hash-Based Message Authentication Code function
 * @function hmac
 * @param rawKey the raw HMAC key
 * @param message the message to authenticate
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the message authentication code
 */
declare function hmac(rawKey: Uint8Array<ArrayBuffer>, message: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<Uint8Array<ArrayBuffer>>;
