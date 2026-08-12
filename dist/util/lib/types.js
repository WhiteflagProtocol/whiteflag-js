'use strict';
export { isArray, isNumber, isObject, isString, isSerializable };
export const BIGINT = 'bigint';
export const BOOLEAN = 'boolean';
export const FUNCTION = 'function';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';
export const SYMBOL = 'symbol';
function isArray(arr) {
    return Array.isArray(arr);
}
function isNumber(num) {
    return (typeof num === NUMBER && Number.isFinite(num));
}
function isObject(obj) {
    return (typeof obj === OBJECT && !!obj);
}
function isString(str) {
    return (typeof str === STRING);
}
function isSerializable(value) {
    if (value === null)
        return true;
    switch (typeof value) {
        case STRING:
        case BOOLEAN: {
            return true;
        }
        case NUMBER: {
            if (Number.isFinite(value))
                return true;
        }
    }
    if (isArray(value)) {
        if (value.every(item => isSerializable(item)))
            return true;
    }
    return false;
}
