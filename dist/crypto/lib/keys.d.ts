/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic keys module
 */
export { ExtCryptoKey, ExtCryptoKeyPair, ExtKeyAlgorithm, createKeyPair, createExtKeyPair, generateEcdhKeyPair, generateSignKeyPair, createAesKey, createHmacKey, createEcdhPubkey, createSignPubkey };
import { SignAlgorithm } from "./sign.ts";
/**
 * An interface that extends the KeyAlgortihm interface to specify which
 * algorithm a cryptographic key supports
 * @interface ExtKeyAlgorithm
 * @remarks This interface is an extention of the Web Crypto API
 * KeyAlgorithm interface for algorithms or curves that are currently not
 * supported by the Web Crypto API.
 */
interface ExtKeyAlgorithm extends KeyAlgorithm {
    name: string;
    hash?: KeyAlgorithm;
    length?: number;
    namedCurve?: string;
}
/**
 * An interface that extends the CryptoKeyPair interface to create key pairs
 * from ExtCryptoKey classes
 * @interface ExtKeyAlgorithm
 * @remarks This interface is an extention of the Web Crypto API
 * CryptoKeyPair interface for keys used for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
interface ExtCryptoKeyPair extends CryptoKeyPair {
    privateKey: ExtCryptoKey;
    publicKey: ExtCryptoKey;
}
/**
 * A class that extends the CryptoKey interface to respresent a crytpographic key
 * @class ExtCryptoKey
 * @remarks This class is an extended implementation for the Web Crypto API
 * CryptoKey interface to hold keys for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
declare class ExtCryptoKey implements CryptoKey {
    protected readonly rawKey: ArrayBuffer;
    readonly type: KeyType;
    readonly extractable = true;
    readonly algorithm: ExtKeyAlgorithm;
    readonly usages: KeyUsage[];
    /**
     * Constructor for a generic cryptographic key
     * @param rawKey the raw binary cryptographic key
     * @param type the key type, i.e. private, public, or secret
     * @param algorithm the algortihm for which the key is created
     * @param usages operations that the cryptographic key can perform
     */
    constructor(rawKey: Uint8Array<ArrayBuffer>, type: KeyType, algorithm: ExtKeyAlgorithm, usages: KeyUsage[]);
    /**
     * Returns the raw key
     * @returns the key as a hexadcimal string
     */
    toHex(): string;
    /**
     * Returns the raw key
     * @returns the key as a byte array
     */
    toU8a(): Uint8Array;
}
/**
 * Creates a Web Crypto API cryptographic key pair
 * @function createKeyPair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns a key pair
 * @remarks This function is a generic implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
declare function createKeyPair(privateKey: CryptoKey, publicKey: CryptoKey): CryptoKeyPair;
/**
 * Creates an extended Web Crypto API-like cryptographic key pair
 * @function createExtKeyPair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns an extended key pair
 * @remarks This function is an extended implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
declare function createExtKeyPair(privateKey: ExtCryptoKey, publicKey: ExtCryptoKey): ExtCryptoKeyPair;
/**
 * Generates a Web Crypto API-like ECDH key pair
 * @function generateEcdhKeyPair
 * @returns a new ECDH key pair
 */
declare function generateEcdhKeyPair(curve?: string): Promise<ExtCryptoKeyPair>;
/**
 * Generates a new Web Crypto API digital signature key pair for the specified algorithm
 * @function generateSignKeyPair
 * @param alg the signature algorithm
 * @returns a new key pair for signing data
 */
declare function generateSignKeyPair(alg?: SignAlgorithm): Promise<CryptoKeyPair>;
/**
 * Creates a Web Crypto API AES encryption and decryption key
 * @function createAesKey
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
declare function createAesKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
/**
 * Creates a Web Crypto API  HMAC signing key
 * @function createHmacKey
 * @param rawKey the raw HMAC signing key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @returns the HMAC signing key
 */
declare function createHmacKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
/**
 * Creates a Web Crypto API-like ECDH public key
 * @function createEcdhPubkey
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @returns the ECDH public key
 */
declare function createEcdhPubkey(rawKey: Uint8Array<ArrayBuffer>, curve?: string): Promise<ExtCryptoKey>;
/**
 * Creates a Web Crypto API digital signature public key
 * @function createSignPubkey
 * @param rawKey the raw public key
 * @param algorithm the digital signature algorithm, default is ES256
 * @returns the digital signature public key
 */
declare function createSignPubkey(rawKey: Uint8Array<ArrayBuffer>, algorithm: SignAlgorithm.ES256): Promise<CryptoKey>;
