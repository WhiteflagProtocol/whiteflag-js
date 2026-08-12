'use strict';
export { generateEcdhRawKeyPair, deriveEcdhRawSecret, deriveEcdhSecret };
import { createECDH } from 'node:crypto';
import { noString } from '@whiteflagprotocol/common';
import { objectHas } from '@whiteflagprotocol/util';
import { useExtKey } from "./keys.js";
import { ECDH, DEFAULT_WF_ECDHCURVE } from "./constants.js";
function generateEcdhRawKeyPair(curve = DEFAULT_WF_ECDHCURVE) {
    const ecdh = createECDH(curve);
    return {
        rawPublicKey: new Uint8Array(ecdh.generateKeys()),
        rawPrivateKey: new Uint8Array(ecdh.getPrivateKey())
    };
}
function deriveEcdhRawSecret(privateKey, publicKey, curve = DEFAULT_WF_ECDHCURVE) {
    const ecdh = createECDH(curve);
    ecdh.setPrivateKey(privateKey);
    return new Uint8Array(ecdh.computeSecret(publicKey));
}
async function deriveEcdhSecret(keypair, pubkey) {
    if (!objectHas(keypair, 'privateKey'))
        throw new TypeError(`Key pair does not contain private key`);
    if (keypair.privateKey?.type !== 'private')
        throw new TypeError(`Key pair contains invalid private key`);
    if (keypair.privateKey?.algorithm?.name !== ECDH)
        throw TypeError(`Private key algorithm is not for ${ECDH} secret negotiation`);
    const curve = keypair.privateKey.algorithm.namedCurve || noString(`Private key is missing the named curve paramter`);
    if (pubkey?.type !== 'public')
        throw new TypeError(`Invalid public key`);
    if (pubkey?.algorithm?.name !== ECDH)
        throw TypeError(`Public key algorithm is not for ${ECDH} secret negotiation`);
    if (pubkey?.algorithm?.namedCurve !== curve)
        throw new Error(`Public key does not macth the private key's curve ${curve}`);
    return deriveEcdhRawSecret(useExtKey(keypair.privateKey), useExtKey(pubkey), curve);
}
