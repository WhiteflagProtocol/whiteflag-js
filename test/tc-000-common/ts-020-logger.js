'use strict';
/**
 * @module common/errors
 * @summary Whiteflag JS common error tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { strictEqual, throws } from 'node:assert';

/* Functions required for test */
import { WfRuntimeError } from '@whiteflagprotocol/common';

/* Functions to test */
import { WfLogger } from '@whiteflagprotocol/common';

/* Test data */
import testVector from './data/tv-020-logger.json' with { type: 'json' };
const LOGLEVEL = 5;

/* TEST SCRIPT */
testCase('Test case 020: Common logger module', function() {
    testCase('Initialize logger', function() {
        assertion(' 1a. should not instantiate directly', function(done) {
            throws(() => { new WfLogger(3, Symbol()) }, WfRuntimeError);
            return done();
        });
        assertion(' 1b. should correctly initialize', function(done) {
            strictEqual(WfLogger.init(LOGLEVEL).getLogLevel(), LOGLEVEL);
            return done();
        });
    });
    testCase('Logging listeners', function() {
        const log = WfLogger.getInstance();
        assertion(' 2.  should correctly inidcate no listeners', function(done) {
            strictEqual(log.error(testVector['warn'].message), false);
            return done();
        });
        assertion(' 3.  should correctly add a listener for each logging level', function(done) {
            log.on('log:fatal', handleFatal);
            log.on('log:error', handleError);
            log.on('log:warn', handleWarning);
            log.on('log:info', handleInfo);
            log.on('log:debug', handleDebug);
            log.on('log:trace', handleTrace);
            strictEqual(log.eventNames().length, 6);
            return done();
        });
        assertion(' 4.  should correctly emit logs', function(done) {
            strictEqual(log.fatal(testVector['fatal'].message, testVector['fatal'].module), true);
            strictEqual(log.error(testVector['error'].message, testVector['error'].module), true);
            strictEqual(log.warn(testVector['warn'].message, testVector['warn'].module), true);
            strictEqual(log.info(testVector['info'].message, testVector['info'].module), true);
            strictEqual(log.debug(testVector['debug'].message, testVector['debug'].module), true);
            strictEqual(log.trace(testVector['trace'].message, testVector['trace'].module), false);
            return done();
        });
        assertion(' 5.  should correctly remove listeners from all logging levels', function(done) {
            log.offAll(handleFatal);
            log.offAll(handleError);
            log.offAll(handleWarning);
            log.offAll(handleInfo);
            log.offAll(handleDebug);
            log.off('log:trace', handleTrace);
            strictEqual(log.eventNames().length, 0)
            strictEqual(log.warn(testVector['warn'].message), false);
            return done();
        });
    });
    testCase('Console logging', function() {
        const log = WfLogger.getInstance();
        assertion(' 6a. should correctly enable logging to the console', function(done) {
            log.setConsole(true);
            strictEqual(log.eventNames().length, 6);
            // strictEqual(log.fatal(testVector['fatal'].message, testVector['fatal'].module), true);
            // strictEqual(log.error(testVector['error'].message, testVector['error'].module), true);
            // strictEqual(log.warn(testVector['warn'].message, testVector['warn'].module), true);
            // strictEqual(log.info(testVector['info'].message, testVector['info'].module), true);
            // strictEqual(log.debug(testVector['debug'].message, testVector['debug'].module), true);
            strictEqual(log.trace(testVector['trace'].message, testVector['trace'].module), false);
            return done();
        });
        assertion(' 6b. should correctly disable logging to the console', function(done) {
            log.setConsole(false);
            strictEqual(log.eventNames().length, 0);
            return done();
        });
    });
});
/*
 * Listeners for logging events
 */
function handleFatal(log) { return handleLog(log); }
function handleError(log) { return handleLog(log); }
function handleWarning(log) { return handleLog(log); }
function handleInfo(log) { return handleLog(log); }
function handleDebug(log) { return handleLog(log); }
function handleTrace(log) { return handleLog(log); }
/**
 * Handles the logging data
 * @param {LogData} log the logging data emitted by the logger
 */
function handleLog(log) {
    /* Should not recive logs above loglevel */
    if (log.level > LOGLEVEL) {
        throw new Error(`Should not emit logs at logging level higher than ${LOGLEVEL}`);
    }
    /* Check logging data */
    const indicator = log.indicator.toLowerCase();
    if (!log.level === testVector[indicator].level
     || !log.message === testVector[indicator].message
     || !log.module === testVector[indicator].module) {
        throw new Error('Received invalid logging data');
    }
}
