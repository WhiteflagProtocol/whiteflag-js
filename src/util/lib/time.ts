'use strict';
/**
 * @module util/time
 * @summary Whiteflag JS utility time functions module
 */
export {
    getIso8601,
    getPosixEpoch,
    getEcmaEpoch
}

/* Module imports */
import { isNumber, Iso8601, ecmatime, posixtime } from './types.ts';

/* Constants */
const MILLISECONDS = 1000;
const POSIXEPOCH_DIGITS = 11;

/* MODULE DECLARATIONS */
/** Time representation */
export type Time = ecmatime | posixtime | Iso8601 | Date;

/* MOUDLE FUNCTIONS */
/**
 * Gives the time in Iso8601 format
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the time as a Iso8601 string
 */
function getIso8601(value: Time = Date.now()): Iso8601 {
    return new Date(checkTimeValue(value)).toISOString();
}
/**
 * Gives the POSIX epoch time in seconds
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the POSIX epoch time in seconds
 */
function getPosixEpoch(value: Time = Date.now()): posixtime {
    return getEcmaEpoch(checkTimeValue(value)) / MILLISECONDS;
}
/**
 * Gives the ECMA epoch time in milliseconds
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the ECMA epoch time in milliseconds
 */
function getEcmaEpoch(value: Time = Date.now()): ecmatime {
    return new Date(checkTimeValue(value)).getTime();
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Determines the input time value and converts if necessary
 * @private
 * @param value the input time value
 * @returns the validated or corrected time value
 * @remarks checks if epoch time is in seconds or milliseconds
 */
function checkTimeValue(value: Time): ecmatime | Iso8601 | Date {
    /* Check if epoch time is in seconds or milliseconds */
    if (isNumber(value) && value.toString().length <= POSIXEPOCH_DIGITS) {
        return value as number * MILLISECONDS;
    }
    return value;
}
