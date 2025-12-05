'use strict';
/**
 * @module test/core/codec
 * @summary Whiteflag JS message field encoding and decoding tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { deepStrictEqual } from 'assert';

/* Functions to test */
import {
    encodeField,
    decodeField
} from '@whiteflag/core';

/* Test data */
import testVector from './codec.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Core codec module', function() {
    testCase('Field encoding', function() {
        assertion(' 1. should correctly encode (hexa)decimal fields', function(done) {
            const BDX = encodeField(testVector['bdx'].string, 'hex');
            deepStrictEqual(BDX.toU8a(), new Uint8Array(testVector['bdx'].buffer));
            return done();
        });
        assertion(' 2. should correctly encode text fields', function(done) {
            const UTF = encodeField(testVector['utf-8'].string, 'utf-8');
            deepStrictEqual(UTF.toU8a(), new Uint8Array(testVector['utf-8'].buffer));
            return done();
        });
        assertion(' 3. should correctly encode datum fields', function(done) {
            const DATETIME = encodeField(testVector['datetime'].string, 'datetime');
            deepStrictEqual(DATETIME.toHex(), testVector['datetime'].hex);
            const PERIOD = encodeField(testVector['duration'].string, 'duration');
            deepStrictEqual(PERIOD.toHex(), testVector['duration'].hex);
            const LAT = encodeField(testVector['lat'].string, 'lat');
            deepStrictEqual(LAT.toHex(), testVector['lat'].hex);
            const LONG = encodeField(testVector['long'].string, 'long');
            deepStrictEqual(LONG.toHex(), testVector['long'].hex);
            return done();
        });
        assertion(' 4. should correctly encode binary fields', function(done) {
            const B1 = encodeField(testVector['bin'].string1, 'bin');
            deepStrictEqual(B1.toHex(), testVector['bin'].hex1);
            const B2 = encodeField(testVector['bin'].string2, 'bin');
            deepStrictEqual(B2.toHex(), testVector['bin'].hex2);
            return done();
        });
    });
    testCase('Field decoding', function() {
        assertion(' 1. should correctly decode (hexa)decimal fields', function(done) {
            const BDX = encodeField(testVector['bdx'].string, 'hex');
            const bdxString = decodeField(BDX, 'hex');
            deepStrictEqual(bdxString, testVector['bdx'].string);
            return done();
        });
        assertion(' 2. should correctly decode text fields', function(done) {
            const UTF = encodeField(testVector['utf-8'].string, 'utf-8');
            const utfString = decodeField(UTF, 'utf-8');
            deepStrictEqual(utfString, testVector['utf-8'].string);
            return done();
        });
        assertion(' 3. should correctly decode datum fields', function(done) {
            const DATETIME = encodeField(testVector['datetime'].string, 'datetime');
            const dtString = decodeField(DATETIME, 'datetime');
            deepStrictEqual(dtString, testVector['datetime'].string);
            const PERIOD = encodeField(testVector['duration'].string, 'duration');
            const pString = decodeField(PERIOD, 'duration');
            deepStrictEqual(pString, testVector['duration'].string);
            const LAT = encodeField(testVector['lat'].string, 'lat');
            const latString = decodeField(LAT, 'lat');
            deepStrictEqual(latString, testVector['lat'].string);
            const LONG = encodeField(testVector['long'].string, 'long');
            const longString = decodeField(LONG, 'long');
            deepStrictEqual(longString, testVector['long'].string);
            return done();
        });
        assertion(' 4. should correctly decode binary fields', function(done) {
            const B1 = encodeField(testVector['bin'].string1, 'bin');
            const binString1 = decodeField(B1, 'bin');
            deepStrictEqual(binString1, testVector['bin'].string1);
            const B2 = encodeField(testVector['bin'].string2, 'bin');
            const binString2 = decodeField(B2, 'bin');
            deepStrictEqual(binString2, testVector['bin'].string2);
            return done();
        });
    });
});
