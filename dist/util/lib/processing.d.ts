/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export { Failed, Timeout, ErrorHandler, StreamConsumer, ChainedFunction, FunctionChain, ignore, delay, retryPromise, timeoutPromise, readStream };
/** Function that operates on data in a function chain */
type ChainedFunction<D> = (data: D, ...args: any) => D;
/** Function that listens for errors */
type ErrorHandler = (err: Error, ...args: any) => void;
/** Function that handles the chuncks of a stream */
type StreamConsumer = (data: any, ...args: any) => Promise<any>;
/**
 * Error class to indicate multiple failed attempts
 * @extends Error
 */
declare class Failed extends AggregateError {
    #private;
    /**
     * Constructs a failed aggregate error with the underlying errors
     * @param message a human readable error message
     * @param errors the errors that occured during the failed retries
     */
    constructor(message: string, errors: Error[], retries: number);
    /**
     * Returns the number of retries before failure as a property
     */
    get retries(): number;
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
 * Class for processing a data element by a chained sequence of functions
 * @template D the data element processed by the function chain
 * @remarks A function chain processes a data element by passing sequentally
 * to the functions added to chain, with the resulting (altered) data element
 * retruned by each function passed to the next. The result of the chain is the
 * resulting data element of the last function in the chain. All functions must
 * accept the same parameters, with the data element processed by the chain
 * being the first. The chain may hold zero or more functions; if the chain
 * contains no functions, the execution of the chain returns the data element
 * unaltered.
 */
declare class FunctionChain<D> {
    #private;
    /**
     * Returns the size of the chain, i.e. the number of functions, as a property
     */
    get size(): number;
    /**
     * Adds a function to the function chain
     * @param func the function to add to function chain
     * @returns this function chain
     */
    add(func: ChainedFunction<D>): this;
    /**
     * Checks if the function chain includes the specifed function
     * @param func the function to check if included
     * @returns `true` if the function is included, else `false`
     */
    includes(func: ChainedFunction<D>): boolean;
    /**
     * Removes a function from the function chain
     * @param func the function to remove from the function chain
     * @returns this function chain
     */
    remove(func: ChainedFunction<D>): this;
    /**
     * Executes the function chain, calling all functions sequentailly in the order added
     * @param data the data element passed to the first function of the sequence
     * @param args optional additional arguments passed to each function in the chain
     * @returns the resulting data after sequential processing by all functions in the chain
     */
    execute(data: D, args?: any[]): D;
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
