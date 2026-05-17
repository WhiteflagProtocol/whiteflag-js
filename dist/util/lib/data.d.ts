/**
 * @module util/data
 * @summary Whiteflag JS data structures utility module
 */
export { DataItem, DataCollection };
import { Base64, Json, Serializable } from './types.ts';
/** A unique value to identify a data item */
export type DataId = string;
/** The data collection object structure */
export type CollectionData = {
    [key: DataId]: Serializable;
};
/**
 * A generic data item
 * @template D the serializable data structure of this data item
 * @remarks This is a generic class to derive child classes from
 * for specific data items.
 */
declare class DataItem<D extends Serializable> {
    #private;
    /** A randomly generated unique id; may be overwritten
     *  by the constructor with a more meaningful unique id */
    protected _id: DataId;
    /**
     * Constructs a new data item
     * @param data the data to store with the data item
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @param ddat a direct data acces stoken for access to the private data property
     */
    constructor(data: D, id?: DataId, ddat?: symbol);
    /**
     * Returns (the reference to) the private data property
     * @private
     * @param ddat the direct data access token
     * @returns the private data property, passed by reference
     */
    protected getDataReference(ddat: Symbol): D | void;
    /**
     * Creates a data item from a base64 encoded JSON serialized object
     * @param data a base64 encoded JSON serialized object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    static deserialize(data: Base64, id: DataId, ...args: any): DataItem<Serializable>;
    /**
     * Creates a data item from a JSON serialized object
     * @param data the JSON serialized object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    static fromJson(data: Json, id?: DataId, ...args: any): DataItem<Serializable>;
    /**
     * Creates a data item from a plain JavaScript object
     * @param data a plain JavaScript object
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @returns a new data item
     */
    static fromObject(data: Serializable, id?: DataId, ...args: any): DataItem<Serializable>;
    /**
     * Gives the unique data item identifier
     * @returns the data item identifier
     */
    getId(): DataId;
    /**
     * Converts the data item into a base64 encoded JSON serialized object
     * @returns a base64 encoded data item
     */
    serialize(): Base64;
    /**
     * Converts the data item to a JSON serialized object
     * @returns a JSON serialized data item
     */
    toJson(): Json;
    /**
     * Converts the data item into a plain JavaScript object
     * @returns a plain JavaScript object data item
     */
    toObject(): D;
}
/**
 * A collection of data items of the same class
 * @template I the data item class stored in this collection
 * @remarks This is a generic class to derive child classes from
 * for specific collections.
 */
declare class DataCollection<I extends DataItem<Serializable>> {
    #private;
    /**
     * Constructs a new data collection
     * @param collection a new or existing map with a data collection
     */
    constructor(collection: Map<DataId, I>);
    /**
     * Creates a data collection from a JSON serialized object
     * @returns a new data collection
     */
    static create(): DataCollection<DataItem<Serializable>>;
    /**
     * Creates a data collection from a JSON serialization with base64 encoded data items
     * @param collection a JSON data collection with base64 encoded data items
     * @returns a new data collection
     */
    static deserialize(collection: Json): DataCollection<DataItem<Serializable>>;
    /**
     * Creates a data collection from a JSON serialized object
     * @param collection a JSON serialized data collection
     * @returns a new data collection
     */
    static fromJson(collection: Json): DataCollection<DataItem<Serializable>>;
    /**
     * Creates a data collection from an object with data items
     * @param collection a plain JavaScript object data collection
     * @returns a new data collection
     */
    static fromObject(collection: CollectionData): DataCollection<DataItem<Serializable>>;
    /**
     * Converts the data collection into a JSON object with base64 encoded data items
     * @returns a JSON object with base64 encoded data items
     */
    serialize(): Json;
    /**
     * Converts the data collection to a JSON serialized object
     * @returns a JSON serialized data collection
     */
    toJson(): Json;
    /**
     * Returns the data collection as a plain JavaScript object
     * @returns a plain JavaScript object
     */
    toObject(): CollectionData;
    /**
     * Gets an iterable with all data item identifiers
     * @returns a map iterator with all identifier values
     */
    ids(): MapIterator<DataId>;
    /**
     * Gets an iterable with all data items
     * @returns a map iterator with all data items
     */
    items(): MapIterator<I>;
    /**
     * Checks if a data item exists in the collection
     * @param id the identifier of the data item
     * @returns `true` if the data item exists, else `false`
     */
    exists(id: DataId): boolean;
    /**
     * Upserts a data item in the collection
     * @param item the data item
     * @returns the data item identifier
     * @remarks If a data item with the same id already exists, the data item will be updated.
     */
    upsert(item: I): DataId;
    /**
     * Gets a data item from the collection
     * @param id the identifier of the data item
     * @returns the data item, or `null` if not found
     */
    retrieve(id: DataId): I | null;
    /**
     * Removes a data item from the collection
     * @param id the identifier of the data item to remove
     * @returns `true` if succeeded, else `false`
     */
    remove(id: DataId): boolean;
}
