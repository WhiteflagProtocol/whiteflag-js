export { Jws };
import { isObject, isString, isBase64u, objToB64u, b64uToObj } from "./encoding.js";
var JwsFormat;
(function (JwsFormat) {
    JwsFormat["COMPACT"] = "JWS_COMPACT";
    JwsFormat["FLAT"] = "JWS_FLATTENED";
    JwsFormat["FULL"] = "JWS_ULL";
})(JwsFormat || (JwsFormat = {}));
const JWSSEPARATOR = '.';
const REGEX_FLAT = /e[yw][A-Za-z0-9-_]+/;
const REGEX_COMPACT = /e[yw][A-Za-z0-9-_]+\.(e[yw][A-Za-z0-9-_]+\.)?[A-Za-z0-9-_]+/;
class Jws {
    protected = {
        alg: ''
    };
    payload = {
        iat: 0
    };
    signature = '';
    constructor(header, payload, signature = '') {
        this.protected = header;
        this.payload = payload;
        this.signature = signature;
    }
    static fromPayload(payload) {
        return new Jws({}, payload, '');
    }
    static fromObject(jws) {
        switch (jwsType(jws)) {
            case JwsFormat.FULL: {
                return new Jws(jws?.protected, jws?.payload, jws?.signature);
            }
            case JwsFormat.FLAT: {
                return new Jws(b64uToObj(jws.protected), b64uToObj(jws.payload), jws?.signature);
            }
            case JwsFormat.COMPACT: {
                return this.fromCompact(jws);
            }
        }
    }
    static fromCompact(jws) {
        if (jwsType(jws) !== JwsFormat.COMPACT) {
            throw new TypeError('Invalid compact serialised JWS string');
        }
        const jwsArray = jws.split(JWSSEPARATOR);
        let header = {};
        if (jwsArray.length > 0)
            header = b64uToObj(jwsArray[0]);
        let payload = {};
        if (jwsArray.length > 1)
            payload = b64uToObj(jwsArray[1]);
        let signature = '';
        if (jwsArray.length > 2)
            signature = jwsArray[2];
        return new Jws(header, payload, signature);
    }
    isSigned() {
        return (this.signature.length > 0);
    }
    getSignInput() {
        if (!this.isSigned()) {
            this.payload.iat = Math.floor(Date.now() / 1000);
        }
        return objToB64u(this.protected) + JWSSEPARATOR + objToB64u(this.payload);
    }
    setSignAlgorithm(algorithm) {
        if (this.isSigned())
            return false;
        this.protected.alg = algorithm;
        return true;
    }
    setSignature(signature) {
        if (this.isSigned())
            return false;
        if (!isBase64u(signature)) {
            throw new TypeError('Signature is not base64url encoded');
        }
        this.signature = signature;
        return true;
    }
    getSignature() {
        return this.signature;
    }
    toFull() {
        return {
            protected: this.protected,
            payload: this.payload,
            signature: this.signature
        };
    }
    toFlat() {
        return {
            protected: objToB64u(this.protected),
            payload: objToB64u(this.payload),
            signature: this.signature
        };
    }
    toCompact() {
        let compactJws = objToB64u(this.protected)
            + JWSSEPARATOR
            + objToB64u(this.payload);
        if (this.isSigned()) {
            compactJws = compactJws
                + JWSSEPARATOR
                + this.signature;
        }
        return compactJws;
    }
}
function jwsType(jws) {
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
