'use strict';
export { sign, verify, SignAlgorithm, getSignParams };
import { DEFAULT_HASHALG, ECDSA, Ed25519, ES256_CURVE, RSA_SSA_PSS, RSA_SSA_PKCS1, RSA_MODLENGTH, RSA_PUBEXP } from "./constants.js";
var SignAlgorithm;
(function (SignAlgorithm) {
    SignAlgorithm["RS256"] = "RS256";
    SignAlgorithm["PS256"] = "PS256";
    SignAlgorithm["ES256"] = "ES256";
    SignAlgorithm["Ed25519"] = "Ed25519";
})(SignAlgorithm || (SignAlgorithm = {}));
async function sign(data, keypair, alg) {
    return crypto.subtle.sign(getSignParams(alg), keypair.privateKey, data);
}
async function verify(data, signature, publicKey, alg) {
    return crypto.subtle.verify(getSignParams(alg), publicKey, signature, data);
}
function getSignParams(alg) {
    switch (alg) {
        case SignAlgorithm.RS256: {
            return {
                name: RSA_SSA_PKCS1,
                modulusLength: RSA_MODLENGTH,
                publicExponent: RSA_PUBEXP,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        case SignAlgorithm.PS256: {
            return {
                name: RSA_SSA_PSS,
                saltLength: 32,
                modulusLength: RSA_MODLENGTH,
                publicExponent: RSA_PUBEXP,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        case SignAlgorithm.ES256: {
            return {
                name: ECDSA,
                namedCurve: ES256_CURVE,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        case SignAlgorithm.Ed25519: {
            return {
                name: Ed25519
            };
        }
        default: {
            throw new Error(`Invalid signature algorithm: ${alg}`);
        }
    }
}
