'use strict';
export { DataItem, DataCollection };
import { createHash, getRandomValues } from 'node:crypto';
import { b64ToStr, hexToB64u } from "./encoding.js";
import { deepCopy, jsonToObj, objToB64 } from "./objects.js";
import { ignore } from "./processing.js";
class DataItem {
    #data;
    #ddat;
    _id;
    constructor(data, id, ddat = Symbol()) {
        this.#data = deepCopy(data);
        if (id) {
            this._id = id;
        }
        else {
            this._id = hexToB64u(generateId());
        }
        this.#ddat = ddat;
    }
    getDataReference(ddat) {
        if (ddat === this.#ddat)
            return this.#data;
    }
    static deserialize(data, id, ...args) {
        ignore(args);
        return this.fromJson(b64ToStr(data), id);
    }
    static fromJson(data, id, ...args) {
        ignore(args);
        return this.fromObject(jsonToObj(data), id);
    }
    static fromObject(data, id, ...args) {
        ignore(args);
        return new this(data, id);
    }
    getId() {
        return this._id;
    }
    serialize() {
        return objToB64(this.#data);
    }
    toJson() {
        return JSON.stringify(this.#data);
    }
    toObject() {
        return deepCopy(this.#data);
    }
}
class DataCollection {
    #collection;
    constructor(collection) {
        this.#collection = collection;
    }
    static create() {
        return new this(new Map());
    }
    static deserialize(collection) {
        const map = new Map();
        for (const [id, data] of Object.entries(jsonToObj(collection))) {
            try {
                map.set(id, DataItem.deserialize(data, id));
            }
            catch (err) {
                throw new Error(`Cannot deserialize data item ${id}: ${err?.message}`, { cause: err });
            }
        }
        return new this(map);
    }
    static fromJson(collection) {
        return this.fromObject(jsonToObj(collection));
    }
    static fromObject(collection) {
        const map = new Map();
        for (const [id, data] of Object.entries(collection)) {
            map.set(id, DataItem.fromObject(data, id));
        }
        return new this(map);
    }
    serialize() {
        const obj = {};
        for (const [id, data] of this.#collection) {
            obj[id] = data.serialize();
        }
        return JSON.stringify(obj);
    }
    toJson() {
        return JSON.stringify(this.toObject());
    }
    toObject() {
        const obj = {};
        for (const [id, data] of this.#collection) {
            obj[id] = data.toObject();
        }
        return obj;
    }
    ids() {
        return this.#collection.keys();
    }
    items() {
        return this.#collection.values();
    }
    exists(id) {
        return this.#collection.has(id);
    }
    upsert(item) {
        if (item instanceof DataItem) {
            const id = item.getId();
            this.#collection.set(id, item);
            return id;
        }
        throw new TypeError('A data collection can only store DataItem objects');
    }
    retrieve(id) {
        const item = this.#collection.get(id);
        if (!item)
            return null;
        return item;
    }
    remove(id) {
        return this.#collection.delete(id);
    }
}
function generateId() {
    const BASE36RADIX = 36;
    const HASHALGORITHM = 'sha256';
    const HEXENCODING = 'hex';
    const HEXBYTELENGTH = 2;
    const IDLENGTH = 12;
    const h = createHash(HASHALGORITHM)
        .update(Date.now().toString(BASE36RADIX))
        .update(getRandomValues(new Uint8Array(IDLENGTH)))
        .digest(HEXENCODING);
    return h.substring(0, IDLENGTH * HEXBYTELENGTH);
}
