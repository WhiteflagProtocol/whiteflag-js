'use strict';
/**
 * @module main/state
 * @summary Whiteflag JS state tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual } from 'node:assert';

/* Functions required for test */
import { hexToU8a } from '@whiteflagprotocol/util';

/* Functions to test */
import { WfState } from '@whiteflagprotocol/main';
import { KeyStoreCtrl } from '@whiteflagprotocol/crypto';

/* TEST SCRIPT */
testCase('Test case 460: Main state module', function() {
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
});
