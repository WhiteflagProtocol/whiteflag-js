/**
 * @module core
 * @summary Whiteflag JS core protocol functionality
 * @document docs/md/packages.md
 * @primaryExport
 */
export { WfAccount, WfOriginator } from './lib/account.ts';
export { WfSignature, createAuthSignature, createAuthToken, validateAuthSignature, isValidAuthSignature, isValidAuthToken } from './lib/authentication.ts';
export { WfBlockchain } from './lib/blockchain.ts';
export { WfCodec, encodeField, decodeField, isValidValue } from './lib/codec.ts';
export { WfCoreMessage, WfMsgType, isValidMessage, validateMessage, encryptMessage, decryptMessage } from './lib/message.ts';
