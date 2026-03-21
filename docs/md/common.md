# WFJSL Error Handling

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The [`@whiteflagprotocol/common`](common.md) package provides the common
declarations and definitions that other packages depend upon. This is to
prevent any mutual or circular dependencies. Therefore, this package is not
intended to be used directly by implementations of Whiteflag; instead, the
[`@whiteflagprotocol/main`](https://www.npmjs.com/package/@whiteflagprotocol/main)
package should be used.

This description provides a generic overview of the WFJSL common package.
Please see the [WFJSL TypeDoc documentation](https://js.whiteflagprotocol.org/typedoc)
for a detailed description of all classes and functions.

## Blockchains

The Whiteflag Protocol works on top of one or more blockchains. While
Whiteflag is blockchain-agnostic, the protocol requires some information about
the underlying blockchain to function correctly.

The `Blockchain` interface as defined in the `common/blockchain` module is an
abstraction of a blockchain class that contains the blockchain-specific
parameters and methods, required by different Whiteflag classes and functions.

The module also defines the following data structures:

* the `BlockchainConfigData` for configuration parameters, such as the connecting blockchain ode URL
* the `BlockchainStatusData` for blockchain status data, such as current block height
* the `TransactionData` for configuration parameters

## Whiteflag Protocol

The Whiteflag protocol uses well-defined messages and methods. The definitions
those entities are included in the `common/protocol` module.

Currently, only one version of the Whiteflag protocol has been developed. For
ease of implementation of future Whiteflag versions, WFJSL functions and
classes take the Whiteflag version into account. The available Whiteflag
versions are defined by the `WfVersions` enum.

The `WfMsgType` enum defines the Whiteflag message types for all versions.

The following enums define the cryptographic key types and methods:

* the `WfKeyType` enum defines the different cryptographic keys and secrets used by the Whiteflag protocol
* the `WfAuthMethods` enum defines the authentication methods specified by the Whiteflag protocol
* the `WfCryptoMethods` enum defines the encryption methods specified by the Whiteflag protocol

## Whiteflag Errors

In addition to the standard JavaScript generic `Error` class, WFJSL provides
two additional error classes defined in the `commons/errors` module for
Whiteflag runtime and protocol errors, respectively:

* the `WfRuntimeError` class for cases where the Whiteflag JS is incorrectly used, typically a programming error
* the `WfProtocolError` class for protocol errors, such as incorrect messages, typically a result of invalid external input

### Example

To use the `WfProtocolError` class for the handling of Whiteflag processing,
message format and protocol errors, define a new error as follows:

```javascript
err = new WfProtocolError(message, causes, code);
```

with the following arguments:

* `message` is similar to the property of the generic Error class, i.e. a string with a human-readable description of the error
* `causes` is an optional argument with a human-readable stack of underlying causes in the form of a string array
* `code` is a property of type string, identifying the type of error, as described below

### Error codes

To use the `WfErrorCode` enum defines the following error codes
used by the `WfProtocolError` class:

* `WF_PROTOCOL_ERROR`: generic Whiteflag protocol error (default)
* `WF_METAHEADER_ERROR`: incorrect Whiteflag message metadata
* `WF_FORMAT_ERROR`: Whiteflag message format error
* `WF_REFERENCE_ERROR`: Whiteflag message reference error
* `WF_AUTH_ERROR`: Whiteflag message authentication error
* `WF_SIGN_ERROR`: Whiteflag signature error
* `WF_ENCRYPTION_ERROR`: Whiteflag encryption error
