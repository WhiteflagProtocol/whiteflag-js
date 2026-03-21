'use strict';
export { WfEventEmitter };
import { EventEmitter } from 'node:events';
import { WfRuntimeError } from '@whiteflagprotocol/common';
class WfEventEmitter extends EventEmitter {
    static #sit = Symbol('WfEventEmitter');
    static #instance;
    constructor(sit) {
        if (sit !== WfEventEmitter.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag event emitter access object');
        }
        super();
    }
    static getInstance() {
        if (!WfEventEmitter.#instance) {
            WfEventEmitter.#instance = new WfEventEmitter(this.#sit);
        }
        return WfEventEmitter.#instance;
    }
}
