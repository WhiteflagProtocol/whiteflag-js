'use strict';
export { arrayEquals, arrayFind, arrayIncludes, arrayPluck, arrayPluckSub };
import { isArray } from "./types.js";
function arrayEquals(arr1, arr2) {
    try {
        const a1 = Array.from(arr1);
        const a2 = Array.from(arr2);
        if (a1.length !== a2.length)
            return false;
        let equal = true;
        for (let i = 0; i < a1.length && equal; i++) {
            equal = (a1[i] === a2[i]);
        }
        return equal;
    }
    catch (err) {
        return false;
    }
}
function arrayFind(arr, key, value) {
    if (!isArray(arr))
        throw new TypeError('Not an array');
    return arr.find(obj => {
        return (!!obj &&
            Object.hasOwn(obj, key) &&
            obj[key] === value);
    });
}
function arrayIncludes(arr, key, value) {
    if (!isArray(arr))
        throw new TypeError('Not an array');
    return arr.some(obj => {
        return (!!obj &&
            Object.hasOwn(obj, key) &&
            obj[key] === value);
    });
}
function arrayPluck(arr, key) {
    if (!isArray(arr))
        throw new TypeError('Not an array');
    return arr.map(obj => {
        if (!!obj && Object.hasOwn(obj, key)) {
            return obj[key];
        }
    }).filter(element => element !== undefined);
}
function arrayPluckSub(arr, key, subkey) {
    if (!isArray(arr))
        throw new TypeError('Not an array');
    return arr.map(obj => {
        if (!!obj && Object.hasOwn(obj, key)) {
            return obj[key][subkey];
        }
    }).filter(element => element !== undefined);
}
