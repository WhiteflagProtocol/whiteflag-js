'use strict';
/**
 * @module util/jws
 * @summary Whiteflag JS basic JSON Web Signature utility module
 */
export {
    Jws,
    JwsHeader,
    JwsPayload,
    JwsFlatObject,
    JwsFullObject,
    JwsCompact
};

/* Module imports */
import { isBase64u, strToU8a } from './encoding.ts';
import { deepCopy, objToB64u, b64uToObj, jsonToObj } from './objects.ts';
import { ByteArray, Json, Base64url, Serializable, serializable, isObject, isString } from './types.ts';

/* Constants */
const EMPTYSTR = '';
const JWSSEPARATOR = '.';
const REGEX_JWS_FLAT = /e[yw][A-Za-z0-9-_]+/;
const REGEX_JWS_COMPACT = /e[yw][A-Za-z0-9-_]+\.(e[yw][A-Za-z0-9-_]+\.)?[A-Za-z0-9-_]+/;

/* MODULE DECLARATIONS */
/**
 * JWS formats i.a.w. RFC 7515
 */
enum JwsFormat {
    /** JWS Compact Serialization */
    COMPACT = 'JWS_COMPACT',
    /** flattened JWS JSON Serialization */
    FLAT = 'JWS_FLATTENED',
    /** full JWS JSON object */
    FULL = 'JWS_FULL',
}
/**
 * A JSON Web Token (JWS)
 * @remarks Whiteflag uses JSON Web Signatures (JWS) for one of its
 * authentication methods. This class provides the basic (not Whiteflag-
 * specific) functionality to create, sign and convert JWSs for other
 * Whiteflag packages. JWS are defined in RFC 7515.
 */
class Jws {
    /* CLASS PROPERTIES */

    /** The protected the JWS protected header */
    public protected: JwsHeader = Object.create(null);
    /** The JWS payload */
    public payload: JwsPayload = Object.create(null);
    /** The JWS signature */
    public signature: Base64url = EMPTYSTR;

