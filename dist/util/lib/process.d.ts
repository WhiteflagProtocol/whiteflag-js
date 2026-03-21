/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export { Timeout, ignore, sleep, timeout, noNumber, noString };
/**
 * Error class to distinguish timeouts from other errors
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
 * Waits the given time
 * @param timeout the time to sleep in milliseconds
 */
declare function sleep(timeout?: number): Promise<void>;
/**
 * Executes a promise under a timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws a Timeout error after timeout
 * @returns a new promise
 */
declare function timeout(promise: Promise<any>, timeout?: number): Promise<any>;
/**
 * Throws a reference error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let nr = params?.nr || noNumber()`
 */
declare function noNumber(descr?: string): number;
/**
 * Throws a reference error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let str = params?.str || noString()`
 */
declare function noString(descr?: string): string;
