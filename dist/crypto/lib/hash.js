'use strict';
export { hkdf, hash, hmac };
import { createHmacKey } from "./keys.js";
import { HMAC, DEFAULT_HASHALG, DEFAULT_HASHLEN } from "./constants.js";
async function hkdf(ikm, salt, info, keylen) {
    const prk = await hmac(salt, ikm);
    const okm = new Uint8Array(keylen);
    const t = new Uint8Array(DEFAULT_HASHLEN);
    let offset = 0;
    const N = Math.ceil(keylen / DEFAULT_HASHLEN);
    for (let i = 1; i <= N; i++) {
        const block = new Uint8Array(offset + info.length + 1);
        block.set(t.slice(0, block.length));
        block.set(info.slice(0, info.length), offset);
        block[offset + info.length] = i;
        const h = await hmac(prk, block);
        t.set(h.slice(0, t.length));
        offset = offset * (i - 1);
        if (offset < okm.length) {
            okm.set(h.slice(0, (okm.length - offset)), offset);
        }
        offset = DEFAULT_HASHLEN;
    }
    return okm;
}
async function hash(data, length = DEFAULT_HASHLEN, algorithm = DEFAULT_HASHALG) {
    const h = await crypto.subtle.digest(algorithm, data);
    return new Uint8Array(h, 0, length);
}
async function hmac(rawKey, message, algorithm = DEFAULT_HASHALG) {
    const key = await createHmacKey(rawKey, algorithm);
    const mac = await crypto.subtle.sign(HMAC, key, message.buffer);
    return new Uint8Array(mac);
}
