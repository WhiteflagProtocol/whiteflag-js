'use strict';
/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { deepStrictEqual } from 'node:assert';

/* Functions required for test */
import { hexToU8a } from '@whiteflagprotocol/util';

/* Functions to test */
import {
    ExtCryptoKey,
    createExtKeyPair,
    generateEcdhKeyPair,
    deriveEcdhSecret,
    createEcdhPubkey
} from '@whiteflagprotocol/crypto';

/* Test data */
import testVector from './data/tv-230-ecdh.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 230: Crypto ECDH module', function() {
    testCase('Shared secret negotiation', function() {
        const ECDHALG = { name: 'ECDH', namedCurve: 'brainpoolP256r1', };
        assertion(' 1. should pass RFC 6932 Test Vector A.2', async function() {
            /* Create key pairs */
            const keypairA = createExtKeyPair(
                new ExtCryptoKey(hexToU8a(testVector['1']['A'].key), 'private', ECDHALG, ['deriveBits', 'deriveKey']),
                new ExtCryptoKey(hexToU8a(testVector['1']['A'].pubkey), 'public', ECDHALG, ['deriveBits', 'deriveKey']),
            )
            const keypairB = createExtKeyPair(
                new ExtCryptoKey(hexToU8a(testVector['1']['B'].key), 'private', ECDHALG, ['deriveBits', 'deriveKey']),
                new ExtCryptoKey(hexToU8a(testVector['1']['B'].pubkey), 'public', ECDHALG, ['deriveBits', 'deriveKey']),
            )
            /* Create public keys */
            const pubkeyA = await createEcdhPubkey(hexToU8a(testVector['1']['A'].pubkey));
            const pubkeyB = await createEcdhPubkey(hexToU8a(testVector['1']['B'].pubkey));
            /* Derive secrets */
            const secretA = await deriveEcdhSecret(keypairA, pubkeyB);
            const secretB = await deriveEcdhSecret(keypairB, pubkeyA);
            /* Verify secrets */
            const secret = hexToU8a(testVector['1'].secret);
            deepStrictEqual(secretA, secret);
            deepStrictEqual(secretB, secret);
            return deepStrictEqual(secretA, secretB);
        });
        assertion(' 2. should generate two random keypairs with two equal secrets', async function() {
            /* Generate key pairs */
            const keypair1 = await generateEcdhKeyPair();
            const keypair2 = await generateEcdhKeyPair();
            /* Extract public keys */
            const pubkey1 = await createEcdhPubkey(keypair1.publicKey.toU8a());
            const pubkey2 = await createEcdhPubkey(keypair2.publicKey.toU8a());
            /* Derive secrets */
            const secret1 = await deriveEcdhSecret(keypair1, pubkey2);
            const secret2 = await deriveEcdhSecret(keypair2, pubkey1);
            /* Verify secrets */
            return deepStrictEqual(secret1, secret2);
        });
    });
});
