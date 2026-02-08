'use strict';
export { isString, isObject, objectHas, objToB64u, b64uToObj };
import { stringToB64u, b64uToString } from "./encoding.js";
function isString(str) {
    return (typeof str === 'string' || str instanceof String);
}
function isObject(obj) {
    return (typeof obj === 'object' || obj instanceof Object);
}
function objectHas(obj, key) {
    return (isObject(obj) && Object.hasOwn(obj, key));
}
function objToB64u(obj) {
    return stringToB64u(JSON.stringify(obj));
}
function b64uToObj(base64u) {
    return JSON.parse(b64uToString(base64u));
}
