'use strict';
export { isNumber, isString, isObject, isSerializable };
export const BOOLEAN = 'boolean';
export const NUMBER = 'number';
export const OBJECT = 'object';
export const STRING = 'string';
function isNumber(num) {
    return (typeof num === NUMBER && Number.isFinite(num));
}
function isString(str) {
    return (typeof str === STRING);
}
function isObject(obj) {
    return (typeof obj === OBJECT || obj instanceof Object);
}
function isSerializable(entity) {
    if (entity === null)
        return true;
    switch (typeof entity) {
        case STRING:
        case NUMBER:
        case BOOLEAN: {
            return true;
        }
    }
    if (Array.isArray(entity)) {
        if (entity.every(item => isSerializable(item)))
            return true;
    }
    return false;
}
