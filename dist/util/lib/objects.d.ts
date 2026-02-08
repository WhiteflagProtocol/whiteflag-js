/**
 * @module util/objects
 * @summary Whiteflag JS objects utility module
 */
export { isString, isObject, objectHas, objToB64u, b64uToObj };
import { Base64url } from './encoding.ts';
/**
 * Checks if something is a string
 * @function isString
 * @param str something that might be a string
 * @returns true if string, else false
 */
declare function isString(str: any): boolean;
/**
 * Checks if something is an object
 * @function isObject
 * @param obj something that might be an object
 * @returns true if object, else false
 */
declare function isObject(obj: any): boolean;
/**
 * Checks if object has a property identified by key
 * @param obj the object to check
 * @param key the name of the property
 * @returns true if property exists, else false
 */
declare function objectHas(obj: any, key: string): boolean;
/**
 * Creates a base64URL encoded JSON string from an object
 * @function objToB64u
 * @param obj the object to be encoded
 * @returns a base64URL encoded JSON string
 */
declare function objToB64u(obj: Object): Base64url;
/**
 * Creates an object from a base64URL encoded JSON string
 * @function b64uToObj
 * @param base64u a base64URL encoded JSON string
 * @returns an object with the data from the JSON object
 */
declare function b64uToObj(base64u: Base64url): Object;
