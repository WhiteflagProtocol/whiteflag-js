'use strict';
/**
 * @module core
 * @summary Whiteflag JS core protocol functionality
 * @document docs/md/modules.md
 * @primaryExport
 */
export {
    WfCodec,
    encodeField,
    decodeField,
    isValidValue
} from './lib/codec.ts';
export {
    WfProtocolError,
    WfErrorCode
} from './lib/errors.ts';
export {
    WfMsgType,
    WfCoreMessage,
    isValidMessage,
    validateMessage,
    encryptMessage,
    decryptMessage
} from './lib/message.ts';
export {
    WfVersion
} from './lib/versions.ts';
