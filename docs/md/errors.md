# WFJSL Error Handling

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

In addition to the standard JavaScript `Error` class, WFJSL provides an
additional error class for Whiteflag protocol errors: the `WfProtocolError`
class for the handling of Whiteflag message format and protocol errors.

## Usage of error classes

To use the ProtocolError class, import it with an object destructor:

```javascript
const { WfProtocolError } = require('whiteflag-js');
```

and define a new error as needed:

```javascript
err = new WfProtocolError(message, causes, code);
```

with the following arguments:

* `message` is similar to the property of the generic Error class, i.e. a string with a human readable description of the error
* `causes` is an additional property in the form of an array that may contain a human readable stack of underlying causes
* `code` is a property of type string, identifying the type of error as described below for both classes

## `ProtocolError` class error codes

* `WF_PROTOCOL_ERROR`: generic Whiteflag protocol error (default)
* `WF_METAHEADER_ERROR`: incorrect Whiteflag message metaheader
* `WF_FORMAT_ERROR`: Whiteflag message format error
* `WF_REFERENCE_ERROR`: Whiteflag message reference error
* `WF_AUTH_ERROR`: Whiteflag message authentication error
* `WF_SIGN_ERROR`: Whiteflag signature error
* `WF_ENCRYPTION_ERROR`: Whiteflag encryption error
