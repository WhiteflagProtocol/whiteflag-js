/**
 * @module crypto/random
 * @summary Whiteflag JS cryptographic random number generator module
 */
export { random, unique };
import { ByteArray, Hex } from '@whiteflagprotocol/util';
/**
 * Returns a cryptographically strong random value of the given length
 * @param byteLength the lentgh of the byte array to return, default is 32 (256 bits)
 * @returns a byte array with a random value
 */
declare function random(byteLength?: number): ByteArray;
/**
 * Returns a pseudo-unique value of 16 bytes
 * @param id an optional identifier of the item to create the unique value for
 * @returns a hexadecimal string with a pseudo-unique value
 * @remarks This function is meant to create a serializable unique identifier
 * to identify objects of classes that have no other unique property; it is
 * therefore synchronous for use in constructors. Although the value is not
 * guaranteed to be unique, the hash of a combination of the date-time as a
 * counter, a random value, and an optional string, should be sufficient to
 * create a pseudo-unique identifier for a limited number of objects, since
 * the collision chance is neglectable.
 */
declare function unique(byteLength?: number, id?: string): Hex;
