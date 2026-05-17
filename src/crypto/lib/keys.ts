'use strict';
/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic keys module
 */
export {
    ExtKeyAlgorithm,
    ExtCryptoKey,
    ExtCryptoKeyPair,
    RawKeyPair,
    createExtKey,
    useExtKey,
    exportExtKey,
    createKeyPair,
    createExtKeyPair,
    generateEcdhKeyPair,
    generateSignKeyPair,
    createAesKey,
    createHmacKey,
    createEcdhPubkey,
    createSignPubkey
};

/* Dependencies */
import { ByteArray } from '@whiteflagprotocol/util';

/* Module imports */
import { getSignParams, SignAlgorithm } from './sign.ts';
import { generateEcdhRawKeyPair } from './ecdh.ts'
import {
    BYTELENGTH,
    DEFAULT_WF_ECDHCURVE,
    DEFAULT_WF_ENCRYPTALG,
    DEFAULT_HASHALG,
    ECDH,
    HMAC
} from './constants.ts';

/* Keys */
const RAWKEY = 'raw';
const EXTRACTABLE = true;
const NOTEXTRACTABLE = false;

/* PRIVATE MODULE DATA */
/** The map object holding the raw keys */
let _keymap: WeakMap<ExtCryptoKey,ByteArray> = new WeakMap();

/* MODULE DECLARATIONS */
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
class ExtCryptoKey implements CryptoKey {
    /* PROPERTIES */
    public readonly algorithm: ExtKeyAlgorithm;
    public readonly extractable: boolean;
    public readonly type: KeyType;
    public readonly usages: KeyUsage[];

    /* CONSTRUCTOR */
    /**
     * Constructs an obejct that represents a generic cryptographic key
     * @param type the key type, i.e. private, public, or secret
     * @param algorithm the algorithm for which the key is created
     * @param extractable indicates whether or not the raw key may be extracted using `exportExtKey()`
     * @param usages operations that the cryptographic key can perform
     */
    constructor(type: KeyType, algorithm: ExtKeyAlgorithm, extractable = NOTEXTRACTABLE, usages: KeyUsage[] = []) {
        this.type = type;
        this.algorithm = algorithm;
        this.usages = usages;
        this.extractable = extractable;
        Object.freeze(this);
    }
}

/* MODULE FUNCTIONS */
/**
 * Creates an extended Web Crypto API-like cryptographic key
 * @param rawKey the raw binary cryptographic key
 * @param type the key type, i.e. private, public, or secret
 * @param algorithm the algorithm for which the key is created
 * @param usages operations that the cryptographic key can perform
 * @param extractable indicates whether or not the raw key may be extracted using `exportExtKey()`
 */
function createExtKey(rawKey: ByteArray, type: KeyType, algorithm: ExtKeyAlgorithm, extractable: boolean, usages: KeyUsage[]): ExtCryptoKey {
    const key = new ExtCryptoKey(type, algorithm, extractable, usages);
    _keymap.set(key, rawKey);
    return key;
}
/**
 * Retrieves the raw binary key of an extended Web Crypto API-like cryptographic key
 * @param key the extended Web Crypto API-like cryptographic key object
 * @returns the raw binary cryptographic key
 */
function useExtKey(key: ExtCryptoKey): ByteArray {
    const rawKey = _keymap.get(key);
    if (!rawKey) throw ReferenceError('Could not retrieve raw key')
    return rawKey;
}
/**
 * Exports the raw binary key of an extended Web Crypto API-like cryptographic key
 * @param key the extended Web Crypto API-like cryptographic key object
 * @returns the raw binary cryptographic key
 */
function exportExtKey(key: ExtCryptoKey): ByteArray {
    if (!key.extractable) throw new Error('Cannot export a non-extractable key');
    return useExtKey(key);
}
/**
 * Creates a Web Crypto API cryptographic key pair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns a key pair
 * @remarks This function is a generic implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
function createKeyPair(privateKey: CryptoKey, publicKey: CryptoKey): CryptoKeyPair {
    if (privateKey.type !== 'private') throw new TypeError(`Cannot use ${privateKey.type} key as private key`);
    if (publicKey.type !== 'public') throw new TypeError(`Cannot use ${publicKey.type} key as public key`);
    if (publicKey.algorithm.name !== privateKey.algorithm.name) {
        throw new TypeError('Private key algorithm does not match public key algorithm');
    }
    return {
        privateKey: privateKey,
        publicKey: publicKey
    }
}
/**
 * Creates an extended Web Crypto API-like cryptographic key pair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns an extended key pair
 * @remarks This function is an extended implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
function createExtKeyPair(privateKey: ExtCryptoKey, publicKey: ExtCryptoKey): ExtCryptoKeyPair {
    return createKeyPair(privateKey, publicKey);
}
/**
 * Generates a Web Crypto API-like ECDH key pair
 * @param curve the predefined elliptic curve to use
 * @returns a new ECDH key pair
 */
