'use strict';
/**
 * @module crypto/keys
 * @summary Whiteflag JS cryptographic keys module
 */
export {
    ExtCryptoKey,
    ExtCryptoKeyPair,
    ExtKeyAlgorithm,
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
import { createECDH } from 'node:crypto';
import { hexToU8a, u8aToHex } from "@whiteflagprotocol/util";

/* Module imports */
import { getSignParams, SignAlgorithm } from "./sign.ts";
import {
    BYTELENGTH,
    HEXENCODING,
    RAWKEY,
    EXTRACTABLE,
    NOTEXTRACTABLE,
    DEFAULT_ECDHCURVE,
    DEFAULT_ENCRYPTALG,
    DEFAULT_HASHALG,
    ECDH,
    HMAC
} from './constants.ts';

/* MODULE DECLARATIONS */
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
class ExtCryptoKey implements CryptoKey {
    /* PROPERTIES */
    protected readonly rawKey: ArrayBuffer;
    public readonly type: KeyType;
    public readonly extractable = EXTRACTABLE;
    public readonly algorithm: ExtKeyAlgorithm;
    public readonly usages: KeyUsage[];

    /* CONSTRUCTOR */
    /**
     * Constructor for a generic cryptographic key
     * @param rawKey the raw binary cryptographic key
     * @param type the key type, i.e. private, public, or secret
     * @param algorithm the algortihm for which the key is created
     * @param usages operations that the cryptographic key can perform
     */
    constructor(rawKey: Uint8Array<ArrayBuffer>, type: KeyType, algorithm: ExtKeyAlgorithm, usages: KeyUsage[]) {
        this.rawKey = rawKey.buffer;
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
        return u8aToHex(this.toU8a());
    }
    /**
     * Returns the raw key
     * @returns the key as a byte array
     */
    public toU8a(): Uint8Array {
        return new Uint8Array(this.rawKey);
    }
}

/* MODULE FUNCTIONS */
/**
 * Creates a Web Crypto API cryptographic key pair
 * @function createKeyPair
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
 * @function createExtKeyPair
 * @param privateKey the private key
 * @param publicKey the corresponding public key
 * @returns an extended key pair
 * @remarks This function is an extended implementation of the Web Crypto API
 * CryptoKeyPair interface.
 */
function createExtKeyPair(privateKey: ExtCryptoKey, publicKey: ExtCryptoKey): ExtCryptoKeyPair {
    return createKeyPair(privateKey, publicKey) as ExtCryptoKeyPair;
}
/**
 * Generates a Web Crypto API-like ECDH key pair
 * @function generateEcdhKeyPair
 * @returns a new ECDH key pair
 */
async function generateEcdhKeyPair(curve: string = DEFAULT_ECDHCURVE): Promise<ExtCryptoKeyPair> {
    const ecdh = createECDH(curve);
    const ecdhAlgorithm = {
            name: ECDH,
            namedCurve: curve,
    }
    const rawPublicKey = ecdh.generateKeys(HEXENCODING, 'compressed');
    const rawPrivateKey = ecdh.getPrivateKey(HEXENCODING);
    return createExtKeyPair(
        new ExtCryptoKey(
            hexToU8a(rawPrivateKey),
            'private',
            ecdhAlgorithm,
            ['deriveBits', 'deriveKey']
        ),
        new ExtCryptoKey(
            hexToU8a(rawPublicKey),
            'public',
            ecdhAlgorithm,
            ['deriveBits', 'deriveKey']
        ),
    )
}
/**
 * Generates a new Web Crypto API digital signature key pair for the specified algorithm
 * @function generateSignKeyPair
 * @param alg the signature algorithm
 * @returns a new key pair for signing data
 */
async function generateSignKeyPair(alg = SignAlgorithm.ES256): Promise<CryptoKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
        getSignParams(alg),
        EXTRACTABLE,
        [ 'sign', 'verify' ]
    );
    if (!Object.hasOwn(keyPair, 'privateKey')) throw new TypeError('Generated key pair is missing private key');
    if (!Object.hasOwn(keyPair, 'publicKey')) throw new TypeError('Generated key pair is missing public key');
    return keyPair as CryptoKeyPair;
}
/**
 * Creates a Web Crypto API AES encryption and decryption key
 * @function createAesKey
 * @param rawKey the raw AES key
 * @param algorithm the AES mode to use the key for, default is CTR mode
 * @returns the AES enrcyption key
 */
async function createAesKey(rawKey: Uint8Array<ArrayBuffer>,
                            algorithm: string = DEFAULT_ENCRYPTALG
                        ): Promise<CryptoKey> {
    const aesAlgorithm: AesKeyAlgorithm = {
        name: algorithm as string,
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
 * Creates a Web Crypto API  HMAC signing key
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
        hash: { name: algorithm as string }
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
 * Creates a Web Crypto API-like ECDH public key
 * @function createEcdhPubkey
 * @param rawKey the raw ECDH public key
 * @param curve the ECDH curve, default is brainpoolP256r1
 * @returns the ECDH public key
 */
async function createEcdhPubkey(rawKey: Uint8Array<ArrayBuffer>,
                                curve: string = DEFAULT_ECDHCURVE
                            ): Promise<ExtCryptoKey> {
    const ecdhAlgorithm: ExtKeyAlgorithm = {
        name: ECDH,
        namedCurve: curve,
    }
    return new ExtCryptoKey(
        rawKey,
        'public',
        ecdhAlgorithm,
        ['deriveBits', 'deriveKey']
    );
}
/**
 * Creates a Web Crypto API digital signature public key
 * @function createSignPubkey
 * @param rawKey the raw public key
 * @param algorithm the digital signature algorithm, default is ES256
 * @returns the digital signature public key
 */
async function createSignPubkey(rawKey: Uint8Array<ArrayBuffer>,
                             algorithm: SignAlgorithm.ES256
                        ): Promise<CryptoKey> {
    const signAlgorithm = getSignParams(algorithm);
    return crypto.subtle.importKey(
        RAWKEY,
        rawKey.buffer,
        signAlgorithm,
        NOTEXTRACTABLE,
        ['verify']
    );
}
