'use strict';
export { ignore, sleep, timeout, noNumber, noString };
const DEFAULT_TIMEOUT = 1000;
function ignore() { }
async function sleep(timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
async function timeout(promise, timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
        promise
            .then((data) => { return resolve(data); })
            .catch((err) => { return reject(err); });
        setTimeout(() => {
            return reject(new Error(`Timeout after ${timeout} ms`));
        }, timeout);
    });
}
function noNumber(descr) {
    if (descr)
        throw new SyntaxError(`Missing parameter (number): ${descr}`);
    throw new SyntaxError('Missing parameter (number)');
}
function noString(descr) {
    if (descr)
        throw new SyntaxError(`Missing parameter (string): ${descr}`);
    throw new SyntaxError('Missing parameter (string)');
}
