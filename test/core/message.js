'use strict';
/**
 * @module test/core/codec
 * @summary Whiteflag JS message field encoding and decoding tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { BinaryBuffer, hexToU8a } from '@whiteflagprotocol/util';
import { Account } from  './account.js';

/* Functions to test */
import { WfCoreMessage, encryptMessage, decryptMessage } from '@whiteflagprotocol/core';

/* Test data */
import testVector from './static/message.json' with { type: 'json' };

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
        assertion(' 2. should create message from object', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.get('MessageCode'), testVector['1'].wfMessage.MessageHeader.MessageCode);
            return strictEqual(MSG.isValid(), true);
        });
    });
    testCase('Message serialisation', function() {
        assertion(' 3a. should correctly serialise (test vector 1)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['1'].wfMessage);
            return strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
        });
        assertion(' 3b. should correctly serialise (test vector 2)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['2'].wfMessage);
            return strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
        });
        assertion(' 3c. should correctly serialise (test vector 3)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['3'].wfMessage);
            return strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
        });
        assertion(' 3d. should correctly serialise (test vector 4)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['4'].wfMessage);
            return strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
        });
    });
    testCase('Message encoding', function() {
        assertion(' 4a. should correctly encode to binary (test vector 1)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['1'].wfMessage);
            await MSG.encode();
            return strictEqual(MSG.toHex(), testVector['1'].encodedMessage);
        });
        assertion(' 4b. should correctly encode to binary (test vector 2)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['2'].wfMessage);
            await MSG.encode();
            return strictEqual(MSG.toHex(), testVector['2'].encodedMessage);
        });
        assertion(' 4c. should correctly encode to binary (test vector 3)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['3'].wfMessage);
            await MSG.encode();
            return strictEqual(MSG.toHex(), testVector['3'].encodedMessage);
        });
        assertion(' 4d. should correctly encode to binary (test vector 4)', async function() {
            const MSG = await WfCoreMessage.fromObject(testVector['4'].wfMessage);
            await MSG.encode();
            return strictEqual(MSG.toHex(), testVector['4'].encodedMessage);
        });
    });
    testCase('Message decoding', function() {
        assertion(' 5a. should correctly decode (test vector 1)', async function() {
            const MSG = await WfCoreMessage.fromHex(testVector['1'].encodedMessage);
            return strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
        });
        assertion(' 5b. should correctly decode (test vector 2)', async function() {
            const MSG = await WfCoreMessage.fromHex(testVector['2'].encodedMessage);
            return strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
        });
        assertion(' 5c. should correctly decode (test vector 3)', async function() {
            const MSG = await WfCoreMessage.fromHex(testVector['3'].encodedMessage);
            return strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
        });
        assertion(' 5d. should correctly decode (test vector 4)', async function() {
            const MSG = await WfCoreMessage.fromHex(testVector['4'].encodedMessage);
            return strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
        });
    });
    testCase('Message encryption', function() {
        assertion(' 5a. should correctly encrypt plain binary message', async function() {
            const MSG_UNENCRYPTED = BinaryBuffer.fromHex(testVector['5'].unencryptedMessage);
            const MSG_ENCRYPTED = await encryptMessage(
                MSG_UNENCRYPTED,
                testVector['5'].encryptionIndicator,
                hexToU8a(testVector['5'].encryptionKeyInput),
                hexToU8a(testVector['5'].originatorAddress),
                hexToU8a(testVector['5'].encryptionInitVector)
            );
            return strictEqual(MSG_ENCRYPTED.toHex(), testVector['5'].encodedMessage);
        });
        assertion(' 5b. should correctly encrypt plain message object', async function() {
            const ACCOUNT = new Account(testVector['5'].originatorAddress);
            const MSG = await WfCoreMessage.fromObject(testVector['5'].wfMessage);
            await MSG.encode(
                ACCOUNT,
                hexToU8a(testVector['5'].encryptionKeyInput),
                hexToU8a(testVector['5'].encryptionInitVector)
            );
            return strictEqual(MSG.toHex(), testVector['5'].encodedMessage);
        });
    });
    testCase('Message decryption', function() {
        assertion(' 6a. should correctly decrypt plain binary message', async function() {
            const MSG_ENCRYPTED = BinaryBuffer.fromHex(testVector['5'].encodedMessage);
            const MSG_UNENCRYPTED = await decryptMessage(
                MSG_ENCRYPTED,
                testVector['5'].encryptionIndicator,
                hexToU8a(testVector['5'].encryptionKeyInput),
                hexToU8a(testVector['5'].originatorAddress),
                hexToU8a(testVector['5'].encryptionInitVector)
            );
            return strictEqual(MSG_UNENCRYPTED.toHex(), testVector['5'].unencryptedMessage);
        });
        assertion(' 6b. should correctly create message from plain encrypted message', async function() {
            const ACCOUNT = new Account(testVector['5'].originatorAddress);
            const MSG = await WfCoreMessage.fromHex(
                testVector['5'].encodedMessage,
                ACCOUNT,
                testVector['5'].encryptionKeyInput,
                testVector['5'].encryptionInitVector
            );
            return strictEqual(MSG.get('Text'), testVector['5'].wfMessage.MessageBody['Text']);
        });
    });
});
