'use strict';
/**
 * @module core/authentication
 * @summary  Whiteflag JS core authentication tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { hexToU8a } from '@whiteflagprotocol/util';
import { Account } from  './lib/t-account.js';
import { Blockchain } from  './lib/t-blockchain.js';

/* Functions to test */
import {
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
        const dummychain1 = new Blockchain('dummychain', 'ES256');
        assertion(' 1a. should correctly verify existing valid signature', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account =  await Account.fromPublicKey(dummychain1, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.correct);
            const result = await isValidAuthSignature(signature, account, signurl);
            /* Check results */
            return strictEqual(result, true);
        });
        assertion(' 1b. should correctly verify existing invalid signature', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].invalid);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(dummychain1, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.false);
            const result = await isValidAuthSignature(signature, account, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 1c. should correctly verify existing valid signature against invalid public key', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(dummychain1, hexToU8a(testVector['1'].wrongkey));
            const signurl = new URL(testVector['1'].url.correct);
            const result = await isValidAuthSignature(signature, account, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 1d. should correctly verify existing valid signature against invalid url', async function() {
            /* Get signed Whiteflag signature */
            const signature = WfSignature.fromObject(testVector['1'].signature);
            strictEqual(signature.isSigned(), true);
            /* Check signature against account and url */
            const account = await Account.fromPublicKey(dummychain1, hexToU8a(testVector['1'].pubkey));
            const signurl = new URL(testVector['1'].url.false);
            const result = await isValidAuthSignature(signature, account, signurl);
            /* Check results */
            return strictEqual(result, false);
        });
        assertion(' 2a. should correctly create and sign signature', async function() {
            /* Create blockchain, originator and account */
            const dummychain2 = new Blockchain('dummychain', 'Ed25519');
            const account = await Account.create(dummychain2);
            const signurl = new URL(testVector['2'].url);
            const originator = {
                name: testVector['2'].orgname,
                accounts: [ account ]
            };
            /* Create unsigned signature */
            const unsigned = WfSignature.create(account, testVector['2'].orgname, signurl);
            strictEqual(unsigned.isSigned(), false);
            /* Create signature */
            const signed = await createAuthSignature(originator, account, signurl);
            strictEqual(signed.isSigned(), true);
            /* Verify signature */
            const result = await isValidAuthSignature(signed, account, signurl);
            return strictEqual(result, true);
        });
    });
    testCase('Whiteflag authentication token (method 2)', function() {
        const dummychain3 = new Blockchain('dummychain', 'ES256');
        assertion(' 3a. should correctly verify token', async function() {
            const account = await Account.fromAddress(dummychain3, testVector['3'].address);
            const secret = hexToU8a(testVector['3'].secret);
            const token = hexToU8a(testVector['3'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, true);
        });
        assertion(' 3b. should correctly verify invalid token', async function() {
            const account = await Account.fromAddress(dummychain3, testVector['3'].address);
            const secret = hexToU8a(testVector['3'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, false);
        });
        assertion(' 3c. should correctly verify token', async function() {
            const account = await Account.fromAddress(dummychain3, testVector['4'].address);
            const secret = hexToU8a(testVector['4'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, true);
        });
        assertion(' 3d. should correctly verify token against wrong address', async function() {
            const account = await Account.fromAddress(dummychain3, testVector['3'].address);
            const secret = hexToU8a(testVector['4'].secret);
            const token = hexToU8a(testVector['4'].token);
            const result = await isValidAuthToken(token, account, secret);
            return strictEqual(result, false);
        });
    });
});
