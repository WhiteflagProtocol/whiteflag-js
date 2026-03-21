'use strict';
/**
 * @module crypto/keystore
 * @summary Whiteflag JS cryptographic keystore tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, rejects } from 'node:assert';

/* Functions required for test */
import { WfKeyType, WfRuntimeError } from '@whiteflagprotocol/common';
import { b64uToObj, hexToU8a, u8aToHex } from '@whiteflagprotocol/util';

/* Functions to test */
import { KeyStoreAccess, KeyStoreCtrl, getWfKeyId } from '@whiteflagprotocol/crypto';

/* Test data */
import testVector from './data/tv-270-keystore.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 270: Crypto keystore module', function() {
    const wfKeyAccess = KeyStoreAccess.getInstance();
    const wfKeyCtrl = KeyStoreCtrl.getInstance();
    testCase('Keystore access', function() {
        wfKeyCtrl.setMasterKey(hexToU8a(testVector['0'].mek1));
        assertion(' 1a. should successfully insert a pre-shared encryption key', async function() {
            const keyId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, testVector['1'].info);
            const PSK = hexToU8a(testVector['1'].psk);
            const result = await wfKeyAccess.upsertKey(keyId, PSK);
            return strictEqual(result, keyId);
        });
        assertion(' 1b. should successfully upsert a pre-shared secret', async function() {
            const keyId = await getWfKeyId(WfKeyType.AUTH_PSS, testVector['1'].info);
            const PSS = hexToU8a(testVector['1'].pss);
            const result1 = await wfKeyAccess.upsertKey(keyId, PSS);    // Insert
            const result2 = await wfKeyAccess.upsertKey(keyId, PSS);    // Update
            return strictEqual((result1 && result2), keyId);
        });
        assertion(' 1c. should correctly retrieve the pre-shared encryption key', async function() {
            const keyId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, testVector['1'].info);
            const PSK = await wfKeyAccess.getKey(keyId);
            return strictEqual(u8aToHex(PSK), testVector['1'].psk);
        });
        assertion(' 1d. should correctly retrieve the pre-shared secret', async function() {
            const keyId = await getWfKeyId(WfKeyType.AUTH_PSS, testVector['1'].info);
            const PSS = await wfKeyAccess.getKey(keyId);
            return strictEqual(u8aToHex(PSS), testVector['1'].pss);
        });
        assertion(' 1e. should not be able to retrieve non-exisiting key', async function() {
            const keyId = await getWfKeyId(WfKeyType.ACCOUNT_PRIVATEKEY, 'does-not-exist');
            const KEY = await wfKeyAccess.getKey(keyId);
            return strictEqual(KEY, null);
        });
        assertion(' 1f. should successfully delete the pre-shared secret', async function() {
            const keyId = await getWfKeyId(WfKeyType.AUTH_PSS, testVector['1'].info);
            const result = await wfKeyAccess.removeKey(keyId);
            strictEqual(result, true);
            const KEY = await wfKeyAccess.getKey(keyId);
            return strictEqual(KEY, null);
        });
    });
    testCase('Keystore control', async function() {
        let keystore = '';
        assertion(' 2a. should successfully export the keystore', async function() {
            const result = await wfKeyCtrl.setMasterKey(hexToU8a(testVector['0'].mek1));
            keystore = await wfKeyCtrl.export();
            return result;
        });
        assertion(' 2b. should successfully import different keystore with same master key', async function() {
            await wfKeyCtrl.import(b64uToObj(testVector['2'].keystore2));
            const keyId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, testVector['1'].info);
            const PSK = await wfKeyAccess.getKey(keyId);
            return strictEqual(u8aToHex(PSK), testVector['1'].psk);
        });
        assertion(' 2c. should not be able to import the keystore with wrong master key', async function() {
            const result = await wfKeyCtrl.setMasterKey(hexToU8a(testVector['0'].mek3));
            strictEqual(result, true, 'Failed to set master key for keystore test');
            return rejects(async () => await wfKeyCtrl.import(keystore), Error);
        });
        assertion(' 2d. should correctly import the exported keystore and retrieve the pre-shared encryption key', async function() {
            await wfKeyCtrl.setMasterKey(hexToU8a(testVector['0'].mek1));
            await wfKeyCtrl.import(keystore);
            const keyId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, testVector['1'].info);
            const PSK = await wfKeyAccess.getKey(keyId);
            return strictEqual(u8aToHex(PSK), testVector['1'].psk);
        });
    });
});
