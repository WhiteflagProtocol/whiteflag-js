'use strict';
/**
 * @module test/crypto/hash
 * @summary Whiteflag JS hashing functions tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { strictEqual, rejects } from 'assert';

/* Functions required for test */
import { hexToU8a, u8aToHex } from '@whiteflag/util';

/* Functions to test */
import { hkdf, hmac, hash } from '@whiteflag/crypto';

/* Test data */
import testVector from './hash.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Crypto hashing module', function() {
    testCase('Basic hash function using SHA-256', function() {
        assertion(' 1. should pass FIPS 180-4 SHA-256 32 bit message test', async function() {
            const msg = hexToU8a(testVector['1'].Msg);
            const digest = u8aToHex(await hash(msg));
            return strictEqual(digest, testVector['1'].MD);
        });
        assertion(' 2. should pass FIPS 180-4 SHA-256 128 bit message test', async function() {
            const msg = hexToU8a(testVector['2'].Msg);
            const digest = u8aToHex(await hash(msg));
            return strictEqual(digest, testVector['2'].MD);
        });
        assertion(' 3. should pass FIPS 180-4 SHA-256 512 bit message test', async function() {
            const msg = hexToU8a(testVector['3'].Msg);
            const digest = u8aToHex(await hash(msg));
            return strictEqual(digest, testVector['3'].MD);
        });
    });
    testCase('Hash-based Message Authentication Code using SHA-256', function() {
        assertion(' 4. should pass FIPS 198-1 SHA-256 HMAC Test Vector 132', async function() {
            const key = hexToU8a(testVector['4'].Key);
            const msg = hexToU8a(testVector['4'].Msg);
            const mac = u8aToHex(await hmac(key, msg));
            return strictEqual(mac, testVector['4'].Mac);
        });
        assertion(' 5. should pass FIPS 198-1 SHA-256 HMAC Test Vector 211', async function() {
            const key = hexToU8a(testVector['5'].Key);
            const msg = hexToU8a(testVector['5'].Msg);
            const mac = u8aToHex(await hmac(key, msg));
            return strictEqual(mac, testVector['5'].Mac);
        });
    });
    testCase('Hash-based Key Derivation Function using SHA-256', function() {
        assertion(' 6. should pass RFC 5869 Test Case 1', async function() {
            const ikm = hexToU8a(testVector['6'].IKM);
            const salt = hexToU8a(testVector['6'].salt);
            const info = hexToU8a(testVector['6'].info);
            const keylen = testVector['6'].L;
            const okm = u8aToHex(await hkdf(ikm, salt, info, keylen));
            return strictEqual(okm, testVector['6'].OKM);
        });
        assertion(' 7. should pass RFC 5869 Test Case 2', async function() {
            const ikm = hexToU8a(testVector['7'].IKM);
            const salt = hexToU8a(testVector['7'].salt);
            const info = hexToU8a(testVector['7'].info);
            const keylen = testVector['7'].L;
            const okm = u8aToHex(await hkdf(ikm, salt, info, keylen));
            return strictEqual(okm, testVector['7'].OKM);
        });
        assertion(' 8. should give zero-length key error for RFC 5869 Test Case 3', async function() {
            const ikm = hexToU8a(testVector['8'].IKM);
            const salt = hexToU8a(testVector['8'].salt);
            const info = hexToU8a(testVector['8'].info);
            const keylen = testVector['8'].L;

            /* Test should result in zero-length key error for empty salt */
            await rejects(async () => {
                const okm = u8aToHex(await hkdf(ikm, salt, info, keylen));
                return strictEqual(okm, testVector['6'].OKM);
            }, DOMException);
        });
    });
});
