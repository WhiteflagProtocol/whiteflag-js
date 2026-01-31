'use strict';
/**
 * @module test/util/arrays
 * @summary Whiteflag JS utility functions for arrays tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'node:assert';

/* Functions to test */
import {
    arrayEquals,
    arrayPluck,
    arrayPluckSub,
    hexToU8a
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './static/arrays.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Util arrays module', function() {
    testCase('Equality of arrays', function() {
        assertion(' 1. should correctly determine arrays are not equal', function(done) {
            strictEqual(arrayEquals(testVector['1'].arr1, testVector['1'].arr2), false);
            return done();
        });
        assertion(' 2. should correctly determine arrays are not equal', function(done) {
            strictEqual(arrayEquals(testVector['2'].arr1, testVector['2'].arr2), false);
            return done();
        });
        assertion(' 3. should correctly determine arrays are not equal', function(done) {
            strictEqual(arrayEquals(testVector['3'].arr1, testVector['3'].arr2), false);
            return done();
        });
        assertion(' 4. should correctly determine arrays are equal', function(done) {
            strictEqual(arrayEquals(testVector['4'].arr1, testVector['4'].arr2), true);
            return done();
        });
        assertion(' 5. should correctly determine arrays are equal', function(done) {
            strictEqual(arrayEquals(testVector['5'].arr1, testVector['5'].arr2), true);
            return done();
        });
        assertion(' 6. should correctly determine arrays are equal', function(done) {
            const arr1 = hexToU8a(testVector['6'].hex1);
            const arr2 = hexToU8a(testVector['6'].hex2);
            strictEqual(arrayEquals(arr1, arr2), true);
            return done();
        });
        assertion(' 7. should correctly determine arrays are equal', function(done) {
            const arr1 = hexToU8a(testVector['7'].hex1);
            const arr2 = hexToU8a(testVector['7'].hex2);
            strictEqual(arrayEquals(arr1, arr2), true);
            return done();
        });
    });
    testCase('Pluck array of objects', function() {
        assertion(' 8. should return new array with the requested property values', function(done) {
            const newArray = arrayPluck(testVector['8'].array, testVector['8'].property);
            deepStrictEqual(newArray, testVector['8'].newArray);
            return done();
        });
        assertion(' 9. should return new array with the requested subproperty values', function(done) {
            const newArray = arrayPluckSub(testVector['9'].array, testVector['9'].property, testVector['9'].subname);
            deepStrictEqual(newArray, testVector['9'].newArray);
            return done();
        });
    });
});