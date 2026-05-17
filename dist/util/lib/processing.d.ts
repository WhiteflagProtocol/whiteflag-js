/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export { Failed, Timeout, ignore, delay, retryPromise, timeoutPromise, readStream };
/** Function that listens for errors */
export type ErrorHandler = (err: Error, ...args: any) => void;
/** Function that handles the chuncks of a stream */
export type StreamConsumer = (data: any, ...args: any) => Promise<any>;
/**
 * Error class to indicate multiple failed attempts
 * @extends Error
 */
declare class Failed extends AggregateError {
    /** The number of retries before failure */
    readonly retries: number;
    /**
     * Constructs a failed aggregate error with the underlying errors
     * @param message a human readable error message
     * @param errors the errors that occured during the failed retries
     */
    constructor(message: string, errors: Error[], retries: number);
}
/**
 * Error class to indicate timeouts
 * @extends Error
 */
declare class Timeout extends Error {
    /**
     * Constructs a timeout error
     * @param message a human readable error message
     */
    constructor(message: string);
}
/**
 * Ignores its arguments and does nothing else
 */
declare function ignore(...args: any): void;
/**
 * Delays for the given time
 * @param timeout the time to delay in milliseconds
 */
declare function delay(timeout?: number): Promise<void>;
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
declare function retryPromise(promise: Promise<any>, retries?: number, delaytime?: number, listener?: ErrorHandler, counter?: number, errors?: Error[]): Promise<any>;
/**
 * Executes a promise under a timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws a `Timeout` error after timeout
 * @returns a new promise
 */
declare function timeoutPromise(promise: Promise<any>, timeout?: number): Promise<any>;
/**
 * Reads a stream and passes chunck to a handler until the stream ends
 * @param stream a readable stream
 * @param consumer an asynchronous function that processes a data chunck from the stream
 * @param counter the number of processed data chuncks
 * @param args additional arguments to be passed to the chunck consumber
 */
declare function readStream(stream: ReadableStream, consumer: StreamConsumer, counter?: number, ...args: any): Promise<number>;
