'use strict';
/**
 * @module common/message
 * @summary Whiteflag JS common message definitions module
 */
export {
    WfMsgType,
    WfMessageData,
    WfCoreMessageData,
    WfMetaHeader,
    WfMsgHeader,
    WfMsgBody,
    WfMetaField,
    WfMsgField
};

/* Dependecies */
import { Serializable, serializable, Hex, Iso8601 } from '@whiteflagprotocol/util';

/* MODULE DECLARATIONS */
/**
 * Whiteflag message types, defining the types of Whiteflag message
 * as specified by the Whiteflag standard
 * @wfversion v1-draft.7
 * @wfreference 2.4.2.1 Functional Messages, 2.4.2.2 Management Messages
 */
enum WfMsgType {
    /** unknown message type, e.g. when encrypted  */
    unknown = '',
    /** Authentication message */
    A = 'A',
    /** Cryptographic support message */
    K = 'K',
    /** Test message */
    T = 'T',
    /** Protection sign */
    P = 'P',
    /** Protection sign */
    D = 'D',
    /** Status signal */
    S = 'S',
    /** Emergency signal */
    E = 'E',
    /** Infrstructure sign */
    I = 'I',
    /** Mission signal */
    M = 'M',
    /** Request signal */
    Q = 'Q',
    /** Reference message */
    R = 'R',
    /** Free text message */
    F = 'F'
}
/**
 * Whiteflag message data structure as used by the `WfMessage` class
 */
interface WfMessageData extends WfCoreMessageData {
    /** The metaheader of the Whiteflag message */
    MetaHeader: WfMetaHeader;
}
/**
 * Whiteflag core message data structure as used by the `WfCoreMessage` class
 */
interface WfCoreMessageData extends Serializable {
    /** The header of the Whiteflag message */
    MessageHeader: WfMsgHeader;
    /** The body of the Whiteflag message */
    MessageBody: WfMsgBody;
}
/**
 * Whiteflag message metaheader
 * @remarks The metaheader is not defined by the Whiteflag specification. The
 * entries defined here are the ones as used by Whiteflag JS.
 */
interface WfMetaHeader extends Serializable {
    /** Any meta property is allowed, but value types are restructed to
     *  strings, array of strings, numbers, booleans, null and undefined */
    [key: string]: serializable | undefined;
    /** Indicates if the message has been
     * automatically generated */
    [WfMetaField.AUTOGEN]?: string;
    /** The name identifying the underlying blockchain */
    [WfMetaField.BLOCKCHAIN]?: string;
    /** Indicates if this message is to be transmitted (TX) to the
     * blockchain or has been received (RX) from the blockchain */
    [WfMetaField.TX_DIRECTION]?: string;
    /** Indicates if message was succesfully put into a
     * blockchain transaction */
    [WfMetaField.TX_SUCCESS]?: boolean;
    /** The hash of the transaction containing the Whiteflag message,
     * encoded as specified for the blockchain */
    [WfMetaField.TX_HASH]?: string;
    /** The timestamp of the message transaction or block
     * containing the Whiteflag message */
    [WfMetaField.TX_TIME]?: Iso8601;
    /** The index of the message transaction in a block */
    [WfMetaField.TX_INDEX]?: number;
    /** The number of the block the message transaction is in */
    [WfMetaField.BLOCK_NR]?: number;
    /** The number of blocks from current block where transaction
     * is in, * until the confirmation maximum is reached */
    [WfMetaField.BLOCK_DEPTH]?: number;
    /** Indication whether the message is confirmed,
     * i.e. the minimal block depth has been reached */
    [WfMetaField.CONFIRMED]?: boolean;
    /** The address of the blockchain account to which
     * the message is sent (required to determine encryption key) */
    [WfMetaField.RECIPIENT_ADDR]?: string;
    /** The address of the blockchain account from which
     * the message is sent */
    [WfMetaField.ORIGINATOR_ADDR]?: string;
    /** The public key of the blockchain account from which
     * the message is sent */
    [WfMetaField.ORIGINATOR_PUBKEY]?: Hex;
    /** Indicates if a valid A-message preceded this message,
     * or if it is itself a valid A-message */
    [WfMetaField.ORIGINATOR_VALID]?: boolean;
    /** Indicates if this messages references other
     * messages correctly */
    [WfMetaField.REFERENCE_VALID]?: boolean;
    /** Indicates if the message complies with the
     * Whiteflag specification */
    [WfMetaField.FORMAT_VALID]?: boolean;
    /** Message validation errors */
    [WfMetaField.ERRORS]?: string[];
    /** The hexadecimal representation of the message
     * in compressed binary encoding, optionally encrypted */
    [WfMetaField.ENCODED]?: Hex;
    /** The hexadecimal representation of the initialization
     * vector of an encrypted message */
    [WfMetaField.CRYPTO_IV]?: Hex;
    /** The hexadecimal representation of the secret from which
     * the encryption key is derived */
    [WfMetaField.CRYPTO_IKM]?: Hex;
}
/**
 * Whiteflag message header as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgHeader extends Serializable {
    /* Required for dynamic creation */
    [key: string]: string | undefined;
    /* Defined header fields
     * for all versions */
    [WfMsgField.H_PREFIX]?: string;
    [WfMsgField.H_VERSION]?: string;
    [WfMsgField.H_ENCRYPTIND]?: string;
    [WfMsgField.H_DURESSIND]?: string;
    [WfMsgField.H_MSGCODE]?: string;
    [WfMsgField.H_REFERENCEIND]?: string;
    [WfMsgField.H_REFERENCEDMSG]?: string;
}
/**
 * Whiteflag message body as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgBody extends Serializable {
    /* Required for dynamic creation */
    [key: string]: string | undefined;
    /* Defined body fields
     * for all versions and message types */
    [WfMsgField.VERIFICATIONMTD]?: string;
    [WfMsgField.VERIFICATIONDATA]?: string;
    [WfMsgField.CRYPTDATATYPE]?: string;
    [WfMsgField.CRYPTDATA]?: string;
    [WfMsgField.PSEUDOMSGCODE]?: string;
    [WfMsgField.SUBJECTCODE]?: string;
    [WfMsgField.DATETIME]?: string;
    [WfMsgField.DURATION]?: string;
    [WfMsgField.OBJTYPE]?: string;
    [WfMsgField.OBJLAT]?: string;
    [WfMsgField.OBJLONG]?: string;
    [WfMsgField.OBJSIZE1]?: string;
    [WfMsgField.OBJSIZE2]?: string;
    [WfMsgField.OBJORNT]?: string;
    [WfMsgField.REFERENCEMTD]?: string;
    [WfMsgField.REFERENCEDATA]?: string;
    [WfMsgField.TEXT]?: string;
}
/**
 * Whiteflag message metaheader fields as used by the WFJSL
 */
