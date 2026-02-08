'use strict';
/**
 * @module crypto/hash
 * @summary Whiteflag JS cryptographic hashing module
 */
export {
    hkdf,
    hash,
    hmac
};

/* Dependencies */
import { hexToB64u, hexToU8a, zeroise } from '@whiteflagprotocol/util';

/* Module imports */
import { createHmacKey } from './keys.ts';
import {
    HMAC,
    DEFAULT_HASHALG,
    DEFAULT_HASHLEN
} from './constants.ts';

/* MODULE FUNCTIONS */
/**
 * Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869
 * @function hkdf
 * @param ikm input key material
 * @param salt salt
 * @param info info
 * @param keylen output key length in octets
 * @returns generated key
 */
async function hkdf(ikm: Uint8Array<ArrayBuffer>,
                    salt: Uint8Array<ArrayBuffer>,
                    info: Uint8Array<ArrayBuffer>,
                    keylen: number
                ): Promise<Uint8Array<ArrayBuffer>> {
    /* Step 1. HKDF-Extract(salt, IKM) -> PRK */
    const prk = await hmac(salt, ikm);
    zeroise(ikm);

    /* Step 2. HKDF-Expand(PRK, info, L) -> OKM */
    const okm = new Uint8Array(keylen);
    const t = new Uint8Array(DEFAULT_HASHLEN);
    let offset = 0;

    const N = Math.ceil(keylen / DEFAULT_HASHLEN);
    for (let i = 1; i <= N; i++) {
        /* Concatinate previous hash t, info and counter i */
        const block = new Uint8Array(offset + info.length + 1);
        block.set(t.slice(0, block.length));
        block.set(info.slice(0, info.length), offset);
        block[offset + info.length] = i;

        /* Get hash and add to okm buffer */
        const h = await hmac(prk, block);
        t.set(h.slice(0, t.length))
        offset = offset * (i - 1);
        if (offset < okm.length) {
            okm.set(h.slice(0, (okm.length-offset)), offset);
        }
        /* Block contains t after after first interation */
        offset = DEFAULT_HASHLEN;
    }
    /* Return output key material */
    return okm;
}
/**
 * Basic hashing function
 * @function hash
 * @param data data to hash
 * @param length the required output length in octets; default is 32
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the hash value
 */
async function hash(data: Uint8Array<ArrayBuffer>,
                    length: number = DEFAULT_HASHLEN,
                    algorithm: AlgorithmIdentifier = DEFAULT_HASHALG
                ): Promise<Uint8Array<ArrayBuffer>> {
    /* Create hash */
    const h = await crypto.subtle.digest(algorithm, data);
    return new Uint8Array(h, 0, length);
}
/**
 * Hash-Based Message Authentication Code function
 * @function hmac
 * @param rawKey the raw HMAC key
 * @param message the message to authenticate
 * @param algorithm the hash algorithm to be used; default is SHA-256
 * @returns the message authentication code
 */
async function hmac(rawKey: Uint8Array<ArrayBuffer>,
                    message: Uint8Array<ArrayBuffer>,
                    algorithm = DEFAULT_HASHALG
                ): Promise<Uint8Array<ArrayBuffer>> {
    const key = await createHmacKey(rawKey, algorithm);
    const mac = await crypto.subtle.sign(HMAC, key, message.buffer);
    return new Uint8Array(mac);
}
