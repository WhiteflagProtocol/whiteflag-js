'use strict';
/**
 * @module common/errors
 * @summary Whiteflag JS common error tests
 */

/* Test framework */
import { describe as testCase, it as assertion } from 'mocha';
import { throws } from 'node:assert';

/* Functions to test */
import { WfError, WfErrorCode, handleError } from '@whiteflagprotocol/common';

/* Constants */
const MESSAGE_SyntaxError = 'Syntactically invalid code';
const MESSAGE_TypeError1 = 'Parameter is not hexadecimal encoded';
const MESSAGE_TypeError2 = 'Cannot determine encryption key';
const MESSAGE_Error1 = 'Could not open socket'
const MESSAGE_Error2 = 'Could not connext to blockchain'
const MESSAGE_WfError1 = 'Invalid Whiteflag signature'
const MESSAGE_WfError2 = 'Could not authenticate originator'
const MESSAGE_NoError = 'An error that is not an Error'

/* TEST SCRIPT */
testCase('Test case 030: Common error module', function() {
    testCase('Error handling', function() {
        assertion(' 1. should correctly handle a SyntaxError', function(done) {
            throws(throwSyntaxError, SyntaxError);
            return done();
        });
        assertion(' 2. should correctly handle a TypeError', function(done) {
            throws(throwTypeError, WfError);
            return done();
        });
        assertion(' 3. should correctly handle a general Error', function(done) {
            throws(throwError, WfError);
            return done();
        });
        assertion(' 4. should correctly handle a WfError', function(done) {
            throws(throwWfError, WfError);
            return done();
        });
        assertion(' 5. should correctly handle an invalid Error object', function(done) {
            throws(throwNoError, Error);
            return done();
        });
    });  
});

/* SUPPORT FUNCTIONS */
/**
 * @throws a SyntaxError
 */
function throwSyntaxError() {
    try {
        throw new SyntaxError(MESSAGE_SyntaxError);
    } catch (err) {
        return handleError(err, 'Irrelevant message');
    }
}
/**
 * @throws a WfError
 */
function throwTypeError() {
    try {
        throw new TypeError(MESSAGE_TypeError1);
    } catch (err) {
        return handleError(err, MESSAGE_TypeError2, WfErrorCode.ENCRYPTION);
    }
}
/**
 * @throws a WfError
 */
function throwError() {
    try {
        throw new Error(MESSAGE_Error1);
    } catch (err) {
        return handleError(err, MESSAGE_Error2);
    }
}
/**
 * @throws a WfError
 */
function throwWfError() {
    try {
        throw new TypeError(MESSAGE_WfError1);
    } catch (err) {
        return handleError(err, MESSAGE_WfError2, WfErrorCode.AUTHENTICATION);
    }
}
/**
 * @throws an Error
 */
function throwNoError() {
    return handleError([ 'Not an error object' ], MESSAGE_NoError);
}
