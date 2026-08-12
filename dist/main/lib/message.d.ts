/**
 * @module main/message
 * @summary Whiteflag JS main message module
 */
export { WfMessage, WfMessageData, WfMetaHeader, WfMetaField, getMessageType };
import { TransactionHash } from '@whiteflagprotocol/common';
import { WfCoreMessage, WfCoreMessageData } from '@whiteflagprotocol/core';
import { BinaryBuffer, ByteArray, Base64, DataId, Hex, Iso8601, Json, Serializable, serializable } from '@whiteflagprotocol/util';
/**
 * Whiteflag message data structure as used by the `WfMessage` class
 */
interface WfMessageData extends WfCoreMessageData {
    /** The metaheader of the Whiteflag message */
    MetaHeader: WfMetaHeader;
}
/**
 * A Whiteflag message as defined by the Whiteflag specification
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 * @remarks This class extends the core Whiteflag message class by
 * adding metadata to the message, additional data conversions (such as to and
 * from JSON), and specific Whiteflag protocol features. This allows the class
 * to be used and integrated in larger functional applications in accordance
 * with the Whiteflag specification.
 */
declare class WfMessage extends WfCoreMessage {
    #private;
    /**
     * Constructs a Whiteflag message
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @param ddat a data acces stoken for access to the private data property
     */
    constructor(data: WfMessageData, binary?: BinaryBuffer, id?: DataId, ddat?: symbol);
    /**
     * Returns the unique id as a property
     */
    get id(): TransactionHash;
    /**
     * Creates a new Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     * @returns a new Whiteflag message of the specified type
     */
    static create(type: string, version?: string): WfMessage;
    /**
     * Deserializes the message data
     * @param data the base64 encoded JSON serialized originator data
     * @param txHash the transaction hash identifying the message
     * @returns the Whiteflag message
     */
    static deserialize(data: Base64, txHash: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a JSON serialized object
     * @param message the JSON serialized object
     * @param txHash the transaction hash identifying the message
     * @returns a new Whiteflag message
     */
    static fromJson(message: Json, txHash?: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a plain message data object
     * @param message a plain JavaScript object with a Whiteflag message
     * @param txHash the transaction hash identifying the message
     * @returns a new Whiteflag message
     */
    static fromObject(message: WfMessageData, txHash?: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a binary buffer
     * @param message a binary buffer with the encoded message
     * @returns a new Whiteflag message
     * @remarks The message will not yet be decrypted/decode
     */
    static fromBinary(message: BinaryBuffer): WfMessage;
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @returns a new Whiteflag message
     * @remarks The message will not yet be decrypted/decode
     */
    static fromHex(message: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a ByteArray with the binary encoded message
     * @returns a new Whiteflag message object
     * @remarks The message will not yet be decrypted/decode
     */
    static fromU8a(message: ByteArray): WfMessage;
    /**
     * Gives the message type
     * @returns a string with the message type, reference indicator and subject code
     */
    getType(): string;
    /**
     * Returns the value of the specified metaheader field
     * @param fieldName the name of the metaheader field
     * @returns the value of the metaheader field
     */
    getMeta(fieldName: string): serializable;
    /**
     * Sets the value of the specified metaheader field
     * @param fieldName the name of the metaheader field
     * @param value the value to set, which must be a string or a number
     * @returns `true` if succesful, else `false`, e.g. when field may not be altered
     * @remarks If the `transactionHash` metadata field is set, it also sets
     * the data item identifier to the same value autmatically. Some metadata
     * fields may be set only once and cannot be altered.
     */
    setMeta(fieldName: string, value: serializable): boolean;
    /**
     * Returns the message metaheader
     * @returns a plain object with the message metaheader
     */
    getMetaHeader(): WfMetaHeader;
    /**
     * Sets the values of metaheader fields
     * @param meta a Whiteflag message metaheader
     */
    setMetaHeader(meta: WfMetaHeader): boolean;
}
/**
 * Whiteflag message metaheader fields as used by the WFJSL
 */
declare enum WfMetaField {
    /** Indicates if the message has been
     * automatically generated */
    AUTOGEN = "autoGenerated",
    /** The name identifying the underlying blockchain */
    BLOCKCHAIN = "blockchain",
    /** Indicates' if this message is to be transmitted (TX) to the
     * blockchain or has been received (RX) from the blockchain */
    TX_DIRECTION = "transceiveDirection",
    /** Indicates if message was succesfully put into a
     * blockchain transaction */
    TX_SUCCESS = "transmissionSuccess",
    /** The hash of the transaction containing the Whiteflag message,
     * encoded as specified for the blockchain */
    TX_HASH = "transactionHash",
    /** The timestamp of the message transaction or block
     * containing the Whiteflag message */
    TX_TIME = "transactionTime",
    /** The index of the message transaction in a block */
    TX_INDEX = "transactionIndex",
    /** The number of the block the message transaction is in */
    BLOCK_NR = "blockNumber",
    /** The number of blocks from current block where transaction
     * is in, * until the confirmation maximum is reached */
    BLOCK_DEPTH = "blockDepth",
    /** Indication whether the message is confirmed,
     * i.e. the minimal block depth has been reached */
    CONFIRMED = "confirmed",
    /** The address of the blockchain account to which
     * the message is sent (required to determine encryption key) */
    RECIPIENT_ADDR = "recipientAddress",
    /** The address of the blockchain account from which
     * the message is sent */
    ORIGINATOR_ADDR = "originatorAddress",
    /** The public key of the blockchain account from which
     * the message is sent */
    ORIGINATOR_PUBKEY = "originatorPubKey",
    /** Indicates if a valid A-message preceded this message,
     * or if it is itself a valid A-message */
    ORIGINATOR_VALID = "originatorValid",
    /** Indicates if this messages references other
     * messages correctly */
    REFERENCE_VALID = "referenceValid",
    /** Indicates if the message complies with the
     * Whiteflag specification */
    FORMAT_VALID = "formatValid",
    /** Message validation errors */
    ERRORS = "validationErrors",
    /** The hexadecimal representation of the message
     * in compressed binary encoding, optionally encrypted */
    ENCODED = "encodedMessage",
    /** The hexadecimal representation of the initialization
     * vector of an encrypted message */
    CRYPTO_IV = "encryptionInitVector",
    /** The hexadecimal representation of the secret from which
     * the encryption key is derived */
    CRYPTO_IKM = "encryptionKeyInput"
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
 * Determines the message type
 * @param message a Whiteflag message
 * @returns a string with the message type, reference indicator and subject code
 */
declare function getMessageType(message: WfMessage): string;
