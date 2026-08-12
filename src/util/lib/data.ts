'use strict';
/**
 * @module util/data
 * @summary Whiteflag JS data structures utility module
 */
export {
    DataItem,
    DataId,
    DataCollection,
    CollectionData
};

/* Dependecies */
import { createHash, getRandomValues } from 'node:crypto';

/* Package modules */
import { b64ToStr, hexToB64u } from './encoding.ts';
import { deepCopy, jsonToObj, objToB64 } from './objects.ts';
import { Base64, Json, Serializable, isObject } from './types.ts';

/* MODULE DECLARATIONS */
/** A unique value to identify a data item */
type DataId = string;
/** The data collection object structure */
type CollectionData = { [key: DataId]: Serializable; };

/**
 * A generic data item
 * @template D the serializable data structure of this data item
 * @remarks This is a generic class to derive child classes from
 * for specific data items.
 */
class DataItem<D extends Serializable> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: D;
    /** Data access token for the private data property */
    readonly #ddat: Symbol;
    /** A randomly generated unique id; may be overwritten
     *  by the constructor with a more meaningful unique id */
    #id: DataId;

    /* CONSTRUCTOR */
    /**
     * Constructs a new data item
     * @param data the data to store with the data item
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @param ddat a direct data acces stoken for access to the private data property
     */
    constructor(data: D, id?: DataId, ddat = Symbol()) {
        /* Check data structure and store data */
        if (!isObject(data)) throw TypeError('Invalid data: not an object');
        this.#data = deepCopy(data) as D;

        /* Set identifier */
        if (id) {
            this.#id = id;
        } else {
            this.#id = hexToB64u(generateId());
        }
        /* Set data access token */
        this.#ddat = ddat;
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the unique id as a property
     */
    get id(): DataId {
        return this.#id;
    }

    /* SPECIAL METHODS */
    /**
     * Returns (the reference to) the private data property
     * @private
     * @param ddat the direct data access token
     * @returns the private data property, passed by reference
     */
    protected getDataReference(ddat: Symbol): D | void {
        if (ddat === this.#ddat) return this.#data;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a data item from a base64 encoded JSON serialized object
     * @param data a base64 encoded JSON serialized object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    public static deserialize(data: Base64, id: DataId): DataItem<Serializable> {
        return this.fromJson(b64ToStr(data), id);
    }
    /**
     * Creates a data item from a JSON serialized object
     * @param data the JSON serialized object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    public static fromJson(data: Json, id?: DataId): DataItem<Serializable> {
        return this.fromObject(jsonToObj(data) as Serializable, id);
    }
    /**
     * Creates a data item from a plain JavaScript object
     * @param data a plain JavaScript object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    public static fromObject(data: Serializable, id?: DataId): DataItem<Serializable> {
        return new this(data, id);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Gives the unique data item identifier
     * @returns the data item identifier
     */
    public getId(): DataId {
        return this.#id;
    }
    /**
     * Converts the data item into a base64 encoded JSON serialized object
     * @returns a base64 encoded data item
     */
    public serialize(): Base64 {
        return objToB64(this.#data);
    }
    /**
     * Converts the data item to a JSON serialized object
     * @returns a JSON serialized data item
     */
    public toJson(): Json {
        return JSON.stringify(this.#data);
    }
    /**
     * Converts the data item into a plain JavaScript object
     * @returns a plain JavaScript object data item
     */
    public toObject(): D {
        return deepCopy(this.#data) as D;
    }
}
/**
 * A collection of data items of the same class
 * @template I the data item class stored in this collection
 * @remarks This is a generic class to derive child classes from
 * for specific collections.
 */
class DataCollection<I extends DataItem<Serializable>> {
    /* CLASS PROPERTIES */
    /** The data items stored in this collection */
    readonly #collection: Map<DataId,I>;

    /* CONSTRUCTOR */
    /**
     * Constructs a new data collection
     * @param collection a new or existing map with a data collection
     */
    constructor(collection: Map<DataId,I>) {
        this.#collection = collection;
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the size of the collection
     */
    get size(): number {
        return +this.#collection.size;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a data collection from a JSON serialized object
     * @returns a new data collection
     */
    public static create(): DataCollection<DataItem<Serializable>> {
        return new this(new Map());
    }
    /**
     * Creates a data collection from a JSON serialization with base64 encoded data items
     * @param collection a JSON data collection with base64 encoded data items
     * @returns a new data collection
     */
    public static deserialize(collection: Json): DataCollection<DataItem<Serializable>> {
        const map: Map<DataId,DataItem<Serializable>> = new Map();

        /* Run through entries and deserialize each data item */
        for (const [id, data] of Object.entries(jsonToObj(collection))) {
            try {
                map.set(id, DataItem.deserialize(data as Base64, id));
            } catch(err: any) {
                throw new Error(`Cannot deserialize data item ${id}: ${err?.message}`, { cause: err });
            }
        }
        /* Create new data collection from deserialized data items */
        return new this(map);
    }
    /**
     * Creates a data collection from a JSON serialized object
     * @param collection a JSON serialized data collection
     * @returns a new data collection
     */
    public static fromJson(collection: Json): DataCollection<DataItem<Serializable>> {
        return this.fromObject(jsonToObj(collection) as CollectionData);
    }
    /**
     * Creates a data collection from an object with data items
     * @param collection a plain JavaScript object data collection
     * @returns a new data collection
     */
    public static fromObject(collection: CollectionData): DataCollection<DataItem<Serializable>> {
        const map: Map<DataId,DataItem<Serializable>> = new Map();

        /* Run through entries of the object and add data items */
        for (const [id, data] of Object.entries(collection)) {
            map.set(id, DataItem.fromObject(data, id));
        }
        /* Create new data collection from deserialized data items */
        return new this(map);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Converts the data collection into a JSON object with base64 encoded data items
     * @returns a JSON object with base64 encoded data items
     */
    public serialize(): Json {
        const obj = {} as any;
        for (const [id, data] of this.#collection) {
            obj[id] = data.serialize();
        }
        return JSON.stringify(obj);
    }
    /**
     * Converts the data collection to a JSON serialized object
     * @returns a JSON serialized data collection
     */
    public toJson(): Json {
        return JSON.stringify(this.toObject());
    }
    /**
     * Returns the data collection as a plain JavaScript object
     * @returns a plain JavaScript object
     */
    public toObject(): CollectionData {
        const obj = {} as CollectionData;
        for (const [id, data] of this.#collection) {
            obj[id] = data.toObject();
        }
        return obj;
    }
    /**
     * Gets an iterable with all data item identifiers
     * @returns a map iterator with all identifier values
     */
    public ids(): MapIterator<DataId> {
        return this.#collection.keys();
    }
    /**
     * Gets an iterable with all data items
     * @returns a map iterator with all data items
     */
    public items(): MapIterator<I> {
        return this.#collection.values();
    }
    /**
     * Checks if a data item exists in the collection
     * @param id the identifier of the data item
     * @returns `true` if the data item exists, else `false`
     */
    public exists(id: DataId): boolean {
        return this.#collection.has(id);
    }
    /**
     * Upserts a data item in the collection
     * @param item the data item
     * @returns the data item identifier
     * @remarks If a data item with the same id already exists, the data item will be updated.
     */
    public upsert(item: I): DataId {
        if (item instanceof DataItem) {
            const id = item.getId();
            this.#collection.set(id, item);
            return id;
        }
        throw new TypeError('A data collection can only store DataItem objects');
    }
    /**
     * Gets a data item from the collection
     * @param id the identifier of the data item
     * @returns the data item, or `null` if not found
     */
    public retrieve(id: DataId): I | null {
        const item = this.#collection.get(id);
        if (!item) return null;
        return item;
    }
    /**
     * Removes a data item from the collection
     * @param id the identifier of the data item to remove
     * @returns `true` if succeeded, else `false`
     */
    public remove(id: DataId): boolean {
        return this.#collection.delete(id);
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Returns a pseudo-unique hexadecimal value
 * @private
 * @returns a hexadecimal string of 12 bytes
 */
function generateId(): DataId {
    /* Constants */
    const BASE36RADIX = 36;
    const HASHALGORITHM = 'sha256';
    const HEXENCODING = 'hex';
    const HEXBYTELENGTH = 2;
    const IDLENGTH = 12;

    /* Create hash */
    const h = createHash(HASHALGORITHM)
        .update(Date.now().toString(BASE36RADIX))
        .update(getRandomValues(new Uint8Array(IDLENGTH)))
        .digest(HEXENCODING);

    /* Return requested length */
    return h.substring(0, IDLENGTH * HEXBYTELENGTH);
}
