'use strict';
/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export {
    Timeout,
    ignore,
    sleep,
    timeout,
    noNumber,
    noString
};

/* Constants */
const DEFAULT_TIMEOUT = 1000;

/* MODULE DECLARATIONS */
/**
 * Error class to distinguish timeouts from other errors
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
 * Waits the given time
 * @param timeout the time to sleep in milliseconds
 */
async function sleep(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
/**
 * Executes a promise under a timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws a Timeout error after timeout
 * @returns a new promise
 */
async function timeout(promise: Promise<any>, timeout: number = DEFAULT_TIMEOUT): Promise<any> {
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
 * Throws a reference error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let nr = params?.nr || noNumber()`
 */
function noNumber(descr?: string): number {
    if (descr) throw new ReferenceError(`Missing parameter (number): ${descr}`);
    throw new ReferenceError('Missing parameter (number)');
}
/**
 * Throws a reference error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let str = params?.str || noString()`
 */
function noString(descr?: string): string {
    if (descr) throw new ReferenceError(`Missing parameter (string): ${descr}`);
    throw new ReferenceError('Missing parameter (string)');
}
