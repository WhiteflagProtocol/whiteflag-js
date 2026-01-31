/**
 * @module util/arrays
 * @summary Whiteflag JS utility functions for arrays
 */
export { isArray, arrayEquals, arrayPluck, arrayPluckSub };
/**
 * Checks if something is an array
 * @function isArray
 * @param arr something that might be an array
 * @returns true if array, else false
 */
declare function isArray(arr: any): boolean;
/**
 * Checks if two arrays contain equal values
 * @param arr1 the first array
 * @param arr2 the second array
 * @returns true if values are equal, else false
 */
declare function arrayEquals(arr1: any, arr2: any): boolean;
/**
 * Gets single property from an array of objects
 * @function pluck
 * @param arr array of objects
 * @param key object property name
 * @returns an array with the values of the objects' property
 */
declare function arrayPluck(arr: Array<any>, key: string): Array<any>;
/**
 * Gets single subobject property from an array of objects
 * @function plucksub
 * @param arr array of objects
 * @param key object property name
 * @param subkey subobject property name
 * @returns an array with the values of the objects' subproperty
 */
declare function arrayPluckSub(arr: Array<any>, key: string, subkey: string): Array<any>;
