'use strict';
/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export {
    Failed,
    Timeout,
    ignore,
    delay,
    retryPromise,
    timeoutPromise,
    readStream
};

/* Constants */
const DEFAULT_RETRIES = 2;
const DEFAULT_TIMEOUT = 1000;

/* MODULE DECLARATIONS */
/** Function that listens for errors */
export type ErrorHandler = (err: Error, ...args: any) => void;
/** Function that handles the chuncks of a stream */
export type StreamConsumer = (data: any, ...args: any) => Promise<any>;
/**
 * Error class to indicate multiple failed attempts
 * @extends Error
 */
class Failed extends AggregateError {
    /** The number of retries before failure */
    public readonly retries: number;
    /**
     * Constructs a failed aggregate error with the underlying errors
     * @param message a human readable error message
     * @param errors the errors that occured during the failed retries
     */
    constructor(message: string, errors: Error[], retries: number) {
        super(errors, message);
        this.name = this.constructor.name;
        this.retries = retries;
    }
}
/**
 * Error class to indicate timeouts
 * @extends Error
 */
class Timeout extends Error {
    /**
     * Constructs a timeout error
     * @param message a human readable error message
     */
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/* MODULE FUNCTIONS */
/**
 * Ignores its arguments and does nothing else
 */
function ignore(...args: any): void {}
/** 
 * Delays for the given time
 * @param timeout the time to delay in milliseconds
 */
async function delay(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout)
    });
} 
/**
 * Executes a promise with retries
 * @param promise the promise to be retried if it is rejected
 * @param retries the total number of retries
 * @param delaytime time to wait between retires in ms
 * @param listener optional function to capture errors causing retries
 * @param counter the number of retries left
 * @param errors the errors from earlier attempts
 * @returns a new promise
 */
async function retryPromise(promise: Promise<any>, retries: number = DEFAULT_RETRIES, delaytime = DEFAULT_TIMEOUT, listener?: ErrorHandler, counter?: number, errors?: Error[]): Promise<any> {
    /* Set initial retry counter and errors array */
    counter ??= retries;
    errors ??= [];

    /* Create new promise */
    return new Promise((resolve, reject) => {
        /* Execute original promise (again) */
        promise
        .then((...args) => { return resolve(...args) })
        .catch((err) => {
            /* Preserve errors and pass to listener, if any */
            errors.push(err);
            if (listener) listener(err);

            /* Retry after delay */
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
/**
 * Executes a promise under a timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws a `Timeout` error after timeout
 * @returns a new promise
 */
async function timeoutPromise(promise: Promise<any>, timeout: number = DEFAULT_TIMEOUT): Promise<any> {
    return new Promise((resolve, reject) => {
        /* Execute original promise */
        promise
        .then((data) => { return resolve(data) })
        .catch((err) => { return reject(err) });
        /* Start timer and reject if timer finishes before original promise */
        setTimeout(() => {
            return reject(new Timeout(`Timeout after ${timeout} ms`));
        }, timeout);
    });
}
/**
 * Reads a stream and passes chunck to a handler until the stream ends
 * @param stream a readable stream
 * @param consumer an asynchronous function that processes a data chunck from the stream
 * @param counter the number of processed data chuncks
 * @param args additional arguments to be passed to the chunck consumber
 */
async function readStream(stream: ReadableStream, consumer: StreamConsumer, counter: number = 0, ...args: any): Promise<number> {
    for await (const data of stream) {
        await consumer(data, ...args);
        counter++
    }
    return counter;
}
