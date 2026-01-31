'use strict';
/**
 * @module util/process
 * @summary Whiteflag JS utility functions for code improvments
 */
export {
    ignore,
    noNumber,
    noString
};

/* MODULE FUNCTIONS */
/**
 * Ignores its arguments and does nothing else
 */
function ignore(): void {}
/**
 * Throws a syntax error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks Typically used where a value might be optional in one case,
 * but required in another: `let nr = params?.nr || noNumber()`
 */
function noNumber(descr?: string): number {
    if (descr) throw new SyntaxError(`Missing parameter (number): ${descr}`);
    throw new SyntaxError('Missing parameter (number)');
}
/**
 * Throws a syntax error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks Typically used where a value might be optional in one case,
 * but required in another: `let str = params?.str || noString()`
 */
function noString(descr?: string): string {
    if (descr) throw new SyntaxError(`Missing parameter (string): ${descr}`);
    throw new SyntaxError('Missing parameter (string)');
}
