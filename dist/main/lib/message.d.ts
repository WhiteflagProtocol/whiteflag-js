/**
 * @module main/message
 * @summary Whiteflag JS main message module
 */
export { WfMessage, WfMessageData, WfMetaHeader };
import { WfAccount, WfCoreMessage, WfCoreMessageData } from '@whiteflagprotocol/core';
import { BinaryBuffer, ByteArray, Base64, DataId, Hex, Json, Serializable, serializable } from '@whiteflagprotocol/util';
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
     * @param data a Whiteflag core message object
     * @param id a unique identifier for the data item; automatically generated if not specified
     */
    constructor(data: WfCoreMessage, id?: DataId);
    /**
     * Creates a new Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     * @returns a new Whiteflag message of the specified type
     */
    static create(type: string, version?: string): WfMessage;
    /**
     * Deserializes the originator data
     * @param data the base64 encoded JSON serialized originator data
     * @param hash the transaction hash identifying the message
     * @returns the originator
     */
    static deserialize(data: Base64, hash: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a JSON serialized object
     * @param message the JSON serialized object
     * @param hash the transaction hash identifying the message
     * @returns a new Whiteflag message
     */
    static fromJson(message: Json, hash?: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a plain object
     * @param message a plain JavaScript object with a Whiteflag message
     * @param hash the transaction hash identifying the message
     * @returns a new Whiteflag message
     */
    static fromObject(message: any, hash?: Hex): WfMessage;
    /**
     * Creates new Whiteflag message from a binary buffer
     * @param message a binary buffer with the encoded message
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message with the decoded message
     * @remarks Adds the originator address and the initialisation vector
     * paramters to the metadata automatically.
     */
    static fromBinary(message: BinaryBuffer, account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfMessage>;
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the hexadecimalinput key material to derive the encryption key, if the message is encrypted
     * @param iv the hexadecimal initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message with the decoded message
     * @remarks Adds the originator address and the initialisation vector
     * paramters to the metadata automatically.
     */
    static fromHex(message: Hex, account?: WfAccount, ikm?: Hex, iv?: Hex): Promise<WfCoreMessage>;
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a ByteArray with the binary encoded message
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     * @remarks Adds the originator address and the initialisation vector
     * paramters to the metadata automatically.
     */
    static fromU8a(message: ByteArray, account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfCoreMessage>;
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
    autoGenerated?: string;
    /** The name identifying the underlying blockchain */
    blockchain?: string;
    /** Indicates if this message is to be transmitted (TX) to the
     * blockchain or has been received (RX) from the blockchain */
    transceiveDirection?: string;
    /** Indicates if message was succesfully put into a
     * blockchain transaction */
    transmissionSuccess?: boolean;
    /** The hash of the transaction containing the Whiteflag message,
     * encoded as specified for the blockchain */
    transactionHash?: string;
    /** The timestamp of the message transaction or block
     * containing the Whiteflag message */
    transactionTime?: string;
    /** The index of the message transaction in a block */
    transactionIndex?: number;
    /** The number of the block the message transaction is in */
    blockNumber?: number;
    /** The number of blocks from current block where transaction
     * is in, * until the confirmation maximum is reached */
    blockDepth?: number;
    /** Indication whether the message is confirmed,
     * i.e. the minimal block depth has been reached */
    confirmed?: boolean;
    /** The address of the blockchain account to which
     * the message is sent (required to determine encryption key) */
    recipientAddress?: string;
    /** The address of the blockchain account from which
     * the message is sent */
    originatorAddress?: string;
    /** The public key of the blockchain account from which
     * the message is sent */
    originatorPubKey?: string;
    /** Indicates if a valid A-message preceded this message,
     * or if it is itself a valid A-message */
    originatorValid?: boolean;
    /** Indicates if this messages references other
     * messages correctly */
    referenceValid?: boolean;
    /** Indicates if the message complies with the
     * Whiteflag specification */
    formatValid?: boolean;
    /** Message validation errors */
    validationErrors?: string[];
    /** The hexadecimal representation of the message
     * in compressed binary encoding, optionally encrypted */
    encodedMessage?: string;
    /** The hexadecimal representation of the initialisation
     * vector of an encrypted message */
    encryptionInitVector?: string;
    /** The hexadecimal representation of the secret from which
     * the encryption key is derived */
    encryptionKeyInput?: string;
}
