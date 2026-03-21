'use strict';
/**
 * @module util/encoding
 * @summary Whiteflag JS common encoding and data conversion tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'node:assert';

/* Functions to test */
import {
    isBase58,
    isBase64,
    isBase64u,
    isHex,
    b58ToU8a,
    b64ToB64u,
    b64ToU8a,
    b64uToB64,
    b64uToHex,
    b64uToStr,
    b64uToU8a,
    hexToB64u,
    hexToStr,
    hexToU8a,
    strToB64u,
    strToHex,
    strToU8a,
    u8aToB58,
    u8aToB64,
    u8aToB64u,
    u8aToHex,
    u8aToStr
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './data/tv-110-encoding.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 110: Util encoding module', function() {
    const testVectorU8a = Uint8Array.from(testVector['0'].Uint8Array);
    testCase('Character string encoding', function() {
        assertion(' 1a. should correctly convert to byte array', function(done) {
            const u8array = strToU8a(testVector['0'].string);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 1b. should correctly convert to base64url string', function(done) {
            const b64uString = strToB64u(testVector['0'].string);
            strictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
        assertion(' 1c. should correctly convert to hexadecimal string', function(done) {
            const hexString = strToHex(testVector['0'].string);
            strictEqual(hexString, testVector['0'].hex);
            return done();
        });
    });
    testCase('Base58 encoding', function() {
        assertion(' 2a. should correctly identify non-base58 string', function(done) {
            strictEqual(isBase58(testVector['0'].string), false);
            return done();
        });
        assertion(' 2b. should correctly identify base58 string', function(done) {
            strictEqual(isBase58(testVector['0'].base58), true);
            return done();
        });
        assertion(' 2c. should correctly convert to byte array', function(done) {
            const u8array = b58ToU8a(testVector['0'].base58);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
    });
    testCase('Base64 encoding', function() {
        assertion(' 3a. should correctly identify non-base64 string', function(done) {
            strictEqual(isBase64(testVector['0'].string), false);
            return done();
        });
        assertion(' 3b. should correctly identify base64 string', function(done) {
            strictEqual(isBase64(testVector['0'].base64), true);
            return done();
        });
        assertion(' 3c. should correctly convert to base64url string', function(done) {
            const b64uString = b64ToB64u(testVector['0'].base64);
            strictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
        assertion(' 3d. should correctly convert to byte array', function(done) {
            const u8array = b64ToU8a(testVector['0'].base64);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
    });
    testCase('Base64URL encoding', function() {
        assertion(' 4a. should correctly identify non-base64url string', function(done) {
            strictEqual(isBase64u(testVector['0'].base64), false);
            return done();
        });
        assertion(' 4b. should correctly identify base64url string', function(done) {
            strictEqual(isBase64u(testVector['0'].base64url), true);
            return done();
        });
        assertion(' 4c. should correctly convert to byte array', function(done) {
            const u8array = b64uToU8a(testVector['0'].base64url);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 4d. should correctly convert to character string', function(done) {
            const charString = b64uToStr(testVector['0'].base64url);
            strictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 4e. should correctly convert to hexadecimal string', function(done) {
            const hexString = b64uToHex(testVector['0'].base64url);
            strictEqual(hexString, testVector['0'].hex);
            return done();
        });
        assertion(' 4f. should correctly convert to base64 string', function(done) {
            const b64String = b64uToB64(testVector['0'].base64url);
            strictEqual(b64String, testVector['0'].base64);
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
        assertion(' 5c. should correctly convert to byte array', function(done) {
            const u8array = hexToU8a(testVector['0'].hexp);
            deepStrictEqual(u8array, testVectorU8a);
            return done();
        });
        assertion(' 5d. should correctly convert to character string', function(done) {
            const charString = hexToStr(testVector['0'].hex);
            strictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 5e. should correctly convert to base64url string', function(done) {
            const b64uString = hexToB64u(testVector['0'].hex);
            strictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
    });
    testCase('Binary encoding', function() {
        assertion(' 6a. should correctly convert to hexadecimal string', function(done) {
            const hexString = u8aToHex(testVectorU8a);
            strictEqual(hexString, testVector['0'].hex);
            return done();
        });
        assertion(' 6b. should correctly convert to character string', function(done) {
            const charString = u8aToStr(testVectorU8a);
            strictEqual(charString, testVector['0'].string);
            return done();
        });
        assertion(' 6c. should correctly convert to base58 string', function(done) {
            const b58String = u8aToB58(testVectorU8a);
            strictEqual(b58String, testVector['0'].base58);
            return done();
        });
        assertion(' 6d. should correctly convert to base64 string', function(done) {
            const b64String = u8aToB64(testVectorU8a);
            strictEqual(b64String, testVector['0'].base64);
            return done();
        });
        assertion(' 6e. should correctly convert to base64url string', function(done) {
            const b64uString = u8aToB64u(testVectorU8a);
            strictEqual(b64uString, testVector['0'].base64url);
            return done();
        });
    });
});
