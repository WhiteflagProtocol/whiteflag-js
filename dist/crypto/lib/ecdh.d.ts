/**
 * @module crypto/ecdh
 * @summary Whiteflag JS ECDH secret negotiation functions
 */
export { generateEcdhKeypair, deriveEcdhSecret };
import { WfCryptoKey, WfCryptoKeyPair } from "./keys.ts";
/**
 * Generates an ECDH key pair
 * @returns a new ECDH key pair
 */
declare function generateEcdhKeypair(): Promise<WfCryptoKeyPair>;
/**
 * Derives a shared secret from a key pair and someone else's public key
 * @param privateKey the key pair with one's own secret key
 * @param publicKey the other's public key
 * @returns a shared secret
 */
declare function deriveEcdhSecret(keypair: WfCryptoKeyPair, pubkey: WfCryptoKey): Promise<Uint8Array<ArrayBuffer>>;
