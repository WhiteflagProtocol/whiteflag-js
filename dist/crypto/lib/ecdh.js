'use strict';
export { deriveEcdhSecret };
import { createECDH } from 'node:crypto';
import { hexToU8a } from '@whiteflagprotocol/util';
import { ECDH, DEFAULT_WF_ECDHCURVE, HEXENCODING } from "./constants.js";
async function deriveEcdhSecret(keypair, pubkey, curve = DEFAULT_WF_ECDHCURVE) {
    if (pubkey?.type !== 'public')
        throw new TypeError(`Invalid public key`);
    if (keypair?.privateKey?.type !== 'private')
        throw new TypeError(`Key pair contains invalid private key`);
    if (pubkey?.algorithm?.name !== ECDH)
        throw TypeError(`Public key algorithm is not for ${ECDH} secret negotiation`);
    if (keypair?.privateKey?.algorithm?.name !== ECDH)
        throw TypeError(`Private key algorithm is not for ${ECDH} secret negotiation`);
    if (pubkey?.algorithm?.namedCurve !== curve)
        throw Error(`Public key does not support the ${curve} curve`);
    if (keypair?.privateKey?.algorithm?.namedCurve !== curve)
        throw Error(`Private key does not support the ${curve} curve`);
    const ecdh = createECDH(curve);
    ecdh.setPrivateKey(keypair.privateKey.toHex(), HEXENCODING);
    return hexToU8a(ecdh.computeSecret(pubkey.toHex(), HEXENCODING, HEXENCODING));
}
