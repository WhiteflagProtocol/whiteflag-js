'use strict';
/**
 * @module test/crypto/cipher
 * @summary Whiteflag JS encryption and decryption functions tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { deepStrictEqual } from 'node:assert';

/* Functions required for test */
import { hexToU8a, u8aToHex } from '@whiteflagprotocol/util';

/* Functions to test */
import { encrypt, decrypt, createAesKey } from '@whiteflagprotocol/crypto';

/* Test data */
import testVector from './static/cipher.json' with { type: 'json' };
const AES256CTR_PSK = '2'; // pre-shared key

/* TEST SCRIPT */
testCase('Crypto cipher module', function() {
    testCase('AES 256 counter mode', function() {
        assertion(' 1. should pass NIST SP 800-38A F.5.5 CTR-AES256 encryption', async function() {
            const plaintext = hexToU8a(
                  testVector['1'].plaintext1
                + testVector['1'].plaintext2
                + testVector['1'].plaintext3
                + testVector['1'].plaintext4
            );
            const cyphertext = 
                  testVector['1'].ciphertext1
                + testVector['1'].ciphertext2
                + testVector['1'].ciphertext3
                + testVector['1'].ciphertext4;
            const key = await createAesKey(hexToU8a(testVector['1'].key), testVector['1'].algorithm);
            const iv = hexToU8a(testVector['1'].initCounter);
            const encrypted = await encrypt(plaintext, AES256CTR_PSK, key, iv);
            return deepStrictEqual(u8aToHex(encrypted), cyphertext);
        });
        assertion(' 2. should pass NIST SP 800-38A F.5.6 CTR-AES256 decryption', async function() {
            const ciphertext = hexToU8a(
                  testVector['2'].ciphertext1
                + testVector['2'].ciphertext2
                + testVector['2'].ciphertext3
                + testVector['2'].ciphertext4
            );
            const plaintext = 
                  testVector['2'].plaintext1
                + testVector['2'].plaintext2
                + testVector['2'].plaintext3
                + testVector['2'].plaintext4;
            const key = await createAesKey(hexToU8a(testVector['2'].key), testVector['2'].algorithm);
            const iv = hexToU8a(testVector['2'].initCounter);
            const decrypted = await decrypt(ciphertext, AES256CTR_PSK, key, iv);
            return deepStrictEqual(u8aToHex(decrypted), plaintext);
        });
    });
});
