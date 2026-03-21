'use strict';
export { WfBlockchainLayer, WfBlockchainStatus };
import { WfRuntimeError } from '@whiteflagprotocol/common';
import { DataItem } from '@whiteflagprotocol/util';
import { jsonToObj, b64ToStr } from '@whiteflagprotocol/util';
let _blockchains = new Map();
class WfBlockchainLayer {
    static #sit = Symbol('WfBlockchainLayer');
    static #instance;
    constructor(sit) {
        if (sit !== WfBlockchainLayer.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag blockchain layer');
        }
        Object.freeze(this);
    }
    static getInstance() {
        if (!this.#instance) {
            this.#instance = new WfBlockchainLayer(this.#sit);
        }
        return this.#instance;
    }
    async configure(blockchain, config) {
        return true;
    }
    async connect(blockchain) {
        return true;
    }
}
class WfBlockchainStatus extends DataItem {
    #data;
    constructor(data, ddat = Symbol('WfBlockchainStatus')) {
        if (!data?.name)
            throw new WfRuntimeError('Missing blockchain name in blockchain status data');
        super(data, data.name, ddat);
        this.#data = super.getDataReference(ddat);
    }
    static create(name) {
        return new WfBlockchainStatus({
            name: name,
            active: true,
            parameters: Object.create(null),
            status: Object.assign(Object.create(null), {
                updated: new Date().toISOString(),
                syncing: false,
                highestBlock: 0,
                currentBlock: 0,
                processedBlock: 0
            })
        });
    }
    static deserialize(data, blockchain) {
        return this.fromJson(b64ToStr(data), blockchain);
    }
    static fromJson(data, blockchain) {
        return this.fromObject(jsonToObj(data), blockchain);
    }
    static fromObject(data, blockchain) {
        if (data?.name !== blockchain) {
            throw new WfRuntimeError(`Blockchain name ${data?.name} does not match blockchain identifier ${blockchain}`);
        }
        return new WfBlockchainStatus(data);
    }
    getName() {
        return this.#data?.name;
    }
}
