/**
 * @module crypto/hash
 * @summary Whiteflag JS cryptographic hashing module
 */
export { hkdf, hash, hmac };
import { ByteArray } from '@whiteflagprotocol/util';
/**
 * Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869
 * @param ikm the input key material
 * @param salt the salt for key
 * @param info optional information to bind the key
 * @param keylen output key length in octets
 * @returns the generated key
 */
declare function hkdf(ikm: ByteArray, salt: ByteArray, info: ByteArray, keylen: number): Promise<ByteArray>;
/**
 * Basic hashing function
 * @param data the data to hash
 * @param length the required output length in octets; default is 32
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the hash value
 */
declare function hash(data: ByteArray, length?: number, algorithm?: AlgorithmIdentifier): Promise<ByteArray>;
/**
 * Hash-Based Message Authentication Code function
 * @param rawKey the raw HMAC key
 * @param message the message to authenticate
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the message authentication code
 */
declare function hmac(rawKey: ByteArray, message: ByteArray, algorithm?: string): Promise<ByteArray>;
