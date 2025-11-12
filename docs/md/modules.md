# Whiteflag API JavaScript Modules

The Whiteflag Javascript Library is written in TypeScript. The source code
module files are organised in the following packages:

| Package    | Purpose                         |
|------------|---------------------------------|
| `protocol` | Main Whiteflag protocol modules |
| `core`     | Core Whiteflag protocol modules |
| `crypto`   | Cryptographic modules           |
| `util`     | Utility modules                 |

See also `README.md` for a general overview of the project, and
`CONTRIBUTING.md` for a description of the repository structure and
development guidelines for the source code.

## Protocol package

The `@whiteflag/protocol` package provides all classes and functions
required to implement the Whiteflag protocol. Normally this should be
the only dependency for projects implementing Whiteflag.

## Core package

The `@whiteflag/core` package provides the modules that define Whiteflag
core protocol features as specified in the Whiteflag standard. As such,
this package is not a fully functional implementation of the protocol. This
is to seperate core protocol features from implementation-specific design
decisions.

## Cryptographic package

The `@whiteflag/crypto` package provides the modules that define Whiteflag
cryptographic implementation independent cryptographic functionality used
by other packages. Seperating these critical security functions makes them
better inspectable, testable and maintainable.

## Utility package

The `@whiteflag/util` package provides the modules with utility functions
for other Whiteflag protocol packages. These utilities include common data
conversions, generic helper functions, etc.
