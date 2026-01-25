/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation functions
 */
export {
    generateEcdhKeypair,
    deriveEcdhSecret
};

/* Dependencies */
import { createECDH } from 'node:crypto';
import { hexToU8a } from "@whiteflagprotocol/util";

/* Module imports */
import { ExtCryptoKey, ExtCryptoKeyPair, createKeypair } from "./keys.ts";

/* Constants */
const ECDHALG = 'ECDH';
const ECDHCURVE = 'brainpoolP256r1';
const KEYENCODING = 'hex';

/* MODULE FUNCTIONS */
/**
 * Generates an ECDH key pair
 * @returns a new ECDH key pair
 */
async function generateEcdhKeypair(): Promise<CryptoKeyPair> {
    const ecdh = createECDH(ECDHCURVE);
    const ecdhAlgorithm = {
            name: ECDHALG,
            namedCurve: ECDHCURVE,
    }
    const rawPublicKey = ecdh.generateKeys(KEYENCODING, 'compressed');
    const rawPrivateKey = ecdh.getPrivateKey(KEYENCODING);
    return createKeypair(
        new ExtCryptoKey(
            hexToU8a(rawPrivateKey),
            'private',
            ecdhAlgorithm,
            ["deriveBits", "deriveKey"]
        ),
        new ExtCryptoKey(
            hexToU8a(rawPublicKey),
            'public',
            ecdhAlgorithm,
            ["deriveBits", "deriveKey"]
        ),
    )
}
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @param privateKey the key pair with one's own secret key
 * @param publicKey the other's public key
 * @returns a shared secret
 */
async function deriveEcdhSecret(keypair: ExtCryptoKeyPair, pubkey: ExtCryptoKey): Promise<Uint8Array<ArrayBuffer>> {
    const ecdh = createECDH(ECDHCURVE);
    ecdh.setPrivateKey(keypair.privateKey.toHex(), KEYENCODING);
    return hexToU8a(ecdh.computeSecret(pubkey.toHex(), KEYENCODING, KEYENCODING));
}
