'use strict';
/**
 * @module test/util/binary
 * @summary Whiteflag JS binary buffer class tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { deepStrictEqual } from 'node:assert';

/* Functions required for test */
import { hexToU8a, u8aToHex } from '@whiteflagprotocol/util';

/* Functions to test */
import {
    BinaryBuffer,
    cropBits,
    shiftRight,
    shiftLeft
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './binary.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Util binary buffer module', function() {
    testCase('Binary manupulation functions', function() {
        assertion(' 1. should correctly crop bits of UInt8Array', function(done) {
            const C1 = cropBits(hexToU8a(testVector['1'].hex), testVector['1'].bitLength);
            deepStrictEqual(u8aToHex(C1), testVector['1'].crop.hex);
            const C2 = cropBits(hexToU8a(testVector['1'].hex), testVector['1'].crop.nBits);
            deepStrictEqual(u8aToHex(C1), u8aToHex(C2));
            return done();
        });
        assertion(' 2. should correctly right shift bits of UInt8Array', function(done) {
            const R = shiftRight(hexToU8a(testVector['1'].hex), testVector['1'].shift.nBits);
            deepStrictEqual(u8aToHex(R), testVector['1'].shift.right.hex);
            const L = shiftLeft(hexToU8a(testVector['1'].hex), -(testVector['1'].shift.nBits));
            deepStrictEqual(L, R);
            return done();
        });
        assertion(' 3. should correctly left shift bits of UInt8Array', function(done) {
            const L = shiftLeft(hexToU8a(testVector['1'].hex), testVector['1'].shift.nBits);
            deepStrictEqual(u8aToHex(L), testVector['1'].shift.left.hex);
            const R = shiftRight(hexToU8a(testVector['1'].hex), -(testVector['1'].shift.nBits));
            deepStrictEqual(R, L);
            return done();
        });
    });
    testCase('Binary buffer class', function() {
        assertion(' 2a. should correctly create binary buffer from UInt8Array', function(done) {
            const buffer = BinaryBuffer.fromU8a(hexToU8a(testVector['1'].hex), testVector['1'].crop.nBits);
            deepStrictEqual(buffer.toHex(), testVector['1'].crop.hex);
            deepStrictEqual(buffer.length, testVector['1'].bitLength);
            return done();
        });
        assertion(' 2b. should correctly create binary buffer from hexadecimal string', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['2'].hex);
            deepStrictEqual(buffer.toHex(), testVector['2'].hex);
            deepStrictEqual(buffer.length, testVector['2'].bitLength);
            return done();
        });
        assertion(' 3a. should correctly append, insert and shift data', function(done) {
            /* Append data */
            const A = BinaryBuffer.fromHex(testVector['3'].hex1, testVector['3'].bitLength1);
            deepStrictEqual(A.length, testVector['3'].bitLength1);
            A.appendHex(testVector['3'].hex2, testVector['3'].bitLength2);
            deepStrictEqual(A.toHex(), testVector['3'].append.hex);
            deepStrictEqual(A.length, testVector['3'].append.bitLength);

            /* Insert data */
            const I = BinaryBuffer.fromHex(testVector['3'].hex1, testVector['3'].bitLength1);
            I.insertHex(testVector['3'].hex2, testVector['3'].bitLength2);
            deepStrictEqual(I.toHex(), testVector['3'].insert.hex);
            deepStrictEqual(I.length, testVector['3'].insert.bitLength);

            /* Shift */
            deepStrictEqual(I.shiftRight(testVector['3'].shift.nBits).toHex(), testVector['3'].shift.right.hex);
            deepStrictEqual(I.shiftRight(-testVector['3'].shift.nBits).toHex(), testVector['3'].insert.hex);
            deepStrictEqual(I.shiftLeft(testVector['3'].shift.nBits).toHex(), testVector['3'].shift.left.hex);

            return done();
        });
        assertion(' 3b. should correctly append and insert data (test vector 4)', function(done) {
            const A = BinaryBuffer.fromHex(testVector['4'].hex1);
            deepStrictEqual(A.length, testVector['4'].bitLength1);
            A.appendHex(testVector['4'].hex2);
            deepStrictEqual(A.toHex(), testVector['4'].append.hex);
            deepStrictEqual(A.length, testVector['4'].append.bitLength);
            return done();
        });
        assertion(' 3c. should correctly append and insert data (test vector 5)', function(done) {
            const A = BinaryBuffer.fromHex(testVector['5'].hex1, testVector['5'].bitLength1);
            deepStrictEqual(A.length, testVector['5'].bitLength1);
            A.appendHex(testVector['5'].hex2);
            deepStrictEqual(A.toHex(), testVector['5'].append.hex);
            deepStrictEqual(A.length, testVector['5'].append.bitLength);
            return done();
        });
        assertion(' 4a. should correctly extract bits (test vector 3)', function(done) {
            const E = BinaryBuffer.fromU8a(hexToU8a(testVector['3'].hex1), testVector['3'].bitLength1);
            E.appendU8a(hexToU8a(testVector['3'].hex2), testVector['3'].bitLength2);
            const extract = E.extractHex(testVector['3'].extract.startBit, testVector['3'].extract.endBit);
            deepStrictEqual(extract, testVector['3'].extract.hex);
            return done();
        });
        assertion(' 4b. should correctly extract bits (test vector 4)', function(done) {
            const E = BinaryBuffer.fromHex(testVector['4'].hex1);
            E.appendHex(testVector['4'].hex2);
            const extract = E.extractHex(testVector['4'].extract.startBit, testVector['4'].extract.endBit);
            deepStrictEqual(extract, testVector['4'].extract.hex);
            return done();
        });
        assertion(' 4c. should correctly extract bits (test vector 5)', function(done) {
            const E = BinaryBuffer.fromHex(testVector['5'].hex1, testVector['5'].bitLength1);
            E.appendHex(testVector['5'].hex2);
            const extract = E.extractHex(testVector['5'].extract.startBit, testVector['5'].extract.endBit);
            deepStrictEqual(extract, testVector['5'].extract.hex);
            return done();
        });
    });
})
