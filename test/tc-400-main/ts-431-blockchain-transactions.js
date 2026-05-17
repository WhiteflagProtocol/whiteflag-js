'use strict';
/**
 * @module main/blockhains
 * @summary Whiteflag JS main blockchain transactions tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Functions required for test */
import { Blockchain } from  '../lib/t-blockchain.js';

/* Functions to test */
import { extractMessage, WfMetaField } from '@whiteflagprotocol/main';

/* Test data */
import bcConfig from './data/tv-400-blockchain-config.json' with { type: 'json' };
import testVector from './data/tv-431-blockchain-transactions.json' with { type: 'json' };
const BCNAME = bcConfig.testchain.name;

/* TEST SCRIPT */
testCase('Test case 431: Main blockchain transaction functionality', function() {
    testCase('Message extraction from transaction data', function() {
        assertion(' 1a. should return null if no message in transaction', async function() {
            const message = extractMessage(testVector.transactions[0]);
            if (!message) return strictEqual(message, testVector.transactions[0].$type);
            await message.decode();
            strictEqual(message.isValid(), false);
            return;
        });
        assertion(' 1b. should correctly extract message and metadata from transaction', async function() {
            const message = extractMessage(testVector.transactions[1]);
            if (!message) return strictEqual(message, testVector.transactions[1].$type);
            strictEqual(message.getMeta('originatorAddress'), testVector.transactions[1].sender);
            strictEqual(message.getMeta('recipientAddress'), testVector.transactions[1].receiver);
            strictEqual(message.getMeta('transactionHash'), testVector.transactions[1].hash);
            strictEqual(message.getMeta('blockNumber'), testVector.transactions[1].block);
            await message.decode();
            strictEqual(message.isValid(), true);
            strictEqual(message.getType(), testVector.transactions[1].$type);
            return;
        });
        assertion(' 1c. should correctly extract message and metadata from transaction', async function() {
            const message = extractMessage(testVector.transactions[2]);
            if (!message) return strictEqual(message, testVector.transactions[2].$type);
            strictEqual(message.getMeta('originatorAddress'), testVector.transactions[2].sender);
            strictEqual(message.getMeta('recipientAddress'), null);
            strictEqual(message.getMeta('transactionHash'), testVector.transactions[2].hash);
            await message.decode();
            strictEqual(message.isValid(), true);
            strictEqual(message.getType(), testVector.transactions[2].$type);
            return;
        });
    });
    const testchain = new Blockchain(BCNAME);
    testCase('Message extraction from retrieved blockchain transaction', function() {
        assertion(' 2.  should retrieve transaction and extract message', async function() {
            /* Initialize and connect blockchain */
            await testchain.initialize(bcConfig[BCNAME]);
            await testchain.connect();

            /* Get transaction and message */
            const transaction = await testchain.getTransaction('fa38d9aef6e03572938f8322c6d702ec30a401bbc7b89b107be13abff949a7ff');
            const message = extractMessage(transaction);

            /* Check message */
            await message.decode();
            strictEqual(message.isValid(), true);
            return;
        });
    });
});
