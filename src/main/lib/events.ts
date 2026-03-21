'use strict';
/**
 * @module main/events
 * @summary Whiteflag JS protocol events module
 */
export {
    WfEvents,
    WfEventEmitter
};

/* Dependecies */
import { EventEmitter } from 'node:events';
import { WfRuntimeError, Blockchain, TransactionData } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';

/* Module imports */
import { WfMessage } from './message.ts';

/* MODULE DECLARATIONS */
/**
 * Whiteflag protocol events definitions and associated data
 * @todo Connect events for full protocol message handling
 */
interface WfEvents {
    /** Emitted when a message has been received,
     *  but not yet decrypted, decoded and verified*/
    'message:received': [message: WfMessage];
    /** Emitted when a message has been verified,
     *  i.e. the decoded message is syntactically correct */
    'message:verified': [message: WfMessage];
    /** Emitted when a received message has been validated,
     *  i.e. the decoded message complies with the protocol */
    'message:validated': [message: WfMessage];
    /** Emitted when a message has been submitted for transmission,
     *  requiring compliance checks and encoding */
    'message:submitted': [message: WfMessage];
    /** Emitted when a message has been prepared for transmission,
     *  i.e. it ccomplies with the protocol and is encoded */
    'message:prepared': [message: WfMessage];
    /** Emitted when a message has been transmitted,
     *  i.e. it has been embedded in a blockchain transaction */
    'message:transmitted': [message: WfMessage];
    /** Emitted when a blockchain has been configured, i.e. the
     *  blockchain object has been created with the proper paramters */
    'blockchain:configured': [blockchain: Blockchain];
    /** Emitted when a blockchain is connected, i.e. the
     *  blockchain object made a connection with a node */
    'blockchain:connected': [blockchain: Blockchain];
    /** Emitted when a blockchain is disconnected, i.e. the
     *  blockchain object broke the connection with a node */
    'blockchain:disconnected': [blockchain: Blockchain];
    /** Emitted when one or more transaction have been found, e.g.
     *  when the blockchain is queried or a block has been discovered */
    'block:discovered': [transactions: TransactionData[]];
    /** Emitted when a transaction has been submitted to the blcockhain
     *  and is pending to be included in a block */
    'transaction:pending': [transaction: TransactionData];
    /** Emitted when a transaction has been submitted to the blcockhain
     *  and is pending to be included in a block */
    'transaction:included': [transaction: TransactionData];
    /** Emitted when a transaction is in a block
     *  but is not yet confirmed */
    'transaction:confirmed': [transaction: TransactionData];
    /** Emitted when a new account has been created,
     *  i.e. an own account account with possession of the private key */
    'account:created': [account: WfAccount];
    /** Emitted when a new account has been discovered,
     *  i.e. an account used by someone else to send WHitedlag messages */
    'account:discovered': [account: WfAccount];
    /** Emitted when a new account has been validated,
     *  i.e. at least one authentiction message has been validated */
    'account:validated': [account: WfAccount];
    /** Emitted when a new originatar has been discovered, i.e. a new account
     *  is validated that does not blong to an existing origintaor */
    'originator:discovered': [originator: WfOriginator];
    /** Emitted when an originatar has been authenticated,
     *  i.e. the origintaor has at least one valid account */
    'originator:authenticated': [originator: WfOriginator];
}
/**
 * The Whiteflag event emitter
 * @extends EventEmitter
 * @remarks This singleton class defines a event emitter for Whiteflag
 * protocol events, such as a received message, a discovered or authenticated
 * originator, etc. This allows different parts of a Whiteflag application to
 * notify and transfer data to other parts.
 */
class WfEventEmitter extends EventEmitter<WfEvents> {
    /** Singleton instantiation token */
    static #sit: Symbol = Symbol('WfEventEmitter');
    /** Property to keep a single instance of the class */
    static #instance: WfEventEmitter;

    /* CONSTRUCTOR AND STATIC FACTORY METHOD */
    /**
     * Constructs the Whiteflag event emitter
     */
    private constructor(sit: Symbol) {
        /* Prohibit direct instantiation */
        if (sit !== WfEventEmitter.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag event emitter access object');
        }
        super();
    }
    /**
     * Gets the Whiteflag event emitter
     * @returns the Whiteflag event emitter singular instance
     */
    public static getInstance(): WfEventEmitter {
        if (!WfEventEmitter.#instance) {
            WfEventEmitter.#instance = new WfEventEmitter(this.#sit);
        }
        return WfEventEmitter.#instance;
    }
}
