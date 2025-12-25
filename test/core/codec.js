'use strict';
/**
 * @module test/core/codec
 * @summary Whiteflag JS message field encoding and decoding tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { deepStrictEqual } from 'assert';

/* Functions required for test */
import { BinaryBuffer } from '@whiteflagprotocol/util';

/* Functions to test */
import { encodeField, decodeField } from '@whiteflagprotocol/core';

/* Test data */
import testVector from './codec.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Core codec module', function() {
    testCase('Field encoding', function() {
        assertion(' 1. should correctly encode (hexa)decimal fields', function(done) {
            const BDX = encodeField(testVector['bdx'].string, 'hexadecimal');
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
            const LAT = encodeField(testVector['latitude'].string, 'latitude');
            deepStrictEqual(LAT.toHex(), testVector['latitude'].hex);
            const LONG = encodeField(testVector['longitude'].string, 'longitude');
            deepStrictEqual(LONG.toHex(), testVector['longitude'].hex);
            return done();
        });
        assertion(' 4. should correctly encode binary fields', function(done) {
            const B1 = encodeField(testVector['binary'].string1, 'binary');
            deepStrictEqual(B1.toHex(), testVector['binary'].hex1);
            const B2 = encodeField(testVector['binary'].string2, 'binary');
            deepStrictEqual(B2.toHex(), testVector['binary'].hex2);
            return done();
        });
    });
    testCase('Field decoding', function() {
        assertion(' 1. should correctly decode (hexa)decimal fields', function(done) {
            const BDX = encodeField(testVector['bdx'].string, 'hexadecimal');
            const bdxString = decodeField(BDX, 'hexadecimal');
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
            const LAT = encodeField(testVector['latitude'].string, 'latitude');
            const latString = decodeField(LAT, 'latitude');
            deepStrictEqual(latString, testVector['latitude'].string);
            const LONG = encodeField(testVector['longitude'].string, 'longitude');
            const longString = decodeField(LONG, 'longitude');
            deepStrictEqual(longString, testVector['longitude'].string);
            return done();
        });
        assertion(' 4. should correctly decode binary fields', function(done) {
            const B1 = encodeField(testVector['binary'].string1, 'binary');
            const binString1 = decodeField(B1, 'binary');
            deepStrictEqual(binString1, testVector['binary'].string1);
            const B2 = encodeField(testVector['binary'].string2, 'binary');
            const binString2 = decodeField(B2, 'binary');
            deepStrictEqual(binString2, testVector['binary'].string2);
            return done();
        });
        assertion(' 5. should correctly decode exctracted text fields', function(done) {
            const buf = BinaryBuffer.fromBytes([ 0b00010101, 0b11010001, 0b10000000 ]);
            const str = decodeField(buf.extract(2, 18), 'utf-8');
            deepStrictEqual(str, 'WF');
            return done();
        });
    });
});