async function generateEcdhKeyPair(curve: string = DEFAULT_WF_ECDHCURVE): Promise<ExtCryptoKeyPair> {
    /* Generate raw ECDH key pair */
    const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair(curve);

    /* Return as extended crypto key pair */
    const ecdhAlgorithm = { name: ECDH, namedCurve: curve }
    return createExtKeyPair(
        createExtKey(rawPrivateKey, 'private', ecdhAlgorithm, NOTEXTRACTABLE, ['deriveBits','deriveKey']),
        createExtKey(rawPublicKey, 'public', ecdhAlgorithm, EXTRACTABLE, ['deriveBits','deriveKey'])
    )
}
/**
 * Generates a new Web Crypto API digital signature key pair for the specified algorithm
 * @param algorithm the signature algorithm
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns a new key pair for signing data
 */
async function generateSignKeyPair(algorithm = SignAlgorithm.ES256,
                                   extractable = NOTEXTRACTABLE
                                ): Promise<CryptoKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
        getSignParams(algorithm),
        extractable,
        ['sign','verify']
    );
    if (!Object.hasOwn(keyPair, 'privateKey')) throw new TypeError('Generated key pair is missing private key');
    if (!Object.hasOwn(keyPair, 'publicKey')) throw new TypeError('Generated key pair is missing public key');
    return keyPair as CryptoKeyPair;
}
/**
 * Creates a Web Crypto API AES encryption and decryption key
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the AES encryption key
 */
async function createAesKey(rawKey: ByteArray,
                            algorithm: string = DEFAULT_WF_ENCRYPTALG,
                            extractable = NOTEXTRACTABLE
                        ): Promise<CryptoKey> {
    const aesAlgorithm: AesKeyAlgorithm = {
        name: algorithm,
        length: rawKey.length * BYTELENGTH
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        aesAlgorithm,
        extractable,
        ['encrypt','decrypt']
    );
}
/**
 * Creates a Web Crypto API  HMAC signing key
 * @param rawKey the raw HMAC signing key
 * @param algorithm the hashing algorithm, default is SHA-256
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the HMAC signing key
 */
async function createHmacKey(rawKey: ByteArray,
                             algorithm: string = DEFAULT_HASHALG,
                             extractable = NOTEXTRACTABLE
                        ): Promise<CryptoKey> {
    const hmacAlgorithm: HmacImportParams = {
        name: HMAC,
        hash: { name: algorithm }
    };
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        hmacAlgorithm,
        extractable,
        ['sign']
    );
}
/**
 * Creates a Web Crypto API-like ECDH public key
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the ECDH public key
 */
async function createEcdhPubkey(rawKey: ByteArray,
                                curve: string = DEFAULT_WF_ECDHCURVE,
                                extractable = NOTEXTRACTABLE
                            ): Promise<ExtCryptoKey> {
    const ecdhAlgorithm: ExtKeyAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    }
    return createExtKey(
        rawKey,
        'public',
        ecdhAlgorithm,
        extractable,
        ['deriveBits','deriveKey'],
    );
}
/**
 * Creates a Web Crypto API digital signature public key
 * @param rawKey the raw public key
 * @param algorithm the digital signature algorithm, default is ES256
 * @param extractable indicates whether or not the raw key may be extracted
 * @returns the digital signature public key
 */
async function createSignPubkey(rawKey: ByteArray,
                                algorithm: SignAlgorithm.ES256,
                                extractable = NOTEXTRACTABLE
                            ): Promise<CryptoKey> {
    const signAlgorithm = getSignParams(algorithm);
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        signAlgorithm,
        extractable,
        ['verify']
    );
}
