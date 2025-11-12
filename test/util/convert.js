'use strict';
/**
 * @module test/util/convert
 * @summary Whiteflag JS common data conversions tests
 */

/* Node.js core and external modules */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { deepStrictEqual } from 'assert';
import { readFileSync } from 'fs';

/* Functions to test */
import {
    b64uToHex,
    b64uToString,
    b64uToU8a,
    hexToB64u,
    hexToString,
    hexToU8a,
    stringToB64u,
    stringToHex,
    stringToU8a,
    u8aToB64u,
    u8aToHex,
    u8aToString
} from '@whiteflag/util';

/* Constants */
/**
 * @constant {Object} testVector
 * @description Defines the common array functions test data
 */
const testVector = JSON.parse(readFileSync('./test/util/convert.json'));

/* TEST SCRIPT */
testCase('Util encoding module', function() {
    const testVectorU8a = Uint8Array.from(testVector.Uint8Array.array);
    testCase('Character string encoding', function() {
        assertion(' 1. should correctly convert to UInt8Array', function(done) {
            const u8array = stringToU8a(testVector.char.string);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 2. should correctly convert to base4url string', function(done) {
            const b64uString = stringToB64u(testVector.char.string);
            deepStrictEqual(b64uString, testVector.base64url.string);
            return done();
        });
        assertion(' 3. should correctly convert to hexadecimal string', function(done) {
            const hexString = stringToHex(testVector.char.string);
            deepStrictEqual(hexString, testVector.hex.string);
            return done();
        });
    });
    testCase('Base64URL encoding', function() {
        assertion(' 4. should correctly convert to UInt8Array', function(done) {
            const u8array = b64uToU8a(testVector.base64url.string);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 5. should correctly convert to standard string', function(done) {
            const charString = b64uToString(testVector.base64url.string);
            deepStrictEqual(charString, testVector.char.string);
            return done();
        });
        assertion(' 6. should correctly convert to hexadecimal string', function(done) {
            const hexString = b64uToHex(testVector.base64url.string);
            deepStrictEqual(hexString, testVector.hex.string);
            return done();
        });
    });   
    testCase('Hexadecimal encoding', function() {
        assertion(' 7. should correctly transform to UInt8Array', function(done) {
            const u8array = hexToU8a(testVector.hex.string);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 8. should correctly convert to standard string', function(done) {
            const charString = hexToString(testVector.hex.string);
            deepStrictEqual(charString, testVector.char.string);
            return done();
        });
        assertion(' 9. should correctly convert to base4url string', function(done) {
            const b64uString = hexToB64u(testVector.hex.string);
            deepStrictEqual(b64uString, testVector.base64url.string);
            return done();
        });
    });
    testCase('Binary encoding', function() {
        assertion('10. should correctly convert to hexadecimal string', function(done) {
            const hexString = u8aToHex(testVectorU8a);
            deepStrictEqual(hexString, testVector.hex.string);
            return done();
        });
        assertion('11. should correctly convert to standard string', function(done) {
            const charString = u8aToString(testVectorU8a);
            deepStrictEqual(charString, testVector.char.string);
            return done();
        });
        assertion('12. should correctly convert to base4url string', function(done) {
            const b64uString = u8aToB64u(testVectorU8a);
            deepStrictEqual(b64uString, testVector.base64url.string);
            return done();
        });
    });
});
