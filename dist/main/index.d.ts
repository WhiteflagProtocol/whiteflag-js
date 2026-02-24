/**
 * @module main
 * @summary Whiteflag JS main programming interface
 * @document docs/md/packages.md
 * @primaryExport
 * @remarks This package provides all classes and functions required to
 * implement the Whiteflag protocol, including relevant ones from other
 * packages. Therefore, this should normally be the only dependency for
 * projects implementing Whiteflag.
 */
export { WfMessage, WfMetaHeader } from './lib/message.ts';
export { Blockchain, WfVersion, WfMsgType, WfError, WfErrorCode } from '@whiteflagprotocol/common';
export { WfAccount, WfOriginator } from '@whiteflagprotocol/core';
export { KeyStoreCtrl } from '@whiteflagprotocol/crypto';
