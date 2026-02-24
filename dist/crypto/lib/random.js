'use strict';
export { random };
function random(byteLength = 32) {
    return crypto.getRandomValues(new Uint8Array(byteLength));
}
