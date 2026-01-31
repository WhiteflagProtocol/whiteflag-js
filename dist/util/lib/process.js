'use strict';
export { ignore, noNumber, noString };
function ignore() { }
function noNumber(descr) {
    if (descr)
        throw new SyntaxError(`Missing parameter (number): ${descr}`);
    throw new SyntaxError('Missing parameter (number)');
}
function noString(descr) {
    if (descr)
        throw new SyntaxError(`Missing parameter (string): ${descr}`);
    throw new SyntaxError('Missing parameter (string)');
}
