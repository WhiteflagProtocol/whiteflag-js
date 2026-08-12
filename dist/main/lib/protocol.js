'use strict';
export { WfProtocol };
import { WfRuntimeError } from '@whiteflagprotocol/common';
import { delay } from '@whiteflagprotocol/util';
import { WfEvent, WfEventEmitter } from "./events.js";
import { WfState } from "./state.js";
const wfEvent = WfEventEmitter.getInstance();
let wfState;
const DELAYTIME = 50;
class WfProtocol {
    static #sit = Symbol('WfProtocol');
    static #instance;
    #rules = new Map();
    constructor(sit) {
        if (sit !== WfProtocol.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag protocol layer');
        }
        Object.freeze(this);
    }
    static async init(rules) {
        if (this.#instance) {
            throw new WfRuntimeError('Whiteflag protocol layer has already been initialized');
        }
        wfState = WfState.getInstance();
        this.#instance = new WfProtocol(this.#sit);
        wfEvent.emit(WfEvent.PROTOCOL_INITIALIZED, this.#instance);
        return this.#instance;
    }
    static getInstance() {
        if (!this.#instance) {
            throw new WfRuntimeError('Whiteflag protocol layer has not been been initialized');
        }
        return this.#instance;
    }
    static async readyInstance() {
        while (!this.#instance)
            await delay(DELAYTIME);
        return this.#instance;
    }
    addRule(rule) {
        if (this.#rules.has(rule))
            return false;
        const handler = this.#createHandler(rule);
        this.#rules.set(rule, handler);
        wfEvent.addListener(rule.trigger, handler);
        return true;
    }
    addRuleSet(ruleset) {
        return ruleset.map(this.addRule);
    }
    removeRule(rule) {
        const handler = this.#rules.get(rule);
        if (!handler)
            return false;
        wfEvent.removeListener(rule.trigger, handler);
        return this.#rules.delete(rule);
    }
    removeRuleSet(ruleset) {
        return ruleset.map(this.removeRule);
    }
    #createHandler(rule) {
        return function (data) {
            const result = rule.chain.execute(data);
            wfEvent.emit(rule.emits, result);
        };
    }
}
