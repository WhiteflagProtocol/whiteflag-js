/**
 * @module util/jws
 * @description Whiteflag JS JSON Web Signature class and functions
 */
export { Jws };
/**
 * A class representing a JSON Web Token (JWS) structure
 * @class Jws
 */
declare class Jws {
    /**
     * @property {Object} protected the JWS protected header
     */
    private protected;
    /**
     * @property {Object} header the JWS payload
     */
    private payload;
    /**
     * @property {string} signature the JWS signature
     */
    private signature;
    /**
     * Constructor for a Whiteflag message
     * @private
     * @param header the JWS header, which will automatically be protected
     * @param payload the JWS payload
     * @param signature the JWS signature
     */
    private constructor();
    /**
     * Creates a new JWS from a payload
     * @function fromPayload
     * @param payload the JWS payload
     * @returns a new Binary Array
     */
    static fromPayload(payload: Object): Jws;
    /**
     * Creates a new JWS object from a plain javaScript object
     * @function fromObject
     * @param jws a plain object
     * @returns a new JWS object
     */
    static fromObject(jws: any): Jws;
    /**
     * Creates a new JWS object from a compact serialised JWS string
     * @function fromCompact
     * @param jws a compact serialised JWS string
     * @returns a new JWS object
     */
    static fromCompact(jws: string): Jws;
    /**
     * Indicates if the JWS has been signed
     * @function isSigned
     * @returns true if signed, else false
     */
    isSigned(): boolean;
    /**
     * Returns the JWS signature input
     * @function getSignInput
     * @param algorithm the identifier of the algorithm used to sign the payload
     * @returns a string with the input to be signed by the signing algorithm
     */
    getSignInput(): string;
    /**
     * Sets the identifier of the signing algorithm, if not yet signed
     * @function setSignAlgorithm
     * @param algorithm the identifier of the algorithm used to sign the payload
     * @returns true if identifier could be set, false if already signed
     */
    setSignAlgorithm(algorithm: string): boolean;
    /**
     * Sets the signature, if not yet signed
     * @function setSignature
     * @param signature the base64url encoded signature
     * @returns true if signature could be added, false if already signed
     */
    setSignature(signature: string): boolean;
    /**
     * Returns the JWS signature
     * @function getSignature
     * @returns a string with the the JWS signature
     */
    getSignature(): string;
    /**
     * Returns a full JWS
     * @function toFull
     * @returns the JWS as a full JWS plain JavaScript object
     */
    toFull(): Object;
    /**
     * Returns a flattened JWS
     * @function toFlat
     * @returns the JWS as a flattened JWS plain JavaScript object
     */
    toFlat(): Object;
    /**
     * Return a compact serialised JWS as a compact serialized string
     * @function toCompact
     * @returns the JWS as a compact serialized JWS string
     */
    toCompact(): string;
}
