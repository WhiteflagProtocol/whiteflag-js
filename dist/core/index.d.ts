/**
 * @module core
 * @summary Whiteflag JS core protocol functionality
 * @document docs/md/packages.md
 * @remarks This package provides the modules that define Whiteflag core
 * protocol features as specified in the Whiteflag standard. As such, this
 * package is not a fully functional implementation of the protocol, but
 * separates core protocol functions from implementation-specific design
 * decisions. Therefore, this package is not intended to be used directly
 * by implementations of Whiteflag; instead, the `@whiteflagprotocol/main`
 * package should be used.
 */
export { WfAccount, WfAccountData } from './lib/account.ts';
export { WfSignature, createAuthSignature, createAuthToken, validateAuthSignature, isValidAuthSignature, isValidAuthToken } from './lib/authentication.ts';
export { WfCodec, encodeField, decodeField, isValidValue } from './lib/codec.ts';
export { WfCoreMessage, WfCoreMessageData, WfMsgHeader, WfMsgBody, isValidMessage, validateMessage, encryptMessage, decryptMessage } from './lib/message.ts';
export { WfOriginator, WfOriginatorData } from './lib/originator.ts';
export { WfVersion, WfMsgType, WfAuthMethod, WfCryptoMethod } from '@whiteflagprotocol/common';
export { BinaryBuffer } from '@whiteflagprotocol/util';
