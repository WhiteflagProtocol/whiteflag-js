'use strict';
export { isString, isObject, objectHas };
function isString(str) {
    return (typeof str === 'string' || str instanceof String);
}
function isObject(obj) {
    return (typeof obj === 'object' || obj instanceof Object);
}
function objectHas(obj, key) {
    return (isObject(obj) && Object.hasOwn(obj, key));
}
