'use strict';
export { generateEcdhKeypair, deriveEcdhSecret };
import { createECDH } from 'node:crypto';
import { hexToU8a } from '@whiteflagprotocol/util';
import { WfCryptoKey, createKeypair } from "./keys.js";
const ECDHALG = 'ECDH';
const ECDHCURVE = 'brainpoolP256r1';
const HEXENCODING = 'hex';
async function generateEcdhKeypair() {
    const ecdh = createECDH(ECDHCURVE);
    const ecdhAlgorithm = {
        name: ECDHALG,
        namedCurve: ECDHCURVE,
    };
    const rawPublicKey = ecdh.generateKeys(HEXENCODING, 'compressed');
    const rawPrivateKey = ecdh.getPrivateKey(HEXENCODING);
    return createKeypair(new WfCryptoKey(hexToU8a(rawPrivateKey), 'private', ecdhAlgorithm, ['deriveBits', 'deriveKey']), new WfCryptoKey(hexToU8a(rawPublicKey), 'public', ecdhAlgorithm, ['deriveBits', 'deriveKey']));
}
async function deriveEcdhSecret(keypair, pubkey) {
    const ecdh = createECDH(ECDHCURVE);
    ecdh.setPrivateKey(keypair.privateKey.toHex(), HEXENCODING);
    return hexToU8a(ecdh.computeSecret(pubkey.toHex(), HEXENCODING, HEXENCODING));
}
