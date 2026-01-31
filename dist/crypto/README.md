# WFJSL Cryptographic Functions

## Overview

The Whiteflag JavaScript Library (WFJSL) is an implementation of the Whiteflag
Protocol written in [TypeScript](https://developer.mozilla.org/en-US/docs/Glossary/TypeScript),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

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

This description provides a generic overview of the WFJSL cryptography
package. Please see the [WFJSL TypeDoc documentation](https://js.whiteflagprotocol.org/typedoc)
for a detailed description of all classes and functions.

## Hashing

The Whiteflag cryptography package provides three hashing functions
with the `hash` module:

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

The Whiteflag cryptography package provides the following functions for
message encryption with the `cipher` module:

| Function    | Purpose                                                                               |
|-------------|---------------------------------------------------------------------------------------|
| `encrypt`   | Encrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `decrypt`   | Decrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `deriveKey` | Derives the encryption key based on the Whiteflag encryption method                   |

The `encrypt` and `decrypt` functions take a binary encoded Whiteflag message,
along with a number of encryption parameters such as the encryption key, to
perform the encryption and decryption of messages.

The `deriveKey` function uses the `hkdf` function from the `hash` module
with the input key material, information parameter, salt, and key length for
the encryption method, to generate the Web Crypto API encryption key to be
used with the `encrypt` and `decrypt` functions i.a.w. the Whiteflag standard.

The Whiteflag encryption methods are defined by the `WfCryptoMethod` enum.

## Elliptic-curve Diffie–Hellman

The Whiteflag cryptography package provides the following functions for
ECDH secret negotiation with the `ecdh` module:

| Function              | Purpose                                                    |
|-----------------------|------------------------------------------------------------|
| `generateEcdhKeypair` | Generates a new ECDH key pair                              |
| `deriveEcdhSecret`    | Generates a shared secret from a key pair and a public key |

Because the Web Crypto API does not support the RFC 5639 Brainpool curves,
the module uses the Node.js cryptography module instead.

## Cryptographic Keys

The cryptographic functions of the Whiteflag cryptography package use key
objects rather than raw binary keys. The following functions of the `keys`
module create the appropriate key objects from raw keys:

| Function           | Purpose                                             |
|--------------------|-----------------------------------------------------|
| `createAesKey`     | Creates an AES encryption and decryption key object |
| `createHmacKey`    | Creates an HMAC signing key object                  |
| `createEcdhPubkey` | Creates an ECDH public key object                   |

The created key is a Web Crypto API `CryptoKey` object, except for the
ECDH public key, which is a `WfCryptoKey` object. The `WfCryptoKey` is an
extension of the first one to allow algorithms and curves that are currently
not supported by the Web Crypto API, such as the RFC 5639 Brainpool curves.

To allow for cryptographic algorithms and curves that are not supported by the
Web Crypto API, while adhering to the API for interoperability, the `keys`
module provides the following extensions to the Web Crypto API:

| Class / Interface | Purpose                                                                                             |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `WfCryptoKey`     | Class implementing the of the `CryptoKey` interface to represent a cryptographic key                |
| `WfCryptoKeyPair` | Interface extending the `CryptoKeyPair` interface for `WfCryptoKey` objects                         |
| `WfKeyAlgorithm`  | Interface extending the `KeyAlgortihm` interface to allow keys for additional algorithms and curves |
