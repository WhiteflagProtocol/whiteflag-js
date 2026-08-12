'use strict';
/**
 * @module main/network
 * @summary Whiteflag JS network tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { rejects, strictEqual, throws } from 'node:assert';

/* Functions required for test */
import { WfRuntimeError } from '@whiteflagprotocol/common';
import { Blockchain } from  '../lib/t-blockchain.js';

/* Functions to test */
import { WfNetwork } from '@whiteflagprotocol/main';

/* Test data */
import bcConfig from './data/tv-400-blockchain-config.json' with { type: 'json' };
const BCNAME = bcConfig.testchain.name;

/* TEST SCRIPT */
testCase('Test case 440: Main blockchain overlay network module', function() {
    let wfNetwork;
    const testchain = new Blockchain(BCNAME);
    testCase('Network layer instantiation', function() {
        assertion(' 1.  should get network instance after state initialization', async function() {
            wfNetwork = await WfNetwork.readyInstance();
            return;
        });
    });
    testCase('Blockchain management', function() {
        assertion(' 2a. should initialize blockchain', async function() {
            strictEqual(await wfNetwork.initialize(testchain, bcConfig[BCNAME]), true);
            return;
        });
        assertion(' 2b. should be able to access blockchain by name', function(done) {
            strictEqual(wfNetwork.getBlockchain(BCNAME), testchain);
            return done();
        });
        assertion(' 2c. should give error for non-existing blockchain', function(done) {
            throws(() => wfNetwork.getBlockchain('non-existing'), WfRuntimeError);
            return done();
        });
        assertion(' 2d. should not start blockchain listener if not connected', async function() {
            rejects(async () => await wfNetwork.listen(BCNAME));
            return;
        });
        assertion(' 2e. should connect to blockchain node', async function() {
            strictEqual(wfNetwork.isConnected(BCNAME), false);
            strictEqual(await wfNetwork.connect(BCNAME), true);
            strictEqual(wfNetwork.isConnected(BCNAME), true);
            return;
        });
        assertion(' 2f. should be able to start blockchain listener', async function() {
            strictEqual(await wfNetwork.listen(BCNAME), true);
            strictEqual(wfNetwork.isListening(BCNAME), true);
            return;
        });
        assertion(' 2g. should be able to retrieve blockchain status data', async function() {
            const status = await wfNetwork.status(BCNAME);
            strictEqual(status.name, BCNAME);
            strictEqual(status.connected, true);
            return;
        });
        assertion(' 2h. should stop blockchain listener when disconnecting from node', async function() {
            strictEqual(await wfNetwork.disconnect(BCNAME), true);
            strictEqual(wfNetwork.isListening(BCNAME), false);
            strictEqual(wfNetwork.isConnected(BCNAME), false);
            return;
        });
    });
});
