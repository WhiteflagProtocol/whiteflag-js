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
import { rejects, strictEqual, notStrictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { WfProtocolError } from '@whiteflagprotocol/common';
import { hexToU8a } from '@whiteflagprotocol/util';
import { Blockchain } from  '../lib/t-blockchain.js';
import { Account } from  '../lib/t-account.js';

/* Functions to test */
import { WfAccount } from '@whiteflagprotocol/core';

/* Test data */
import testVector from './data/tv-321-account.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 321: Core account module', function() {
    let accountX;
    let accountA;
    let accountB;
    const testchainA = new Blockchain('A', 'ES256');
    testCase('Account creation', function() {
        assertion(' 1a. should correctly create an account from an address', async function() {
            accountA = await WfAccount.fromAddress(testchainA, testVector['1'].address);
            strictEqual(accountA.getId(), testVector['1'].address);
            strictEqual(accountA.getBlockchainName(), testchainA.name);
            return strictEqual(accountA.isSelf(), false);
        });
        assertion(' 1b. should correctly create an account from a public key', async function() {
            accountB = await WfAccount.fromPublicKey(testchainA, hexToU8a(testVector['2'].pubkey));
            strictEqual(accountB.getAddress(), testVector['2'].address);
            strictEqual(accountB.getId(), testVector['2'].address);
            strictEqual(accountB.getBlockchainName(), testchainA.name);
            return strictEqual(accountB.isSelf(), false);
        });
        assertion(' 1c. should correctly create new own account', async function() {
            accountX = await Account.create(testchainA);
            strictEqual(accountX.getBlockchainName(), testchainA.name);
            return strictEqual(accountX.isSelf(), true);
        });
    });
    testCase('Shared encryption secret negotiation', function() {
        assertion(' 2a. should return null if no ECDH keys available', async function() {
            strictEqual(accountX.getPublicCryptoEcdhKey(), null);
            strictEqual(accountA.getPublicCryptoEcdhKey(), null);
            strictEqual(accountB.getPublicCryptoEcdhKey(), null);
        });
        assertion(' 2b. should correctly generate ECDH key pair', async function() {
            await accountX.generateCryptoEcdhKeys();
        });
        assertion(' 2c. should correctly store ECDH public key', async function() {
            rejects(async () => await accountA.generateCryptoEcdhKeys(), WfProtocolError);
            await accountA.setPublicCryptoEcdhKey(testVector['1'].ecdhCryptoPubKey);
            rejects(async () => await accountB.generateCryptoEcdhKeys(), WfProtocolError);
            await accountB.setPublicCryptoEcdhKey(testVector['2'].ecdhCryptoPubKey);
        });
        assertion(' 2d. should correctly derive shared encryption secret', async function() {
            const secretA = await accountX.deriveCryptoSharedSecret(accountA);
            const secretB = await accountX.deriveCryptoSharedSecret(accountA);
            return notStrictEqual(secretA, secretB);
        });
        assertion(' 2e. should not derive shared encryption secret for other accounts', async function() {
            rejects(async () => await accountA.deriveCryptoSharedSecret(accountB), WfProtocolError);
        });
    });
    testCase('Shared authentication secret negotiation', function() {
        assertion(' 3a. should return null if no ECDH keys available', async function() {
            strictEqual(accountX.getPublicAuthEcdhKey(), null);
            strictEqual(accountA.getPublicAuthEcdhKey(), null);
            strictEqual(accountB.getPublicAuthEcdhKey(), null);
        });
        assertion(' 3b. should correctly generate ECDH key pair', async function() {
            await accountX.generateAuthEcdhKeys();
        });
        assertion(' 3c. should correctly store ECDH public key', async function() {
            rejects(async () => await accountA.generateAuthEcdhKeys(), WfProtocolError);
            await accountA.setPublicAuthEcdhKey(testVector['1'].ecdhAuthPubKey);
            rejects(async () => await accountB.generateAuthEcdhKeys(), WfProtocolError);
            await accountB.setPublicAuthEcdhKey(testVector['2'].ecdhAuthPubKey);
        });
        assertion(' 3d. should correctly derive shared authentication secret', async function() {
            const secretA = await accountX.deriveAuthSharedSecret(accountA);
            const secretB = await accountX.deriveAuthSharedSecret(accountA);
            return notStrictEqual(secretA, secretB);
        });
        assertion(' 3e. should not derive shared authentication secret for other accounts', async function() {
            rejects(async () => await accountA.deriveAuthSharedSecret(accountB), WfProtocolError);
        });
    });
});
