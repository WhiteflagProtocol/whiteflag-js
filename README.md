# Whiteflag JavaScript Library

![GitHub latest release](https://img.shields.io/github/v/release/whiteflagprotocol/whiteflag-js?label=latest&logo=github&sort=semver)
![Ubuntu Test](https://github.com/WhiteflagProtocol/whiteflag-js/workflows/Ubuntu%20Test/badge.svg)
![Windows Test](https://github.com/WhiteflagProtocol/whiteflag-js/workflows/Windows%20Test/badge.svg)

## Introduction

[Whiteflag](https://www.whiteflagprotocol.org) is a fully neutral and
secure communications protocol based on blockchain technology. It enables
near real-time communication in armed conflicts and disasters to exchange
early warning and status information to create shared situational awareness.
The [Whiteflag Protocol specification](https://standard.whiteflagprotocol.org)
is an open standard.

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

Version 1 of the WFJSL corresponds with version 1 of the protocol, and
more specifically with `v1-draft.7` of the standard. The planned WFJSL
functionality and corresponding `1.x` subversions are defined as
[milestones](https://github.com/WhiteflagProtocol/whiteflag-js/milestones).

## Documentation

Detailed documentation of the WFJSL programming interface is available
at [js.whiteflagprotocol.org](https://js.whiteflagprotocol.org/).
The documentation is also found in this repository in the `docs/` directory.

## Testing

Testing of the software is done with the [Mocha](https://mochajs.org/)
test framework. To do a full test and run all the test scripts, use the
following NPM command in the project root:

```{sh}
npm test
```

## License and Third Party Software

The WFJSL software is dedicated to the public domain under the
[Creative Commons CC0-1.0 Universal Public Domain Dedication](http://creativecommons.org/publicdomain/zero/1.0/)
statement. See `LICENSE.md` for details.

The library may require third party software packages, which are not part of
this distribution and may be licensed differently.
