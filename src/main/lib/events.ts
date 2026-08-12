'use strict';
/**
 * @module main/events
 * @summary Whiteflag JS protocol events module
 */
export {
    WfEvent,
    WfEventType,
    WfEvents,
    WfEventEmitter,
    WfEventListener,
    WfEventData
};

/* Dependecies */
import { EventEmitter } from 'node:events';
import { WfRuntimeError, Blockchain, TransactionData, LogLevel } from '@whiteflagprotocol/common';
import { WfAccount, WfOriginator } from '@whiteflagprotocol/core';

/* Package modules */
import { WfState } from './state.ts';
import { WfBlockListener } from './blockchain.ts';
import { WfMessage } from './message.ts';
import { logWfEvents } from './logger.ts';

/* MODULE DECLARATIONS */
/** Function that listens to Whiteflag protocol events */
type WfEventListener = (data: WfEventData) => void;
/** All data types that can be emitted with an event */
type WfEventData = WfState | WfMessage | WfAccount | WfOriginator | WfBlockListener | Blockchain | TransactionData | TransactionData[];

/**
 * Whiteflag protocol event types
 */
enum WfEventType {
    /** Events related to the Whiteflag state */
    STATE = 'state',
    /** Events related to the Whiteflag protocol */
    PROTOCOL = 'protocol',
    /** Events related to Whiteflag messages */
    MESSAGE = 'message',
    /** Events related to a blockchain */
    BLOCKCHAIN = 'blockchain',
    /** Events related to a blockchain block */
    BLOCK = 'block',
    /** Events related to a blockchain transaction */
    TRANSACTION = 'transaction',
    /** Events related to a blockchain account */
    ACCOUNT = 'account',
    /** Events related to a Whiteflag originator */
    ORIGINATOR = 'originator'
}
/**
 * Whiteflag protocol event definitions
 */
enum WfEvent {
    /** Emitted when the Whiteflag state
     *  has been initialized */
    STATE_INITIALIZED = `${WfEventType.STATE}:initialized`,
    /** Emitted when the Whiteflag protocol
     *  has been initialized */
    PROTOCOL_INITIALIZED = `${WfEventType.PROTOCOL}:initialized`,
    /** Emitted when a message has been received,
     *  but not yet decrypted, decoded and verified*/
    MESSAGE_RECEIVED = `${WfEventType.MESSAGE}:received`,
    /** Emitted when a message has been verified,
     *  i.e. the decoded message is syntactically correct */
    MESSAGE_DECODED = `${WfEventType.MESSAGE}:decoded`,
    /** Emitted when a received message has been validated,
     *  i.e. the decoded message complies with the protocol */
    MESSAGE_VALIDATED = `${WfEventType.MESSAGE}:validated`,
    /** Emitted when a message has been submitted for transmission,
     *  requiring compliance checks and encoding */
    MESSAGE_SUBMITTED = `${WfEventType.MESSAGE}:submitted`,
    /** Emitted when a message has been prepared for transmission,
     *  i.e. it ccomplies with the protocol and is encoded */
    MESSAGE_ENCODED = `${WfEventType.MESSAGE}:encoded`,
    /** Emitted when a message has been transmitted,
     *  i.e. it has been embedded in a blockchain transaction */
    MESSAGE_TRANSMITTED = `${WfEventType.MESSAGE}:transmitted`,
    /** Emitted when a blockchain has been initialized, i.e. the
     *  blockchain instance has been created with the proper paramters */
    BLOCKCHAIN_INITIALIZED =  `${WfEventType.BLOCKCHAIN}:initialized`,
    /** Emitted when a blockchain is connected, i.e. the
     *  blockchain object made a connection with a node */
    BLOCKCHAIN_CONNECTED = `${WfEventType.BLOCKCHAIN}:connected`,
    /** Emitted when a blockchain is disconnected, i.e. the
     *  blockchain object broke the connection with a node */
    BLOCKCHAIN_DISCONNECTED = `${WfEventType.BLOCKCHAIN}:disconnected`,
    /** Emitted when the block listener is started,
     *  i.e. when started listening for messages in blocks */
    BLOCKCHAIN_LISTENING = `${WfEventType.BLOCKCHAIN}:listening`,
    /** Emitted when the block listener is paused,
     *  i.e. not listening for messages in blocks */
    BLOCKCHAIN_PAUSED = `${WfEventType.BLOCKCHAIN}:paused`,
    /** Emitted when one or more transaction have been found, e.g.
     *  when the blockchain is queried or a block has been discovered */
    BLOCK_DISCOVERED = `${WfEventType.BLOCK}:discovered`,
    /** Emitted when a transaction has been submitted to the blcockhain
     *  and is pending to be included in a block */
    TRANSACTION_PENDING = `${WfEventType.TRANSACTION}:pending`,
    /** Emitted when a transaction is included in a block
     *  but is not yet confirmed */
    TRANSACTION_INCLUDED = `${WfEventType.TRANSACTION}:included`,
    /** Emitted when a transaction is in a block
     *  that is at a specified block depth */
    TRANSACTION_CONFIRMED = `${WfEventType.TRANSACTION}:confirmed`,
    /** Emitted when a new account has been created,
     *  i.e. an own account account with possession of the private key */
    ACCOUNT_CREATED = `${WfEventType.ACCOUNT}:created`,
    /** Emitted when a new account has been discovered,
     *  i.e. an account used by someone else to send WHitedlag messages */
    ACCOUNT_DISCOVERED = `${WfEventType.ACCOUNT}:discovered`,
    /** Emitted when a new account has been validated,
     *  i.e. at least one authentiction message has been validated */
    ACCOUNT_VALIDATED = `${WfEventType.ACCOUNT}:validated`,
    /** Emitted when a new originatar has been discovered, i.e. a new account
     *  is validated that does not blong to an existing origintaor */
    ORIGINATOR_DISCOVERED = `${WfEventType.ORIGINATOR}:discovered`,
    /** Emitted when an originatar has been authenticated,
     *  i.e. the origintaor has at least one valid account */
    ORIGINATOR_AUTHENTICATED = `${WfEventType.ORIGINATOR}:authenticated`,
}
/**
 * Whiteflag protocol events and associated data
 */
