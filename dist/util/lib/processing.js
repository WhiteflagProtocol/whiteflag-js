'use strict';
export { Failed, Timeout, ignore, delay, retryPromise, timeoutPromise, readStream };
const DEFAULT_RETRIES = 2;
const DEFAULT_TIMEOUT = 1000;
class Failed extends AggregateError {
    retries;
    constructor(message, errors, retries) {
        super(errors, message);
        this.name = this.constructor.name;
        this.retries = retries;
    }
}
class Timeout extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
function ignore(...args) { }
async function delay(timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
async function retryPromise(promise, retries = DEFAULT_RETRIES, delaytime = DEFAULT_TIMEOUT, listener, counter, errors) {
    counter ??= retries;
    errors ??= [];
    return new Promise((resolve, reject) => {
        promise
            .then((...args) => { return resolve(...args); })
            .catch((err) => {
            errors.push(err);
            if (listener)
                listener(err);
            if (counter > 0) {
                return delay(delaytime)
                    .then(retryPromise.bind(null, promise, retries, delaytime, listener, (counter - 1), errors))
                    .then(resolve)
                    .catch(reject);
            }
            return reject(new Failed(`Failed after ${retries} retries`, errors, retries));
        });
    });
}
async function timeoutPromise(promise, timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
        promise
            .then((data) => { return resolve(data); })
            .catch((err) => { return reject(err); });
        setTimeout(() => {
            return reject(new Timeout(`Timeout after ${timeout} ms`));
        }, timeout);
    });
}
async function readStream(stream, consumer, counter = 0, ...args) {
    for await (const data of stream) {
        await consumer(data, ...args);
        counter++;
    }
    return counter;
}
