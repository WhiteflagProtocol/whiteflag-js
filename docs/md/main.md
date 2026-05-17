# WFJSL Main Interface

| [WFJSL Documentation Home](../index.md) | [WFJSL TypeDoc Reference](../typedoc) | [Whiteflag Specification](https://standard.whiteflagprotocol.org) |

## Overview

The [`@whiteflagprotocol/main`](https://www.npmjs.com/package/@whiteflagprotocol/main)
package provides all classes and functions required to implement the Whiteflag
protocol. This should normally be the only dependency for projects
implementing Whiteflag.

This description provides a generic overview of the Whiteflag main package.
Please refer to the [WFJSL TypeDoc documentation](../typedoc) for a detailed
description of all classes and functions.

## Whiteflag Protocol Stack and WFJSL Scope

The Whiteflag Protocol works on top of the internet and on one or more
blockchains to create a network for trusted communications that can be used
by different applications through application programming interfaces.

The WFJSL implements layers 3–5 of the protocol stack as defined in
[Paragraph 2.2](https://standard.whiteflagprotocol.org/v1/#2.2-Protocol-Stack-and-Scope)
of the Whiteflag specification:

1. At the bottom of the protocol stack is the _Connection Layer_ to ensure global connectivity, i.e. the Internet.

2. On top of the Internet is the _Blockchain Layer_ ensures connectivity and interaction with specific blockchains. This layer is typically implemented through the APIs of the underlying blockchains.

3. The _Blockchain Overlay Network Layer_ works on top of the Blockchain Layer. The WFJSL creates the **Whiteflag Network Layer** as a blockchain overlay network by encapsulating Whiteflag messages in blockchain transactions.

4. The _Decentralized Protocol Layer_ is implemented with the **Whiteflag Protocol Layer** as the full protocol handler, which forms the core of the WFJSL.

5. The Application Programming Interface (API) layer is the abstraction of the programming interface provided by the `@whiteflagprotocol/main` package, which allows software to interact with the Whiteflag Protocol.

6. The _Application Layer_ is the part of the stack that comprises the applications that are actually used by the end-users. This layer is outside the scope of the WFJSL and typically implemented either with classical applications such as databases in use by various organizations, or with newly developed web applications or smartphone apps that can send, receive, filter, analyse and display data exchanged through Whiteflag combined with data from other sources.

## The Whiteflag Protocol Layer

### Whiteflag protocol events

The `WfEventEmitter` singleton class defined by the `main/events` module is
the event emitter for Whiteflag protocol events, such as a received message,
a discovered or authenticated originator, etc. This allows different parts of
a Whiteflag application to notify and transfer data to other parts. Therefore,
this is the main interface for dynamic interaction with the Whiteflag protocol.
The `WfEvents` enum defines all events and their associated data.

```javascript
const events = WfEventEmitter.getInstance();
events.once('state:initialized', doOtherInitializations);
events.on('blockchain:connected', startListener);
events.on('message:received', someMessageHandler);
```

### Whiteflag protocol state

The `WfState` singleton class defined by the `main/state` module keeps track
of the protocol state. As such, it holds all known accounts, originators,
cryptographic keys and blockchain status. The state should be initialized
using `WfState.init(...)` providing a master encryption key and, optionally,
the previously saved state.

```javascript
const state = WfState.init(masterKey, previousStateData);
```

To get the Whiteflag state instance, either use the synchronous or
asynchronous function:

```javascript
const state1 = WfState.getInstance();           // Throws if not initialized
const state2 = await WfState.readyInstance();   // Waits until initialized
```

The state data can be exported using the `WfState.export()` function
to store, and later restore, the state:

```javascript
const currentStateData = await state.export();
```

## The Whiteflag Network Layer

The blockchain overlay network layer is represented by the `WfNetwork`
singleton class defined by the `main/network` module. The network layer
provides access to one or more underlying blockchains used to send and
receive Whiteflag messages. To get the blockchain overlay network layer,
use the async `readyInstance()` method, which ensure that the Whiteflag
state has been initialized:

```javascript
const network = await WfNetwork.readyInstance();
```

For this layer to interact with the underlying blockchain layer, the WFJSL
assumes it can interact with a blockchain through the `Blockchain` interface.
For example, if the `Ethereum` class is an implementation of the Whiteflag
`Blockchain` interface to use an Ethereum network as one of the underlying
blockchains of the Whiteflag network, the sequence to initialize, connect to
and listen for Whiteflag messages on the Ethereum network is as follows:

```javascript
await network.initialize(new Ethereum(), { name: 'ethereum-mainnet', ... });
await network.connect('ethereum-mainnet');
await network.listen('ethereum-mainnet');
```

The blockchain name, in this case `Ethereum-mainnet`, is part of the
configuration data, defined by the `BlockchainConfigData` interface.

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
let incomingMessage = await WfMessage.fromHex(hexMessage);
```

Encryption and decryption is automatically performed upon encoding and
decoding, based on the value of the `EncryptionIndicator` field in the message
header.
