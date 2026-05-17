/**
 * @module crypto/sign
 * @summary Whiteflag JS cryptographic signatures module
 */
export { sign, verify, SignAlgorithm, getSignParams };
import { ByteArray } from '@whiteflagprotocol/util';
/** Signature parameters */
export type SignParams = RsaHashedKeyGenParams | RsaPssParams | EcdsaParams | EcKeyGenParams;
/**
 * Supported digital signature algorithms
 */
declare enum SignAlgorithm {
    /** RSASSA-PKCS1-v1_5 using SHA-256 (RFC 3447) */
    RS256 = "RS256",
    /** RSASSA-PSS using SHA-256 (RFC 3447) */
    PS256 = "PS256",
    /** ECDSA using P-256 and SHA-256 (FIPS 186-5) */
    ES256 = "ES256",
    /** EdDSA based on Curve25519 (RFC 8032) */
    Ed25519 = "Ed25519"
}
/**
 * Creates a digital signature
 * @param data the data to be signed
 * @param keypair the key pair with which to sign the data
 * @param alg the digital signature algorithm
 * @returns the digital signature
 */
declare function sign(data: ByteArray, keypair: CryptoKeyPair, alg: SignAlgorithm): Promise<ArrayBuffer>;
/**
 * Verifies a digital signature
 * @param data the data that has been signed
 * @param signature the digital signature
 * @param publicKey the public key corresponding to the private key used for signing the data
 * @param alg the digital signature algorithm
 * @returns `true` if signature is valid, else `false`
 */
declare function verify(data: ByteArray, signature: ByteArray, publicKey: CryptoKey, alg: SignAlgorithm): Promise<boolean>;
/**
 * Returns a Web Crypto API algorithm object
 * @private
 * @param alg the digital signature algorithm
 * @returns a Web Crypto API algorthm object
 */
declare function getSignParams(alg: SignAlgorithm): Algorithm | SignParams;
