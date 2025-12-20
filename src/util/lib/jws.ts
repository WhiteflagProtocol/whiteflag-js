'use strict';
/**
 * @module util/jws
 * @description Whiteflag JS JSON Web Signature class and functions
 */
export {
    Jws
};

/* Module imports */
import {
    isObject,
    isString,
    isBase64u,
    objToB64u,
    b64uToObj
} from './encoding.ts';

/* Constants */
/**
 * Defines JWS formats
 * @enum JwsFormat
 */
enum JwsFormat {
    /**
     * Generic Whiteflag protocol error
     */
    COMPACT = 'JWS_COMPACT',
    /**
     * Incorrect or missingWhiteflag message meta data
     */
    FLAT = 'JWS_FLATTENED',
    /**
     * Whiteflag message format error
     */
    FULL = 'JWS_ULL',
}
/**
 * Seperator in compact serialised JWS
 * @Constant
 */
const JWSSEPARATOR = '.';
const REGEX_FLAT = /e[yw][A-Za-z0-9-_]+/;
const REGEX_COMPACT = /e[yw][A-Za-z0-9-_]+\.(e[yw][A-Za-z0-9-_]+\.)?[A-Za-z0-9-_]+/;

/* MODULE DECLARATIONS */
/**
 * A class representing a JSON Web Token (JWS) structure
 * @class Jws
 */
class Jws {
    /* CLASS PROPERTIES */
    /**
     * @property protected the JWS protected header
     */
    private protected = {
        alg: ''
    }
    /**
     * @property header the JWS payload
     */
    private payload = {
        iat: 0
    }
    /**
     * @property signature the JWS signature
     */
    private signature: string = '';

    /* CONSTRUCTOR */
    /**
     * Constructor for a Whiteflag message
     * @private
     * @param header the JWS header, which will automatically be protected
     * @param payload the JWS payload
     * @param signature the JWS signature
     */
    private constructor(header: any, payload: any, signature: string = '') {
        this.protected = header;
        this.payload = payload;
        this.signature = signature;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new JWS from a payload
     * @function fromPayload
     * @param payload the JWS payload 
     * @returns a new Binary Array
     */
    public static fromPayload(payload: Object): Jws {
        return new Jws({}, payload, '');
    }
    /**
     * Creates a new JWS object from a plain javaScript object
     * @function fromObject
     * @param jws a plain object
     * @returns a new JWS object
     */
    public static fromObject(jws: any): Jws {
        switch (jwsType(jws)) {
            case JwsFormat.FULL: {
                return new Jws(
                    jws?.protected,
                    jws?.payload,
                    jws?.signature
                );
            }
            case JwsFormat.FLAT: {
                return new Jws(
                    b64uToObj(jws.protected),
                    b64uToObj(jws.payload),
                    jws?.signature
                );
            }
            case JwsFormat.COMPACT: {
                return this.fromCompact(jws);
            }
        }
    } 
    /**
     * Creates a new JWS object from a compact serialised JWS string
     * @function fromCompact
     * @param jws a compact serialised JWS string
     * @returns a new JWS object
     */
    public static fromCompact(jws: string): Jws {
        if (jwsType(jws) !== JwsFormat.COMPACT) {
            throw new TypeError('Invalid compact serialised JWS string');
        }
        const jwsArray = jws.split(JWSSEPARATOR);
        let header = {};
        if (jwsArray.length > 0) header = b64uToObj(jwsArray[0]);
        let payload = {};
        if (jwsArray.length > 1) payload = b64uToObj(jwsArray[1]);
        let signature = '';
        if (jwsArray.length > 2) signature = jwsArray[2];
        return new Jws(header, payload, signature);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Indicates if the JWS has been signed
     * @function isSigned
     * @returns true if signed, else false
     */
    public isSigned(): boolean {
        return (this.signature.length > 0);
    }
    /**
     * Returns the JWS signature input
     * @function getSignInput
     * @param algorithm the identifier of the algorithm used to sign the payload
     * @returns a string with the input to be signed by the signing algorithm
     */
    public getSignInput(): string {
        /* Add timestamp if not (yet) signed */
        if (!this.isSigned()) {
            this.payload.iat = Math.floor(Date.now()/1000);
        }
        return objToB64u(this.protected) + JWSSEPARATOR + objToB64u(this.payload);
    }
    /**
     * Sets the identifier of the signing algorithm, if not yet signed
     * @function setSignAlgorithm
     * @param algorithm the identifier of the algorithm used to sign the payload 
     * @returns true if identifier could be set, false if already signed
     */
    public setSignAlgorithm(algorithm: string): boolean {
        if (this.isSigned()) return false;
        this.protected.alg = algorithm;
        return true;
    }
    /**
     * Sets the signature, if not yet signed
     * @function setSignature
     * @param signature the base64url encoded signature
     * @returns true if signature could be added, false if already signed
     */
    public setSignature(signature: string): boolean {
        if (this.isSigned()) return false;
        if (!isBase64u(signature)) {
            throw new TypeError('Signature is not base64url encoded');
        }
        this.signature = signature;
        return true;
    }
    /**
     * Returns the JWS signature
     * @function getSignature
     * @returns a string with the the JWS signature
     */
    public getSignature(): string {
        return this.signature;
    }
    /**
     * Returns a full JWS
     * @function toFull
     * @returns the JWS as a full JWS plain JavaScript object
     */
    public toFull(): Object {
        return {
            protected: this.protected,
            payload: this.payload,
            signature: this.signature
        }
    }
    /**
     * Returns a flattened JWS
     * @function toFlat
     * @returns the JWS as a flattened JWS plain JavaScript object
     */ 
    public toFlat(): Object {
        return {
            protected: objToB64u(this.protected),
            payload: objToB64u(this.payload),
            signature: this.signature
        }
    }
    /**
     * Return a compact serialised JWS as a compact serialized string
     * @function toCompact
     * @returns the JWS as a compact serialized JWS string
     */
    public toCompact(): string {
        let compactJws = objToB64u(this.protected)
                        + JWSSEPARATOR
                        + objToB64u(this.payload);
        if (this.isSigned()) {
            compactJws = compactJws
                        + JWSSEPARATOR
                        + this.signature
        }
        return compactJws;
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Return the type of the provided JWS
 * @private
 * @param jws a JSON Web Signature
 * @returns the JWS format
 * @throws if invalid JWS
 */
function jwsType(jws: any): JwsFormat {
    if (isString(jws) && REGEX_COMPACT.test(jws)) {
        return JwsFormat.COMPACT;
    }
    if (isObject(jws)) {
        if (isObject(jws.protected) && isObject(jws.payload)) {
            return JwsFormat.FULL;
        }
        if (isString(jws.protected) && REGEX_FLAT.test(jws.protected)
         && isString(jws.payload) && REGEX_FLAT.test(jws.payload)) {
                return JwsFormat.FLAT;
        }
    }
    throw new TypeError('Invalid JWS representation or encoding');
}