    /* CONSTRUCTOR */
    /**
     * Constructs a Whiteflag message
     * @private
     * @param header the JWS header, which will automatically be protected
     * @param payload the JWS payload
     * @param signature the JWS signature
     * @throws if invalid JWS
     */
    public constructor(header: JwsHeader, payload: JwsPayload, signature: Base64url = EMPTYSTR) {
        /* Check inpout */
        if (!isObject(header)) throw TypeError('Provided JWS protected header is not an object');
        if (!isObject(payload)) throw TypeError('Provided JWS payload is not an object');
        if (!isBase64u(signature)) throw new TypeError('Signature is not base64url encoded');

        /* Set properties */
        this.protected = deepCopy(header);
        this.payload = deepCopy(payload);
        this.signature = signature;

        /* Make object immutable if signature provided */
        if (signature) Object.freeze(this);
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new JWS from a payload
     * @param payload the JWS payload 
     * @returns a new Binary Array
     */
    public static fromPayload(payload: JwsPayload): Jws {
        return new this(Object.create(null), payload, EMPTYSTR);
    }
    /**
     * Creates a new JWS object from a plain javaScript object
     * @param jws a JSON string representing a JWS
     * @returns a new JWS object
     * @throws if invalid JSON or invalid JWS object
     */
    public static fromJSON(jws: Json): Jws {
        return this.fromObject(jsonToObj(jws));
    }
    /**
     * Creates a new JWS object from a plain javaScript object
     * @param jws a plain object
     * @returns a new JWS object
     * @throws if invalid JWS object
     */
    public static fromObject(jws: any): Jws {
        switch (jwsType(jws)) {
            case JwsFormat.FULL: {
                return new this(
                    jws?.protected as JwsHeader,
                    jws?.payload as JwsPayload,
                    jws?.signature as Base64url
                );
            }
            case JwsFormat.FLAT: {
                return new this(
                    b64uToObj(jws?.protected) as JwsHeader,
                    b64uToObj(jws?.payload) as JwsPayload,
                    jws?.signature as Base64url
                );
            }
            case JwsFormat.COMPACT: {
                return this.fromCompact(jws);
            }
            default: {
                throw new TypeError('Invalid JWS representation or encoding');
            }
        }
    } 
    /**
     * Creates a new JWS object from a compact serialized JWS string
     * @param jws a compact serialized JWS string
     * @returns a new JWS object
     * @throws if invalid serialized JWS
     */
    public static fromCompact(jws: JwsCompact): Jws {
        if (jwsType(jws) !== JwsFormat.COMPACT) {
            throw new TypeError('Invalid compact serialized JWS string');
        }
        const jwsArray = jws.split(JWSSEPARATOR);
        let header = Object.create(null);
        if (jwsArray.length > 0) header = b64uToObj(jwsArray[0]);
        let payload = Object.create(null);
        if (jwsArray.length > 1) payload = b64uToObj(jwsArray[1]);
        let signature = EMPTYSTR;
        if (jwsArray.length > 2) signature = jwsArray[2];
        return new this(header, payload, signature);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Indicates if the JWS has been signed
     * @returns `true` if signed, else `false`
     */
    public isSigned(): boolean {
        return (this.signature.length > 0);
    }
    /**
     * Returns the JWS signature input
     * @returns the data to be signed by the signing algorithm
     */
    public getSignInput(): string {
        /* Add timestamp if not (yet) signed */
        if (!this.isSigned()) {
            this.payload.iat = Math.floor(Date.now()/1000);
        }
        return objToB64u(this.protected) + JWSSEPARATOR + objToB64u(this.payload);
    }
    /**
     * Returns the binary JWS signature input
     * @returns the binary data to be signed by the signing algorithm
     */
    public getBinSignInput(): ByteArray {
        return strToU8a(this.getSignInput());
    }
    /**
     * Sets the identifier of the signing algorithm, if not yet signed
     * @param algorithm the identifier of the algorithm used to sign the payload 
     * @returns `true` if identifier could be set, false if already signed
     */
    public setSignAlgorithm(algorithm: string): boolean {
        if (this.isSigned()) return false;
        this.protected.alg = algorithm;
        return true;
    }
    /**
     * Sets the JWS signature, if not yet signed
     * @param signature the base64url encoded signature
     * @returns `true` if signature could be added, false if already signed
     */
    public setSignature(signature: Base64url): this {
        if (this.isSigned()) return this;
        if (this.protected.alg === 'none') {
            throw new Error('Cannot sign an unsecured JWS');
        }
        if (!isBase64u(signature)) {
            throw new TypeError('Signature is not base64url encoded');
        }
        if (signature === EMPTYSTR) {
            throw new TypeError('Cannot sign with an empty signature');
        }
        this.signature = signature;
        return Object.freeze(this);
    }
    /**
     * Returns the JWS signature
     * @returns a string with the base64url encoded JWS signature
     */
    public getSignature(): Base64url {
        return this.signature;
    }
    /**
     * Returns a compact serialized JWS as a compact serialized string
     * @returns the JWS as a compact serialized JWS string
     */
    public toCompact(): JwsCompact {
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
    /**
     * Returns a flattened JWS
     * @returns the JWS as a flattened JWS plain JavaScript object
     */ 
    public toFlat(): JwsFlatObject {
        return {
            protected: objToB64u(this.protected),
            payload: objToB64u(this.payload),
            signature: this.signature
        }
    }
    /**
     * Returns a full JWS
     * @returns the JWS as a full JWS plain JavaScript object
     */
    public toFull(): JwsFullObject {
        return {
            protected: this.protected,
            payload: this.payload,
            signature: this.signature
        }
    }
    /**
     * Returns the JWS as a plain JavaScript object
     * @returns the JWS as a full JWS plain JavaScript object
     */
    public toObject(): Object {
        return this.toFull();
    }
    /**
     * Returns the JWS as a JSON string
     * @returns the JWS as a JSON string
     */
    public toJSON(): Json {
        return JSON.stringify(this.toObject());
    }
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

/* PRIVATE FUNCTIONS */
/**
 * Return the type of the provided JWS
 * @private
 * @param jws a JSON Web Signature
 * @returns the JWS format, or `null` if invalid format
 */
function jwsType(jws: any): JwsFormat | null {
    if (isString(jws) && REGEX_JWS_COMPACT.test(jws)) {
        return JwsFormat.COMPACT;
    }
    if (isObject(jws)) {
        if (isObject(jws.protected) && isObject(jws.payload)) {
            return JwsFormat.FULL;
        }
        if (isString(jws.protected) && REGEX_JWS_FLAT.test(jws.protected)
         && isString(jws.payload) && REGEX_JWS_FLAT.test(jws.payload)) {
                return JwsFormat.FLAT;
        }
    }
    return null;
}
