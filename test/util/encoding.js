'use strict';
/**
 * @module test/util/encoding
 * @summary Whiteflag JS common encoding and data conversion tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'assert';

/* Functions to test */
import {
    isBase64,
    isBase64u,
    isHex,
    objToB64u,
    b64uToObj,
    b64ToB64u,
    b64uToB64,
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
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './encoding.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Util encoding module', function() {
    const testVectorU8a = Uint8Array.from(testVector['0'].Uint8Array);
    testCase('Character string encoding', function() {
        assertion(' 1a. should correctly convert to UInt8Array', function(done) {
            const u8array = stringToU8a(testVector['0'].string);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 1b. should correctly convert to base4url string', function(done) {
            const b64uString = stringToB64u(testVector['0'].string);
            deepStrictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
        assertion(' 1c. should correctly convert to hexadecimal string', function(done) {
            const hexString = stringToHex(testVector['0'].string);
            deepStrictEqual(hexString, testVector['0'].hex);
            return done();
        });
    });
    testCase('Base64 encoding', function() {
        assertion(' 2a. should correctly identify non-base64 string', function(done) {
            strictEqual(isBase64(testVector['0'].string), false);
            return done();
        });
        assertion(' 2b. should correctly identify base64 string', function(done) {
            strictEqual(isBase64(testVector['0'].base64), true);
            return done();
        });
        assertion(' 2c. should correctly convert to base64url string', function(done) {
            const b64uString = b64ToB64u(testVector['0'].base64);
            deepStrictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
    });
    testCase('Base64URL encoding', function() {
        assertion(' 3a. should correctly identify non-base64url string', function(done) {
            strictEqual(isBase64u(testVector['0'].base64), false);
            return done();
        });
        assertion(' 3b. should correctly identify base64url string', function(done) {
            strictEqual(isBase64u(testVector['0'].base64url), true);
            return done();
        });
        assertion(' 4a. should correctly convert to UInt8Array', function(done) {
            const u8array = b64uToU8a(testVector['0'].base64url);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 4b. should correctly convert to standard string', function(done) {
            const charString = b64uToString(testVector['0'].base64url);
            deepStrictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 4c. should correctly convert to hexadecimal string', function(done) {
            const hexString = b64uToHex(testVector['0'].base64url);
            deepStrictEqual(hexString, testVector['0'].hex);
            return done();
        });
        assertion(' 4c. should correctly convert to base64 string', function(done) {
            const b64String = b64uToB64(testVector['0'].base64url);
            deepStrictEqual(b64String, testVector['0'].base64);
            return done();
        });
    });   
    testCase('Hexadecimal encoding', function() {
        assertion(' 5a. should correctly identify non-hexadecimal string', function(done) {
            strictEqual(isHex(testVector['0'].string), false);
            strictEqual(isHex(testVector['0'].base64), false);
            return done();
        });
        assertion(' 5b. should correctly identify hexadecimal string', function(done) {
            strictEqual(isHex(testVector['0'].hex), true);
            strictEqual(isHex(testVector['0'].hexp), true);
            return done();
        });
        assertion(' 5b. should correctly transform to UInt8Array', function(done) {
            const u8array = hexToU8a(testVector['0'].hexp);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 5c. should correctly convert to standard string', function(done) {
            const charString = hexToString(testVector['0'].hex);
            deepStrictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 5c. should correctly convert to base4url string', function(done) {
            const b64uString = hexToB64u(testVector['0'].hex);
            deepStrictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
    });
    testCase('Binary encoding', function() {
        assertion(' 6a. should correctly convert to hexadecimal string', function(done) {
            const hexString = u8aToHex(testVectorU8a);
            deepStrictEqual(hexString, testVector['0'].hex);
            return done();
        });
        assertion(' 6b. should correctly convert to standard string', function(done) {
            const charString = u8aToString(testVectorU8a);
            deepStrictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 6c. should correctly convert to base4url string', function(done) {
            const b64uString = u8aToB64u(testVectorU8a);
            deepStrictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
    });
    testCase('JSON Base64URL encoding', function() {
        assertion(' 7. should correctly convert random object to base64URL and back', function(done) {
            const obj = { prop1: 'string', prop2: { key: 'value'}, prop3: [ "one", "two"] };
            const str = objToB64u(obj);
            strictEqual(isBase64u(str), true);
            deepStrictEqual(obj, b64uToObj(str));
            return done();
        });
        assertion(' 8. should correctly convert RFC 7515 Annex A.1.2 header example to base64URL', function(done) {
            const obj = testVector['0'].object.plain.protected;
            const encoded = testVector['0'].object.base64url;
            deepStrictEqual(objToB64u(obj), encoded);
            return done();
        });
    });  
});
