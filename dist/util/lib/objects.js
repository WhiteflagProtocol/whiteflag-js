'use strict';
export { isString, isObject, objectHas, objToB64u, objToU8a, b64uToObj, u8aToObj };
import { stringToB64u, stringToU8a, b64uToString, u8aToString } from "./encoding.js";
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
function objToU8a(obj) {
    return stringToU8a(JSON.stringify(obj));
}
function u8aToObj(u8array) {
    return JSON.parse(u8aToString(u8array));
}
