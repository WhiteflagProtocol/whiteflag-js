/**
 * @module crypto
 * @summary Whiteflag JS cryptographic classes and functions
 * @document docs/md/packages.md
 * @remarks This package provides cryptographic functions for other Whiteflag
 * packages.Therefore, it should normally not be necessary to add this package
 * as a dependency.
 */
export { deriveToken } from './lib/auth.ts';
export { encryptMsg, decryptMsg, deriveKey } from './lib/cipher.ts';
export { EncryptedData, encryptData, decryptData, generateDEK } from './lib/encrypt.ts';
export { generateEcdhRawKeyPair, deriveEcdhRawSecret, deriveEcdhSecret } from './lib/ecdh.ts';
export { hkdf, hash, hmac } from './lib/hash.ts';
export { ExtKeyAlgorithm, ExtCryptoKey, ExtCryptoKeyPair, RawKeyPair, createExtKey, exportExtKey, createKeyPair, createExtKeyPair, generateEcdhKeyPair, generateSignKeyPair, createAesKey, createHmacKey, createEcdhPubkey, createSignPubkey } from './lib/keys.ts';
export { KeyStoreAccess, KeyStoreCtrl, KeyId, getWfKeyId } from './lib/keystore.ts';
export { random, unique } from './lib/random.ts';
export { SignAlgorithm, sign, verify } from './lib/sign.ts';
export { WfVersion, WfKeyType, WfAuthMethod, WfCryptoMethod } from '@whiteflagprotocol/common';
