'use strict';
/**
 * @module main/state
 * @summary Whiteflag JS state tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { Account } from  '../lib/t-account.js';
import { Blockchain } from  '../lib/t-blockchain.js';
import { hexToU8a } from '@whiteflagprotocol/util';

/* Functions to test */
import { WfState } from '@whiteflagprotocol/main';

/* TEST SCRIPT */
testCase('Test case 462: Account state', function() {
    let state;
    const blockchainA = new Blockchain('A', 'ES256');
    testCase('Account addition and retrieval', async function() {
        let id;
        let address;
        assertion(' 1. should store new account', async function() {
            /* Get state */
            state = await WfState.readyInstance();

            /* Create and store account */
            const account = await Account.create(blockchainA);
            address = account.getAddress();

            /* Store account and check id */
            id = state.upsertAccount(account); 
            strictEqual(id, address);   // account id should be equal to address
            return;
        });
        assertion(' 2. should retrieve account by address', function(done) {
            const account = state.getAccount(address);
            strictEqual(account.getAddress(), id);
            return done();
        });
        assertion(' 3. should get null when retrieving non-existing account', function(done) {
            const account = state.getAccount('138dc8f17375d884');
            strictEqual(account, null);
            return done();
        });
    });
});
