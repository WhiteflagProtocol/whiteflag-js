'use strict';
/**
 * @module main/state
 * @summary Whiteflag JS state tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'node:assert';

/* Classes and Functions required for test */
import { Account } from  '../lib/t-account.js';
import { Blockchain } from  '../lib/t-blockchain.js';
import { hexToU8a } from '@whiteflagprotocol/util';

/* Functions to test */
import { WfState, WfOriginator, WfMessage, WfMsgType } from '@whiteflagprotocol/main';
import { KeyStoreCtrl } from '@whiteflagprotocol/crypto';

/* Test data */
import testVector6 from './data/tv-426-state-queue.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test Case 420: Main state module', function() {
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
    const BCNAME = 'testchain';
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
    const ORGNAME = 'Organisation 1';
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
    testCase('Message queue', async function() {
        let msg1;
        let msg2;
        let msg3;
        assertion(' 5a. should store message in queue', async function() {
            msg1 = await WfMessage.fromObject(testVector6['1'].wfMessage);
            msg2 = await WfMessage.fromObject(testVector6['2'].wfMessage);
            msg3 = await WfMessage.fromObject(testVector6['3'].wfMessage);
            /* Queue messages */
            const id1 = state.putOnQueue(msg1);
            const id2 = state.putOnQueue(msg2);
            const id3 = state.putOnQueue(msg3);
            strictEqual(id1, msg1.id);   // account id should be equal to address
            strictEqual(id2, msg2.id);
            strictEqual(id3, msg3.getMeta('transactionHash'));
            return;
        });
        assertion(' 5b. should get queued message by id, i.e. transaction hash', function(done) {
            const rmsg1 = state.getQueuedById(testVector6['1'].wfMessage.MetaHeader.transactionHash);
            strictEqual(rmsg1.getMeta('transactionHash'), msg1.id);
            const rmsg2 = state.getQueuedById(testVector6['3'].wfMessage.MessageHeader.ReferencedMessage);
            strictEqual(rmsg2.getMeta('transactionHash'), msg2.id);
            return done();
        });
        assertion(' 5c. should get queued message by reference', function(done) {
            const messages1 = state.getQueuedByRef(testVector6['2'].wfMessage.MetaHeader.transactionHash);
            strictEqual(messages1[0].id, msg3.id);        // Only message 3 refers to message 2 in test data
            strictEqual(messages1.length, 1);
            const messages2 = state.getQueuedByRef(testVector6['2'].wfMessage.MetaHeader.transactionHash, WfMsgType.K);
            strictEqual(messages2[0].id, msg3.id);
            strictEqual(messages2.length, 1);
            const messages3 = state.getQueuedByRef(testVector6['2'].wfMessage.MetaHeader.transactionHash, WfMsgType.T);
            deepStrictEqual(messages3, []);
            return done();
        });
        assertion(' 5d. should get queued message by type', function(done) {
            const messages = state.getQueuedByType(WfMsgType.A);
            strictEqual(messages[0].id, msg1.id);   // Only 1 message of type A in test data
            strictEqual(messages.length, 1);
            return done();
        });
        assertion(' 5e. should get null or empty array when retrieving non-existing messages', function(done) {
            const messageA = state.getQueuedById('138dc8f17375d884');
            strictEqual(messageA, null);        // No such message in test data
            const messagesB = state.getQueuedByRef('138dc8f17375d884');
            deepStrictEqual(messagesB, []);     // No such messages in test data
            const messagesC = state.getQueuedByType(WfMsgType.R);
            deepStrictEqual(messagesC, []);     // No such messages in test data
            return done();
        });
        assertion(' 5f. should successfully remove message from queue', function(done) {
            strictEqual(state.removeFromQueue(msg1.id), true);
            strictEqual(state.getQueuedById(msg1.id), null);
            strictEqual(state.removeFromQueue(msg1.id), false);
            return done();
        });
    });
});
