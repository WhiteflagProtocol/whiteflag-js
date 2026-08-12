'use strict';
/**
 * @module util/objects
 * @summary Whiteflag JS objects utility module
 */
export {
    deepCopy,
    objectHas,
    objectHasNot,
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

/* Package modules */
import { b64ToStr, b64uToStr, strToB64, strToB64u, strToU8a, u8aToStr } from './encoding.ts';
import { ByteArray, Base64, Base64url, Json, Serializable, serializable, primitive } from './types.ts';
import { isArray, isObject } from './types.ts';

/* Constants */
const illegalKeys = new Set(['__proto__', 'constructor', 'prototype']);

/* MODULE FUNCTIONS */
/**
 * Checks if an object has a property identified by key
 * @param obj the object to check
 * @param key the name of the property
 * @returns `true` if property exists, else `false`
 * @throws if first argument is not an object
 */
function objectHas(obj: object, key: string): boolean {
    if (!isObject(obj)) throw new TypeError('Not an object');
    return Object.hasOwn(obj, key);
}
/**
 * Checks if an object does not have a property identified by key
 * @param obj the object to check
 * @param key the name of the missing property
 * @returns `true` if property does not exists, else `false`
 * @throws if first argument is not an object
 */
function objectHasNot(obj: object, key: string): boolean {
    if (!isObject(obj)) throw new TypeError('Not an object');
    return !Object.hasOwn(obj, key);
}
/**
 * Provides a plain serializable deep copy of an object
 * @param obj the object to copy
 * @returns a plain JavaScript object with a deep copy of the object
 * @remarks Copies of objects created by this functions are without any
 * inherited properties to prevent prototype poisoning. Complex objects
 * (Map, Set, Date, RegExp) are converted to plain objects or a primitive
 * value, allowing the deep copy to be serialized.
 */
function deepCopy(obj: object): {};
function deepCopy(obj: primitive): serializable;
function deepCopy(obj: Array<unknown>): Array<Serializable | serializable>;
function deepCopy(obj: Set<unknown>): Array<Serializable | serializable>;
function deepCopy(obj: Map<unknown,unknown>): Serializable;
function deepCopy(obj: Date): string;
function deepCopy(obj: RegExp): string;
function deepCopy(obj: undefined): null;
function deepCopy(obj: unknown): {} | serializable | Serializable | Array<Serializable | serializable> {
    if (obj === null) return null;
    switch (typeof obj) {
        case 'undefined': {
            return null;
        }
        case 'boolean':
        case 'string': {
            return obj;
        }
        case 'number': {
            if (Number.isFinite(obj)) return obj;
        }
        case 'object': {
            /* Array: calls itself on each element of an array */
            if (isArray(obj)) return obj.map(deepCopy);

            /* Convert complex objects */
            if (obj instanceof Set) return deepCopy(Array.from(obj));
            if (obj instanceof Map) return deepCopy(Object.fromEntries(obj));
            if (obj instanceof Date) return obj.toISOString();
            if (obj instanceof RegExp) return obj.toString();

            /* Create object copy */
            const copy = Object.create(null);
            for (const [k, o] of Object.entries(obj)) {
                copy[k] = deepCopy(o);
            }
            return obj;
        }
    }
    return String(obj);
}
/**
 * Creates a base64 encoded JSON serialized object
 * @param obj the object to be base64 encoded
 * @returns a base64 encoded JSON serialized object
 */
function objToB64(obj: object): Base64 {
    return strToB64(JSON.stringify(obj));
}
/**
 * Creates a base64url encoded JSON serialized object
 * @param obj the object to be base64url encoded
 * @returns a base64url encoded JSON serialized object
 */
function objToB64u(obj: object): Base64url {
    return strToB64u(JSON.stringify(obj));
}
/**
 * Creates an object from a base64 encoded JSON serialized object
 * @param base64 a base64 encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
function b64ToObj(base64: Base64): Serializable {
    return jsonToObj(b64ToStr(base64));
}
/**
 * Creates an object from a base64url encoded JSON serialized object
 * @param base64u a base64url encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
function b64uToObj(base64u: Base64url): Serializable {
    return jsonToObj(b64uToStr(base64u));
}
/**
 * Creates a JSON serialized object from an object
 * @param obj the object to be stringified
 * @returns a JSON serialized object
 * @remarks Just a wrapper for `JSON.stringify`, included for completeness
 */
function objToJson(obj: object): Json {
    return JSON.stringify(obj);
}
/**
 * Creates a map from an obejct
 * @param obj the object to be transformed to a map
 * @returns a map
 */
function objToMap(obj: object): Map<string,any> {
    if (!isObject(obj)) throw new TypeError('Not an object');
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
function jsonToObj(json: Json): Serializable {
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
function mapToObj(map: Map<string,any>): Serializable {
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
function objToU8a(obj: object): ByteArray {
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
function u8aToObj(u8array: Uint8Array): Serializable {
    return jsonToObj(u8aToStr(u8array));
}
