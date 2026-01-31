'use strict';
export { isArray, arrayEquals, arrayPluck, arrayPluckSub };
import { objectHas } from "./objects.js";
function isArray(arr) {
    return Array.isArray(arr);
}
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
function arrayPluck(arr, key) {
    if (!isArray(arr))
        throw new TypeError('Argument 1 is not an array');
    return arr.map(obj => {
        if (objectHas(obj, key))
            return obj[key];
    }).filter(element => element !== undefined);
}
;
function arrayPluckSub(arr, key, subkey) {
    if (!isArray(arr))
        throw new TypeError('Argument 1 is not an array');
    return arr.map(obj => {
        if (objectHas(obj, key))
            return obj[key][subkey];
    }).filter(element => element !== undefined);
}
