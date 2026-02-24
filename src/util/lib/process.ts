'use strict';
/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export {
    ignore,
    sleep,
    timeout,
    noNumber,
    noString
};

/* Constants */
const DEFAULT_TIMEOUT = 1000;

/* MODULE FUNCTIONS */
/**
 * Ignores its arguments and does nothing else
 */
function ignore(): void {}
/** 
 * Waits the given time
 * @function sleep
 * @param timeout the time to sleep in milliseconds
 */
async function sleep(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
/**
 * Executes a promise under a timeout
 * @function timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws after timeout
 * @returns a new promise
 */
async function timeout(promise: Promise<any>, timeout: number = DEFAULT_TIMEOUT): Promise<any> {
    return new Promise((resolve, reject) => {
        // Execute original promise
        promise
        .then((data) => { return resolve(data) })
        .catch((err) => { return reject(err) });
        // Start timer and reject if timer finishes before original promise
        setTimeout(() => {
            return reject(new Error(`Timeout after ${timeout} ms`));
        }, timeout);
    });
}
/**
 * Throws a syntax error for missing a numeric parameter as a result of a coding error
 * @function noNumber
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks To be used where a value might be optional in one case,
 * but required in another: `let nr = params?.nr || noNumber()`
 */
function noNumber(descr?: string): number {
    if (descr) throw new SyntaxError(`Missing parameter (number): ${descr}`);
    throw new SyntaxError('Missing parameter (number)');
}
/**
 * Throws a syntax error for missing a string parameter as a result of a coding error
 * @function noString
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks To be used where a value might be optional in one case,
 * but required in another: `let str = params?.str || noString()`
 */
function noString(descr?: string): string {
    if (descr) throw new SyntaxError(`Missing parameter (string): ${descr}`);
    throw new SyntaxError('Missing parameter (string)');
}
