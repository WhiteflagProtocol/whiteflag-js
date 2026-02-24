'use strict';
/**
 * @module crypto/sign
 * @summary Whiteflag JS cryptographic signing tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';

/* Functions required for test */
import { hexToU8a } from '@whiteflagprotocol/util';

/* Functions to test */
import { generateSignKeyPair, sign, verify } from '@whiteflagprotocol/crypto';

/* Constants */
const TIMEOUT = 15000;  // RSA can be really slow...

/* TEST SCRIPT */
testCase('Test case 240: Crypto signing module', function() {
    testCase('Digital signining algorithms', function() {
        const data = hexToU8a('3ea1e82b615a25308f0faed7514dc35da9ea87f5fc053bee522f64fe53bb4aca');
        assertion(' 1a. should correctly sign and verify with RS256: RSASSA-PKCS1-v1_5 using SHA-256', async function() {
            this.timeout(TIMEOUT)   // RSA is slow
            const ALG = 'RS256';
            const keypair = await generateSignKeyPair(ALG);
            const signature = await sign(data, keypair, ALG);
            return verify(data, signature, keypair.publicKey, ALG);
        });
        assertion(' 1b. should correctly sign and verify with PS256: RSASSA-PSS using SHA-256', async function() {
            this.timeout(TIMEOUT)   // RSA is slow
            const ALG = 'PS256';
            const keypair = await generateSignKeyPair(ALG);
            const signature = await sign(data, keypair, ALG);
            return verify(data, signature, keypair.publicKey, ALG);
        });
        assertion(' 1c. should correctly sign and verify with ES256: ECDSA using P-256 and SHA-256', async function() {
            const ALG = 'ES256';
            const keypair = await generateSignKeyPair(ALG);
            const signature = await sign(data, keypair, ALG);
            return verify(data, signature, keypair.publicKey, ALG);
        });
        assertion(' 1d. should correctly sign and verify with Ed25519: EdDSA based on Curve25519', async function() {
            const ALG = 'Ed25519';
            const keypair = await generateSignKeyPair(ALG);
            const signature = await sign(data, keypair, ALG);
            return verify(data, signature, keypair.publicKey, ALG);
        });
    });
});
