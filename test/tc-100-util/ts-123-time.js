'use strict';
/**
 * @module util/time
 * @summary Whiteflag JS util time functions tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Functions to test */
import {
    getIso8601,
    getEcmaEpoch,
    getPosixEpoch
} from '@whiteflagprotocol/util';

/* Test data */
const POSIX = 1780846627;
const ECMA = 1780846627000;
const ISO='2026-06-07T15:37:07.000Z';

/* TEST SCRIPT */
testCase('Test case 123: Util time module', function() {
    testCase('Time conversions', function() {
        assertion(' 1a. should correctly convert ECMA epoch time to Iso8601', function(done) {
            strictEqual(getIso8601(ECMA), ISO);
            return done();
        });
        assertion(' 1b. should correctly convert POSIX epoch time to Iso8601', function(done) {
            strictEqual(getIso8601(POSIX), ISO);
            return done();
        });
        assertion(' 2a. should correctly convert Iso8601 to ECMA epoch time', function(done) {
            strictEqual(getEcmaEpoch(ISO), ECMA);
            return done();
        });
        assertion(' 2b. should correctly convert to POSIX epoch time to ECMA epoch time', function(done) {
            strictEqual(getEcmaEpoch(POSIX), ECMA);
            return done();
        });
        assertion(' 3a. should correctly convert Iso8601 to POSIX epoch time', function(done) {
            strictEqual(getPosixEpoch(ISO), POSIX);
            return done();
        });
        assertion(' 3b. should correctly convert ECMA epoch time to POSIX epoch time', function(done) {
            strictEqual(getPosixEpoch(ECMA), POSIX);
            return done();
        });
    });
});
