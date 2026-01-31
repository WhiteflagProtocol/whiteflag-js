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

## Whiteflag versions

Currently, only one version of the Whiteflag protocol has been developed. For
ease of implementation of future Whiteflag versions, WFJSL functions and
classes take the Whiteflag version into account. The `versions` module defines
the available Whiteflag versions with the `WfVersions` enum.

## Authentication and Encryption Methods

The `crypto` module defines two enums:

* the `WfAuthMethods` enum defines the authentication methods specified by the Whiteflag protocol
* the `WfCryptoMethods` enum defines the encryption methods specified by the Whiteflag protocol

## Whiteflag Errors

In addition to the standard JavaScript `Error` class, WFJSL provides an
additional error class for Whiteflag protocol errors: the `WfProtocolError`
class for the handling of Whiteflag message format and protocol errors
consistently. To use the `WfProtocolError` class, define a new error
as follows:

```javascript
err = new WfProtocolError(message, causes, code);
```

with the following arguments:

* `message` is similar to the property of the generic Error class, i.e. a string with a human-readable description of the error
* `causes` is an additional property in the form of an array that may contain a human-readable stack of underlying causes
* `code` is a property of type string, identifying the type of error as described below for both classes

## `ProtocolError` class error codes

* `WF_PROTOCOL_ERROR`: generic Whiteflag protocol error (default)
* `WF_METAHEADER_ERROR`: incorrect Whiteflag message metadata
* `WF_FORMAT_ERROR`: Whiteflag message format error
* `WF_REFERENCE_ERROR`: Whiteflag message reference error
* `WF_AUTH_ERROR`: Whiteflag message authentication error
* `WF_SIGN_ERROR`: Whiteflag signature error
* `WF_ENCRYPTION_ERROR`: Whiteflag encryption error
