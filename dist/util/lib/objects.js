'use strict';
export { isString, isObject, objectHas, deepCopy, objToJson, objToMap, objToB64, objToB64u, objToU8a, jsonToObj, jsonToMap, mapToObj, mapToJson, mapToU8a, b64ToObj, b64uToObj, u8aToObj, u8aToMap };
import { b64ToStr, b64uToStr, strToB64, strToB64u, strToU8a, u8aToStr } from "./encoding.js";
const illegalKeys = new Set(['__proto__', 'constructor', 'prototype']);
function isString(str) {
    return (typeof str === 'string' || str instanceof String);
}
function isObject(obj) {
    return (typeof obj === 'object' || obj instanceof Object);
}
function objectHas(obj, key) {
    return (isObject(obj) && Object.hasOwn(obj, key));
}
function deepCopy(entity) {
    if (!isObject(entity))
        return entity;
    switch (entity) {
        case null: return null;
        case undefined: return null;
    }
    switch (true) {
        case entity instanceof Map: return deepCopy(Object.fromEntries(entity));
        case entity instanceof Set: return deepCopy(Array.from(entity));
        case entity instanceof Date: return entity.toISOString();
        case entity instanceof RegExp: return entity.toString();
    }
    if (Array.isArray(entity)) {
        return entity.map(deepCopy);
    }
    const obj = Object.create(null);
    for (const [key, value] of Object.entries(entity)) {
        obj[key] = deepCopy(value);
    }
    return obj;
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
        throw new TypeError('Argument is not an object');
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
