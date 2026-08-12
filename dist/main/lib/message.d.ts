/**
 * @module main/message
 * @summary Whiteflag JS main message module
 */
export { WfMessage, WfMessageData, WfMetaHeader, WfMetaField, getMessageType };
import { WfMetaHeader, WfMessageData, WfMetaField, TransactionHash } from '@whiteflagprotocol/common';
import { WfCoreMessage } from '@whiteflagprotocol/core';
import { BinaryBuffer, ByteArray, Base64, DataId, Hex, Json, serializable } from '@whiteflagprotocol/util';
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
     * @param txHash the transaction hash identifying the message
     * @returns a new Whiteflag message of the specified type
     */
    static create(type: string, version?: string, txHash?: TransactionHash): WfMessage;
    /**
     * Deserializes the message data
     * @param data the base64 encoded JSON serialized originator data
     * @param txHash the transaction hash identifying the message
     * @returns the Whiteflag message
     */
    static deserialize(data: Base64, txHash: TransactionHash): WfMessage;
    /**
     * Creates new Whiteflag message from a JSON serialized object
     * @param message the JSON serialized object
     * @param txHash the transaction hash identifying the message
     * @returns a new Whiteflag message
     */
    static fromJson(message: Json, txHash?: TransactionHash): WfMessage;
    /**
     * Creates new Whiteflag message from a plain message data object
     * @param message a plain JavaScript object with a Whiteflag message
     * @param txHash the transaction hash identifying the message, if known
     * @returns a new Whiteflag message
     */
    static fromObject(message: WfMessageData, txHash?: TransactionHash): WfMessage;
    /**
     * Creates new Whiteflag message from a binary buffer
     * @param message a binary buffer with the encoded message
     * @param txHash the transaction hash identifying the message, if known
     * @returns a new Whiteflag message
     * @remarks The message will not yet be decrypted/decode
     */
    static fromBinary(message: BinaryBuffer, txHash?: TransactionHash): WfMessage;
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @param txHash the transaction hash identifying the message, if known
     * @returns a new Whiteflag message
     * @remarks The message will not yet be decrypted/decode
     */
    static fromHex(message: Hex, txHash?: TransactionHash): WfMessage;
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a ByteArray with the binary encoded message
     * @param txHash the transaction hash identifying the message, if known
     * @returns a new Whiteflag message object
     * @remarks The message will not yet be decrypted/decode
     */
    static fromU8a(message: ByteArray, txHash?: TransactionHash): WfMessage;
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
 * Determines the message type
 * @param message a Whiteflag message
 * @returns a string with the message type, reference indicator and subject code
 */
declare function getMessageType(message: WfMessage): string;
