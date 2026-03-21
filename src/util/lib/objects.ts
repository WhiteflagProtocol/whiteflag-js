'use strict';
/**
 * @module util/objects
 * @summary Whiteflag JS objects utility module
 */
export {
    isString,
    isObject,
    objectHas,
    deepCopy,
    objToJson,
    objToMap,
    objToB64,
    objToB64u,
    objToU8a,
    jsonToObj,
    jsonToMap,
    mapToObj,
    mapToJson,
    mapToU8a,
    b64ToObj,
    b64uToObj,
    u8aToObj,
    u8aToMap
};

/* Module imports */
import { b64ToStr, b64uToStr, strToB64, strToB64u, strToU8a, u8aToStr } from './encoding.ts';
import { ByteArray, Base64, Base64url, Json } from './types.ts';

/* Constants */
const illegalKeys = new Set(['__proto__', 'constructor', 'prototype']);

/* MODULE FUNCTIONS */
/**
 * Checks if something is a string
 * @param str something that might be a string
 * @returns `true` if string, else `false`
 */
function isString(str: any): boolean {
    return (typeof str === 'string' || str instanceof String); 
}
/**
 * Checks if something is an object
 * @param obj something that might be an object
 * @returns `true` if object, else `false`
 */
function isObject(obj: any): boolean {
    return (typeof obj === 'object' || obj instanceof Object);
}
/**
 * Checks if an object has a property identified by key
 * @param obj the object to check
 * @param key the name of the property
 * @returns `true` if property exists, else `false`
 */
function objectHas(obj: Object, key: string): boolean {
    return (isObject(obj) && Object.hasOwn(obj, key));
}
/**
 * Provides a plain serializable deep copy of an object
 * @param entity the object to copy
 * @returns a plain JavaScript object with a deep copy of the entity
 * @remarks Copies of objects created by this functions are without any
 * inherited properties to prevent prototype poisoning. Complex objects
 * (Map, Set, Date, RegExp) are converted to plain objects or a primitive
 * value, allowing the deep copy to be serialized.
 */
function deepCopy(entity: any): any {
    /* Returns as a value if not an object or array */
    if (!isObject(entity)) return entity;

    /* Null and undefined */
    switch (entity) {
        case null: return null;
        case undefined: return null;
    }
    /* Handle complex objects */
    switch (true) {
        case entity instanceof Map: return deepCopy(Object.fromEntries(entity));
        case entity instanceof Set: return deepCopy(Array.from(entity));
        case entity instanceof Date: return entity.toISOString();
        case entity instanceof RegExp: return entity.toString();
    }
    /* Calls itself on each element of an array*/
    if (Array.isArray(entity)) {
        return entity.map(deepCopy);
    }
    /* Copy each element of the object */
    const obj = Object.create(null);
    for (const [key, value] of Object.entries(entity)) {
        obj[key] = deepCopy(value);
    }
    return obj;
}
/**
 * Creates a base64 encoded JSON serialized object
 * @param obj the object to be base64 encoded
 * @returns a base64 encoded JSON serialized object
 */
function objToB64(obj: Object): Base64 {
    return strToB64(JSON.stringify(obj));
}
/**
 * Creates a base64url encoded JSON serialized object
 * @param obj the object to be base64url encoded
 * @returns a base64url encoded JSON serialized object
 */
function objToB64u(obj: Object): Base64url {
    return strToB64u(JSON.stringify(obj));
}
/**
 * Creates an object from a base64 encoded JSON serialized object
 * @param base64 a base64 encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
function b64ToObj(base64: Base64): Object {
    return jsonToObj(b64ToStr(base64));
}
/**
 * Creates an object from a base64url encoded JSON serialized object
 * @param base64u a base64url encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
function b64uToObj(base64u: Base64url): Object {
    return jsonToObj(b64uToStr(base64u));
}
/**
 * Creates a JSON serialized object from an object
 * @param obj the object to be stringified
 * @returns a JSON serialized object
 * @remarks Just a wrapper for `JSON.stringify`, included for completeness
 */
function objToJson(obj: Object): Json {
    return JSON.stringify(obj);
}
/**
 * Creates a map from an obejct
 * @param obj the object to be transformed to a map
 * @returns a map
 */
function objToMap(obj: Object): Map<string,any> {
    if (!isObject(obj)) throw new TypeError('Argument is not an object');
    return new Map(Object.entries(obj));
}
/**
 * Creates an object from a JSON serialized object
 * @param json the JSON serialized object
 * @returns a plain object with the JSON data
 * @throws if the JSON serialized object contains illegal keys
 * @remarks This function is prefered over using `JSON.parse` directly,
 * because it creates an object without any inherited properties to prevent
 * prototype poisoning.
 */
function jsonToObj(json: Json): Object {
    try {
        /* Create object without prototype from JSON serialized object */
        return Object.assign(Object.create(null), JSON.parse(json, (key, value) => {
            /* Check for illegal keys */
            if (illegalKeys.has(key)) throw TypeError(`JSON contains illegal key: ${key}`);
            return value;
        }));
    } catch(err: any) {
        throw new TypeError(`Cannot convert JSON to JavaScript object: ${err?.message}`, { cause: err });
    }
}
/**
 * Creates a map from a JSON serialized object
 * @param json the JSON serialized object
 * @returns a map with  with the JSON data
 */
function jsonToMap(json: Json): Map<string,any> {
    return new Map(Object.entries(jsonToObj(json)));
}
/**
 * Creates an object from a map
 * @param map the map to transform to an object
 * @returns a plain object with the data from the map
 * @throws if the map contains illegal keys
 * @remarks This function creates an object without any inherited properties
 * to prevent prototype poisoning.
 */
function mapToObj(map: Map<string,any>): Object {
    for (const key of illegalKeys) {
        /* Checks for illegal keys in map */
        if (map.has(key)) throw TypeError(`Map contains illegal key: ${key}`);
    }
    /* Create object without prototype from map */
    return deepCopy(Object.fromEntries(map));
}
/**
 * Creates a JSON serialized object from a map
 * @param map the map to be stringified
 * @returns a JSON serialized object
 */
function mapToJson(map: Map<string,any>): Json {
    return JSON.stringify(Object.fromEntries(map));
}
/**
 * Creates a byte array of JSON serialized map
 * @param map the map to be binary encoded
 * @returns a binary encoded map
 */
function mapToU8a(map: Map<string,any>): ByteArray {
    return strToU8a(mapToJson(map));
}
/**
 * Creates a byte array with a JSON serialized object
 * @param obj the object to be binary encoded
 * @returns a binary encoded object
 */
function objToU8a(obj: Object): ByteArray {
    return strToU8a(JSON.stringify(obj));
}
/**
 * Creates a map from a byte array with a JSON serialized object
 * @param u8array a binary encoded JSON serialized object
 * @returns a map with the decoded binary data
 */
function u8aToMap(u8array: Uint8Array): Map<string,any> {
    return objToMap(u8aToObj(u8array));
}
/**
 * Creates an object from a byte array with a JSON serialized object
 * @param u8array a binary encoded JSON serialized object
 * @returns a plain object with the decoded binary data
 */
function u8aToObj(u8array: Uint8Array): Object {
    return jsonToObj(u8aToStr(u8array));
}