interface WfEvents {
    [WfEvent.STATE_INITIALIZED]: [state: WfState];
    [WfEvent.MESSAGE_RECEIVED]: [message: WfMessage];
    [WfEvent.MESSAGE_DECODED]: [message: WfMessage];
    [WfEvent.MESSAGE_VALIDATED]: [message: WfMessage];
    [WfEvent.MESSAGE_SUBMITTED]: [message: WfMessage];
    [WfEvent.MESSAGE_ENCODED]: [message: WfMessage];
    [WfEvent.MESSAGE_TRANSMITTED]: [message: WfMessage];
    [WfEvent.BLOCKCHAIN_INITIALIZED]: [blockchain: Blockchain];
    [WfEvent.BLOCKCHAIN_CONNECTED]: [blockchain: Blockchain];
    [WfEvent.BLOCKCHAIN_DISCONNECTED]: [blockchain: Blockchain];
    [WfEvent.BLOCKCHAIN_LISTENING]: [listener: WfBlockListener];
    [WfEvent.BLOCKCHAIN_PAUSED]: [listener: WfBlockListener];
    [WfEvent.BLOCK_DISCOVERED]: [transactions: TransactionData[]];
    [WfEvent.TRANSACTION_PENDING]: [transaction: TransactionData];
    [WfEvent.TRANSACTION_INCLUDED]: [transaction: TransactionData];
    [WfEvent.TRANSACTION_CONFIRMED]: [transaction: TransactionData];
    [WfEvent.ACCOUNT_CREATED]: [account: WfAccount];
    [WfEvent.ACCOUNT_DISCOVERED]: [account: WfAccount];
    [WfEvent.ACCOUNT_VALIDATED]: [account: WfAccount];
    [WfEvent.ORIGINATOR_DISCOVERED]: [originator: WfOriginator];
    [WfEvent.ORIGINATOR_AUTHENTICATED]: [originator: WfOriginator];
}
/**
 * The Whiteflag event emitter
 * @extends EventEmitter
 * @remarks This singleton class defines the event emitter for Whiteflag
 * protocol events, such as a received message, a discovered or authenticated
 * originator, etc. This allows different parts of a Whiteflag application to
 * notify and transfer data to other parts.
 */
class WfEventEmitter extends EventEmitter<WfEvents> {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('WfEventEmitter');
    /** Property to keep a single instance of the class */
    static #instance: WfEventEmitter;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the Whiteflag event emitter
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        /* Prohibit direct instantiation */
        if (sit !== WfEventEmitter.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag event emitter');
        }
        super();
        Object.freeze(this);
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

    /* PUBLIC METHODS */
    /**
     * Adds a listener to all Whiteflag protocol events
     * @param listener the callback function to be called upon all events
     * @returns this Whiteflag event emitter, for chaining functions
     */
    public onAllEvents(listener: WfEventListener): this {
        for (const event of Object.values(WfEvent)) {
            this.addListener(event, listener);
        }
        return this;
    }
    /**
     * Removes a listener from all Whiteflag protocol events
     * @param listener the callback function to be removed from all events
     * @returns this Whiteflag event emitter, for chaining functions
     */
    public offAllEvents(listener: WfEventListener): this {
        for (const event of Object.values(WfEvent)) {
            this.removeListener(event, listener);
        }
        return this;
    }
    /**
     * Activates the logging of protocol events
     * @param level the highest level of the generated logs, default is `INFO`
     * @returns this Whiteflag event emitter, for chaining functions
     * @remarks The logging level determines the highest level at which the
     * logs are generated, not which events are logged. If set at `INFO` it
     * means that the logs will be at `INFO`, `DEBUG` and `TRACE`, depending
     * on the event. If set to the lowest level `TRACE`, all logs will be at
     * level `TRACE`. It does not affect the level at which logs are kept, as
     * that is determined by the logger. Once logging of events is activated,
     * it cannot be deactivated, but the log level can still be changed.
     */
    public logEvents(level: LogLevel = LogLevel.INFO): this {
        logWfEvents(this, level);
        return this;
    }
}
