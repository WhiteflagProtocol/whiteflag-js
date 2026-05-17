/**
 * @module util/jws
 * @summary Whiteflag JS basic JSON Web Signature utility module
 */
export { Jws, JwsHeader, JwsPayload, JwsFlatObject, JwsFullObject, JwsCompact };
import { ByteArray, Json, Base64url, Serializable, serializable } from './types.ts';
/**
 * A JSON Web Token (JWS)
 * @remarks Whiteflag uses JSON Web Signatures (JWS) for one of its
 * authentication methods. This class provides the basic (not Whiteflag-
 * specific) functionality to create, sign and convert JWSs for other
 * Whiteflag packages. JWS are defined in RFC 7515.
 */
declare class Jws {
    /** The protected the JWS protected header */
    protected: JwsHeader;
    /** The JWS payload */
    payload: JwsPayload;
    /** The JWS signature */
    signature: Base64url;
    /**
     * Constructs a Whiteflag message
     * @private
     * @param header the JWS header, which will automatically be protected
     * @param payload the JWS payload
     * @param signature the JWS signature
     * @throws if invalid JWS
     */
    constructor(header: JwsHeader, payload: JwsPayload, signature?: Base64url);
    /**
     * Creates a new JWS from a payload
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
    static fromJSON(jws: Json): Jws;
    /**
     * Creates a new JWS object from a plain javaScript object
     * @param jws a plain object
     * @returns a new JWS object
     * @throws if invalid JWS object
     */
    static fromObject(jws: any): Jws;
    /**
     * Creates a new JWS object from a compact serialized JWS string
     * @param jws a compact serialized JWS string
     * @returns a new JWS object
     * @throws if invalid serialized JWS
     */
    static fromCompact(jws: JwsCompact): Jws;
    /**
     * Indicates if the JWS has been signed
     * @returns `true` if signed, else `false`
     */
    isSigned(): boolean;
    /**
     * Returns the JWS signature input
     * @returns the data to be signed by the signing algorithm
     */
    getSignInput(): string;
    /**
     * Returns the binary JWS signature input
     * @returns the binary data to be signed by the signing algorithm
     */
    getBinSignInput(): ByteArray;
    /**
     * Sets the identifier of the signing algorithm, if not yet signed
     * @param algorithm the identifier of the algorithm used to sign the payload
     * @returns `true` if identifier could be set, false if already signed
     */
    setSignAlgorithm(algorithm: string): boolean;
    /**
     * Sets the JWS signature, if not yet signed
     * @param signature the base64url encoded signature
     * @returns `true` if signature could be added, false if already signed
     */
    setSignature(signature: Base64url): this;
    /**
     * Returns the JWS signature
     * @returns a string with the base64url encoded JWS signature
     */
    getSignature(): Base64url;
    /**
     * Returns a compact serialized JWS as a compact serialized string
     * @returns the JWS as a compact serialized JWS string
     */
    toCompact(): JwsCompact;
    /**
     * Returns a flattened JWS
     * @returns the JWS as a flattened JWS plain JavaScript object
     */
    toFlat(): JwsFlatObject;
    /**
     * Returns a full JWS
     * @returns the JWS as a full JWS plain JavaScript object
     */
    toFull(): JwsFullObject;
    /**
     * Returns the JWS as a plain JavaScript object
     * @returns the JWS as a full JWS plain JavaScript object
     */
    toObject(): Object;
    /**
     * Returns the JWS as a JSON string
     * @returns the JWS as a JSON string
     */
    toJSON(): Json;
}
/**
 * A compact serialized JWS string
 */
type JwsCompact = string;
/**
 * A flat JWS as used by the `Jws` class
 */
interface JwsFlatObject extends Serializable {
    protected: Base64url;
    payload: Base64url;
    signature: Base64url;
}
/**
 * A full JWS as used by the `Jws` class
 */
interface JwsFullObject extends Serializable {
    protected: JwsHeader;
    payload: JwsPayload;
    signature: Base64url;
}
/**
 * The JWS header as used by the `Jws` class
 */
interface JwsHeader extends Serializable {
    [key: string]: serializable;
}
/**
 * The JWS payload as used by the `Jws` class
 */
interface JwsPayload extends Serializable {
    [key: string]: serializable;
}
