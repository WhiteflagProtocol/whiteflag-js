'use strict';
/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation module
 */
export {
    deriveEcdhSecret
};

/* Dependencies */
import { createECDH } from 'node:crypto';
import { hexToU8a } from '@whiteflagprotocol/util';

/* Module imports */
import { ExtCryptoKey, ExtCryptoKeyPair } from './keys.ts';
import {
    ECDH,
    DEFAULT_WF_ECDHCURVE,
    HEXENCODING
} from './constants.ts';

/* MODULE FUNCTIONS */
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @function deriveEcdhSecret
 * @param keypair the key pair with one's own secret key
 * @param pubkey the other's public key
 * @returns a shared secret
 */
async function deriveEcdhSecret(keypair: ExtCryptoKeyPair, pubkey: ExtCryptoKey, curve: string = DEFAULT_WF_ECDHCURVE): Promise<Uint8Array<ArrayBuffer>> {
    /* Check provided keys */
    if (pubkey?.type !== 'public') throw new TypeError(`Invalid public key`);
    if (keypair?.privateKey?.type !== 'private') throw new TypeError(`Key pair contains invalid private key`);
    if (pubkey?.algorithm?.name !== ECDH) throw TypeError(`Public key algorithm is not for ${ECDH} secret negotiation`)
    if (keypair?.privateKey?.algorithm?.name !== ECDH) throw TypeError(`Private key algorithm is not for ${ECDH} secret negotiation`)
    if (pubkey?.algorithm?.namedCurve !== curve) throw Error(`Public key does not support the ${curve} curve`)
    if (keypair?.privateKey?.algorithm?.namedCurve !== curve) throw Error(`Private key does not support the ${curve} curve`)

    /* Calculate seceret for the specified curve */
    const ecdh = createECDH(curve);
    ecdh.setPrivateKey(keypair.privateKey.toHex(), HEXENCODING);
    return hexToU8a(ecdh.computeSecret(pubkey.toHex(), HEXENCODING, HEXENCODING));
}
