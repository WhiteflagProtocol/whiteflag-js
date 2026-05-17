'use strict';
/**
 * @module main/blockhains
 * @summary Whiteflag JS main blockchain listener tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, throws, rejects } from 'node:assert';

/* Functions required for test */
import { WfRuntimeError, WfLogger, LogLevel } from '@whiteflagprotocol/common';
import { delay } from '@whiteflagprotocol/util';
import { Blockchain } from  '../lib/t-blockchain.js';

/* Functions to test */
import { WfBlockListener, WfEventEmitter, WfState } from '@whiteflagprotocol/main';

/* Test data */
import bcConfig from './data/tv-400-blockchain-config.json' with { type: 'json' };
import testVector from '../lib/data/t-blockchain-data.json' with { type: 'json' };
const BCNAME = bcConfig.testchain.name;

/* TEST SCRIPT */
testCase('Test case 432: Main blockchain listener functionality', function() {
    let state;
    let listener;
    const logger = WfLogger.getInstance();
    const events = WfEventEmitter.getInstance();
    const testchain = new Blockchain(BCNAME);
    testCase('Listener creation', function() {
        assertion(' 1a. should not create listener if blockchain is not initialzed', function(done) {
            throws(() => WfBlockListener.init(testchain), WfRuntimeError);
            return done();
        });
        assertion(' 1b. should create listener after blockchain has been initialzed', async function() {
            /* Ensure blockchain state exists */
            state = await WfState.readyInstance();
            strictEqual(state.hasBlockchain(BCNAME), true);

            /* Initialize blockchain and listener */
            await testchain.initialize(bcConfig[BCNAME]);
            listener = WfBlockListener.init(testchain);
            strictEqual(listener.blockchain, BCNAME);
            return;
        });
    });
    testCase('Listening and block iterations', function() {
        // events.logAllEvents();
        // logger.setLogLevel(LogLevel.DEBUG).setConsole(true);
        assertion(' 2a. should not start listener if blockchain is not connected', async function() {
            if (!testchain.isConnected()) {
                rejects(() => listener.start(), WfRuntimeError);
            }
            return;
        });
        assertion(' 2b. should start listener after blockchain has been connected', async function() {
            /* Connect blockchain and start listener */
            strictEqual(await testchain.connect(), true);
            strictEqual(await listener.start(), true);
            return;
        });
        assertion(' 2c. should have discovered all Whiteflag messages', async function() {
            const LISTENTIME = bcConfig.testchain.blockIntervalTime * (testVector.blocks.length + 1);
            const SLOW = 100 + LISTENTIME * 2;
            this.slow(SLOW); await delay(LISTENTIME); // Wait until all blocks are created and processed
            strictEqual(listener.messageCount(), testVector.messages);
            return;
        });
        assertion(' 2d. should stop listener', async function() {
            strictEqual(listener.stop(), true);
            strictEqual(listener.isListening(), false);
            return;
        });
    });
});
