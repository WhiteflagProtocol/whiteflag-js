'use strict';
/**
 * @module util/data
 * @summary Whiteflag JS data structures tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, deepEqual } from 'node:assert';

/* Functions to test */
import { DataItem, DataCollection } from '@whiteflagprotocol/util';

/* Test data */
import testVector from './data/tv-150-data.json' with { type: 'json' };

/* TEST SCRIPT */
testCase('Test case 150: Util data module', function() { 
    const item1 = DataItem.fromObject(testVector['1'].data);
    const item2 = DataItem.fromObject(testVector['2'].data);
    testCase('Data Item class', function() {
        assertion(' 1a. should correctly create data item from object', function(done) {
            deepEqual(item1.toObject(), testVector['1'].data);
            return done();
        });
        assertion(' 1b. should correctly serialize and deserialize data item', function(done) {
            const serialized = item1.serialize();
            const test = DataItem.deserialize(serialized);
            deepEqual(test.toObject(), testVector['1'].data);
            return done();
        });
    });
    testCase('Data Collection class', function() {
        const collection1 = DataCollection.create();
        assertion(' 2a. should correctly create data collection', function(done) {
            const id1 = collection1.upsert(item1);
            const id2 = collection1.upsert(item2);
            deepEqual(collection1.retrieve(id1).toObject(), testVector['1'].data);
            deepEqual(collection1.retrieve(item2.getId()).toObject(), testVector['2'].data);
            return done();
        });
        assertion(' 2b. should correctly serialize and deserialize data collection', function(done) {
            const id2 = collection1.upsert(item2);
            const serialized = collection1.serialize();
            const collection2 = DataCollection.deserialize(serialized);
            deepEqual(collection2.retrieve(item1.getId()).toObject(), testVector['1'].data);
            deepEqual(collection2.retrieve(id2).toObject(), testVector['2'].data);
            return done();
        });
        assertion(' 2c. should correctly create JSON from data collection', function(done) {
            const json = collection1.toJson();
            const collection2 = DataCollection.fromJson(json);
            deepEqual(collection2.retrieve(item1.getId()).toObject(), testVector['1'].data);
            deepEqual(collection2.retrieve(item2.getId()).toObject(), testVector['2'].data);
            return done();
        });
        assertion(' 2d. should correctly create Object from data collection', function(done) {
            const obj = collection1.toObject();
            const collection2 = DataCollection.fromObject(obj);
            deepEqual(collection2.retrieve(item1.getId()).toObject(), testVector['1'].data);
            deepEqual(collection2.retrieve(item2.getId()).toObject(), testVector['2'].data);
            return done();
        });
        assertion(' 2e. should correctly check if data item exists in data collection', function(done) {
            strictEqual(collection1.exists(item1.getId()), true);
            strictEqual(collection1.exists(item2.getId()), true);
            strictEqual(collection1.exists('737adf6f369d4f7a989d42e3'), false);
            strictEqual(collection1.exists('something'), false);
            strictEqual(collection1.exists(123), false);
            return done();
        });
        assertion(' 2f. should correctly remove data item from data collection', function(done) {
            strictEqual(collection1.remove(item1.getId()), true);
            strictEqual(collection1.remove(item1.getId()), false);
            strictEqual(collection1.exists(item1.getId()), false);
            deepEqual(collection1.retrieve(item2.getId()).toObject(), testVector['2'].data);
            return done();
        });
    });
});
