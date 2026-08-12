/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic keys module
 */
export { ExtKeyAlgorithm, ExtCryptoKey, ExtCryptoKeyPair, RawKeyPair, createExtKey, useExtKey, exportExtKey, createKeyPair, createExtKeyPair, generateEcdhKeyPair, generateSignKeyPair, createAesKey, createHmacKey, createEcdhPubkey, createSignPubkey };
import { ByteArray } from '@whiteflagprotocol/util';
import { SignAlgorithm } from './sign.ts';
/**
 * An interface that extends the `KeyAlgortihm` interface to specify which
 * algorithm a cryptographic key supports
 * @remarks This interface is an extention of the Web Crypto API
 * `KeyAlgorithm` interface for algorithms or curves that are currently not
 * supported by the Web Crypto API.
 */
interface ExtKeyAlgorithm extends KeyAlgorithm {
    name: string;
    hash?: KeyAlgorithm;
    length?: number;
    namedCurve?: string;
}
/**
 * An extention of the `CryptoKeyPair` interface to create key pairs
 * from `ExtCryptoKey` classes
 * @remarks This interface is an extention of the Web Crypto API
 * `CryptoKeyPair` interface for keys used for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
interface ExtCryptoKeyPair extends CryptoKeyPair {
    privateKey: ExtCryptoKey;
    publicKey: ExtCryptoKey;
}
/**
 * An object containing a pair of raw cryptograohic keys
 */
interface RawKeyPair {
    rawPublicKey: ByteArray;
    rawPrivateKey: ByteArray;
}
/**
 * An extention of the `CryptoKey` interface to respresent a crytpographic key
 * @remarks This class is an extended implementation for the Web Crypto API
 * `CryptoKey` interface to hold keys for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
declare class ExtCryptoKey implements CryptoKey {
    readonly algorithm: ExtKeyAlgorithm;
    readonly extractable: boolean;
    readonly type: KeyType;
    readonly usages: KeyUsage[];
    /**
     * Constructs an object that represents a generic cryptographic key
     * @param type the key type, i.e. private, public, or secret
     * @param algorithm the algorithm for which the key is created
     * @param extractable indicates whether or not the raw key may be extracted using `exportExtKey()`
     * @param usages operations that the cryptographic key can perform
     */
    constructor(type: KeyType, algorithm: ExtKeyAlgorithm, extractable?: boolean, usages?: KeyUsage[]);
}
/**
 * Creates an extended Web Crypto API-like cryptographic key
 * @param rawKey the raw binary cryptographic key
 * @param type the key type, i.e. private, public, or secret
 * @param algorithm the algorithm for which the key is created
 * @param usages operations that the cryptographic key can perform
 * @param extractable indicates whether or not the raw key may be extracted using `exportExtKey()`
 */
declare function createExtKey(rawKey: ByteArray, type: KeyType, algorithm: ExtKeyAlgorithm, extractable: boolean, usages: KeyUsage[]): ExtCryptoKey;
/**
 * Retrieves the raw binary key of an extended Web Crypto API-like cryptographic key
 * @param key the extended Web Crypto API-like cryptographic key object
 * @returns the raw binary cryptographic key
 */
declare function useExtKey(key: ExtCryptoKey): ByteArray;
/**
 * Exports the raw binary key of an extended Web Crypto API-like cryptographic key
 * @param key the extended Web Crypto API-like cryptographic key object
 * @returns the raw binary cryptographic key
 */
declare function exportExtKey(key: ExtCryptoKey): ByteArray;
/**
 * Creates a Web Crypto API cryptographic key pair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns a key pair
 * @remarks This function is a generic implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
declare function createKeyPair(privateKey: CryptoKey, publicKey: CryptoKey): CryptoKeyPair;
/**
 * Creates an extended Web Crypto API-like cryptographic key pair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns an extended key pair
 * @remarks This function is an extended implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
declare function createExtKeyPair(privateKey: ExtCryptoKey, publicKey: ExtCryptoKey): ExtCryptoKeyPair;
/**
 * Generates a Web Crypto API-like ECDH key pair
 * @param curve the predefined elliptic curve to use
 * @returns a new ECDH key pair
 */
declare function generateEcdhKeyPair(curve?: string): Promise<ExtCryptoKeyPair>;
/**
 * Generates a new Web Crypto API digital signature key pair for the specified algorithm
 * @param algorithm the signature algorithm
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns a new key pair for signing data
 */
declare function generateSignKeyPair(algorithm?: SignAlgorithm, extractable?: boolean): Promise<CryptoKeyPair>;
/**
 * Creates a Web Crypto API AES encryption and decryption key
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the AES encryption key
 */
declare function createAesKey(rawKey: ByteArray, algorithm?: string, extractable?: boolean): Promise<CryptoKey>;
/**
 * Creates a Web Crypto API  HMAC signing key
 * @param rawKey the raw HMAC signing key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the HMAC signing key
 */
declare function createHmacKey(rawKey: ByteArray, algorithm?: string, extractable?: boolean): Promise<CryptoKey>;
/**
 * Creates a Web Crypto API-like ECDH public key
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the ECDH public key
 */
declare function createEcdhPubkey(rawKey: ByteArray, curve?: string, extractable?: boolean): Promise<ExtCryptoKey>;
/**
 * Creates a Web Crypto API digital signature public key
 * @param rawKey the raw public key
 * @param algorithm the digital signature algorithm, default is ES256
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the digital signature public key
 */
declare function createSignPubkey(rawKey: ByteArray, algorithm: SignAlgorithm.ES256, extractable?: boolean): Promise<CryptoKey>;
