'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.hkdf = hkdf;
exports.hash = hash;
exports.hmac = hmac;
const HASHALG = 'SHA-256';
const HASHLEN = 32;
async function hkdf(ikm, salt, info, keylen) {
    const prk = await hmac(salt, ikm);
    zeroise(ikm);
    let okm = new Uint8Array(keylen);
    let t = new Uint8Array(HASHLEN);
    let offset = 0;
    const N = Math.ceil(keylen / HASHLEN);
    for (let i = 1; i <= N; i++) {
        let b = new Uint8Array(offset + info.length + 1);
        b.set(t.slice(0, b.length));
        b.set(info.slice(0, info.length), offset);
        b[offset + info.length] = i;
        let h = await hmac(prk, b);
        t.set(h.slice(0, t.length));
        offset = offset * (i - 1);
        if (offset < okm.length) {
            okm.set(h.slice(0, (okm.length - offset)), offset);
        }
        offset = HASHLEN;
    }
    return okm;
}
async function hash(data, len = HASHLEN, hashalg = HASHALG) {
    const h = await crypto.subtle.digest(hashalg, data);
    return new Uint8Array(h, 0, len);
}
async function hmac(key, msg, hashalg = HASHALG) {
    const HMAC = 'HMAC';
    const k = await crypto.subtle.importKey('raw', key.buffer, { name: HMAC, hash: { name: hashalg } }, false, ['sign']);
    const mac = await crypto.subtle.sign(HMAC, k, msg.buffer);
    return new Uint8Array(mac);
}
function zeroise(u8array) {
    return u8array.fill(0);
}
