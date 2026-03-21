'use strict';
/**
 * @module util/encoding
 * @summary Whiteflag JS common encoding and data conversion tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepEqual } from 'node:assert';

/* Functions to test */
import {
    isBase64u,
    objToB64u,
    objToJson,
    objToMap,
    objToU8a,
    b64uToObj,
    jsonToObj,
    mapToObj,
    u8aToObj,
    mapToJson
} from '@whiteflagprotocol/util';

/* Test data */
import testVector from './data/tv-121-objects.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 121: Util objects module', function() {
    testCase('JSON object encoding', function() {
        const obj = { prop1: 'string', prop2: { key: 'value'}, prop3: [ "one", "two" ] };
        assertion(' 1. should correctly convert random object to JSON and back', function(done) {
            const json = objToJson(obj);
            deepEqual(obj, jsonToObj(json));
            return done();
        });
        assertion(' 2a. should correctly convert random object to base64url and back', function(done) {
            const str = objToB64u(obj);
            strictEqual(isBase64u(str), true);
            deepEqual(obj, b64uToObj(str));
            return done();
        });
        assertion(' 2b. should correctly convert random object to byte array and back', function(done) {
            const bin = objToU8a(obj);
            deepEqual(obj, u8aToObj(bin));
            return done();
        });
        assertion(' 3. should correctly convert random object to map and back', function(done) {
            const map = objToMap(obj);
            deepEqual(obj, mapToObj(map));
            strictEqual(objToJson(obj), mapToJson(map));
            return done();
        });
        assertion(' 4. should correctly convert RFC 7515 Annex A.1.2 header example to base64url', function(done) {
            const header = testVector['0'].object.plain.protected;
            const encoded = testVector['0'].object.base64url;
            deepEqual(objToB64u(header), encoded);
            return done();
        });
    });  
});
