'use strict';
/**
 * @module test/core/codec
 * @summary Whiteflag JS message field encoding and decoding tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'assert';

/* Functions to test */
import {
    WfCoreMessage
} from '@whiteflag/core';

/* Test data */
import testVector from './message.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Core message module', function() {
    testCase('Message creation', function() {
        assertion(' 1. should create new message obejct', function(done) {
            const MSG = new WfCoreMessage('A');
            strictEqual(MSG.get('Version'), '1');
            strictEqual(MSG.get('MessageCode'), 'A');
            strictEqual(MSG.isValid(), false);
            return done();
        });
        assertion(' 2. should create message from object', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.get('MessageCode'), testVector['1'].wfMessage.MessageHeader.MessageCode);
            strictEqual(MSG.isValid(), true);
            return done();
        });
    });
    testCase('Message serialisation', function() {
        assertion(' 3a. should correctly serialise', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
            return done();
        });
        assertion(' 3b. should correctly serialise', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['2'].wfMessage);
            strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
            return done();
        });
        assertion(' 3c. should correctly serialise', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['3'].wfMessage);
            strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
            return done();
        });
        assertion(' 3d. should correctly serialise', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['4'].wfMessage);
            strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
            return done();
        });
    });
    testCase('Message encoding', function() {
        assertion(' 4a. should correctly encode to binary', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.encode().toHex(), testVector['1'].encodedMessage);
            return done();
        });
        assertion(' 4b. should correctly encode to binary', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['2'].wfMessage);
            strictEqual(MSG.encode().toHex(), testVector['2'].encodedMessage);
            return done();
        });
        assertion(' 4c. should correctly encode to binary', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['3'].wfMessage);
            strictEqual(MSG.encode().toHex(), testVector['3'].encodedMessage);
            return done();
        });
        assertion(' 4d. should correctly encode to binary', function(done) {
            const MSG = WfCoreMessage.fromObject(testVector['4'].wfMessage);
            strictEqual(MSG.encode().toHex(), testVector['4'].encodedMessage);
            return done();
        });
    });
    testCase('Message decoding', function() {
        assertion(' 5a. should correctly decode', function(done) {
            const MSG = WfCoreMessage.fromHex(testVector['1'].encodedMessage);
            strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
            return done();
        });
        assertion(' 5b. should correctly decode', function(done) {
            const MSG = WfCoreMessage.fromHex(testVector['2'].encodedMessage);
            strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
            return done();
        });
        assertion(' 5c. should correctly decode', function(done) {
            const MSG = WfCoreMessage.fromHex(testVector['3'].encodedMessage);
            strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
            return done();
        });
        assertion(' 5d. should correctly decode', function(done) {
            const MSG = WfCoreMessage.fromHex(testVector['4'].encodedMessage);
            strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
            return done();
        });
    });
});
