'use strict';
/**
 * @module core/authentication
 * @summary Whiteflag JS core authentication tests
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
import {
    WfOriginator,
    WfSignature,
    createAuthSignature,
    isValidAuthSignature,
    isValidAuthToken
} from '@whiteflagprotocol/core';

/* Test data */
import testVector from './data/tv-321-authentication.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 321: Core authentication module', function() {
    testCase('Whiteflag authentication signatures (method 1)', function() {
        const testchainA = new Blockchain('A', 'ES256');
        assertion(' 1a. should correctly verify existing valid signature', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account =  await Account.fromPublicKey(testchainA, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.correct);
            const result = await isValidAuthSignature(testchainA, account, signature, signurl);
            /* Check results */
            return strictEqual(result, true);
        });
        assertion(' 1b. should correctly verify existing invalid signature', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].invalid);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(testchainA, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.false);
            const result = await isValidAuthSignature(testchainA, account, signature, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 1c. should correctly verify existing valid signature against invalid public key', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(testchainA, hexToU8a(testVector['1'].wrongkey));
            const signurl = new URL(testVector['1'].url.correct);
            const result = await isValidAuthSignature(testchainA, account, signature, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 1d. should correctly verify existing valid signature against invalid url', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(testchainA, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.false);
            const result = await isValidAuthSignature(testchainA, account, signature, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 2a. should correctly create and sign signature', async function() {
            /* Create blockchain, originator and account */
            const testchainB = new Blockchain('B', 'Ed25519');
            const account = await Account.create(testchainB);
            const signurl = new URL(testVector['2'].url);
            const originator = new WfOriginator({
                name: testVector['2'].orgname,
                accounts: [ account.getAddress() ]
            });
            /* Create unsigned signature */
            const unsigned = WfSignature.create(testchainB.signAlgorithm, {
                addr: account.getAddress(),
                orgname: originator.getName(),
                url: signurl.toString()
            });
            strictEqual(unsigned.isSigned(), false);
            /* Create signature */
            const signed = await createAuthSignature(testchainB, account, originator, signurl);
            strictEqual(signed.isSigned(), true);
            /* Verify signature */
            const result = await isValidAuthSignature(testchainB, account, signed, signurl);
            return strictEqual(result, true);
        });
    });
    testCase('Whiteflag authentication token (method 2)', function() {
        const testchainC = new Blockchain('C', 'ES256');
        assertion(' 3a. should correctly verify token', async function() {
            const account = await Account.fromAddress(testchainC, testVector['3'].address);
            const secret = hexToU8a(testVector['3'].secret);
            const token = hexToU8a(testVector['3'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, true);
        });
        assertion(' 3b. should correctly verify invalid token', async function() {
            const account = await Account.fromAddress(testchainC, testVector['3'].address);
            const secret = hexToU8a(testVector['3'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, false);
        });
        assertion(' 3c. should correctly verify token', async function() {
            const account = await Account.fromAddress(testchainC, testVector['4'].address);
            const secret = hexToU8a(testVector['4'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, true);
        });
        assertion(' 3d. should correctly verify token against wrong address', async function() {
            const account = await Account.fromAddress(testchainC, testVector['3'].address);
            const secret = hexToU8a(testVector['4'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, false);
        });
    });
});
