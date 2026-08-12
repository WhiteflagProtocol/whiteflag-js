'use strict';
/**
 * @module util/arrays
 * @summary Whiteflag JS arrays utility module
 */
export {
    arrayEquals,
    arrayFind,
    arrayIncludes,
    arrayPluck,
    arrayPluckSub
};

/* Package modules */
import { isArray } from './types.ts';

/* MODULE FUNCTIONS */
/**
 * Checks if two arrays or iterables contain equal values
 * @param arr1 the first array like
 * @param arr2 the second array
 * @returns `true` if arrays and values are equal, else `false`
 */
function arrayEquals(arr1: any, arr2: any): boolean {
    try {
        /* Basic checks */
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
 * Gets the first object matching a key-value pair from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param value the value to match
 * @returns the requested object
 * @throws if first argument is not an array
 */
function arrayFind(arr: object[], key: string, value: any): any {
    if (!isArray(arr)) throw new TypeError('Not an array');
    return arr.find(obj => {
        return (
            !!obj &&
            Object.hasOwn(obj, key) &&
            obj[key as keyof typeof obj] === value
        );
    });
}
/**
 * Checks if an object matching a key-value pair exists in an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param value the value to match
 * @returns `true` if object exists, else `false`
 * @throws if first argument is not an array
 */
function arrayIncludes(arr: object[], key: string, value: any): boolean {
    if (!isArray(arr)) throw new TypeError('Not an array');
    return arr.some(obj => {
        return (
            !!obj &&
            Object.hasOwn(obj, key) &&
            obj[key as keyof typeof obj] === value
        );
    });
}
/**
 * Gets the values of single property from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @returns an array with the values of the objects' property
 * @throws if first argument is not an array
 */
function arrayPluck(arr: object[], key: string): any[] {
    if (!isArray(arr)) throw new TypeError('Not an array');
    return arr.map(obj => {
        if (!!obj && Object.hasOwn(obj, key)) {
            return obj[key as keyof typeof obj];
        }
    }).filter(element => element !== undefined);
}
/**
 * Gets the values of single subobject property from an array of objects
 * @param arr array of objects
 * @param key object property name
 * @param subkey subobject property name
 * @returns an array with the values of the objects' subproperty
 * @throws if first argument is not an array
 */
function arrayPluckSub(arr: object[], key: string, subkey: string): any[] {
    if (!isArray(arr)) throw new TypeError('Not an array');
    return arr.map(obj => {
        if (!!obj && Object.hasOwn(obj, key)) {
            return obj[key as keyof typeof obj][subkey];
        }
    }).filter(element => element !== undefined);
}
