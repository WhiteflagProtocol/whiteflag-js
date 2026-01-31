/**
 * @module util/objects
 * @summary Whiteflag JS utility functions for objects
 */
export { isString, isObject, objectHas };
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
