'use strict';
export { deepCopy, objectHas, objectHasNot, objToJson, objToMap, objToB64, objToB64u, objToU8a, jsonToObj, jsonToMap, mapToObj, mapToJson, mapToU8a, b64ToObj, b64uToObj, u8aToObj, u8aToMap };
import { b64ToStr, b64uToStr, strToB64, strToB64u, strToU8a, u8aToStr } from "./encoding.js";
import { isArray, isObject } from "./types.js";
const illegalKeys = new Set(['__proto__', 'constructor', 'prototype']);
function objectHas(obj, key) {
    if (!isObject(obj))
        throw new TypeError('Not an object');
    return Object.hasOwn(obj, key);
}
function objectHasNot(obj, key) {
    if (!isObject(obj))
        throw new TypeError('Not an object');
    return !Object.hasOwn(obj, key);
}
function deepCopy(obj) {
    if (obj === null)
        return null;
    switch (typeof obj) {
        case 'undefined': {
            return null;
        }
        case 'boolean':
        case 'string': {
            return obj;
        }
        case 'number': {
            if (Number.isFinite(obj))
                return obj;
        }
        case 'object': {
            if (isArray(obj))
                return obj.map(deepCopy);
            if (obj instanceof Set)
                return deepCopy(Array.from(obj));
            if (obj instanceof Map)
                return deepCopy(Object.fromEntries(obj));
            if (obj instanceof Date)
                return obj.toISOString();
            if (obj instanceof RegExp)
                return obj.toString();
            const copy = Object.create(null);
            for (const [k, o] of Object.entries(obj)) {
                copy[k] = deepCopy(o);
            }
            return obj;
        }
    }
    return String(obj);
}
function objToB64(obj) {
    return strToB64(JSON.stringify(obj));
}
function objToB64u(obj) {
    return strToB64u(JSON.stringify(obj));
}
function b64ToObj(base64) {
    return jsonToObj(b64ToStr(base64));
}
function b64uToObj(base64u) {
    return jsonToObj(b64uToStr(base64u));
}
function objToJson(obj) {
    return JSON.stringify(obj);
}
function objToMap(obj) {
    if (!isObject(obj))
        throw new TypeError('Not an object');
    return new Map(Object.entries(obj));
}
function jsonToObj(json) {
    try {
        return Object.assign(Object.create(null), JSON.parse(json, (key, value) => {
            if (illegalKeys.has(key))
                throw TypeError(`JSON contains illegal key: ${key}`);
            return value;
        }));
    }
    catch (err) {
        throw new TypeError(`Cannot convert JSON to JavaScript object: ${err?.message}`, { cause: err });
    }
}
function jsonToMap(json) {
    return new Map(Object.entries(jsonToObj(json)));
}
function mapToObj(map) {
    for (const key of illegalKeys) {
        if (map.has(key))
            throw TypeError(`Map contains illegal key: ${key}`);
    }
    return deepCopy(Object.fromEntries(map));
}
function mapToJson(map) {
    return JSON.stringify(Object.fromEntries(map));
}
function mapToU8a(map) {
    return strToU8a(mapToJson(map));
}
function objToU8a(obj) {
    return strToU8a(JSON.stringify(obj));
}
function u8aToMap(u8array) {
    return objToMap(u8aToObj(u8array));
}
function u8aToObj(u8array) {
    return jsonToObj(u8aToStr(u8array));
}
