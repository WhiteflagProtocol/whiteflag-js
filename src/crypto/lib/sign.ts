'use strict';
/**
 * @module crypto/sign
 * @summary Whiteflag JS cryptographic signatures module
 */
export {
    sign,
    verify,
    SignAlgorithm,
    getSignParams
};

/* Module imports */
import {
    DEFAULT_HASHALG,
    ECDSA,
    Ed25519,
    ES256_CURVE,
    RSA_SSA_PSS,
    RSA_SSA_PKCS1,
    RSA_MODLENGTH,
    RSA_PUBEXP
} from './constants.ts';

/* MODULE DECLARATIONS */
/**
 * Supported digital signature algorithms
 * @enum SignAlgorithm
 */
enum SignAlgorithm {
    /** RSASSA-PKCS1-v1_5 using SHA-256 (RFC 3447) */
    RS256 = 'RS256',
    /** RSASSA-PSS using SHA-256 (RFC 3447) */
    PS256 = 'PS256',
    /** ECDSA using P-256 and SHA-256 (FIPS 186-5) */
    ES256 = 'ES256',
    /** EdDSA based on Curve25519 (RFC 8032) */
    Ed25519 = 'Ed25519'
}

/* MODULE FUNCTIONS */
/**
 * Creates a digital signature
 * @function sign
 * @param data the data to be signed
 * @param keypair the keypair with which to sign the data
 * @param alg the digital signature algorithm
 * @returns the digital signature
 */
async function sign(data: Uint8Array<ArrayBuffer>,
                    keypair: CryptoKeyPair,
                    alg: SignAlgorithm
                ): Promise<ArrayBuffer> {
    return crypto.subtle.sign(getSignParams(alg), keypair.privateKey, data);
}
/**
 * Verifies a digital signature
 * @function verify
 * @param data the data that has been signed
 * @param signature the digital signature
 * @param publicKey the public key corresponding to the private key used for signing the data
 * @param alg the digital signature algorithm
 * @returns true if signature is valid, else false
 */
async function verify(data: Uint8Array<ArrayBuffer>,
                      signature: Uint8Array<ArrayBuffer>,
                      publicKey: CryptoKey,
                      alg: SignAlgorithm
                    ): Promise<boolean> {
    return crypto.subtle.verify(getSignParams(alg), publicKey, signature, data);
}
/**
 * Returns a Web Crypto API algorithm object
 * @private
 * @param alg the digital signature algorithm
 * @returns a Web Crypto API algorthm object
 */
function getSignParams(alg: SignAlgorithm): Algorithm | RsaPssParams | RsaHashedKeyGenParams | RsaPssParams | EcdsaParams | EcKeyGenParams {
    /* Choose codec based on field encoding */
    switch (alg) {
        /* RSASSA-PKCS1-v1_5 using SHA-256 */
        case SignAlgorithm.RS256: {
            return {
                name: RSA_SSA_PKCS1,
                modulusLength: RSA_MODLENGTH,
                publicExponent: RSA_PUBEXP,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        /* RSASSA-PSS using SHA-256 using SHA-256 */
        case SignAlgorithm.PS256: {
            return {
                name: RSA_SSA_PSS,
                saltLength: 32,
                modulusLength: RSA_MODLENGTH,
                publicExponent: RSA_PUBEXP,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        /* ECDSA using P-256 and SHA-256 */
        case SignAlgorithm.ES256: {
            return {
                name: ECDSA,
                namedCurve: ES256_CURVE,
                hash: { name: DEFAULT_HASHALG }
            };
        }
        /* EdDSA based on Curve25519 */
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
