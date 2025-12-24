# WFJSL Package Structure

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The Whiteflag JavaScript Library is written in TypeScript. The source code
module files are organized in the following packages:

| Package  | Purpose                         |
|----------|---------------------------------|
| `main`   | Main Whiteflag protocol modules |
| `core`   | Core Whiteflag protocol modules |
| `crypto` | Cryptographic modules           |
| `util`   | Utility modules                 |

Please refer to the [WFJSL TypeDoc documentation](../typedoc) for a detailed
description of all classes and functions.

See also `README.md` for a general overview of the project, and
`CONTRIBUTING.md` for a description of the repository structure and
development guidelines for the source code.

## Main package

The [`@whiteflagprotocol/main`](main.md) package provides all classes and functions
required to implement the Whiteflag protocol. Normally this should be
the only dependency for projects implementing Whiteflag.

## Core package

The [`@whiteflagprotocol/core`](core.md) package provides the modules that define
Whiteflag core protocol features as specified in the Whiteflag standard.
As such, this package is not a fully functional implementation of the
protocol. This is to separate core protocol features from
implementation-specific design decisions.

## Cryptographic package

The [`@whiteflagprotocol/crypto`](crypto.md) package provides the modules that define
Whiteflag cryptographic implementation independent cryptographic functionality
used by other packages. Separating these critical security functions makes
them better inspectable, testable and maintainable.

## Utility package

The [`@whiteflagprotocol/util`](util.md) package provides the modules with utility
functions for other Whiteflag protocol packages. These utilities include
common data conversions, generic helper functions, etc.
