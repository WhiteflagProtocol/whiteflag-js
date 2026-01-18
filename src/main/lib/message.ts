'use strict';
/**
 * @module main/message
 * @summary Whiteflag JS message class
 */
export {
    WfMessage,
    WfMetaHeader
};

/* Module imports */
import {
    WfVersion,
    WfMsgType,
    WfCoreMessage
} from '@whiteflagprotocol/core';
import {
    u8aToHex
} from '@whiteflagprotocol/util';

/**
 * A Whiteflag message as defined by the Whiteflag specification
 * @class WfMessage
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 * @remarks This class extends the core Whiteflag message class by
 * adding metadata to the message, additional data conversions (such as to and
 * from JSON), and specific Whiteflag protocol features. This allows the class
 * to be used and integrated in larger functional applications in accordance
 * with the Whiteflag specification.
 */
class WfMessage extends WfCoreMessage {
    /* CLASS PROPERTIES */

    /** The message metadata required for processing the message */
    protected meta: WfMetaHeader = {};

    /* CONSTRUCTOR */
    /**
     * Constructor for a Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     */
    constructor(type: string, version: string = '1') {
        super(type as WfMsgType, version as WfVersion);
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates new Whiteflag message from a plain object
     * @function fromObject
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message
     * @throws {WfProtocolError} if message could not be created
     */
    public static async fromJSON(message: string): Promise<WfMessage> {
        const wfMessage = await this.fromObject(JSON.parse(message));
        return wfMessage as WfMessage;
    }
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @param address the hexadecimal encoded originator address, if the message is encrypted
     * @param ikm the hexadecimalinput key material to derive the encryption key, if the message is encrypted
     * @param iv the hexadecimal initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     * @todo replace address with originator object
     */
    public static async fromHex(message: string, address?: string, ikm?: string, iv?: string): Promise<WfMessage> {
        const wfMessage = await super.fromHex(message, address, ikm, iv) as WfMessage;
        if (address) wfMessage.setMeta('originatorAddress', address);
        if (iv) wfMessage.setMeta('encryptionInitVector', iv);
        return wfMessage;
    }
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a Uint8Array with the binary encoded message
     * @param address the binary encoded originator address, if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     * @todo replace address with originator object
     */
    public static async fromU8a(message: Uint8Array, address?: Uint8Array, ikm?: Uint8Array, iv?: Uint8Array): Promise<WfMessage> {
        const wfMessage = await super.fromU8a(message, address, ikm, iv) as WfMessage;
        if (address) wfMessage.setMeta('originatorAddress', u8aToHex(address));
        if (iv) wfMessage.setMeta('encryptionInitVector', u8aToHex(iv));
        return wfMessage;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Returns the value of the metaheader field
     * @function getMeta
     * @param fieldName the name of the metaheader field
     * @returns the value of the metaheader field
     */
    public getMeta(fieldName: string): string | null {
        /* Look for field in metaheader */
        for (const field of Object.keys(this.meta)) {
            if (field === fieldName) return this.meta[field];
        }
        /* Specified field not found */
        return null;
    }
    /**
     * Sets the value of the specified metaheader field
     * @function setMeta
     * @param fieldName the name of the metaheader field
     * @param value the value to set
     * @return true if succesful, else false
     */
    public setMeta(fieldName: string, value: string): boolean {
        this.meta[fieldName] = value;
        return true;
    }
    /**
     * Returns the Whiteflag message as a plain object
     * @function toObject
     * @returns the message as a plain object
     */
    public toObject(): Object {
        let message = super.toObject() as any;
        message.MetaHeader = this.meta;
        return message;
    }
    /**
     * Returns the Whiteflag message as a plain object
     * @function toObject
     * @returns the message as a plain object
     */
    public toJSON(): string {
        return JSON.stringify(this.toObject());
    }
}

/* MODULE DECLARATIONS */
/**
 * Defines a Whiteflag message header object
 * @interface WfMetaHeader
 */
interface WfMetaHeader {
    /* Metaheader may include custom properties */
    [key: string]: any,
    /** Indicates if the message has been
     * automatically generated */
    autoGenerated?: string,
    /** The name identifying the underlying blockchain */
    blockchain?: string
    /** Indicates if this message is to be transmitted (TX) to the
     * blockchain or has been received (RX) from the blockchain */
    transceiveDirection?: string,
    /** Indicates if message was succesfully put into a
     * blockchain transaction */
    transmissionSuccess?: boolean,
    /** The hash of the transaction containing the Whiteflag message,
     * encoded as specified for the blockchain */
    transactionHash?: string,
    /** The timestamp of the message transaction or block
     * containing the Whiteflag message */
    transactionTime?: string,
    /** The index of the message transaction in a block */
    transactionIndex?: number,
    /** The number of the block the message transaction is in */
    blockNumber?: number,
    /** The number of blocks from current block where transaction
     * is in, * until the confirmation maximum is reached */
    blockDepth?: number,
    /** Indication whether the message is confirmed,
     * i.e. the minimal block depth has been reached */
    confirmed?: boolean,
    /** The address of the blockchain account to which
     * the message is sent (required to determine encryption key) */
    recipientAddress?: string,
    /** The address of the blockchain account from which
     * the message is sent */
    originatorAddress?: string,
    /** The public key of the blockchain account from which
     * the message is sent */
    originatorPubKey?: string,
    /** Indicates if a valid A-message preceded this message,
     * or if it is itself a valid A-message */
    originatorValid?: boolean,
    /** Indicates if this messages references other
     * messages correctly */
    referenceValid?: boolean,
    /** Indicates if the message complies with the
     * Whiteflag specification */
    formatValid?: boolean,
    /** Message validation errors */
    validationErrors?: string[],
    /** The hexadecimal representation of the message
     * in compressed binary encoding, optionally encrypted */
    encodedMessage?: string,
    /** The hexadecimal representation of the initialisation
     * vector of an encrypted message */
    encryptionInitVector?: string,
    /** The hexadecimal representation of the secret from which
     * the encryption key is derived */
    encryptionKeyInput?: string
}
