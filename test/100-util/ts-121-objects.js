'use strict';
/**
 * @module util/encoding
 * @summary Whiteflag JS common encoding and data conversion tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepStrictEqual } from 'node:assert';

/* Functions to test */
import {
    isBase64u,
    objToB64u,
    objToU8a,
    b64uToObj,
    u8aToObj
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './data/tv-121-objects.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 121: Util objects module', function() {
    testCase('JSON Base64URL object encoding', function() {
        assertion(' 1. should correctly convert random object to base64url and back', function(done) {
            const obj = { prop1: 'string', prop2: { key: 'value'}, prop3: [ "one", "two"] };
            const str = objToB64u(obj);
            strictEqual(isBase64u(str), true);
            deepStrictEqual(obj, b64uToObj(str));
            return done();
        });
        assertion(' 2. should correctly convert RFC 7515 Annex A.1.2 header example to base64url', function(done) {
            const obj = testVector['0'].object.plain.protected;
            const encoded = testVector['0'].object.base64url;
            deepStrictEqual(objToB64u(obj), encoded);
            return done();
        });
        assertion(' 3. should correctly convert random object to byte array and back', function(done) {
            const obj = { prop1: 'string', prop2: { key: 'value'}, prop3: [ "one", "two"] };
            const bin = objToU8a(obj);
            deepStrictEqual(obj, u8aToObj(bin));
            return done();
        });
    });  
});
