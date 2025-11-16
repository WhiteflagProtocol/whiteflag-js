# Whiteflag JavaScript Library

## Introduction

[Whiteflag](https://www.whiteflagprotocol.org) is a fully neutral and
secure communciations protocol based on blockchain technology. It enables
near real-time communication in armed conflicts and disasters to exchange
early warning and status information to create shared situational awareness.
The [Whiteflag Protocol specification](https://standard.whiteflagprotocol.org)
is an open standard.

The Whiteflag JavaScript Library (WFJSL) will be the reference implementation
of the Whiteflag Protocol in [TypeScript](https://www.typescriptlang.org/),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

The WFJSL is currently **in development** in order to seperate the Whiteflag
core protocol code from the current reference implementation, i.e. the
[Whiteflag API](https://api.whiteflagprotocol.org). This makes the code
better to maintain and test in support of future Whiteflag protocol
development, while ensuring reusability for other implementations.

The WFJSL is to include all Whiteflag protocol features, but with minimal
dependencies. Therefore, the library is independent from any specific
blockchain, database solution, user interface, etc.

Version 1 of the WFJSL corresponds with version 1 of the protocol, and
more specifically with `v1-draft.7` of the standard. The planned WFJSL
functionality and corresponding `1.x` subversions are defined as
[milestones](https://github.com/WhiteflagProtocol/whiteflag-js/milestones).

## Documentation

All detailed documentation of the WFJSL programming interface will become
available at [js.whiteflagprotocol.org](https://js.whiteflagprotocol.org/).
The documentation is also found in this repository in the `docs/` directory.

## License and Third Party Software

The WFJSL software is dedicated to the public domain under the
[Creative Commons CC0-1.0 Universal Public Domain Dedication](http://creativecommons.org/publicdomain/zero/1.0/)
statement. See `LICENSE.md` for details.

The library may require third party software packages, which are not part of
this distribution and may be licenced differently. The third party software
dependencies of the WFJSL are:

* the [Mocha](https://mochajs.org/) for testing the software