enum WfMetaField {
    /** Indicates if the message has been
     * automatically generated */
    AUTOGEN = 'autoGenerated',
    /** The name identifying the underlying blockchain */
    BLOCKCHAIN = 'blockchain',
    /** Indicates' if this message is to be transmitted (TX) to the
     * blockchain or has been received (RX) from the blockchain */
    TX_DIRECTION = 'transceiveDirection',
    /** Indicates if message was succesfully put into a
     * blockchain transaction */
    TX_SUCCESS = 'transmissionSuccess',
    /** The hash of the transaction containing the Whiteflag message,
     * encoded as specified for the blockchain */
    TX_HASH = 'transactionHash',
    /** The timestamp of the message transaction or block
     * containing the Whiteflag message */
    TX_TIME = 'transactionTime',
    /** The index of the message transaction in a block */
    TX_INDEX = 'transactionIndex',
    /** The number of the block the message transaction is in */
    BLOCK_NR = 'blockNumber',
    /** The number of blocks from current block where transaction
     * is in, * until the confirmation maximum is reached */
    BLOCK_DEPTH = 'blockDepth',
    /** Indication whether the message is confirmed,
     * i.e. the minimal block depth has been reached */
    CONFIRMED = 'confirmed',
    /** The address of the blockchain account to which
     * the message is sent (required to determine encryption key) */
    RECIPIENT_ADDR = 'recipientAddress',
    /** The address of the blockchain account from which
     * the message is sent */
    ORIGINATOR_ADDR = 'originatorAddress',
    /** The public key of the blockchain account from which
     * the message is sent */
    ORIGINATOR_PUBKEY = 'originatorPubKey',
    /** Indicates if a valid A-message preceded this message,
     * or if it is itself a valid A-message */
    ORIGINATOR_VALID = 'originatorValid',
    /** Indicates if this messages references other
     * messages correctly */
    REFERENCE_VALID = 'referenceValid',
    /** Indicates if the message complies with the
     * Whiteflag specification */
    FORMAT_VALID = 'formatValid',
    /** Message validation errors */
    ERRORS = 'validationErrors',
    /** The hexadecimal representation of the message
     * in compressed binary encoding, optionally encrypted */
    ENCODED = 'encodedMessage',
    /** The hexadecimal representation of the initialization
     * vector of an encrypted message */
    CRYPTO_IV = 'encryptionInitVector',
    /** The hexadecimal representation of the secret from which
     * the encryption key is derived */
    CRYPTO_IKM = 'encryptionKeyInput'
}
/**
 * Whiteflag message field names used by all message types
 * as specified by the Whiteflag standard
 * @wfversion v1-draft.7
 * @wfreference 4.2 Message Header, 4.3 Message Body
 * @remarks The header fields are indicated by `H_` and are present
 * in all messages. All other fields are used depending on the
 * message type.
 */
enum WfMsgField {
    H_PREFIX = 'Prefix',
    H_VERSION = 'Version',
    H_ENCRYPTIND = 'EncryptionIndicator',
    H_DURESSIND = 'DuressIndicator',
    H_MSGCODE = 'MessageCode',
    H_REFERENCEIND = 'ReferenceIndicator',
    H_REFERENCEDMSG = 'ReferencedMessage',
    VERIFICATIONMTD = 'VerificationMethod',
    VERIFICATIONDATA = 'VerificationData',
    CRYPTDATATYPE = 'CryptoDataType',
    CRYPTDATA = 'CryptoData',
    PSEUDOMSGCODE = 'PseudoMessageCode',
    REFERENCEMTD = 'ReferenceMethod',
    REFERENCEDATA = 'ReferenceData',
    TEXT = 'Text',
    SUBJECTCODE = 'SubjectCode',
    DATETIME = 'DateTime',
    DURATION = 'Duration',
    OBJTYPE = 'ObjectType',
    OBJLAT = 'ObjectLatitude',
    OBJLONG = 'ObjectLongitude',
    OBJSIZE1 = 'ObjectSizeDim1',
    OBJSIZE2 = 'ObjectSizeDim2',
    OBJORNT = 'ObjectOrientation'
}
