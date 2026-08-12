'use strict';
/**
 * @module main/logger
 * @summary Whiteflag JS protocol events logger module
 */
export {
    logWfEvents
};

/* Dependecies */
import { WfLogger, LogLevel, checkLogLevel } from '@whiteflagprotocol/common';

/* Package modules */
import { WfEvent, WfEventType, WfEventEmitter } from './events.ts';

/* Related singleton classes */
const wfLogger = WfLogger.getInstance();

/* Module varibales */
let _logAllEvents: boolean = false;
let _logLevel: LogLevel = LogLevel.DEBUG;
let _logName: string = 'protocol';

/* PUBLIC MODULE FUNCTIONS */
/**
 * Activates the logging of all Whiteflag protocol events
 * @param emitter the emitter of protocol events
 * @param level the highest level of the generated logs, default is `INFO`
 * @remarks The logging level determines the highest level at which the logs
 * are generated, not which events are logged. If set at `INFO` it means that
 * the logs will be at `INFO`, `DEBUG` and `TRACE`, depending on the event. If
 * set to the lowest level `TRACE`, all event logs will be at level `TRACE`.
 */
function logWfEvents(emitter: WfEventEmitter, level: LogLevel = LogLevel.INFO): void {
    _logLevel = checkLogLevel(level);
    if (!_logAllEvents) {
        activateLogEvents(emitter);
        _logAllEvents = true;
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Activates the logging of all Whiteflag protocol events
 * @private
 * @param emitter the emitter of protocol events
 * @remarks Once logging of all events is activated, it cannot be deactivated.
 */
function activateLogEvents(emitter: WfEventEmitter): void {
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
    emitter.on(WfEvent.TRANSACTION_PENDING, transaction => logEvent(LogLevel.DEBUG, `Transaction has been sent to the chain: ${transaction.hash}`, transaction.blockchain));
    emitter.on(WfEvent.TRANSACTION_INCLUDED, transaction => logEvent(LogLevel.DEBUG, `Transaction is included in block ${transaction.block}: ${transaction.hash}`, transaction.blockchain));
    emitter.on(WfEvent.TRANSACTION_CONFIRMED, transaction => logEvent(LogLevel.DEBUG, `Transaction has been confirmed: ${transaction.hash}`, transaction.blockchain));
    emitter.on(WfEvent.ACCOUNT_CREATED, account => logEvent(LogLevel.INFO, `Created account: ${account.getAddress()}`, account.getBlockchainName()));
    emitter.on(WfEvent.ACCOUNT_DISCOVERED, account => logEvent(LogLevel.INFO, `Discovered account: ${account.getAddress()}`, account.getBlockchainName()));
    emitter.on(WfEvent.ACCOUNT_VALIDATED, account => logEvent(LogLevel.INFO, `Validated account: ${account.getAddress()}`, account.getBlockchainName()));
    emitter.on(WfEvent.ORIGINATOR_AUTHENTICATED, originator => logEvent(LogLevel.DEBUG, `Originator discovered: ${originator.getName()}`, WfEventType.ORIGINATOR));
    emitter.on(WfEvent.ORIGINATOR_AUTHENTICATED, originator => logEvent(LogLevel.INFO, `Originator authenticated: ${originator.getName()}`, WfEventType.ORIGINATOR));
}
/**
 * Logs the specified message
 * @private
 * @param level the logging level
 * @param message the message to log
 * @param source the name of the source generating the debug data
 * @returns `true` if the event was emitted and there were listeners, else `false`
 */
function logEvent(level: LogLevel, message: string, source = _logName): boolean {
    if (level > LogLevel.TRACE) level = LogLevel.TRACE;
    if (level < _logLevel) level = _logLevel;
    return wfLogger.log(level, message, source);
}
