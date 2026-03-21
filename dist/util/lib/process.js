'use strict';
export { Timeout, ignore, sleep, timeout, noNumber, noString };
const DEFAULT_TIMEOUT = 1000;
class Timeout extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
function ignore(...args) { }
async function sleep(timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
async function timeout(promise, timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
        promise
            .then((data) => { return resolve(data); })
            .catch((err) => { return reject(err); });
        setTimeout(() => {
            return reject(new Timeout(`Timeout after ${timeout} ms`));
        }, timeout);
    });
}
function noNumber(descr) {
    if (descr)
        throw new ReferenceError(`Missing parameter (number): ${descr}`);
    throw new ReferenceError('Missing parameter (number)');
}
function noString(descr) {
    if (descr)
        throw new ReferenceError(`Missing parameter (string): ${descr}`);
    throw new ReferenceError('Missing parameter (string)');
}
