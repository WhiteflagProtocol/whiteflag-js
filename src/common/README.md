# WFJSL Common Definitions

## Overview

The Whiteflag JavaScript Library (WFJSL) is an implementation of the Whiteflag
Protocol written in [TypeScript](https://developer.mozilla.org/en-US/docs/Glossary/TypeScript),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

The [`@whiteflagprotocol/common`](https://www.npmjs.com/package/@whiteflagprotocol/common)
package provides the common declarations and definitions that other packages
depend upon. This is to prevent any mutual or circular dependencies. Therefore,
package is not intended to be used directly by implementations of Whiteflag;
instead, the [`@whiteflagprotocol/main`](https://www.npmjs.com/package/@whiteflagprotocol/main)
package should be used.

This description provides a generic overview of the WFJSL common package.
Please see the [WFJSL TypeDoc documentation](https://js.whiteflagprotocol.org/typedoc)
for a detailed description of all classes and functions.

## Whiteflag Versions

Currently, only one version of the Whiteflag protocol has been developed. For
ease of implementation of future Whiteflag versions, WFJSL functions and
classes take the Whiteflag version into account. The `versions` module defines
the available Whiteflag versions with the `WfVersions` enum.

## Blockchains

The Whiteflag Protocol works on top of one or more blockchains. While
Whiteflag is blockchain-agnostic, the protocol requires some information about
the underlying blockchain to function correctly. The `Blockchain` interface is
an abstraction of a blockchain class that contains the blockchain-specific
parameters and methods, required by different Whiteflag classes and functions.

## Message Types

The `message` module defines the Whiteflag message types with
the `WfMsgType` enum.

## Authentication and Encryption Methods, and Cryptographic Key Types

The `crypto` module defines three enums:

* the `WfKeyType` enum defines the different cryptographic keys and secrets used by the Whiteflag protocol
* the `WfAuthMethods` enum defines the authentication methods specified by the Whiteflag protocol
* the `WfCryptoMethods` enum defines the encryption methods specified by the Whiteflag protocol

## Whiteflag Errors

In addition to the standard JavaScript generic `Error` class, WFJSL provides
an additional error class for Whiteflag protocol errors: the `WfError` class
for the handling of Whiteflag processing, message format and protocol errors.

### Example

To use the `WfError` class, define a new error
as follows:

```javascript
err = new WfError(message, causes, code);
```

with the following arguments:

* `message` is similar to the property of the generic Error class, i.e. a string with a human-readable description of the error
* `causes` is an optional argument with a human-readable stack of underlying causes in the form of a string array
* `code` is a property of type string, identifying the type of error, as described below

### Error codes

To use the `WfErrorCode` enum defines the following error codes
used by the `WfError` class:

* `WF_PROTOCOL_ERROR`: generic Whiteflag protocol error (default)
* `WF_METAHEADER_ERROR`: incorrect Whiteflag message metadata
* `WF_FORMAT_ERROR`: Whiteflag message format error
* `WF_REFERENCE_ERROR`: Whiteflag message reference error
* `WF_AUTH_ERROR`: Whiteflag message authentication error
* `WF_SIGN_ERROR`: Whiteflag signature error
* `WF_ENCRYPTION_ERROR`: Whiteflag encryption error
