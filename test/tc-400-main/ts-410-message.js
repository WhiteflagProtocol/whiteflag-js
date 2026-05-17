'use strict';
/**
 * @module main/message
 * @summary Whiteflag JS main message field encoding and decoding tests
 * @remarks Due to Web Crypto API restrictions, these tests use a
 * specific implementation of the `Account` class, instead of the
 * `WfAccount` from `@hiteflagprotocol/core`.
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { hexToU8a } from '@whiteflagprotocol/util';
import { Account } from  '../lib/t-account.js';
import { Blockchain } from  '../lib/t-blockchain.js';

/* Functions to test */
import { WfMessage } from '@whiteflagprotocol/main';

/* Test data */
import testVector from './data/tv-410-message.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 411: Main message module', function() {
    const testchain = new Blockchain('testchain');
    testCase('Message creation', function() {
        assertion(' 1a. should create new message object', function(done) {
            const MSG = WfMessage.create('A');
            strictEqual(MSG.get('Version'), '1');
            strictEqual(MSG.get('MessageCode'), 'A');
            strictEqual(MSG.isValid(), false);
            return done();
        });
        assertion(' 1b. should create message from object', async function() {
            const MSG = await WfMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.get('MessageCode'), testVector['1'].wfMessage.MessageHeader.MessageCode);
            return strictEqual(MSG.isValid(), true);
        });
    });
    testCase('Message serialization', function() {
        assertion(' 2a. should correctly serialize (test vector 1)', async function() {
            const MSG = WfMessage.fromObject(testVector['1'].wfMessage);
            strictEqual(MSG.getType(), testVector['1'].type);
            return strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
        });
        assertion(' 2b. should correctly serialize (test vector 2)', async function() {
            const MSG = WfMessage.fromObject(testVector['2'].wfMessage);
            strictEqual(MSG.getType(), testVector['2'].type);
            return strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
        });
        assertion(' 2c. should correctly serialize (test vector 3)', async function() {
            const MSG = WfMessage.fromObject(testVector['3'].wfMessage);
            strictEqual(MSG.getType(), testVector['3'].type);
            return strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
        });
        assertion(' 2d. should correctly serialize (test vector 4)', async function() {
            const MSG = WfMessage.fromObject(testVector['4'].wfMessage);
            strictEqual(MSG.getType(), testVector['4'].type);
            return strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
        });
    });
    testCase('Message encoding', function() {
        assertion(' 3a. should correctly encode to binary (test vector 1)', async function() {
            const MSG = await WfMessage.fromObject(testVector['1'].wfMessage).encode();
            return strictEqual(MSG.toHex(), testVector['1'].encodedMessage);
        });
        assertion(' 3b. should correctly encode to binary (test vector 2)', async function() {
            const MSG = await WfMessage.fromObject(testVector['2'].wfMessage).encode();
            return strictEqual(MSG.toHex(), testVector['2'].encodedMessage);
        });
        assertion(' 3c. should correctly encode to binary (test vector 3)', async function() {
            const MSG = await WfMessage.fromObject(testVector['3'].wfMessage).encode();
            return strictEqual(MSG.toHex(), testVector['3'].encodedMessage);
        });
        assertion(' 3d. should correctly encode to binary (test vector 4)', async function() {
            const MSG = await WfMessage.fromObject(testVector['4'].wfMessage).encode();
            return strictEqual(MSG.toHex(), testVector['4'].encodedMessage);
        });
    });
    testCase('Message decoding', function() {
        assertion(' 4a. should correctly decode (test vector 1)', async function() {
            const MSG = await WfMessage.fromHex(testVector['1'].encodedMessage).decode();
            strictEqual(MSG.getType(), testVector['1'].type);
            return strictEqual(MSG.toString(), testVector['1'].concatinatedMessage);
        });
        assertion(' 4b. should correctly decode (test vector 2)', async function() {
            const MSG = await WfMessage.fromHex(testVector['2'].encodedMessage).decode();
            strictEqual(MSG.getType(), testVector['2'].type);
            return strictEqual(MSG.toString(), testVector['2'].concatinatedMessage);
        });
        assertion(' 4c. should correctly decode (test vector 3)', async function() {
            const MSG = await WfMessage.fromHex(testVector['3'].encodedMessage).decode();
            strictEqual(MSG.getType(), testVector['3'].type);
            return strictEqual(MSG.toString(), testVector['3'].concatinatedMessage);
        });
        assertion(' 4d. should correctly decode (test vector 4)', async function() {
            const MSG = await WfMessage.fromHex(testVector['4'].encodedMessage).decode();
            strictEqual(MSG.getType(), testVector['4'].type);
            return strictEqual(MSG.toString(), testVector['4'].concatinatedMessage);
        });
    });
    testCase('Message encryption', function() {
        assertion(' 5a. should correctly encrypt plain message object', async function() {
            const ACCOUNT = await Account.fromAddress(testchain, testVector['5'].originatorAddress);
            const MSG = await WfMessage.fromObject(testVector['5'].wfMessage);
            await MSG.encode(
                ACCOUNT,
                hexToU8a(testVector['5'].encryptionKeyInput),
                hexToU8a(testVector['5'].encryptionInitVector)
            );
            strictEqual(MSG.getType(), testVector['5'].type);
            return strictEqual(MSG.toHex(), testVector['5'].encodedMessage);
        });
    });
    testCase('Message decryption', function() {
        assertion(' 6a. should correctly create message from plain encrypted message', async function() {
            const ACCOUNT = await Account.fromAddress(testchain, testVector['5'].originatorAddress);
            const MSG = await WfMessage
                .fromHex(testVector['5'].encodedMessage)
                .decode(
                    ACCOUNT,
                    hexToU8a(testVector['5'].encryptionKeyInput),
                    hexToU8a(testVector['5'].encryptionInitVector)
                );
            strictEqual(MSG.getType(), testVector['5'].type);
            return strictEqual(MSG.get('Text'), testVector['5'].wfMessage.MessageBody['Text']);
        });
    });
});
