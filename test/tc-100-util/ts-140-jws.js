'use strict';
/**
 * @module util/jws
 * @summary Whiteflag JS JSON Web Signature functions tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepEqual, throws } from 'node:assert';

/* Functions to test */
import { Jws } from '@whiteflagprotocol/util';

/* Test data */
import testVector from './data/tv-140-jws.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 140: Util JWS module', function() { 
    testCase('JWS variants i.a.w. Whiteflag Standard Annex C example', function() {
        assertion(' 1a. should correctly transform flattened JWS to compact JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            strictEqual(jws.toCompact(), testVector['1'].compact);
            return done();
        });
        assertion(' 1b. should correctly transform full JWS to compact JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].full);
            deepEqual(jws.toCompact(), testVector['1'].compact);
            return done();
        });
        assertion(' 2a. should correctly transform compact JWS to flattened JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            deepEqual(jws.toFlat(), testVector['1'].flat);
            return done();
        });
        assertion(' 2b. should correctly transform full JWS to flattened JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].full);
            deepEqual(jws.toFlat(), testVector['1'].flat);
            return done();
        });
        assertion(' 3a. should correctly transform compact JWS to full JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            deepEqual(jws.toFull(), testVector['1'].full);
            return done();
        });
        assertion(' 3b. should correctly transform flattened JWS to full JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            deepEqual(jws.toFull(), testVector['1'].full);
            return done();
        });
    });
    testCase('JWS class functions', function() {
        assertion(' 4a. should correctly get signature input from signed JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            strictEqual(jws.getSignInput(), testVector['1'].signInput);
            return done();
        });
        assertion(' 4b. should correctly get signature from signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            strictEqual(jws.getSignature(), testVector['1'].full.signature);
            return done();
        });
        assertion(' 5a. should not be able to change signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            const signature1 = jws.getSignature();
            jws.setSignature('nosignature');
            const signature2 = jws.getSignature();
            strictEqual(signature1, signature2);
            return done();
        });
        assertion(' 5b. should not be able to set algorithm for signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            strictEqual(jws.setSignAlgorithm('sr25519'), false);
            return done();
        });
        assertion(' 6a. should be able to set algorithm for unsigned JWS', function(done) {
            const jws = Jws.fromObject(testVector['2'].flat);
            strictEqual(jws.setSignAlgorithm('sr25519'), true);
            return done();
        });
        assertion(' 6b. should be not able to sign unsigned JWS with invalid signature encoding', function(done) {
            const jws = Jws.fromObject(testVector['2'].full);
            throws(() => jws.setSignature(testVector['2'].falseSignature), TypeError);
            return done();
        });
        assertion(' 6c. should be able to sign unsigned JWS', function(done) {
            const jws = Jws.fromObject(testVector['2'].full);
            jws.setSignature('XWBRA1TrCxs8tpep1lLPcmpp9JlO_A0TJB5ULOROvadje3SgAsfkFEjE2DoHGpWJ_zNGlEPBtdUQo9MEypIp2Q');
            strictEqual(jws.isSigned(), true);
            return done();
        });
    });
});
