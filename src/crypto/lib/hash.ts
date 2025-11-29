'use strict';
/**
 * @module crypto/hash
 * @summary Whiteflag JS hashing functions
 */
export {
    hkdf,
    hash,
    hmac
};

/* Constants */
const HASHALG = 'SHA-256';
const HASHLEN = 32;

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
                    info: Uint8Array,
                    keylen: number
                   ): Promise<Uint8Array> {
    // Step 1. HKDF-Extract(salt, IKM) -> PRK
    const prk = await hmac(salt, ikm);
    zeroise(ikm);

    // Step 2. HKDF-Expand(PRK, info, L) -> OKM
    let okm = new Uint8Array(keylen);
    let t = new Uint8Array(HASHLEN);
    let offset = 0;

    const N = Math.ceil(keylen / HASHLEN);
    for (let i = 1; i <= N; i++) {
        // Concatinate previous hash t, info and counter i
        let b = new Uint8Array(offset + info.length + 1);
        b.set(t.slice(0, b.length));
        b.set(info.slice(0, info.length), offset);
        b[offset + info.length] = i;

        // Get hash and add to okm buffer
        let h = await hmac(prk, b);
        t.set(h.slice(0, t.length))
        offset = offset * (i - 1);
        if (offset < okm.length) {
            okm.set(h.slice(0, (okm.length-offset)), offset);
        }
        // Block contains t after after first interation
        offset = HASHLEN;
    }
    // Return output key material
    return okm;
}

/**
 * Basic hashing function
 * @function hash
 * @param data data to hash
 * @param len the required output length in octets; default is 32
 * @param alg the hash algorithm to be used; default is SHA-256
 * @returns the hash value
 */
async function hash(data: Uint8Array<ArrayBuffer>,
                    len = HASHLEN,
                    hashalg = HASHALG
                   ): Promise<Uint8Array<ArrayBuffer>> {
    // Create hash
    const h = await crypto.subtle.digest(hashalg, data);
    return new Uint8Array(h, 0, len);
}

/**
 * Hash-Based Message Authentication Code function
 * @function hmac
 * @param key the HMAC key
 * @param msg the message to authenticate
 * @param alg the hash algorithm to be used; default is SHA-256
 * @returns the message authentication code
 */
async function hmac(key: Uint8Array<ArrayBuffer>,
                    msg: Uint8Array<ArrayBuffer>,
                    hashalg = HASHALG
                   ): Promise<Uint8Array<ArrayBuffer>> {
    // Algorithm
    const HMAC = 'HMAC';

    // Create key
    const k = await crypto.subtle.importKey(
                        'raw', key.buffer,
                        { name: HMAC, hash: { name: hashalg }},
                        false, ['sign']
                    );
    // Sign message
    const mac = await crypto.subtle.sign(HMAC, k, msg.buffer);
    return new Uint8Array(mac);
}

/**
 * Basic zeroisation function
 * @function zeroise
 * @param u8array typed array to zeroise
 * @returns the zeroised typed array
 */
function zeroise(u8array: Uint8Array): Uint8Array {
    return u8array.fill(0);
}
