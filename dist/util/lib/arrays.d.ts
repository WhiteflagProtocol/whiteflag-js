/**
 * @module util/arrays
 * @summary Whiteflag JS arrays utility module
 */
export { arrayEquals, arrayFind, arrayIncludes, arrayPluck, arrayPluckSub };
/**
 * Checks if two arrays or iterables contain equal values
 * @param arr1 the first array like
 * @param arr2 the second array
 * @returns `true` if arrays and values are equal, else `false`
 */
declare function arrayEquals(arr1: any, arr2: any): boolean;
/**
 * Gets the first object matching a key-value pair from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param value the value to match
 * @returns the requested object
 * @throws if first argument is not an array
 */
declare function arrayFind(arr: object[], key: string, value: any): any;
/**
 * Checks if an object matching a key-value pair exists in an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param value the value to match
 * @returns `true` if object exists, else `false`
 * @throws if first argument is not an array
 */
declare function arrayIncludes(arr: object[], key: string, value: any): boolean;
/**
 * Gets the values of single property from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @returns an array with the values of the objects' property
 * @throws if first argument is not an array
 */
declare function arrayPluck(arr: object[], key: string): any[];
/**
 * Gets the values of single subobject property from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param subkey subobject property name
 * @returns an array with the values of the objects' subproperty
 * @throws if first argument is not an array
 */
declare function arrayPluckSub(arr: object[], key: string, subkey: string): any[];
