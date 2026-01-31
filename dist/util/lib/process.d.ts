/**
 * @module util/process
 * @summary Whiteflag JS utility functions for code improvments
 */
export { ignore, noNumber, noString };
/**
 * Ignores its arguments and does nothing else
 */
declare function ignore(): void;
/**
 * Throws a syntax error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks Typically used where a value might be optional in one case,
 * but required in another: `let nr = params?.nr || noNumber()`
 */
declare function noNumber(descr?: string): number;
/**
 * Throws a syntax error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a syntax error
 * @remarks Typically used where a value might be optional in one case,
 * but required in another: `let str = params?.str || noString()`
 */
declare function noString(descr?: string): string;
