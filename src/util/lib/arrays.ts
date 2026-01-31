'use strict';
/**
 * @module util/arrays
 * @summary Whiteflag JS utility functions for arrays
 */
export {
    isArray,
    arrayEquals,
    arrayPluck,
    arrayPluckSub
};

/* Module imports */
import { isObject, objectHas } from "./objects.ts";

/* MODULE FUNCTIONS */
/**
 * Checks if something is an array
 * @function isArray
 * @param arr something that might be an array
 * @returns true if array, else false
 */
function isArray(arr: any): boolean {
    return Array.isArray(arr);
}
/**
 * Checks if two arrays contain equal values
 * @param arr1 the first array
 * @param arr2 the second array
 * @returns true if values are equal, else false
 */
function arrayEquals(arr1: any, arr2: any): boolean {
    /* Basic checks */
    try {
        const a1 = Array.from(arr1);
        const a2 = Array.from(arr2);
        if (a1.length !== a2.length) return false;

        /* Compare values one by one */
        let equal = true;
        for (let i = 0; i < a1.length && equal; i++) {
            equal = (a1[i] === a2[i]);
        }
        return equal;
    } catch(err) {
        return false;
    }
}
/**
 * Gets single property from an array of objects
 * @function pluck
 * @param arr array of objects
 * @param key object property name
 * @returns an array with the values of the objects' property
 */
function arrayPluck(arr: Array<any>, key: string): Array<any> {
    if (!isArray(arr)) throw new TypeError('Argument 1 is not an array');
    return arr.map(obj => {
        if (objectHas(obj, key)) return obj[key];
    }).filter(element => element !== undefined);
};

/**
 * Gets single subobject property from an array of objects
 * @function plucksub
 * @param arr array of objects
 * @param key object property name
 * @param subkey subobject property name
 * @returns an array with the values of the objects' subproperty
 */
function arrayPluckSub(arr: Array<any>, key: string, subkey: string): Array<any> {
    if (!isArray(arr)) throw new TypeError('Argument 1 is not an array');
    return arr.map(obj => {
        if (objectHas(obj, key)) return obj[key][subkey];
    }).filter(element => element !== undefined);
}
