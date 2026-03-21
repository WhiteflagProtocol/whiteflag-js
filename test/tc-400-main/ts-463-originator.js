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
import { WfState, WfOriginator } from '@whiteflagprotocol/main';

/* Test data */
const ORGNAME = 'Organisation 1';

/* TEST SCRIPT */
testCase('Test case 463: Originator state', function() {
    let state;
    const blockchainA = new Blockchain('A', 'ES256');
    testCase('Originator addition and retrieval', function() {
        let id;
        let address;
        assertion(' 1.  should store new originator', async function() {
            /* Get state */
            state = await WfState.readyInstance();

            /* Create and store originator */
            const originator = WfOriginator.create(ORGNAME);
            id = state.upsertOriginator(originator);
            
            /* Add account to originator */
            const account = await Account.create(blockchainA);
            address = account.getAddress();
            originator.addAccount(address);
            return;
        });
        assertion(' 2a. should retrieve originator by identifier', function(done) {
            const originator = state.getOriginatorById(id);
            strictEqual(originator.getName(), ORGNAME);
            return done();
        });
        assertion(' 2b. should retrieve originator by address', function(done) {
            const originator = state.getOriginator(address);
            strictEqual(originator.getName(), ORGNAME);
            return done();
        });
        assertion(' 3.  should get null when retrieving non-existing originator', function(done) {
            const originator = state.getOriginator('138dc8f17375d884');
            strictEqual(originator, null);
            return done();
        });
    });
});
