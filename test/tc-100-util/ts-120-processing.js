'use strict';
/**
 * @module util/processing
 * @summary Whiteflag JS processing tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepEqual } from 'node:assert';

/* Functions to test */
import { FunctionChain } from '@whiteflagprotocol/util';

/* TEST SCRIPT */
testCase('Test case 120: Util processing module', function() {
    testCase('Function chaining', function() {
        let chain;
        function plusTen(n) { return n + 10; }
        assertion(' 1. should correctly create processing chain', function(done) {
            chain = new FunctionChain();
            strictEqual(chain.execute(1), 1);
            return done();
        });
        assertion(' 2a. should correctly add functions to processing chain', function(done) {
            chain.add(v => v + 1).add(v => v * v);
            strictEqual(chain.size, 2);
            return done();
        });
        assertion(' 2b. should correctly execute processing chain', function(done) {
            strictEqual(chain.execute(2), 9);
            return done();
        });
        assertion(' 3a. should correctly add named function to processing chain', function(done) {
            chain.add(plusTen);
            strictEqual(chain.size, 3);
            strictEqual(chain.includes(plusTen), true);
            strictEqual(chain.execute(3), 26);
            return done();
        });
        assertion(' 3b. should correctly remove named function from processing chain', function(done) {
            chain.remove(plusTen);
            strictEqual(chain.size, 2);
            strictEqual(chain.includes(plusTen), false);
            strictEqual(chain.execute(1), 4);
            return done();
        });
    });
});
