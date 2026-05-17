'use strict';
export { WfEvent, WfEventType, WfEventEmitter };
import { EventEmitter } from 'node:events';
import { WfRuntimeError, WfLogger, LogLevel, checkLogLevel } from '@whiteflagprotocol/common';
const wfLogger = WfLogger.getInstance();
let _logAllEvents = false;
let _logLevel = LogLevel.DEBUG;
let _logName = 'event';
var WfEventType;
(function (WfEventType) {
    WfEventType["STATE"] = "state";
    WfEventType["MESSAGE"] = "message";
    WfEventType["BLOCKCHAIN"] = "blockchain";
    WfEventType["BLOCK"] = "block";
    WfEventType["TRANSACTION"] = "transaction";
    WfEventType["ACCOUNT"] = "account";
    WfEventType["ORIGINATOR"] = "originator";
})(WfEventType || (WfEventType = {}));
var WfEvent;
(function (WfEvent) {
    WfEvent["STATE_INITIALIZED"] = "state:initialized";
    WfEvent["MESSAGE_RECEIVED"] = "message:received";
    WfEvent["MESSAGE_DECODED"] = "message:decoded";
    WfEvent["MESSAGE_VALIDATED"] = "message:validated";
    WfEvent["MESSAGE_SUBMITTED"] = "message:submitted";
    WfEvent["MESSAGE_ENCODED"] = "message:encoded";
    WfEvent["MESSAGE_TRANSMITTED"] = "message:transmitted";
    WfEvent["BLOCKCHAIN_INITIALIZED"] = "blockchain:initialized";
    WfEvent["BLOCKCHAIN_CONNECTED"] = "blockchain:connected";
    WfEvent["BLOCKCHAIN_DISCONNECTED"] = "blockchain:disconnected";
    WfEvent["BLOCKCHAIN_LISTENING"] = "blockchain:paused";
    WfEvent["BLOCKCHAIN_PAUSED"] = "blockchain:paused";
    WfEvent["BLOCK_DISCOVERED"] = "block:discovered";
    WfEvent["TRANSACTION_PENDING"] = "transaction:pending";
    WfEvent["TRANSACTION_INCLUDED"] = "transaction:included";
    WfEvent["TRANSACTION_CONFIRMED"] = "transaction:confirmed";
    WfEvent["ACCOUNT_CREATED"] = "account:created";
    WfEvent["ACCOUNT_DISCOVERED"] = "account:discovered";
    WfEvent["ACCOUNT_VALIDATED"] = "account:validated";
    WfEvent["ORIGINATOR_DISCOVERED"] = "originator:discovered";
    WfEvent["ORIGINATOR_AUTHENTICATED"] = "originator:authenticated";
})(WfEvent || (WfEvent = {}));
class WfEventEmitter extends EventEmitter {
    static #sit = Symbol('WfEventEmitter');
    static #instance;
    constructor(sit) {
        if (sit !== WfEventEmitter.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag event emitter');
        }
        super();
    }
    static getInstance() {
        if (!WfEventEmitter.#instance) {
            WfEventEmitter.#instance = new WfEventEmitter(this.#sit);
        }
        return WfEventEmitter.#instance;
    }
    onAllEvents(listener) {
        for (const event of Object.values(WfEvent)) {
            this.addListener(event, listener);
        }
        return this;
    }
    offAllEvents(listener) {
        for (const event of Object.values(WfEvent)) {
            this.removeListener(event, listener);
        }
        return this;
    }
    logAllEvents(level = LogLevel.INFO) {
        _logLevel = checkLogLevel(level);
        logAllEvents(this);
        return this;
    }
}
function logAllEvents(emitter = WfEventEmitter.getInstance()) {
    if (!_logAllEvents) {
        emitter.on(WfEvent.STATE_INITIALIZED, state => logEvent(LogLevel.INFO, `Protocol state initialized`, WfEventType.STATE));
        emitter.on(WfEvent.MESSAGE_RECEIVED, message => logEvent(LogLevel.TRACE, `Incoming ${message.getType()} message: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.MESSAGE_DECODED, message => logEvent(LogLevel.DEBUG, `Incoming ${message.getType()} message decoded: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.MESSAGE_VALIDATED, message => logEvent(LogLevel.TRACE, `Incoming ${message.getType()} message validated: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.MESSAGE_SUBMITTED, message => logEvent(LogLevel.TRACE, `Outbound ${message.getType()} message submitted: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.MESSAGE_ENCODED, message => logEvent(LogLevel.TRACE, `Outbound ${message.getType()} message encoded: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.MESSAGE_TRANSMITTED, message => logEvent(LogLevel.DEBUG, `Outbound ${message.getType()} message transmitted: ${JSON.stringify(message.getMetaHeader())}`, WfEventType.MESSAGE));
        emitter.on(WfEvent.BLOCKCHAIN_INITIALIZED, blockchain => logEvent(LogLevel.INFO, `Initialized blockchain`, blockchain.name));
        emitter.on(WfEvent.BLOCKCHAIN_CONNECTED, blockchain => logEvent(LogLevel.INFO, `Connected to blockchain`, blockchain.name));
        emitter.on(WfEvent.BLOCKCHAIN_DISCONNECTED, blockchain => logEvent(LogLevel.INFO, `Disconnected from blockchain`, blockchain.name));
        emitter.on(WfEvent.BLOCKCHAIN_LISTENING, listener => logEvent(LogLevel.INFO, `Listening for messages on blockchain`, listener.blockchain));
        emitter.on(WfEvent.BLOCKCHAIN_PAUSED, listener => logEvent(LogLevel.INFO, `Paused listening for messages on blockchain`, listener.blockchain));
        emitter.on(WfEvent.BLOCK_DISCOVERED, transactions => logEvent(LogLevel.TRACE, `Discovered ${transactions.length} transactions in block ${transactions[0]?.block}`, transactions[0]?.blockchain));
        emitter.on(WfEvent.TRANSACTION_PENDING, transaction => logEvent(LogLevel.DEBUG, `Transaction has been sent to the chain: ${transaction?.hash}`, transaction?.blockchain));
        emitter.on(WfEvent.TRANSACTION_INCLUDED, transaction => logEvent(LogLevel.DEBUG, `Transaction is included in block ${transaction?.block}: ${transaction?.hash}`, transaction?.blockchain));
        emitter.on(WfEvent.TRANSACTION_CONFIRMED, transaction => logEvent(LogLevel.DEBUG, `Transaction has been confirmed: ${transaction?.hash}`, transaction?.blockchain));
        emitter.on(WfEvent.ACCOUNT_CREATED, account => logEvent(LogLevel.INFO, `Created account: ${account.getAddress()}`, account.getBlockchainName()));
        emitter.on(WfEvent.ACCOUNT_DISCOVERED, account => logEvent(LogLevel.INFO, `Discovered account: ${account.getAddress()}`, account.getBlockchainName()));
        emitter.on(WfEvent.ACCOUNT_VALIDATED, account => logEvent(LogLevel.INFO, `Validated account: ${account.getAddress()}`, account.getBlockchainName()));
        emitter.on(WfEvent.ORIGINATOR_AUTHENTICATED, originator => logEvent(LogLevel.DEBUG, `Originator discovered: ${originator.getName()}`, WfEventType.ORIGINATOR));
        emitter.on(WfEvent.ORIGINATOR_AUTHENTICATED, originator => logEvent(LogLevel.INFO, `Originator authenticated: ${originator.getName()}`, WfEventType.ORIGINATOR));
        _logAllEvents = true;
    }
}
function logEvent(level, message, source = _logName) {
    if (level > LogLevel.TRACE)
        level = LogLevel.TRACE;
    if (level < _logLevel)
        level = _logLevel;
    wfLogger.log(level, message, source);
}
