/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation module
 */
export { generateEcdhRawKeyPair, deriveEcdhRawSecret, deriveEcdhSecret };
import { ByteArray } from '@whiteflagprotocol/util';
import { ExtCryptoKey, ExtCryptoKeyPair, RawKeyPair } from './keys.ts';
/**
 * Generates a raw ECDH key pair
 * @param curve the predefined elliptic curve to use
 * @returns an object with a raw private key and a raw public key
 */
declare function generateEcdhRawKeyPair(curve?: string): RawKeyPair;
/**
 * Derives a shared secret from a raw private key and someone else's raw public key
 * @param privateKey one's own raw private key
 * @param publicKey the other's raw public key
 * @param curve the predefined elliptic curve to use
 * @returns a shared secret
 */
declare function deriveEcdhRawSecret(privateKey: ByteArray, publicKey: ByteArray, curve?: string): ByteArray;
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @param keypair the key pair with one's own private key
 * @param pubkey the other's public key
 * @returns a shared secret
 */
declare function deriveEcdhSecret(keypair: ExtCryptoKeyPair, pubkey: ExtCryptoKey): Promise<ByteArray>;
