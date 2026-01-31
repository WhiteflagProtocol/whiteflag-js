# WFJSL Utility Classes and Functions

## Overview

The Whiteflag JavaScript Library (WFJSL) is an implementation of the Whiteflag
Protocol written in [TypeScript](https://developer.mozilla.org/en-US/docs/Glossary/TypeScript),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

The [`@whiteflagprotocol/util`](https://www.npmjs.com/package/@whiteflagprotocol/util)
package provides common utilities for other Whiteflag packages. These
utilities include common data conversions, generic helper functions, etc.
It should normally not be necessary to add this package as a dependency, but
its functionality might be useful for other purposes.

This description provides a generic overview of the WFJSL utility package.
Please see the [WFJSL TypeDoc documentation](https://js.whiteflagprotocol.org/typedoc)
for a detailed description of all classes and functions.

## BinaryBuffer class

The `binary` module of the Whiteflag utility package provides the
`BinaryBuffer` class. Objects of this class represent a binary encoded piece
of data, e.g. a Whiteflag message, that can be manipulated at bit level.

Static methods to create a binary buffer:

* `BinaryBuffer.empty()`: creates an empty binary buffer
* `BinaryBuffer.from(...)`: creates a binary buffer from another binary buffer
* `BinaryBuffer.fromBytes(...)`: creates a binary buffer from bytes in a number array
* `BinaryBuffer.fromHex(...)`: creates a binary buffer from a hexadecimal string
* `BinaryBuffer.fromU8a(...)`: creates a binary buffer from a Uint8Array

Public methods to manipulate a binary buffer:

* `BinaryBuffer.append(...)`: appends another binary buffer to the end of the binary buffer
* `BinaryBuffer.crop(...)`: shortens the binary buffer to the length of the specified bits
* `BinaryBuffer.extract(...)`: extracts the specified bits from the binary buffer
* `BinaryBuffer.insert(...)`: inserts another binary buffer at the start of the binary buffer
* `BinaryBuffer.shiftLeft(...)`: shifts bits in the buffer to the left, shrinking the buffer
* `BinaryBuffer.shiftRight(...)`: shifts bits in the buffer to the right, enlarging the buffer

Some of these functions have an equivalent that allow to use a different
binary representation, e.g. `appendHex(...)` or `insertU8a(...)`.

## Data conversions

The `encoding` module provides generic functions to convert data
from one encoding to another.

| Encoding    | Description                                                   | Converts to                             |
|-------------|---------------------------------------------------------------|-----------------------------------------|
| Base64      | a string with a 64-character binary-to-text encoding          | Base64url                               |
| Base64url   | a string with a URL-safe 64-character binary-to-text encoding | Base64, Hexadecimal, String, UInt8Array |
| Hexadecimal | a string with a hexadecimal representation of a binary        | Base64url, String, UInt8Array           |
| Object      | a plain JavaScript object                                     | Base64url                               |
| Text        | a string with UTF-8 characters                                | Base64url, Hexadecimal, UInt8Array      |
| UInt8Array  | an array of bytes representing a binary encoding              | Base64url, Hexadecimal, String          |

For example `hexToB64u(...)` creates a base64url encoded string from a
hexadecimal string. The module also provides some additional helper functions
for different data encodings:

* `isObject(...)` checks if something is an object
* `isString(...)` checks if something is a string
* `isBase64(...)` checks if a string is base64 encoded
* `isBase64u(...)` checks if a string is base64url encoded
* `isHex(...)` checks if a string is hexadecimal encoded
* `noHexPrefix(...)` removes the '0x' hex prefix if present

## JSON Web Signature (JWS)

Whiteflag uses JSON Web Signatures (JWS). To create, sign and convert JWSs
the `jws` module provides a common `Jws` class to other Whiteflag packages.
Once a JWS is signed, it cannot be changed.

Static methods to create a binary buffer:

* `Jws.fromJSON(...)`: creates a JWS from a JSON string
* `Jws.fromObject(...)`: creates a JWS from a plain JavaScript object
* `Jws.fromCompact(...)`: creates a JWS from a compact serialized JWS string

Public methods for signing the JWS:

* `Jws.isSigned()`: indicates if the JWS has been signed
* `Jws.setSignAlgorithm(...)`: sets the signing algorithm identifier in the protected header
* `Jws.getSignInput()`: gets the base64url encoded JWS data to sign
* `Jws.setSignInput(...)`: sets the base64url encoded signature, effectively signing the JWS
* `Jws.getSignature()`: gets the JWS signature

Public methods to get the JWS in different formats:

* `Jws.toCompact()`: returns the JWS as a compact serialized JWS string
* `Jws.toFlat()`: the JWS as a flattened JWS plain JavaScript object
* `Jws.toFull()`: returns the JWS as a full JWS plain JavaScript object
* `Jws.toObject()`: returns the JWS as a plain JavaScript object
* `Jws.toJSON()`: returns the JWS as a JSON string
