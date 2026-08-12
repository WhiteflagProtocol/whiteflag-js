/**
 * @module util/time
 * @summary Whiteflag JS utility time functions module
 */
export { Time, getIso8601, getPosixEpoch, getEcmaEpoch };
import { Iso8601, ecmatime, posixtime } from './types.ts';
/** Time representation */
type Time = ecmatime | posixtime | Iso8601 | Date;
/**
 * Gives the time in Iso8601 format
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the time as a Iso8601 string
 */
declare function getIso8601(value?: Time): Iso8601;
/**
 * Gives the POSIX epoch time in seconds
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the POSIX epoch time in seconds
 */
declare function getPosixEpoch(value?: Time): posixtime;
/**
 * Gives the ECMA epoch time in milliseconds
 * @param value the time value to convert (epoch, Iso8601, or Date), else current time is used
 * @returns the ECMA epoch time in milliseconds
 */
declare function getEcmaEpoch(value?: Time): ecmatime;
