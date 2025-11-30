'use strict';
/**
 * @module test/util/jws
 * @summary Whiteflag JS JSON Web Signature functions tests
 */

/* Test framework */
import { describe as testCase } from 'mocha';
import { it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual, throws } from 'assert';

/* Functions to test */
import { Jws } from '@whiteflag/util';

/* Test data */
import testVector from './jws.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Util JWS module', function() { 
    testCase('JWS variants i.a.w. Whiteflag Standard Annex C example', function() {
        assertion(' 3A. should correctly transform flattened JWS to compact JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            deepStrictEqual(jws.toCompact(), testVector['1'].compact);
            return done();
        });
        assertion(' 3B. should correctly transform full JWS to compact JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].full);
            deepStrictEqual(jws.toCompact(), testVector['1'].compact);
            return done();
        });
        assertion(' 4A. should correctly transform compact JWS to flattened JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            deepStrictEqual(jws.toFlat(), testVector['1'].flat);
            return done();
        });
        assertion(' 4B. should correctly transform full JWS to flattened JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].full);
            deepStrictEqual(jws.toFlat(), testVector['1'].flat);
            return done();
        });
        assertion(' 5A. should correctly transform compact JWS to full JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            deepStrictEqual(jws.toFull(), testVector['1'].full);
            return done();
        });
        assertion(' 5B. should correctly transform flattened JWS to full JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            deepStrictEqual(jws.toFull(), testVector['1'].full);
            return done();
        });
    });
    testCase('JWS class functions', function() {
        assertion(' 6A. should correctly get signature input from signed JWS', function(done) {
            const jws = Jws.fromObject(testVector['1'].flat);
            deepStrictEqual(jws.getSignInput(), testVector['1'].signInput);
            return done();
        });
        assertion(' 6B. should correctly get signature from signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            deepStrictEqual(jws.getSignature(), testVector['1'].full.signature);
            return done();
        });
        assertion(' 7A. should not be able to change signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            strictEqual(jws.setSignature('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), false);
            return done();
        });
        assertion(' 7B. should not be able to set algorithm for signed JWS', function(done) {
            const jws = Jws.fromCompact(testVector['1'].compact);
            strictEqual(jws.setSignAlgorithm('sr25519'), false);
            return done();
        });
        assertion(' 8A. should be able to set algorithm for unsigned JWS', function(done) {
            const jws = Jws.fromObject(testVector['2'].flat);
            strictEqual(jws.setSignAlgorithm('sr25519'), true);
            return done();
        });
        assertion(' 8B. should be not able to sign unsigned JWS with invalid signature encoding', function(done) {
            const jws = Jws.fromObject(testVector['2'].full);
            throws(() => jws.setSignature(testVector['2'].falseSignature), TypeError);
            return done();
        });
        assertion(' 8C. should be able to sign unsigned JWS', function(done) {
            const jws = Jws.fromObject(testVector['2'].full);
            strictEqual(jws.setSignature('XWBRA1TrCxs8tpep1lLPcmpp9JlO_A0TJB5ULOROvadje3SgAsfkFEjE2DoHGpWJ_zNGlEPBtdUQo9MEypIp2Q'), true);
            return done();
        });
    });
});
