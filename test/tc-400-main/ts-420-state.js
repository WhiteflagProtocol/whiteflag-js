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
import { KeyStoreCtrl } from '@whiteflagprotocol/crypto';

/* Test data */
const ORGNAME = 'Organisation 1';
const BCNAME = 'testchain';

/* TEST SCRIPT */
testCase('Test case 420: Main state module', function() {
    let state;
    testCase('State creation', function() {
        assertion(' 1a. should initialize clean state', async function() {
            state = await WfState.init('138dc8f17375d884');
            return;
        });
        assertion(' 1b. should correctly export state', async function() {
            const data = await state.export();
            return;
        });
        assertion(' 2.  should not be able to change keystore master key after state init', async function() {
            const result1 = await KeyStoreCtrl.getInstance().setMasterKey(hexToU8a('3a8b61430edcc6afbdf9dfdb'));
            return strictEqual(result1, false);
        });
    });
    const testchain = new Blockchain(BCNAME, 'ES256');
    testCase('Blockchain state', async function() {
        let id;
        assertion(' 3a. should create new blockchain state', async function() {
            /* Get state */
            state = await WfState.readyInstance();

            /* Create new blockchain state */
            id = state.createBlockchain(BCNAME); 
            strictEqual(id, BCNAME);
            return;
        });
        assertion(' 3b. should have blockchain in state', function(done) {
            strictEqual(state.hasBlockchain(BCNAME), true);
            return done();
        });
    });
    testCase('Originator state', function() {
        let id;
        let address;
        assertion(' 4a. should store new originator', async function() {
            /* Create and store originator */
            const originator = WfOriginator.create(ORGNAME);
            id = state.upsertOriginator(originator);
            
            /* Add account to originator */
            const account = await Account.create(testchain);
            address = account.getAddress();
            originator.addAccount(address);
            return;
        });
        assertion(' 4b. should retrieve originator by identifier', function(done) {
            const originator = state.getOriginatorById(id);
            strictEqual(originator.getName(), ORGNAME);
            return done();
        });
        assertion(' 4c. should retrieve originator by address', function(done) {
            const originator = state.getOriginator(address);
            strictEqual(originator.getName(), ORGNAME);
            return done();
        });
        assertion(' 4d. should get null when retrieving non-existing originator', function(done) {
            const originator = state.getOriginator('138dc8f17375d884');
            strictEqual(originator, null);
            return done();
        });
    });
    testCase('Account state', async function() {
        let id;
        let address;
        assertion(' 5a. should store new account', async function() {
            /* Create and store account */
            const account = await Account.create(testchain);
            address = account.getAddress();

            /* Store account and check id */
            id = state.upsertAccount(account); 
            strictEqual(id, address);   // account id should be equal to address
            return;
        });
        assertion(' 5b. should retrieve account by address', function(done) {
            const account = state.getAccount(address);
            strictEqual(account.getAddress(), id);
            return done();
        });
        assertion(' 5c. should get null when retrieving non-existing account', function(done) {
            const account = state.getAccount('138dc8f17375d884');
            strictEqual(account, null);
            return done();
        });
    });
});
