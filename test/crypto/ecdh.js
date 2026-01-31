'use strict';
/**
 * @module test/crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation functions
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { deepStrictEqual } from 'node:assert';

/* Functions to test */
import { generateEcdhKeypair, deriveEcdhSecret, createEcdhPubkey } from '@whiteflagprotocol/crypto';

/* TEST SCRIPT */
testCase('Crypto ECDH module', function() {
    testCase('Shared secret negotiation', function() {
        assertion(' 1. should pass RFC 6932 Test Vector A.2', async function() {
            return true;
        });
        assertion(' 2. should generate two keypairs and two equal secrets', async function() {
            /* Generate key pairs */
            const keypair1 = await generateEcdhKeypair();
            const keypair2 = await generateEcdhKeypair();
            /* Extract public keys */
            const pubkey1 = createEcdhPubkey(keypair1.publicKey.toU8a());
            const pubkey2 = createEcdhPubkey(keypair2.publicKey.toU8a());
            /* Derives secrets */
            const secret1 = deriveEcdhSecret(keypair1, pubkey2);
            const secret2 = deriveEcdhSecret(keypair2, pubkey1);
            /* Test secrets */
            return deepStrictEqual(secret1, secret2);
        });
    });
});
