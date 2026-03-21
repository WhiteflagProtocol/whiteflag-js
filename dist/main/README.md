# WFJSL Main Interface

## Overview

The Whiteflag JavaScript Library (WFJSL) is an implementation of the Whiteflag
Protocol written in [TypeScript](https://developer.mozilla.org/en-US/docs/Glossary/TypeScript),
and compiled to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
to support the development of Whiteflag-enabled applications in JavaScript.

The [`@whiteflagprotocol/main`](https://www.npmjs.com/package/@whiteflagprotocol/main)
package provides all classes and functions required to implement the Whiteflag
protocol. This should normally be the only dependency for projects
implementing Whiteflag.

This description provides a generic overview of the Whiteflag main package.
Please refer to the [WFJSL TypeDoc documentation](https://js.whiteflagprotocol.org/typedoc)
for a detailed description of all classes and functions.

## Blockchain layer

The blockchain layer is represented by the `WfBlockchainLayer` class defined
by the `main/blockchain` module. The blockchain layer provides access to
one or more underlying blockchains used to send and receive Whiteflag messages.

## Whiteflag protocol

The `WfEventEmitter` singleton class defined by the `main/events` module is
the event emitter for Whiteflag protocol events, such as a received message,
a discovered or authenticated originator, etc. This allows different parts of
a Whiteflag application to notify and transfer data to other parts. Therefore,
this is the main interface for dynamic interaction with the Whiteflag protocol.
The `WfEvents` enum defines all events and their associated data.

```javascript
let events = WfEventEmitter.getInstance();
events.on('message:validated', furtherMsgHandler);
```

The `WfState` singleton class defined by the `main/state` module keeps track
of the protocol state. As such, it holds all known accounts, originators,
cryptographic keys and blockchain status. The state should be initialized
using `WfState.init(...)` providing a master encryption key and, optionally,
the previously saved state. The state can be exported (e.g. to store) using the
`WfState.export()` function.

```javascript
WfState.init(masterKey, savedState);
state = await WfState.readyInstance();
```

## Whiteflag messages

The Whiteflag message class `WfMessage` defined in the `main/message` module
represents a Whiteflag message.

This class extends the core Whiteflag message class `WfCoreMessage` by adding
metadata to the message, additional data conversions (such as to and from
JSON), and specific Whiteflag protocol features. This allows the class to be
used and integrated in larger functional applications in accordance with the
Whiteflag protocol specification.

A new message may be created using the constructor, or by using a static
factory method. For example, creating a new FreeText message (message
code `F`) and set the `Text` field, may be done as follows:

```javascript
let message = new WfMessage('F');
message.set('Text', 'Example text to be sent with the FreeText message');
```

The `encode()` method encodes the message. It automatically verifies the fields
and values when encoding and decoding. Encoding and decoding are asynchronous,
meaning the functions return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Once encoded, the methods `toHex()` and `toU8a()` may be used to obtain the
encoded message as a hexadecimal string or a UInt8array, respectively.

```javascript
await wfMessage.encode();
const hexMessage = wfMessage.toHex();
```

If a message is encoded, or decoded, the message is "final", meaning its
content cannot be changed. Decoding a message is done using a one of the
static factory methods such as `fromHex(...)` or `fromU8a(...)`, since the
message type is probably not known before decoding.

```javascript
wfMessage = await WfMessage.fromHex(hexMessage);
```

Encryption and decryption is automatically performed upon encoding and
decoding, based on the value of the `EncryptionIndicator` field in the message
header.
