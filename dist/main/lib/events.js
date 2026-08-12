'use strict';
export { WfEvent, WfEventType, WfEventEmitter };
import { EventEmitter } from 'node:events';
import { WfRuntimeError, LogLevel } from '@whiteflagprotocol/common';
import { logWfEvents } from "./logger.js";
var WfEventType;
(function (WfEventType) {
    WfEventType["STATE"] = "state";
    WfEventType["PROTOCOL"] = "protocol";
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
    WfEvent["PROTOCOL_INITIALIZED"] = "protocol:initialized";
    WfEvent["MESSAGE_RECEIVED"] = "message:received";
    WfEvent["MESSAGE_DECODED"] = "message:decoded";
    WfEvent["MESSAGE_VALIDATED"] = "message:validated";
    WfEvent["MESSAGE_SUBMITTED"] = "message:submitted";
    WfEvent["MESSAGE_ENCODED"] = "message:encoded";
    WfEvent["MESSAGE_TRANSMITTED"] = "message:transmitted";
    WfEvent["BLOCKCHAIN_INITIALIZED"] = "blockchain:initialized";
    WfEvent["BLOCKCHAIN_CONNECTED"] = "blockchain:connected";
    WfEvent["BLOCKCHAIN_DISCONNECTED"] = "blockchain:disconnected";
    WfEvent["BLOCKCHAIN_LISTENING"] = "blockchain:listening";
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
        Object.freeze(this);
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
    logEvents(level = LogLevel.INFO) {
        logWfEvents(this, level);
        return this;
    }
}
