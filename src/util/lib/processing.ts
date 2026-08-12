'use strict';
/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export {
    Failed,
    Timeout,
    ErrorHandler,
    StreamConsumer,
    ChainedFunction,
    FunctionChain,
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
class Failed extends AggregateError {
    /* CLASS PROPERTIES */
    /** The number of retries before failure */
    readonly #retries: number;

    /* CONSTRUCTOR */
    /**
     * Constructs a failed aggregate error with the underlying errors
     * @param message a human readable error message
     * @param errors the errors that occured during the failed retries
     */
    constructor(message: string, errors: Error[], retries: number) {
        super(errors, message);
        this.name = this.constructor.name;
        this.#retries = retries;
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the number of retries before failure as a property
     */
    get retries(): number {
        return this.#retries;
    }
}
/**
 * Error class to indicate timeouts
 * @extends Error
 */
class Timeout extends Error {
    /* CONSTRUCTOR */
    /**
     * Constructs a timeout error
     * @param message a human readable error message
     */
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
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
class FunctionChain<D> {
    /** A chain of functions */
    #functions = new Set<ChainedFunction<D>>();

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the size of the chain, i.e. the number of functions, as a property
     */
    get size(): number {
        return +this.#functions.size;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Adds a function to the function chain
     * @param func the function to add to function chain
     * @returns this function chain
     */
    public add(func: ChainedFunction<D>): this {
        this.#functions.add(func);
        return this;
    }
    /**
     * Checks if the function chain includes the specifed function
     * @param func the function to check if included
     * @returns `true` if the function is included, else `false`
     */
    public includes(func: ChainedFunction<D>): boolean {
        return this.#functions.has(func);
    }
    /**
     * Removes a function from the function chain
     * @param func the function to remove from the function chain
     * @returns this function chain
     */
    public remove(func: ChainedFunction<D>): this {
        this.#functions.delete(func);
        return this;
    }
    /**
     * Executes the function chain, calling all functions sequentailly in the order added
     * @param data the data element passed to the first function of the sequence
     * @param args optional additional arguments passed to each function in the chain
     * @returns the resulting data after sequential processing by all functions in the chain
     */
    public execute(data: D, args: any[] = []): D {
        let result = data;
        this.#functions.forEach(func => {
            result = func(result, ...args);
        })
        return result;
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
