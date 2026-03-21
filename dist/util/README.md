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

## Types

The `util/types` module defines the data types used by utilities and other
packages, including types aliases to identify the use of strings.

## BinaryBuffer class

The `util/binary` module of the Whiteflag utility package provides the
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

## Data items and collections

The `DataItem` class of the `util/data` module is a generic class to hold a
plain JavaScript data object. It provides a unique identifier for each object
and (de)serialization functions. The `DataCollection` class is to hold data
items of the same type and provides function to (de)serialize the collection
as a whole.

## Data conversions

The `util/encoding` module provides generic functions to convert data
from one encoding to another.

| Encoding    | Description                                                   | Converts to                                  |
|-------------|---------------------------------------------------------------|----------------------------------------------|
| Base58      | a string with a 58-character binary-to-text encoding          | UInt8Array                                   |
| Base64      | a string with a 64-character binary-to-text encoding          | Base64url, Hexadecimal, Text, UInt8Array     |
| Base64url   | a string with a URL-safe 64-character binary-to-text encoding | Base64, Hexadecimal, Text, UInt8Array        |
| Hexadecimal | a string with a hexadecimal representation of binary data     | Base64, Base64url, Text, UInt8Array          |
| Text        | a string with UTF-8 characters                                | Base64, Base64url, Hexadecimal, UInt8Array   |
| UInt8Array  | an array of bytes representing a binary encoding              | Base58, Base64, Base64url, Hexadecimal, Text |

For example `hexToB64u(...)` creates a base64url encoded string from a
hexadecimal string. The module also provides some additional helper functions
for different data encodings:

* `isObject(...)` checks if something is an object
* `isString(...)` checks if something is a string
* `isBas584(...)` checks if a string is base58 encoded
* `isBase64(...)` checks if a string is base64 encoded
* `isBase64u(...)` checks if a string is base64url encoded
* `isHex(...)` checks if a string is hexadecimal encoded
* `noHexPrefix(...)` removes the '0x' hex prefix if present

## JSON Web Signature (JWS)

Whiteflag uses JSON Web Signatures (JWS). To create, sign and convert JWSs
the `util/jws` module provides a common `Jws` class to other Whiteflag
packages. Once a JWS is signed, it cannot be changed.

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

## Arrays and Objects

The `util/arrays` and `util/objects` modules provide functions for easy
array and object manipulation.

Functions to check an object:

* `isArray(...)` checks if something is an array
* `isObject(...)` checks if something is an object
* `isString(...)` checks if something is a string
* `objectHas(object, key)` checks if an object has a property identified by `key`

Function to copy objects:

* `deepCopy(object)` provides a deep copy of an object, including Arrays, Maps, Sets and Dates

Functions to work with arrays and arrays of objects:

* `arrayEquals(array1, array2)` checks if arrays 1 and 2 contain equal values
* `arrayPluck(array, key)` puts the values of a property identified by `key` from each object in an array in a new array
* `arrayPluckSub(array, key, subkey)` puts the values of a subproperty from each object in an array in a new array

Functions to convert to and from objects, including serialization functions:

* `objToJson(object)` creates a JSON string from an object
* `objToMap(object)` creates a map from an object
* `objToB64(object)` encodes a plain JavaScript object as a Base64 encoded JSON string
* `objToB64u(object)` encodes a plain JavaScript object as a Base64url encoded JSON string
* `objToU8a(object)` encodes a plain JavaScript object as a byte array of a JSON string
* `jsonToObj(string)` creates an object from a JSON string
* `mapToObj(map)` creates an object from a map
* `b64ToObj(string)` converts a Base64 encoded JSON string into a plain JavaScript object
* `b64uToObj(string)` converts a Base64url encoded JSON string into a plain JavaScript object
* `u8aToObj(u8array)` converts a byte array of a JSON string into a plain JavaScript object
