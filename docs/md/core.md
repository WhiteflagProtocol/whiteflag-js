# WFJSL Core Implementation

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The [`@whiteflagprotocol/core`](https://www.npmjs.com/package/@whiteflagprotocol/core)
package provides the modules that define Whiteflag core protocol features as
specified in the Whiteflag standard. As such, this package is not a fully
functional implementation of the protocol, but separates core protocol
functions from implementation-specific design decisions. Therefore, this
package is not intended to be used directly by implementations of Whiteflag;
instead, the [`@whiteflagprotocol/main`](https://www.npmjs.com/package/@whiteflagprotocol/main)
package should be used.

This description provides a generic overview of the Whiteflag core package.
Please refer to the [WFJSL TypeDoc documentation](../typedoc) for a detailed
description of all classes and functions.

## Originators and Accounts

An originator is a person or organization sending Whiteflag messages. An
originator may use one or more blockchain accounts to send messages. Some
blockchains lack the concept of an account, whereas Whiteflag assumes an
identifiable originator that has an account on a blockchain. An account for
Whiteflag is nothing else than a key pair for signing blockchain transactions,
with some related information, e.g. an address, balance etc.

The `core/account` and `core/originator` modules define the following classes
to represent accounts and originators:

| Class          | Purpose                                                                                |
|----------------|----------------------------------------------------------------------------------------|
| `WfOriginator` | representation of an originator that contains its name and accounts of an organization |
| `WfAccount`    | representation of a blockchain account that holds its address and key pair             |

## Authentication

The `core/authentication` module contains the classes functions for the
authentication of Whiteflag accounts on a blockchain. The module defines the
`WfSignature` class, which extends the `Jws` class from the [`@whiteflagprotocol/util`](https://www.npmjs.com/package/@whiteflagprotocol/util)
packages, to represent Whiteflag signatures used in authentication method 1.

The following authentication functions are available:

| Function                | Purpose                                                                  |
|-------------------------|--------------------------------------------------------------------------|
| `createAuthSignature`   | Creates a Whiteflag authentication signature for authentication method 1 |
| `createAuthToken`       | Creates a Whiteflag authentication token for authentication method 2     |
| `validateAuthSignature` | Checks a Whiteflag authentication signature for validation errors        |
| `isValidAuthSignature`  | Checks if a Whiteflag authentication signature is valid                  |
| `isValidAuthToken`      | Checks if a Whiteflag authentication token is valid                      |

## Whiteflag messages

The Whiteflag message class `WfCoreMessage` defined in the `core/message`
module represents a Whiteflag message. The class contains the methods to
create, set field values, encode and encrypt a Whiteflag message. Please note
that there normally is no need to use the `WfCoreMessage` directly. Instead,
the `WfMessage` child class of the `@whiteflagprotocol/main` package is the
main class to use for Whiteflag message, as this extended class provides
methods to process the metadata required for full protocol functionality.

A new message should not be created using the constructor. Instead, one of
the static factory methods should be used:

* `create(type, ...)`: creates a new message of the specified type
* `fromObject(...)`: creates a message from a plain JavaScript object
* `fromBinary(...)`: creates a message from a binary buffer with an encoded message

The `encode()` method encodes the message. The `WfCoreMessage` class
automatically verifies the fields and values when encoding and decoding.
Encoding and decoding are asynchronous, meaning the functions return
[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Once encoded, the methods `toHex()` and `toU8a()` may be used to obtain
the encoded message as a hexadecimal string or a UInt8array, respectively.

If a message is encoded, or decoded, the message is "final", meaning its
content cannot be changed.

Encryption and decryption is automatically performed upon encoding and
decoding, based on the value of the `EncryptionIndicator` field in the
message header. Since the `WfCoreMessage` class does not hold any metadata,
all encryption and decryption parameters must be provided to the respective
method when encoding or decoding a message.

The `core/message` module, also provides the following functions. These
functions are used by the `WfCoreMessage` class, but may also be used for
alternative processing of Whiteflag messages.

| Function          | Purpose                                          |
|-------------------|--------------------------------------------------|
| `isValidMessage`  | Checks if an object is a valid Whiteflag message |
| `validateMessage` | Checks a message object for validation errors    |
| `encryptMessage`  | Encrypts a binary encoded message                |
| `decryptMessage`  | Decrypts an encrypted binary message             |

Both validation functions may be used for both plain JavaScript objects and
objects of the `WfCoreMessage` class. The encryption and decryption functions
work only on binary encoded messages provided as a `BinaryBuffer`.

## Whiteflag Message Encoding and Decoding

The `core/codec` module provides the encoding and decoding for each field in
a Whiteflag message i.a.w. the Whiteflag specification. The available field
encodings are defined with the `WfCodec` enum. For the encoding, decoding, and
verification of field values, the module provides the following functions.

| Function       | Purpose                            |
|----------------|------------------------------------|
| `encodeField`  | Encodes a Whiteflag message field  |
| `decodeField`  | Decodes a Whiteflag message field  |
| `isValidValue` | Checks if the field value is valid |

These functions are used by the `WfCoreMessage` class when encoding and
decoding a message.
