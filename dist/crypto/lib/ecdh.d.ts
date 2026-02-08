/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation module
 */
export { deriveEcdhSecret };
import { ExtCryptoKey, ExtCryptoKeyPair } from './keys.ts';
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @function deriveEcdhSecret
 * @param keypair the key pair with one's own secret key
 * @param pubkey the other's public key
 * @returns a shared secret
 */
declare function deriveEcdhSecret(keypair: ExtCryptoKeyPair, pubkey: ExtCryptoKey, curve?: string): Promise<Uint8Array<ArrayBuffer>>;
