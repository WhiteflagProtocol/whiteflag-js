'use strict';
/**
 * @module crypto/random
 * @summary Whiteflag JS cryptographic random number generator module
 */
export {
    random,
    unique
};

/* Dependecies */
import { createHash, getRandomValues } from 'node:crypto';
import { ByteArray, Hex } from '@whiteflagprotocol/util';

/* Package modules */
import {
    HEXBYTELENGTH,
    HEXENCODING,
    BASE36RADIX
} from './constants.ts';

/* Constants */
const EMPTYSTR = '';
const UNIQUEHASH = 'sha256'
const MINBYTES = 8;
const MAXBYTES = 32;

/* MODULE FUNCTIONS */
/**
 * Returns a cryptographically strong random value of the given length
 * @param byteLength the lentgh of the byte array to return, default is 32 (256 bits)
 * @returns a byte array with a random value
 */
function random(byteLength: number = 32): ByteArray {
    return getRandomValues(new Uint8Array(byteLength));
}

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
function unique(byteLength: number = 16, id: string = EMPTYSTR): Hex {
    /* Check minumum and maximum length */
    if (byteLength < MINBYTES) byteLength = MINBYTES;
    if (byteLength > MAXBYTES) byteLength = MAXBYTES;

    /* Create hash */
    const h = createHash(UNIQUEHASH)
        .update(Date.now().toString(BASE36RADIX))
        .update(random(byteLength))
        .update(id)
        .digest(HEXENCODING);

    /* Return requested length */
    return h.substring(0, byteLength * HEXBYTELENGTH);
}
