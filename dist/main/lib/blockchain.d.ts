/**
 * @module main/blockchain
 * @summary Whiteflag JS main blockchain module
 */
export { WfBlockchainState, WfBlockchainData, WfBlockListener, extractMessage };
import { Blockchain, TransactionData } from '@whiteflagprotocol/common';
import { Base64, DataItem, Json, Serializable, serializable, posixtime } from '@whiteflagprotocol/util';
import { WfMessage } from './message.ts';
/**
 * Whiteflag blockchain state data structure
 */
interface WfBlockchainData extends Serializable {
    [key: string]: Serializable | serializable | undefined;
    /** The name of the blockchain */
    name: string;
    /** The blockchain state */
    state: {
        /** The POSIX epoch timestamp of the last blockchain state update */
        _timestamp: posixtime;
        /** The highest known existing block on the blockchain */
        highestBlock: number;
        /** The block that is currently processed */
        currentBlock: number;
        /** The highest block that has been processed */
        processedBlock: number;
    };
}
/**
 * The status of a blockchain
 * @remarks This class only keeps track of the status of a blockchain;
 * it does not provide any functionality for blockchain operations, such
 * as processing transactions.
 */
declare class WfBlockchainState extends DataItem<WfBlockchainData> {
    #private;
    /**
     * Constructs a blockchain status
     * @param data the serialized blockchain status data
     * @param ddat a direct data acces stoken for access to the private data property
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfBlockchainData, ddat?: symbol);
    /**
     * Creates a new blockchain status
     * @param name the name uniquely identifying the blockchain
     * @returns the blockchain status
     */
    static create(name: string): WfBlockchainState;
    /**
     * Deserializes the blockchain status data
     * @param data the base64 encoded JSON serialized blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns the blockchain status
     */
    static deserialize(data: Base64, blockchain: string): WfBlockchainState;
    /**
     * Creates a blockchain status from a JSON serialized object
     * @param data the JSON serialized object
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new data item
     */
    static fromJson(data: Json, blockchain?: string): WfBlockchainState;
    /**
     * Creates a blockchain status from a plain JavaScript object
     * @param data a plain JavaScript object  with the blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new blockchain account
     */
    static fromObject(data: WfBlockchainData, blockchain?: string): WfBlockchainState;
    /**
     * Returns the blockchain name as a property
     */
    get name(): string;
    /**
     * Returns the number of the highest known block as a property
     */
    get highestBlock(): number;
    /**
     * Returns the number of the block currently processed as a property
     */
    get currentBlock(): number;
    /**
     * Returns the number of the highest block that has been processed as a property
     */
    get processedBlock(): number;
    /**
     * Provides the name of the blockchain
     * @returns the human readible name of the blockchain
     */
    getName(): string;
    /**
     * Provides the current state of the blockchain
     * @returns the current blockchain state
     */
    getCurrentState(): WfBlockchainData['state'];
}
/**
 * A listener for blockchain transactions
 * @remarks This class defines an object that listens on a specific blockchain
 * and keeps track of the blocks using the Whiteflag state.
 */
declare class WfBlockListener {
    #private;
    /**
     * Constructor to create a blockchain account
     * @param bc the blockchain instance to listen on
     * @param cit the class instantiation token
     */
    private constructor();
    /**
     * Initilaizes the blockchain listener
     * @param bc the blockchain instance to listen on
     * @returns `true` if the initialization was succesful, else `false`
     */
    static init(bc: Blockchain): WfBlockListener;
    /**
     * Returns the blockchain name as a property
     */
    get blockchain(): string;
    /**
     * Returns the blockchain name as a property
     */
    get name(): string;
    /**
     * Returns listening status as a property
     */
    active(): boolean;
    /**
     * Returns the block cursor as a property
     */
    get cursor(): number;
    /**
     * Starts listening to the blockchain
     * @returns `true` if the listener is active, else `false`
     */
    start(): Promise<boolean>;
    /**
     * Stops listening to the blockchain
     * @returns `true` if the listener is stopped, else `false`
     */
    stop(): boolean;
    /** Checks if the listener is active, i.e. listening
     * @returns `true` if the listener is active, else `false`
    */
    isActive(): boolean;
    /** Checks if the listener is listening
     * @returns `true` if the listener is listening, else `false`
    */
    isListening(): boolean;
    /**
     * Gets the highest known block and updates the state
     * @returns the highest known block
     */
    getHighestBlock(): Promise<number>;
    /**
     * Gives the number received messages in this session, i.e. since initialization
     * @returns th number of received messages
     */
    messageCount(): number;
}
/**
 * Extracts a Whiteflag message from a blockchain transaction
 * @param transaction a blockchain transaction
 * @returns a Whiteflag message, or `null` if no message in the transaction
 */
declare function extractMessage(transaction: TransactionData): WfMessage | null;
