'use strict';
/**
 * @module util/objects
 * @summary Whiteflag JS objects utility module
 */
export {
    isString,
    isObject,
    objectHas,
    objToB64u,
    b64uToObj
};

/* Module imports */
import { Base64url, stringToB64u, b64uToString } from './encoding.ts';

/* MODULE FUNCTIONS */
/**
 * Checks if something is a string
 * @function isString
 * @param str something that might be a string
 * @returns true if string, else false
 */
function isString(str: any): boolean {
    return (typeof str === 'string' || str instanceof String); 
}
/**
 * Checks if something is an object
 * @function isObject
 * @param obj something that might be an object
 * @returns true if object, else false
 */
function isObject(obj: any): boolean {
    return (typeof obj === 'object' || obj instanceof Object);
}
/**
 * Checks if object has a property identified by key
 * @param obj the object to check
 * @param key the name of the property
 * @returns true if property exists, else false
 */
function objectHas(obj: any, key: string): boolean {
    return (isObject(obj) && Object.hasOwn(obj, key));
}
/**
 * Creates a base64URL encoded JSON string from an object
 * @function objToB64u
 * @param obj the object to be encoded
 * @returns a base64URL encoded JSON string
 */
function objToB64u(obj: Object): Base64url {
    return stringToB64u(JSON.stringify(obj));
}
/**
 * Creates an object from a base64URL encoded JSON string
 * @function b64uToObj
 * @param base64u a base64URL encoded JSON string
 * @returns an object with the data from the JSON object
 */
function b64uToObj(base64u: Base64url): Object {
    return JSON.parse(b64uToString(base64u));
}
