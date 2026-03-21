# WFJSL Cryptographic Functions

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The [`@whiteflagprotocol/crypto`](https://www.npmjs.com/package/@whiteflagprotocol/crypto)
package provides cryptographic functions for other Whiteflag packages.
Therefore, it should normally not be necessary to add this package as a
dependency.

The WFJSL uses the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
for the basic implementation of Whiteflag cryptographic functions, such as
secret negotiation, encryption, and authentication. Putting these critical
security functions in a separate package makes them better inspectable,
testable and maintainable.

Most cryptography functions are asynchronous and return a
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

This description provides a generic overview of the Whiteflag cryptography
package. Please refer to the [WFJSL TypeDoc documentation](../typedoc) for a
detailed description of all classes and functions.

## Hashing

The Whiteflag cryptography package provides three hashing functions
with the `crypto/hash` module:

| Function | Purpose                                                                   |
|----------|---------------------------------------------------------------------------|
| `hkdf`   | Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869          |
| `hash`   | Basic hashing function, using SHA-256 as default                          |
| `hmac`   | Hash-Based Message Authentication Code function, using SHA-256 as default |

The `hkdf` function is used by Whiteflag to derive encryption keys and
authentication tokens and bind them to the blockchain address of a specific
originator. The `hash` and `hmac` functions are wrappers for easy common
access to the underlying algorithms through the Web Crypto API; they are
primarily intended for the `hkdf` function, but may also be used for other
functionality as required.

## Encryption

The Whiteflag cryptography package provides the `crypto/encrypt` module for
basic data encryption and decryption, e.g. for secure storage of data and key.

| Function      | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| `encryptData` | Encrypts binary data using AES-256-GCM                         |
| `decryptData` | Decrypts binary data using AES-256-GCM                         |
| `generateDEK` | Generates the data encryption key from a master encryption key |

Message encryption in accordance with the Whiteflag specification is performed
by the following functions of the `crypto/cipher` module:

| Function    | Purpose                                                                               |
|-------------|---------------------------------------------------------------------------------------|
| `encrypt`   | Encrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `decrypt`   | Decrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `deriveKey` | Derives the encryption key based on the Whiteflag encryption method                   |

The `encrypt` and `decrypt` functions take a binary encoded Whiteflag message,
along with a number of encryption parameters such as the encryption key, to
perform the encryption and decryption of messages.

The `deriveKey` function uses the `hkdf` function from the `crypto/hash` module
with the input key material, information parameter, salt, and key length for
the encryption method, to generate the Web Crypto API encryption key to be
used with the `encrypt` and `decrypt` functions i.a.w. the Whiteflag standard.

The Whiteflag encryption methods are defined by the `WfCryptoMethod` enum.

## Elliptic-curve Diffie–Hellman

The Whiteflag cryptography package provides the following functions for
ECDH secret negotiation with the `crypto/ecdh` module:

| Function                 | Purpose                                                                      |
|--------------------------|------------------------------------------------------------------------------|
| `generateEcdhRawKeyPair` | Generates a new ECDH key pair                                                |
| `deriveEcdhRawSecret`    | Generates a shared secret from a raw private and public key                  |
| `deriveEcdhSecret`       | Generates a shared secret from a Web Crypto API-like key pair and public key |

Because the Web Crypto API does not support the RFC 5639 Brainpool curves,
the module uses the Node.js cryptography module instead.

## Digital Signatures

The Whiteflag cryptography package provides the following functions for
creating and verifying digital signatures:

| Function | Purpose                                                    |
|----------|------------------------------------------------------------|
| `sign`   | Signs an arbitrary piece of data                           |
| `verify` | Generates a shared secret from a key pair and a public key |

The `generateSignKeyPair` function generates a new key pair for creating
digital signatures. The `SignAlgorithm` enum defines the supporting digital
signature algorithms:

* `RS256`: RSASSA-PKCS1-v1_5 using SHA-256 (RFC 3447)
* `PS256`: RSASSA-PSS using SHA-256 (RFC 3447)
* `ES256`: ECDSA using P-256 and SHA-256 (FIPS 186-5)
* `Ed25519`: EdDSA based on Curve25519 (RFC 8032)

## Random Number Generation

The `crypto/random` module provides the `random()` function, which returns a
byte array of 32 random bytes, or of another length if specified. Random
numbers are, among other things, used as initialization vectors for
AES Counter Mode (CTR) and Galois/Counter Mode (GCM) ciphers.

## Cryptographic Keys

The cryptographic functions of the Whiteflag cryptography package use key
objects rather than raw binary keys. The following functions of the
`crypto/keys` module create the appropriate key objects from raw keys:

| Function              | Purpose                                             |
|-----------------------|-----------------------------------------------------|
| `generateEcdhKeyPair` | Generates a new ECDH key pair                       |
| `generateSignKeyPair` | Generates a new key pair for digital signatures     |
| `createAesKey`        | Creates an AES encryption and decryption key object |
| `createHmacKey`       | Creates an HMAC signing key object                  |
| `createEcdhPubkey`    | Creates an ECDH public key object                   |
| `createSignPubkey`    | Creates a digital signature public key object       |

The created key is a Web Crypto API `CryptoKey` object, except for the
ECDH public key, which is a `ExtCryptoKey` object. The `ExtCryptoKey` is an
extension of the first one to allow algorithms and curves that are currently
not supported by the Web Crypto API, such as the RFC 5639 Brainpool curves.

To allow for cryptographic algorithms and curves that are not supported by the
Web Crypto API, while adhering to the API for interoperability, the
`crypto/keys` module provides the following extensions to the Web Crypto API:

| Class / Interface  | Purpose                                                                                              |
|--------------------|------------------------------------------------------------------------------------------------------|
| `ExtCryptoKey`     | Class implementing the of the `CryptoKey` interface to represent a cryptographic key                 |
| `ExtCryptoKeyPair` | Interface extending the `CryptoKeyPair` interface for `ExtCryptoKey` objects                         |
| `ExtKeyAlgorithm`  | Interface extending the `KeyAlgortihm` interface to allow keys for additional algorithms and curves  |

The extended keys can be created and used with the following functions:

* `createExtKey(...)` creates an extended Web Crypto API-like cryptographic key object
* `useExtKey(key)` uses the raw binary key of an extended Web Crypto API-like key object (only internally)
* `exportExtKey(key)` exports the raw binary key of an extended Web Crypto API-like key, if the key is extractable

## Cryptographic Keystore

Classes that need to use cryptographic keys and other secrets store the actual
key in the Whiteflag keystore, and only hold a key identifier to retrieve it.
The Whiteflag keystore is provided by the `crypto/keystore` module. The actual
keystore is not directly accessible. Therefore, the module provides two
singleton classes that control and provide access to the keystore:

| Class            | Purpose                                                               |
|------------------|-----------------------------------------------------------------------|
| `KeyStoreAccess` | Singleton class to upsert, retrieve and remove keys from the keystore |
| `KeyStoreCtrl`   | Singleton class to control access to the cryptographic keystore       |

The following functions are available on the keystore access object that
is returned by `KeyStoreAccess.getInstance()`:

* `getKey(kid)` to retrieve the key identified by `kid`
* `upsertKey(kid, key)` to store the key identified by `kid`
* `removeKey(kid)` to remove the key identified by `kid`

The hexadecimal key identifier `kid` may be any unique value, but it assumed
to be the hash of the Whiteflag key type combined with a unique identifier as
created by the `getWfKeyId(type, info)` function of the `crypto/keystore` module.
The key type is defined by the `WfKeyType` enum from the `@whiteflagprotocol/common`
package. The unique identifier is typically the blockchain address of the
account associated with the key.

The keystore control object returned by `KeyStoreCtrl.getInstance()` allows
setting the master encryption key, and import and export the keystore data
with the following functions:

* `setMasterKey(...)` sets the master encryption key to access the (keys in the) keystore
* `import(...)` imports the encrypted serialized keystore data, overwriting the current keystore
* `export()` exports the encrypted serialized keystore data

In order to prevent tampering with the key store after any initialization, the
key store control may be sealed. Once sealed, it cannot be unsealed and only
exports are possible.
