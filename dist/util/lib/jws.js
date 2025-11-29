'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jws = void 0;
const encoding_1 = require("./encoding");
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
                return new Jws((0, encoding_1.b64uToObj)(jws.protected), (0, encoding_1.b64uToObj)(jws.payload), jws?.signature);
            }
            case JwsFormat.COMPACT: {
                return this.fromCompact(jws);
            }
        }
    }
    static fromCompact(jws) {
        if (jwsType(jws) !== JwsFormat.COMPACT) {
            throw new Error('Invalid compact serialised JWS string');
        }
        const jwsArray = jws.split(JWSSEPARATOR);
        let header = {};
        if (jwsArray.length > 0)
            header = (0, encoding_1.b64uToObj)(jwsArray[0]);
        let payload = {};
        if (jwsArray.length > 1)
            payload = (0, encoding_1.b64uToObj)(jwsArray[1]);
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
        return (0, encoding_1.objToB64u)(this.protected) + JWSSEPARATOR + (0, encoding_1.objToB64u)(this.payload);
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
        if (!(0, encoding_1.isBase64u)(signature)) {
            throw new Error('Signature is not base64url encoded');
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
            protected: (0, encoding_1.objToB64u)(this.protected),
            payload: (0, encoding_1.objToB64u)(this.payload),
            signature: this.signature
        };
    }
    toCompact() {
        let compactJws = (0, encoding_1.objToB64u)(this.protected)
            + JWSSEPARATOR
            + (0, encoding_1.objToB64u)(this.payload);
        if (this.isSigned()) {
            compactJws = compactJws
                + JWSSEPARATOR
                + this.signature;
        }
        return compactJws;
    }
}
exports.Jws = Jws;
function jwsType(jws) {
    if ((0, encoding_1.isString)(jws) && REGEX_COMPACT.test(jws)) {
        return JwsFormat.COMPACT;
    }
    if ((0, encoding_1.isObject)(jws)) {
        if ((0, encoding_1.isObject)(jws.protected) && (0, encoding_1.isObject)(jws.payload)) {
            return JwsFormat.FULL;
        }
        if ((0, encoding_1.isString)(jws.protected) && REGEX_FLAT.test(jws.protected)
            && (0, encoding_1.isString)(jws.payload) && REGEX_FLAT.test(jws.payload)) {
            return JwsFormat.FLAT;
        }
    }
    throw new Error('Invalid JWS representation or encoding');
}
