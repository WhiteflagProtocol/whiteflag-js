/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic key generation functions
 */
export { ExtCryptoKey, ExtCryptoKeyPair, ExtKeyAlgorithm, createKeypair, createAesKey, createHmacKey, createEcdhPubkey };
/**
 * An interface that extends the KeyAlgortihm interface to specify which
 * algorithm a cryptographic key supports
 * @interface ExtKeyAlgorithm
 * @remark This interface is a generic extention of the Web Crypto API
 * KeyAlgorithm interface for algorithms or curves that are currently not
 * supported by the Web Crypto API.
 */
interface ExtKeyAlgorithm extends KeyAlgorithm {
    name: string;
    hash?: KeyAlgorithm;
    length?: number;
    namedCurve?: string;
}
interface ExtCryptoKeyPair extends CryptoKeyPair {
    privateKey: ExtCryptoKey;
    publicKey: ExtCryptoKey;
}
/**
 * A class that implements the CryptoKey interface to respresent a crytpographic key
 * @class ExtCryptoKey
 * @remark This class is an extended implementation for the Web Crypto API
 * CryptoKey interface to hold keys for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
declare class ExtCryptoKey implements CryptoKey {
    private readonly data;
    type: KeyType;
    algorithm: ExtKeyAlgorithm;
    usages: KeyUsage[];
    extractable: boolean;
    /**
     * Constructor for a generic cryptographic key pair
     * @param privateKey The private key of the key pair
     * @param publicKey The public key of the key pair
     */
    constructor(keyData: Uint8Array<ArrayBuffer>, type: KeyType, algorithm: ExtKeyAlgorithm, usages: KeyUsage[]);
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
 * Creates a cryptographic key pair
 * @function createKeypair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns a key pair
 * @remark This function is a generic implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
declare function createKeypair(privateKey: ExtCryptoKey, publicKey: ExtCryptoKey): CryptoKeyPair;
/**
 * Creates an AES encryption and decryption key Web Crypto API object
 * @function createAesKey
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
declare function createAesKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
/**
 * Creates an HMAC signing key Web Crypto API object
 * @function createHmacKey
 * @param rawKey the raw HMAC signing key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @returns the HMAC signing key
 */
declare function createHmacKey(rawKey: Uint8Array<ArrayBuffer>, algorithm?: string): Promise<CryptoKey>;
/**
 * Creates an ECDH public key Web Crypto API object
 * @function createEcdhPubkey
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @returns the ECDH public key
 */
declare function createEcdhPubkey(rawKey: Uint8Array<ArrayBuffer>, curve?: string): Promise<ExtCryptoKey>;
