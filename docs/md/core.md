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

## Whiteflag message class

The Whiteflag message class `WfCoreMessage` defined in the `message` module
represents a Whiteflag message. The class contains the methods to create,
set field values, encode and encrypt a Whiteflag message. Please note that
there normally is no need to use the `WfCoreMessage` directly. Instead, the
`WfMessage` child class of the `@whiteflagprotocol/main` package is the main
class to use for Whiteflag message, as this extended class provides methods to
process the metadata required for full protocol functionality.

A new message may be created using the constructor, or by using a static
factory method. For example, creating a new FreeText message (message
code `F`) and set the `Text` field, may be done as follows:

```{javascript}
let wfMessage = new WfCoreMessage('F');
wfMessage.set('Text', 'Example text to be sent with the FreeText message');
```

The `encode()` method encodes the message. The `WfCoreMessage` class
automatically verifies the fields and values when encoding and decoding.
Encoding and decoding are asynchronous, meaning the functions return
[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Once encoded, the methods `toHex()` and `toU8a()` may be used to obtain the
encoded message as a hexadecimal string or a UInt8array, respectively.

```{javascript}
await wfMessage.encode();
const hexMessage = wfMessage.toHex();
```

If a message is encoded, or decoded, the message is "final", meaning its
content cannot be changed. Decoding a message is done using a one of the
static factory methods such as `fromHex(...)` or `fromU8a(...)`, since the
message type is probably not known before decoding.

```{javascript}
wfMessage = await WfCoreMessage.fromHex(hexMessage);
```

Encryption and decryption is automatically performed upon encoding and
decoding, based on the value of the `EncryptionIndicator` field in the message
header. Since the `WfCoreMessage` class does not hold any metadata, all
encryption and decryption parameters must be provided to the respective method
when encoding or decoding a message.

The `message` module, also provides the following functions. These functions
are used by the `WfCoreMessage` class, but may also be used for alternative
processing of Whiteflag messages.

| Function          | Purpose                                          |
|-------------------|--------------------------------------------------|
| `isValidMessage`  | Checks if an object is a valid Whiteflag message |
| `validateMessage` | Checks a message object for validation errors    |
| `encryptMessage`  | Encrypts a binary encoded message                |
| `decryptMessage`  | Decrypts an encrypted binary message             |

Both validation functions may be used for both plain JavaScript objects and
objects of the `WfCoreMessage` class. The encryption and decryption functions
work only on binary encoded messages provided as a `BinaryBuffer`.

## Whiteflag encoding

The `codec` module provides the encoding and decoding for each field in
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

## Whiteflag versions

Currently, only one version of the Whiteflag protocol has been developed. For
ease of implementation of future Whiteflag versions, WFJSL functions and
classes take the Whiteflag version into account. The `versions` module defines
the available Whiteflag versions with the `WfVersions` enum.
