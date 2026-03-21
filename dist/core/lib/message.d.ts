/**
 * @module core/message
 * @summary Whiteflag JS core message module
 */
export { WfCoreMessage, WfCoreMessageData, WfMsgHeader, WfMsgBody, isValidMessage, validateMessage, encryptMessage, decryptMessage };
import { WfVersion, WfMsgType, WfCryptoMethod } from '@whiteflagprotocol/common';
import { ByteArray, BinaryBuffer, DataItem, DataId, Hex, Serializable } from '@whiteflagprotocol/util';
import { WfAccount } from './account.ts';
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
 * A core Whiteflag message as defined by the Whiteflag specification
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 * @remarks Ths class represents a core Whiteflag message as
 * defined by the Whiteflag specification. It has a message header and
 * a message body which contain the message fields as specified for the
 * message type. It performs the encoding/encryption and decoding/decryption
 * to and from binary messages. Since the processing of Whiteflag messges
 * in accordance with the protocol requires additional metadata, the extrended
 * `WfMessage` class of the `@whitelag/protol` package should normallly be
 * used instead of this class.
 */
declare class WfCoreMessage extends DataItem<WfCoreMessageData> {
    #private;
    /**
     * Constructs a Whiteflag message
     * @param data a plain JavaScript object with message header and body
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @param ddat a data acces stoken for access to the private data property
     */
    constructor(data: WfCoreMessageData, id?: DataId, ddat?: symbol);
    /**
     * Creates a new Whiteflag message
     * @param msgType the Whiteflag message type
     * @param version the Whiteflag protocol version
     * @returns a new Whiteflag message of the specified type
     */
    static create(msgType: WfMsgType, version?: WfVersion): WfCoreMessage;
    /**
 * Creates new Whiteflag message from a plain object
 * @param message a plain JavaScript object with message header and body
 * @returns a new Whiteflag message
 */
    static fromObject(message: any): WfCoreMessage;
    /**
     * Creates new Whiteflag message from a binary buffer
     * @param message a binary buffer with the encoded message
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message with the decoded message
     */
    static fromBinary(message: BinaryBuffer, account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfCoreMessage>;
    /**
     * Indicates if the message has already been encoded
     * @returns `true` if message has been encoded, else `false`
     */
    isEncoded(): boolean;
    /**
     * Indicates if the message is valid, i.e. if all fields contain valid values
     * @returns `true` if message is valid, else `false`
     */
    isValid(): boolean;
    /**
     * Returns message validation errors
     * @returns an array of validation errors
     */
    validate(): string[];
    /**
     * Decodes an unencrypted binary encoded message
     * @param message a binary encoded message
     * @returns a new Whiteflag message object
     */
    decode(message: BinaryBuffer): Promise<WfCoreMessage>;
    /**
     * Encodes the message, making the contents final
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is to be encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns this Whitedlag message object with the encoded message
     */
    encode(account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfCoreMessage>;
    /**
     * Returns the value of the specified message field
     * @param fieldName the name of the message field
     * @returns the value of the message field
     */
    get(fieldName: string): string | null;
    /**
     * Sets the value of the specified message field, if the message has not been encoded
     * @param fieldName the name of the message field
     * @param value the value to set
     * @returns `true` if succesful, else `false`
     */
    set(fieldName: string, value: string): boolean;
    /**
     * Returns the Whiteflag message as a string
     * @returns a concatinated string of field values
     */
    toString(): string;
    /**
     * Returns the Whiteflag message encoded as a hexadecimal string
     * @returns a hexadecimal string with the encoded message
     */
    toHex(): Hex;
    /**
     * Returns the encoded Whiteflag message as a byte array
     * @returns a UInt8array with the encoded message
     */
    toU8a(): Uint8Array;
}
/**
 * Checks if an object is a valid Whiteflag message
 * @param message the message object to validate
 * @returns `true` if message is valid, else `false`
 */
declare function isValidMessage(message: any): boolean;
/**
 * Checks a message object for validation errors
 * @param message the message object to validate
 * @returns an array of validation errors
 */
declare function validateMessage(message: any): string[];
/**
 * Encrypts a binary encoded message
 * @param message a binary buffer with the binary encoded message
 * @param method the Whiteflag encryption method
 * @param ikm the input key material to derive the encryption key
 * @param address the binary encoded originator address
 * @param iv the initialisation vector, if required for the encryption method
 * @param version the Whiteflag protocol version
 * @returns the encrypted message
 */
declare function encryptMessage(message: BinaryBuffer, method: WfCryptoMethod, ikm: ByteArray, address: ByteArray, iv?: ByteArray, version?: WfVersion): Promise<BinaryBuffer>;
/**
 * Decrypts an encrypted binary message
 * @param message a binary buffer with the encrypted message
 * @param method the Whiteflag encryption method
 * @param ikm the input key material to derive the encryption key
 * @param address the binary encoded originator address
 * @param iv the initialisation vector, if required for the encryption method
 * @param version the Whiteflag protocol version
 * @returns the decrypted binary encoded message
 */
declare function decryptMessage(message: BinaryBuffer, method: WfCryptoMethod, ikm: ByteArray, address: ByteArray, iv?: ByteArray, version?: WfVersion): Promise<BinaryBuffer>;
/**
 * Whiteflag message header as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgHeader extends Serializable {
    [key: string]: string | undefined;
    Prefix?: string;
    Version?: string;
    EncryptionIndicator?: string;
    DuressIndicator?: string;
    MessageCode?: string;
    ReferenceIndicator?: string;
    ReferencedMessage?: string;
}
/**
 * Whiteflag message body as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgBody extends Serializable {
    [key: string]: string | undefined;
    VerificationMethod?: string;
    VerificationData?: string;
    CryptoDataType?: string;
    CryptoData?: string;
    PseudoMessageCode?: string;
    SubjectCode?: string;
    DateTime?: string;
    Duration?: string;
    ObjectType?: string;
    ObjectLatitude?: string;
    ObjectLongitude?: string;
    ObjectSizeDim1?: string;
    ObjectSizeDim2?: string;
    ObjectOrientation?: string;
    ReferenceMethod?: string;
    ReferenceData?: string;
    Text?: string;
}
