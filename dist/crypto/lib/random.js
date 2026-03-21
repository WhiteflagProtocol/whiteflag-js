'use strict';
export { random, unique };
import { createHash, getRandomValues } from 'node:crypto';
import { HEXBYTELENGTH, HEXENCODING, BASE36RADIX } from "./constants.js";
const EMPTYSTR = '';
const UNIQUEHASH = 'sha256';
const MINBYTES = 8;
const MAXBYTES = 32;
function random(byteLength = 32) {
    return getRandomValues(new Uint8Array(byteLength));
}
function unique(byteLength = 16, id = EMPTYSTR) {
    if (byteLength < MINBYTES)
        byteLength = MINBYTES;
    if (byteLength > MAXBYTES)
        byteLength = MAXBYTES;
    const h = createHash(UNIQUEHASH)
        .update(Date.now().toString(BASE36RADIX))
        .update(random(byteLength))
        .update(id)
        .digest(HEXENCODING);
    return h.substring(0, byteLength * HEXBYTELENGTH);
}
