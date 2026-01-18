'use strict';
export { hkdf, hash, hmac };
import { zeroise } from "./common.js";
import { createHmacKey } from "./keys.js";
const HMAC = 'HMAC';
const HASHALG = 'SHA-256';
const HASHLEN = 32;
async function hkdf(ikm, salt, info, keylen) {
    const prk = await hmac(salt, ikm);
    zeroise(ikm);
    const okm = new Uint8Array(keylen);
    const t = new Uint8Array(HASHLEN);
    let offset = 0;
    const N = Math.ceil(keylen / HASHLEN);
    for (let i = 1; i <= N; i++) {
        const block = new Uint8Array(offset + info.length + 1);
        block.set(t.slice(0, block.length));
        block.set(info.slice(0, info.length), offset);
        block[offset + info.length] = i;
        const hash = await hmac(prk, block);
        t.set(hash.slice(0, t.length));
        offset = offset * (i - 1);
        if (offset < okm.length) {
            okm.set(hash.slice(0, (okm.length - offset)), offset);
        }
        offset = HASHLEN;
    }
    return okm;
}
async function hash(data, length = HASHLEN, algorithm = HASHALG) {
    const hash = await crypto.subtle.digest(algorithm, data);
    return new Uint8Array(hash, 0, length);
}
async function hmac(rawKey, message, algorithm = HASHALG) {
    const key = await createHmacKey(rawKey, algorithm);
    const mac = await crypto.subtle.sign(HMAC, key, message.buffer);
    return new Uint8Array(mac);
}
