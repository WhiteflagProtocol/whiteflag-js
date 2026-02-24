/**
 * @module util/process
 * @summary Whiteflag JS processing utility module
 */
export { ignore, sleep, timeout, noNumber, noString };
/**
 * Ignores its arguments and does nothing else
 */
declare function ignore(): void;
/**
 * Waits the given time
 * @function sleep
 * @param timeout the time to sleep in milliseconds
 */
declare function sleep(timeout?: number): Promise<void>;
/**
 * Executes a promise under a timeout
 * @function timeout
 * @param promise the promise to be executed under a timeout
 * @param timeout the timeout in ms
 * @throws after timeout
 * @returns a new promise
 */
declare function timeout(promise: Promise<any>, timeout?: number): Promise<any>;
/**
 * Throws a syntax error for missing a numeric parameter as a result of a coding error
 * @function noNumber
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks To be used where a value might be optional in one case,
 * but required in another: `let nr = params?.nr || noNumber()`
 */
declare function noNumber(descr?: string): number;
/**
 * Throws a syntax error for missing a string parameter as a result of a coding error
 * @function noString
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks To be used where a value might be optional in one case,
 * but required in another: `let str = params?.str || noString()`
 */
declare function noString(descr?: string): string;
