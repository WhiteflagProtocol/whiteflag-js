/**
 * @module util/jws
 * @summary Whiteflag JS basic JSON Web Signature module
 */
export { Jws, JwsHeader, JwsPayload, JwsFlatObject, JwsFullObject, JwsCompact };
import { Base64url, JSON } from './encoding.ts';
/**
 * A class representing a JSON Web Token (JWS)
 * @class Jws
 * @remarks Whiteflag uses JSON Web Signatures (JWS) for one of its
 * authentication methods. This class provides the basic (not Whiteflag-
 * specific) functionality to create, sign and convert JWSs for other
 * Whiteflag packages.
 */
declare class Jws {
    /** The protected the JWS protected header */
    protected: JwsHeader;
    /** The JWS payload */
    payload: JwsPayload;
    /** The JWS signature */
    signature: Base64url;
    /**
     * Constructor for a Whiteflag message
     * @private
     * @param header the JWS header, which will automatically be protected
     * @param payload the JWS payload
     * @param signature the JWS signature
     * @throws if invalid JWS
     */
    constructor(header: JwsHeader, payload: JwsPayload, signature?: Base64url);
    /**
     * Creates a new JWS from a payload
     * @function fromPayload
     * @param payload the JWS payload
     * @returns a new Binary Array
     */
    static fromPayload(payload: JwsPayload): Jws;
    /**
     * Creates a new JWS object from a plain javaScript object
     * @param jws a JSON string representing a JWS
     * @returns a new JWS object
     * @throws if invalid JSON or invalid JWS object
     */
    static fromJSON(jws: JSON): Jws;
    /**
     * Creates a new JWS object from a plain javaScript object
     * @function fromObject
     * @param jws a plain object
     * @returns a new JWS object
     * @throws if invalid JWS object
     */
    static fromObject(jws: any): Jws;
    /**
     * Creates a new JWS object from a compact serialized JWS string
     * @function fromCompact
     * @param jws a compact serialized JWS string
     * @returns a new JWS object
     * @throws if invalid serialized JWS
     */
    static fromCompact(jws: JwsCompact): Jws;
    /**
     * Indicates if the JWS has been signed
     * @function isSigned
     * @returns true if signed, else false
     */
    isSigned(): boolean;
    /**
     * Returns the JWS signature input
     * @function getSignInput
     * @returns the data to be signed by the signing algorithm
     */
    getSignInput(): string;
    /**
     * Returns the binary JWS signature input
     * @function getBinSignInput
     * @returns the binary data to be signed by the signing algorithm
     */
    getBinSignInput(): Uint8Array<ArrayBuffer>;
    /**
     * Sets the identifier of the signing algorithm, if not yet signed
     * @function setSignAlgorithm
     * @param algorithm the identifier of the algorithm used to sign the payload
     * @returns true if identifier could be set, false if already signed
     */
    setSignAlgorithm(algorithm: string): boolean;
    /**
     * Sets the JWS signature, if not yet signed
     * @function setSignature
     * @param signature the base64url encoded signature
     * @returns true if signature could be added, false if already signed
     */
    setSignature(signature: Base64url): Jws;
    /**
     * Returns the JWS signature
     * @function getSignature
     * @returns a string with the base64url encoded JWS signature
     */
    getSignature(): Base64url;
    /**
     * Returns a compact serialized JWS as a compact serialized string
     * @function toCompact
     * @returns the JWS as a compact serialized JWS string
     */
    toCompact(): JwsCompact;
    /**
     * Returns a flattened JWS
     * @function toFlat
     * @returns the JWS as a flattened JWS plain JavaScript object
     */
    toFlat(): JwsFlatObject;
    /**
     * Returns a full JWS
     * @function toFull
     * @returns the JWS as a full JWS plain JavaScript object
     */
    toFull(): JwsFullObject;
    /**
     * Returns the JWS as a plain JavaScript object
     * @function toObject()
     * @returns the JWS as a full JWS plain JavaScript object
     */
    toObject(): Object;
    /**
     * Returns the JWS as a JSON string
     * @function toJSON
     * @returns the JWS as a JSON string
     */
    toJSON(): JSON;
}
/**
 * A compact serialized JWS string
 */
type JwsCompact = string;
/**
 * A flat JWS object
 * @interface JwsFlatObject
 */
interface JwsFlatObject {
    protected: Base64url;
    payload: Base64url;
    signature: Base64url;
}
/**
 * A full JWS object
 * @interface JwsFullObject
 */
interface JwsFullObject {
    protected: JwsHeader;
    payload: JwsPayload;
    signature: Base64url;
}
/**
 * The JWS header object
 * @interface JwsHeader
 */
interface JwsHeader {
    [key: string]: any;
}
/**
 * The JWS payload object
 * @interface JwsPayload
 */
interface JwsPayload {
    [key: string]: any;
}
