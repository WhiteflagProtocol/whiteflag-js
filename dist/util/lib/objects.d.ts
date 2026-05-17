/**
 * @module util/objects
 * @summary Whiteflag JS objects utility module
 */
export { objectHas, deepCopy, objToJson, objToMap, objToB64, objToB64u, objToU8a, jsonToObj, jsonToMap, mapToObj, mapToJson, mapToU8a, b64ToObj, b64uToObj, u8aToObj, u8aToMap };
import { ByteArray, Base64, Base64url, Json } from './types.ts';
/**
 * Checks if an object has a property identified by key
 * @param obj the object to check
 * @param key the name of the property
 * @returns `true` if property exists, else `false`
 */
declare function objectHas(obj: Object, key: string): boolean;
/**
 * Provides a plain serializable deep copy of an object
 * @param entity the object to copy
 * @returns a plain JavaScript object with a deep copy of the entity
 * @remarks Copies of objects created by this functions are without any
 * inherited properties to prevent prototype poisoning. Complex objects
 * (Map, Set, Date, RegExp) are converted to plain objects or a primitive
 * value, allowing the deep copy to be serialized.
 */
declare function deepCopy(entity: any): any;
/**
 * Creates a base64 encoded JSON serialized object
 * @param obj the object to be base64 encoded
 * @returns a base64 encoded JSON serialized object
 */
declare function objToB64(obj: Object): Base64;
/**
 * Creates a base64url encoded JSON serialized object
 * @param obj the object to be base64url encoded
 * @returns a base64url encoded JSON serialized object
 */
declare function objToB64u(obj: Object): Base64url;
/**
 * Creates an object from a base64 encoded JSON serialized object
 * @param base64 a base64 encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
declare function b64ToObj(base64: Base64): Object;
/**
 * Creates an object from a base64url encoded JSON serialized object
 * @param base64u a base64url encoded JSON serialized object
 * @returns a plain object with the data from the JSON object
 */
declare function b64uToObj(base64u: Base64url): Object;
/**
 * Creates a JSON serialized object from an object
 * @param obj the object to be stringified
 * @returns a JSON serialized object
 * @remarks Just a wrapper for `JSON.stringify`, included for completeness
 */
declare function objToJson(obj: Object): Json;
/**
 * Creates a map from an obejct
 * @param obj the object to be transformed to a map
 * @returns a map
 */
declare function objToMap(obj: Object): Map<string, any>;
/**
 * Creates an object from a JSON serialized object
 * @param json the JSON serialized object
 * @returns a plain object with the JSON data
 * @throws if the JSON serialized object contains illegal keys
 * @remarks This function is prefered over using `JSON.parse` directly,
 * because it creates an object without any inherited properties to prevent
 * prototype poisoning.
 */
declare function jsonToObj(json: Json): Object;
/**
 * Creates a map from a JSON serialized object
 * @param json the JSON serialized object
 * @returns a map with  with the JSON data
 */
declare function jsonToMap(json: Json): Map<string, any>;
/**
 * Creates an object from a map
 * @param map the map to transform to an object
 * @returns a plain object with the data from the map
 * @throws if the map contains illegal keys
 * @remarks This function creates an object without any inherited properties
 * to prevent prototype poisoning.
 */
declare function mapToObj(map: Map<string, any>): Object;
/**
 * Creates a JSON serialized object from a map
 * @param map the map to be stringified
 * @returns a JSON serialized object
 */
declare function mapToJson(map: Map<string, any>): Json;
/**
 * Creates a byte array of JSON serialized map
 * @param map the map to be binary encoded
 * @returns a binary encoded map
 */
declare function mapToU8a(map: Map<string, any>): ByteArray;
/**
 * Creates a byte array with a JSON serialized object
 * @param obj the object to be binary encoded
 * @returns a binary encoded object
 */
declare function objToU8a(obj: Object): ByteArray;
/**
 * Creates a map from a byte array with a JSON serialized object
 * @param u8array a binary encoded JSON serialized object
 * @returns a map with the decoded binary data
 */
declare function u8aToMap(u8array: Uint8Array): Map<string, any>;
/**
 * Creates an object from a byte array with a JSON serialized object
 * @param u8array a binary encoded JSON serialized object
 * @returns a plain object with the decoded binary data
 */
declare function u8aToObj(u8array: Uint8Array): Object;
