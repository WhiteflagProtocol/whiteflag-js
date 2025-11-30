'use strict';
/**
 * @module test/util/binary
 * @summary Whiteflag JS binary buffer class tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { deepStrictEqual } from 'assert';

/* Functions required for test */
import {
    hexToU8a,
    u8aToHex
} from '@whiteflag/util';

/* Functions to test */
import {
    BinaryBuffer,
    cropBits,
    shiftRight,
    shiftLeft
} from '@whiteflag/util';

/* Test data */
import testVector from './binary.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Util binary buffer module', function() {
    testCase('Binary manupulation functions', function() {
        assertion(' 1. should correctly crop bits of UInt8Array', function(done) {
            const cropped1 = cropBits(hexToU8a(testVector['1'].hex), testVector['1'].bitLength);
            deepStrictEqual(u8aToHex(cropped1), testVector['1'].cropped);
            const cropped2 = cropBits(hexToU8a(testVector['1'].hex), testVector['1'].cropped);
            deepStrictEqual(u8aToHex(cropped2), u8aToHex(cropped2));
            return done();
        });
        assertion(' 2. should correctly right shift bits of UInt8Array', function(done) {
            const rightShift = shiftRight(hexToU8a(testVector['1'].hex), testVector['1'].shift);
            deepStrictEqual(u8aToHex(rightShift), testVector['1'].rightShift);
            const leftShift = shiftLeft(hexToU8a(testVector['1'].hex), -(testVector['1'].shift));
            deepStrictEqual(leftShift, rightShift);
            return done();
        });
        assertion(' 3. should correctly left shift bits of UInt8Array', function(done) {
            const leftShift = shiftLeft(hexToU8a(testVector['1'].hex), testVector['1'].shift);
            deepStrictEqual(u8aToHex(leftShift), testVector['1'].leftShift);
            const rightShift = shiftRight(hexToU8a(testVector['1'].hex), -(testVector['1'].shift));
            deepStrictEqual(rightShift, leftShift);
            return done();
        });
    });
    testCase('Binary buffer class', function() {
        assertion(' 2A. should correctly create binary buffer from UInt8Array', function(done) {
            const buffer = BinaryBuffer.fromU8a(hexToU8a(testVector['1'].hex), testVector['1'].cropping);
            deepStrictEqual(buffer.toHex(), testVector['1'].cropped);
            deepStrictEqual(buffer.length, testVector['1'].bitLength);
            return done();
        });
        assertion(' 2B. should correctly create binary buffer from hexadecimal string', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['2'].hex);
            deepStrictEqual(buffer.toHex(), testVector['2'].hex);
            deepStrictEqual(buffer.length, testVector['2'].bitLength);
            return done();
        });
        assertion(' 3A. should correctly append binary buffer', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['3'].hex1, testVector['3'].bitLength1);
            deepStrictEqual(buffer.length, testVector['3'].bitLength1);
            buffer.appendHex(testVector['3'].hex2, testVector['3'].bitLength2);
            deepStrictEqual(buffer.toHex(), testVector['3'].hex);
            deepStrictEqual(buffer.length, testVector['3'].bitLength);
            return done();
        });
        assertion(' 3B. should correctly append binary buffer', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['4'].hex1);
            deepStrictEqual(buffer.length, testVector['4'].bitLength1);
            buffer.appendHex(testVector['4'].hex2);
            deepStrictEqual(buffer.toHex(), testVector['4'].hex);
            deepStrictEqual(buffer.length, testVector['4'].bitLength);
            return done();
        });
        assertion(' 3C. should correctly append binary buffer', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['5'].hex1, testVector['5'].bitLength1);
            deepStrictEqual(buffer.length, testVector['5'].bitLength1);
            buffer.appendHex(testVector['5'].hex2);
            deepStrictEqual(buffer.toHex(), testVector['5'].hex);
            deepStrictEqual(buffer.length, testVector['5'].bitLength);
            return done();
        });
        assertion(' 4A. should correctly extract bits from binary buffer', function(done) {
            const buffer = BinaryBuffer.fromU8a(hexToU8a(testVector['3'].hex1), testVector['3'].bitLength1);
            buffer.appendU8a(hexToU8a(testVector['3'].hex2), testVector['3'].bitLength2);
            const extract = buffer.extract(testVector['3'].startBit, testVector['3'].nBits);
            deepStrictEqual(u8aToHex(extract), testVector['3'].extract);
            return done();
        });
        assertion(' 4B. should correctly extract bits from binary buffer', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['4'].hex1);
            buffer.appendHex(testVector['4'].hex2);
            const extract = buffer.extract(testVector['4'].startBit, testVector['4'].nBits);
            deepStrictEqual(u8aToHex(extract), testVector['4'].extract);
            return done();
        });
        assertion(' 4C. should correctly extract bits from binary buffer', function(done) {
            const buffer = BinaryBuffer.fromHex(testVector['5'].hex1, testVector['5'].bitLength1);
            buffer.appendHex(testVector['5'].hex2);
            const extract = buffer.extract(testVector['5'].startBit, testVector['5'].nBits);
            deepStrictEqual(u8aToHex(extract), testVector['5'].extract);
            return done();
        });
    });
})
