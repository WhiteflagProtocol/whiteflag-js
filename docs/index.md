# General Description and Overview

## Introduction

The Whiteflag JavaScript Library (WFJSL) will be the reference implementation
of the Whiteflag Protocol written in [TypeScript](https://developer.mozilla.org/en-US/docs/Glossary/TypeScript),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

The WFJSL is currently developed in order to separate the Whiteflag
core protocol code from the current reference implementation, i.e. the
[Whiteflag API](https://api.whiteflagprotocol.org). This makes the code
better to maintain and test in support of future Whiteflag protocol
development, while ensuring reusability for other implementations.

The WFJSL is to include all Whiteflag protocol features, but with minimal
dependencies. Therefore, the library is independent of any specific
blockchain, database solution, user interface, etc.

## Documentation

### Detailed API and Source Code References

* [WFJSL TypeDoc Reference](typedoc)
* [Package Structure](md/packages.md)

### Source Code Description

* [Main WFSJL Interface](md/main.md)
* [Core Protocol Implementation](md/core.md)
* [Cryptographic Functions](md/crypto.md)
* [Utility Classes and Functions](md/utility.md)
* [Error Handling](md/errors.md)
