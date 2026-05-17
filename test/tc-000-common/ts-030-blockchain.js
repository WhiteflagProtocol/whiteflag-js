'use strict';
/**
 * @module common/blockchain
 * @summary Whiteflag JS common blockchain interface test implementation tests
 * @remarks This scripts tests the simulated blockchain,
 * on which other tests rely.
 */
/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, notStrictEqual, rejects } from 'node:assert';


/* Functions required for test */
import { delay, readStream, isNumber, Mutex } from  '@whiteflagprotocol/util';

/* Functions to test */
import { Blockchain } from  '../lib/t-blockchain.js';

/* Test data */
import bcConfig from './data/tv-030-blockchain-config.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 030: Blockchain interface test implementation', function() {
    const testchain = new Blockchain('testchain');
    testCase('Simulated initialization and control', function() {
        assertion(' 1a. should not connect before initialization', async function() {
            await rejects(async () => {
                const connected = await testchain.connect();
                return strictEqual(connected, true);
            }, Error);
        });
        assertion(' 1b. should correctly initialize', async function() {
            const initialized = await testchain.initialize();
            return strictEqual(initialized, true);
        });
        assertion(' 1c. should correctly connect', async function() {
            const connected = await testchain.connect();
            return strictEqual(connected, true);
        });
    });
    testCase('Simulated online functions', function() {
        assertion(' 1.  should get syncing status', async function() {
            await testchain.connect();
            const syncing = await testchain.isSyncing();
            strictEqual(syncing, true);
        });
        assertion(' 2.  should get block height', async function() {
            const highestBlock = await testchain.getBlockHeight();
            strictEqual(isNumber(highestBlock), true);
        });
        assertion(' 3a. should get transaction from the blockchain', async function() {
            const transaction = await testchain.getTransaction('fa38d9aef6e03572938f8322c6d702ec30a401bbc7b89b107be13abff949a7ff');
            notStrictEqual(transaction, null);
        });
        assertion(' 3b. should get null for non-existing transaction', async function() {
            const transaction = await testchain.getTransaction('8ab3c2ecc3219dbb5215e1268e845f195eba7069122112b8837c64c630f68690');
            strictEqual(transaction, null);
        });
        assertion(' 4.  should get multiple blocks from stream', async function() {
            let blockCursor = 2;
            const lastBlock = blockCursor + 2;
            const blockStream = testchain.getTransactions(blockCursor, lastBlock);

            /* Wait until all blocks are created */
            const LISTENTIME = bcConfig.testchain.blockIntervalTime * (lastBlock + 1);
            const SLOW = 100 + LISTENTIME * 2;
            this.slow(SLOW); await delay(LISTENTIME);

            /* Read blockstream  and check results */
            const finalBlock = await readStream(
                testchain.getTransactions(blockCursor, lastBlock),
                async transactions => {
                    strictEqual(transactions[0].block, blockCursor);
                    return blockCursor++;
                },
                blockCursor
            );
            strictEqual(blockCursor, finalBlock);
            strictEqual(finalBlock, lastBlock + 1);
        });
    });
});
