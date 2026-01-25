'use strict';
/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic key generation functions
 */
export {
    WfCryptoKey,
    WfCryptoKeyPair,
    WfKeyAlgorithm,
    createKeypair,
    createAesKey,
    createHmacKey,
    createEcdhPubkey
};

/* Dependencies */
import { u8aToHex } from "@whiteflagprotocol/util";

/* Constants */
const BYTELENGTH = 8;
const RAWKEY = 'raw';
const NOTEXTRACTABLE = false;
const DEFAULT_HASHALG = 'SHA-256';
const DEFAULT_ENCRYPTALG = 'AES-CTR';
const DEFAULT_ECDHCURVE = 'brainpoolP256r1';
const ECDH = 'ECDH';
const HMAC = 'HMAC';

/* MODULE DECLARATIONS */
/**
 * An interface that extends the KeyAlgortihm interface to specify which
 * algorithm a cryptographic key supports
 * @interface WfKeyAlgorithm
 * @remark This interface is an extention of the Web Crypto API
 * KeyAlgorithm interface for algorithms or curves that are currently not
 * supported by the Web Crypto API.
 */
interface WfKeyAlgorithm extends KeyAlgorithm {
    name: string;
    hash?: KeyAlgorithm;
    length?: number;
    namedCurve?: string;
}
/**
 * An interface that extends the CryptoKeyPair interface to create key pairs
 * from WfCryptoKey classes
 * @interface WfKeyAlgorithm
 * @remark This interface is an extention of the Web Crypto API
 * CryptoKeyPair interface for keys used for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
interface WfCryptoKeyPair extends CryptoKeyPair {
    privateKey: WfCryptoKey;
    publicKey: WfCryptoKey
}
/**
 * A class that implements the CryptoKey interface to respresent a crytpographic key
 * @class WfCryptoKey
 * @remark This class is an extended implementation for the Web Crypto API
 * CryptoKey interface to hold keys for algorithms or curves that are
 * currently not supported by the Web Crypto API.
 */
class WfCryptoKey implements CryptoKey {
    private readonly data: Uint8Array;
    public type: KeyType;
    public algorithm: WfKeyAlgorithm;
    public usages: KeyUsage[];
    public extractable = true;

    /* CONSTRUCTOR */
    /**
     * Constructor for a generic cryptographic key pair
     * @param privateKey The private key of the key pair
     * @param publicKey The public key of the key pair
     */
    constructor(keyData: Uint8Array<ArrayBuffer>, type: KeyType, algorithm: WfKeyAlgorithm, usages: KeyUsage[]) {
        this.data = keyData;
        this.type = type;
        this.algorithm = algorithm;
        this.usages = usages;
        Object.freeze(this);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Returns the raw key
     * @returns the key as a hexadcimal string
     */
    public toHex(): string {
        return u8aToHex(this.data)
    }
    /**
     * Returns the raw key
     * @returns the key as a byte array
     */
    public toU8a(): Uint8Array {
        return this.data;
    }
}

/* MODULE FUNCTIONS */
/**
 * Creates a cryptographic key pair
 * @function createKeypair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns a key pair
 * @remark This function is a generic implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
function createKeypair(privateKey: WfCryptoKey, publicKey: WfCryptoKey): WfCryptoKeyPair {
    if (privateKey.type !== 'private') throw new Error(`Cannot use ${privateKey.type} key as private key`);
    if (publicKey.type !== 'public') throw new Error(`Cannot use ${publicKey.type} key as public key`);
    if (publicKey.algorithm.name !== privateKey.algorithm.name) {
        throw new Error('Private key algorithm does not match public key algorithm');
    }
    return {
        privateKey: privateKey,
        publicKey: publicKey,
    }
}
/**
 * Creates an AES encryption and decryption key Web Crypto API object
 * @function createAesKey
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
async function createAesKey(rawKey: Uint8Array<ArrayBuffer>,
                            algorithm: string = DEFAULT_ENCRYPTALG
                        ): Promise<CryptoKey> {
    const aesAlgorithm: AesKeyAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        aesAlgorithm,
        NOTEXTRACTABLE,
        ['encrypt', 'decrypt']
    );
}
/**
 * Creates an HMAC signing key Web Crypto API object
 * @function createHmacKey
 * @param rawKey the raw HMAC signing key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @returns the HMAC signing key
 */
async function createHmacKey(rawKey: Uint8Array<ArrayBuffer>,
                             algorithm: string = DEFAULT_HASHALG
                        ): Promise<CryptoKey> {
    const hmacAlgorithm: HmacImportParams = {
        name: HMAC,
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        hmacAlgorithm,
        NOTEXTRACTABLE,
        ['sign']
    );
}
/**
 * Creates an ECDH public key Web Crypto API object
 * @function createEcdhPubkey
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @returns the ECDH public key
 */
async function createEcdhPubkey(rawKey: Uint8Array<ArrayBuffer>,
                                curve: string = DEFAULT_ECDHCURVE
                            ): Promise<WfCryptoKey> {
    const ecdhAlgorithm: WfKeyAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    }
    return new WfCryptoKey(
        rawKey,
        'public',
        ecdhAlgorithm,
        ['deriveBits', 'deriveKey']
    );
}
