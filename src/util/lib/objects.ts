'use strict';
/**
 * @module util/objects
 * @summary Whiteflag JS utility functions for objects
 */
export {
    isString,
    isObject,
    objectHas
};

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
