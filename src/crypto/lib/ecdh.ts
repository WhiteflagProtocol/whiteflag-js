'use strict';
/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation module
 */
export {
    generateEcdhRawKeyPair,
    deriveEcdhRawSecret,
    deriveEcdhSecret
};

/* Dependencies */
import { createECDH } from 'node:crypto';
import { noString } from '@whiteflagprotocol/common';
import { ByteArray, objectHas } from '@whiteflagprotocol/util';

/* Module imports */
import { ExtCryptoKey, ExtCryptoKeyPair, RawKeyPair, useExtKey } from './keys.ts';
import {
    ECDH,
    DEFAULT_WF_ECDHCURVE
} from './constants.ts';

/* MODULE FUNCTIONS */
/**
 * Generates a raw ECDH key pair
 * @param curve the predefined elliptic curve to use
 * @returns an object with a raw private key and a raw public key
 */
function generateEcdhRawKeyPair(curve: string = DEFAULT_WF_ECDHCURVE): RawKeyPair {
    const ecdh = createECDH(curve);
    return {
        rawPublicKey: new Uint8Array(ecdh.generateKeys()),
        rawPrivateKey: new Uint8Array(ecdh.getPrivateKey())
    };
}
/**
 * Derives a shared secret from a raw private key and someone else's raw public key
 * @param privateKey one's own raw private key
 * @param publicKey the other's raw public key
 * @param curve the predefined elliptic curve to use
 * @returns a shared secret
 */
function deriveEcdhRawSecret(privateKey: ByteArray, publicKey: ByteArray, curve: string = DEFAULT_WF_ECDHCURVE): ByteArray {
    const ecdh = createECDH(curve);
    ecdh.setPrivateKey(privateKey);
    return new Uint8Array(ecdh.computeSecret(publicKey));
}
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @param keypair the key pair with one's own private key
 * @param pubkey the other's public key
 * @returns a shared secret
 */
async function deriveEcdhSecret(keypair: ExtCryptoKeyPair, pubkey: ExtCryptoKey): Promise<ByteArray> {
    /* Check private key */
    if (!objectHas(keypair, 'privateKey')) throw new TypeError(`Key pair does not contain private key`);
    if (keypair.privateKey?.type !== 'private') throw new TypeError(`Key pair contains invalid private key`);
    if (keypair.privateKey?.algorithm?.name !== ECDH) throw TypeError(`Private key algorithm is not for ${ECDH} secret negotiation`);
    const curve = keypair.privateKey?.algorithm?.namedCurve || noString(`Private key is missing the named curve paramter`);

    /* Check public key */
    if (pubkey?.type !== 'public') throw new TypeError(`Invalid public key`);
    if (pubkey?.algorithm?.name !== ECDH) throw TypeError(`Public key algorithm is not for ${ECDH} secret negotiation`);
    if (pubkey?.algorithm?.namedCurve !== curve) throw new Error(`Public key does not macth the private key's curve ${curve}`);

    /* Calculate seceret for the specified curve */
    return deriveEcdhRawSecret(useExtKey(keypair.privateKey), useExtKey(pubkey), curve);
}
