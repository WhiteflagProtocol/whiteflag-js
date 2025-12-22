# WFJSL Cryptographic Functions

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The `@whiteflag/crypto` package provides cryptographic functions for other
Whiteflag packages. Therefore, it should normally not be necessary to add this
package as a dependency.

The WFJSL uses the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
for the basic implementation of Whiteflag cryptographic functions, such as
secret negotiation, encryption, and authentication. Putting these critical
security functions in a seperate package makes them better inspectable,
testable and maintainable.

Most cryptography functions are asynchronous and return a
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

This description provides a generic overview of the Whiteflag cryptography
package. Please refer to the [TypeDoc documentation](../typedoc) for a
detailed description of all classes and functions.

## Hashing

The Whiteflag cryptography package provides three hashing functions
with the `hash` module:

| Function | Purpose                                                                   |
|----------|---------------------------------------------------------------------------|
| `hkdf`   | Hash-based Key Derivation Function using SHA-256 i.a.w. RFC 5869          |
| `hash`   | Basic hashing function, using SHA-256 as deafult                          |
| `hmac`   | Hash-Based Message Authentication Code function, using SHA-256 as deafult |

The `hkdf` function is used by Whiteflag to derive encryption keys and
authentication tokens and bind them to the blockchain address of a specific
originator. The `hash` and `hmac` functions are wrappers easy common access
to the underlying algorithms through the Web Crypto API; they are used by
the `hkdf` function, but may also be used for other functionality as required.

## Encyrption

The Whiteflag cryptography package provides the following functions for
message encryption with the `cipher` module:

| Function    | Purpose                                                                               |
|-------------|---------------------------------------------------------------------------------------|
| `encrypt`   | Encrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `decrypt`   | Decrypts a binary encoded Whiteflag message, based on the Whiteflag encryption method |
| `deriveKey` | Derives the encryption key based on the Whiteflag encryption method                   |

The `encrypt` and `decrypt` functions take a bianry encoded Whiteflag message,
along with a number of encyrption parameters such as the encryption key, to
perfrom the encryption and decryption of messages.

The `deriveKey` function uses the `hkdf` function with the input key material,
information parameter, salt, and key length for the encryption method, to
generate the Web Crypto API encryption key to be used with the `encrypt` and
`decrypt` functions i.a.w. the Whiteflag standard.

The Whiteflag encryption methods are defined by the `WfCryptoMethod` enum.

## Cryptographic Keys

The Whiteflag cryptography package provides the following functions for
key generation with the `keys` module:

| Function        | Purpose                                      |
|-----------------|----------------------------------------------|
| `createAesKey`  | Creates an AES encryption and decryption key |
| `createHmacKey` | Creates an HMAC signing key                  |

All key generation functions create a Web Crypto API `CryptoKey` object,
typically from a raw key generated or provided elesewhere. These keys are
primarily intented to provide the correct Web Crypto API keys to other
functions of the cryptography package.
