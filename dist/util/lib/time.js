'use strict';
export { getIso8601, getPosixEpoch, getEcmaEpoch };
import { isNumber } from "./types.js";
const MILLISECONDS = 1000;
const POSIXEPOCH_DIGITS = 11;
function getIso8601(value = Date.now()) {
    return new Date(checkTimeValue(value)).toISOString();
}
function getPosixEpoch(value = Date.now()) {
    return getEcmaEpoch(checkTimeValue(value)) / MILLISECONDS;
}
function getEcmaEpoch(value = Date.now()) {
    return new Date(checkTimeValue(value)).getTime();
}
function checkTimeValue(value) {
    if (isNumber(value) && value.toString().length <= POSIXEPOCH_DIGITS) {
        return value * MILLISECONDS;
    }
    return value;
}
