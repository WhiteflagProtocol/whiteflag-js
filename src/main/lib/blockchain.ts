'use strict';
/**
 * @module main/blockchain
 * @summary Whiteflag JS main blockchain module
 */
export {
    WfBlockchainState,
    WfBlockchainData,
    WfBlockListener,
    extractMessage
};

/* Dependencies */
import { Blockchain, Block, BlockchainConfigData, TransactionData } from '@whiteflagprotocol/common';
import { WfLogger, WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { WFMSG_PREFIX } from '@whiteflagprotocol/core';
import { Base64, DataItem, Json, Serializable, serializable, posixtime } from '@whiteflagprotocol/util';
import { retryPromise, getPosixEpoch, getIso8601, isNumber, jsonToObj, b64ToStr, strToHex } from '@whiteflagprotocol/util';

/* Package modules */
import { WfState } from './state.ts';
import { WfEvent, WfEventEmitter } from './events.ts';
import { WfMessage, WfMetaField } from './message.ts';

/* Related singleton classes */
const wfLogger: WfLogger = WfLogger.getInstance();
const wfEvent: WfEventEmitter = WfEventEmitter.getInstance();

/* PRIVATE MODULE DATA */
/** The configured blockchains */
const _listeners: WeakSet<Blockchain> = new WeakSet();

/* Constants */
const WFMSG_HEXPREFIX = strToHex(WFMSG_PREFIX);
const MINBLOCKINTERVAL = 10;
const MAXBLOCKINTERVAL = 100000;
const DEFAULTBLOCKRETRIES = 1;
const MINBLOCKRETRIES = 0;
const MAXBLOCKRETRIES = 10;
const MINTXBATCH = 1;
const MAXTXBATCH = 1000;
const DEFAULTTXBATCH = 64;

/* MODULE DECLARATIONS */
/**
 * Whiteflag blockchain state data structure
 */
interface WfBlockchainData extends Serializable {
    /* Additional state parameters are alloweed */
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
    }
}
/**
 * The status of a blockchain
 * @remarks This class only keeps track of the status of a blockchain;
 * it does not provide any functionality for blockchain operations, such
 * as processing transactions.
 */
class WfBlockchainState extends DataItem<WfBlockchainData> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: WfBlockchainData;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs a blockchain status
     * @param data the serialized blockchain status data
     * @param ddat a direct data acces stoken for access to the private data property
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfBlockchainData, ddat = Symbol('WfBlockchainState')) {
        /* Check essential data */
        if (!data?.name) throw new WfRuntimeError('Missing blockchain name in blockchain status data');

        /* Create account as data item using the address as the data item identifier */
        super(data, data.name, ddat);
        this.#data = super.getDataReference(ddat) as WfBlockchainData;
    }
    /**
     * Creates a new blockchain status
     * @param name the name uniquely identifying the blockchain
     * @returns the blockchain status
     */
    public static create(name: string): WfBlockchainState {
        return new this({
            name: name,
            active: true,
            parameters: Object.create(null),
            state: Object.assign(Object.create(null), {
                _timestamp: getPosixEpoch(),
                highestBlock: 0,
                currentBlock: 0,
                processedBlock: 0
            })
        });
    }
    /**
     * Deserializes the blockchain status data
     * @param data the base64 encoded JSON serialized blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns the blockchain status
     */
    public static override deserialize(data: Base64, blockchain: string): WfBlockchainState {
        return this.fromJson(b64ToStr(data), blockchain);
    }
    /**
     * Creates a blockchain status from a JSON serialized object
     * @param data the JSON serialized object
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new data item
     */
    public static override fromJson(data: Json, blockchain?: string): WfBlockchainState {
        return this.fromObject(jsonToObj(data) as WfBlockchainData, blockchain);
    }
    /**
     * Creates a blockchain status from a plain JavaScript object
     * @param data a plain JavaScript object  with the blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new blockchain account
     */
    public static override fromObject(data: WfBlockchainData, blockchain?: string): WfBlockchainState {
        /* Check identifier */
        if (data?.name !== blockchain) {
            throw new WfRuntimeError(`Blockchain name ${data?.name} does not match blockchain identifier ${blockchain}`);
        }
        return new this(data);
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the blockchain name as a property
     */
    get name(): string {
        return this.#data.name;
    }
    /**
     * Returns the number of the highest known block as a property
     */
    get highestBlock(): number {
        return this.#data.state.highestBlock;
    }
    /**
     * Returns the number of the block currently processed as a property
     */
    get currentBlock(): number {
        return this.#data.state.currentBlock;
    }
    /**
     * Returns the number of the highest block that has been processed as a property
     */
    get processedBlock(): number {
        return this.#data.state.processedBlock;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Provides the name of the blockchain
     * @returns the human readible name of the blockchain
     */
    public getName(): string {
        return this.#data.name;
    }
    /**
     * Provides the current state of the blockchain
     * @returns the current blockchain state
     */
    public getCurrentState(): WfBlockchainData['state'] {
        return this.#data.state;
    }
}

/**
 * A listener for blockchain transactions
 * @remarks This class defines an object that listens on a specific blockchain
 * and keeps track of the blocks using the Whiteflag state.
 */
class WfBlockListener {
    /* CLASS PROPERTIES */
    /** Class instantiation token */
    static readonly #cit: Symbol = Symbol('WfBlockListener');
    /** The blockchain instance to listen to */
    readonly #bc: Blockchain;
    /** The blockchain to listen */
    readonly #state: WfBlockchainData['state'];
    /** The time is milliseconds between block retrievals */
    readonly #config: BlockchainConfigData;
    /** The number of the received Whiteflag messages since initialization */
    #nMessages: number = 0;
    /** The cursor pointing to the next block to process */
    #cursor: number = 0;
    /** Indicates if the listener is active */
    #listening: boolean = false;
    /* The id of the timeout repeatedly starting a block iteration */
    #iid: ReturnType<typeof setInterval> | null = null;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructor to create a blockchain account
     * @param bc the blockchain instance to listen on
     * @param cit the class instantiation token
     */
    private constructor(bc: Blockchain, cit: Symbol) {
        /* Prohibit direct instantiation */
        if (cit !== WfBlockListener.#cit) {
            throw new WfRuntimeError('Cannot directly instantiate a blockchain listener');
        }
        /* Register blockchain and listener */
        this.#bc = bc;
        _listeners.add(this.#bc);

        /* References to related objects */
        this.#state = getCurrentState(this.#bc.name);
        this.#config = this.#bc.getConfig();
    }
    /**
     * Initilaizes the blockchain listener
     * @param bc the blockchain instance to listen on
     * @returns `true` if the initialization was succesful, else `false`
     */
    public static init(bc: Blockchain): WfBlockListener {
        /* Check blockchain and configuration parameters */
        try {
            const errors = checkListenerConfig(bc.getConfig());
            if (errors.length > 0) throw new WfRuntimeError('Invalid blockchain configuration parameters', errors);
            if (_listeners.has(bc)) throw new WfRuntimeError(`Listener for ${bc.name} already exists`);
        } catch(err) {
            return handleError(err, `Cannot initialize listener for blockchain ${bc.name}`);
        }
        /* Create listener */
        return new this(bc, this.#cit);
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the blockchain name as a property
     */
    get blockchain(): string {
        return this.#bc.name;
    }
    /**
     * Returns the blockchain name as a property
     */
    get name(): string {
        return this.#bc.name;
    }
    /**
     * Returns listening status as a property
     */
    public active(): boolean {
        return this.#listening;
    }
    /**
     * Returns the block cursor as a property
     */
    get cursor(): number {
        return +this.#cursor;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Starts listening to the blockchain
     * @returns `true` if the listener is active, else `false`
     */
    public async start(): Promise<boolean> {
        /* Check connection */
        if (!this.#bc.isConnected()) {
            throw new WfRuntimeError(`Blockchain ${this.#bc.name} is not connected`);
        }
        /* Determine cursor */
        if (this.#cursor < 1) {
            await this.getHighestBlock();
            this.#cursor = this.#determineBlockCursor();
            wfLogger.debug(`Block cursor set to ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
        }
        /* Start listener */
        this.#listening = true;
        this.#scheduleNextIteration(true);
        return this.#listening;
    }
    /**
     * Stops listening to the blockchain
     * @returns `true` if the listener is stopped, else `false`
     */
    public stop(): boolean {
        this.#cancelNextIteration();
        return !(this.#listening = false);
    }
    /** Checks if the listener is active, i.e. listening
     * @returns `true` if the listener is active, else `false`
    */
    public isActive(): boolean {
        return this.isListening();
    }
    /** Checks if the listener is listening
     * @returns `true` if the listener is listening, else `false`
    */
    public isListening(): boolean {
        return this.#listening;
    }
    /**
     * Gets the highest known block and updates the state
     * @returns the highest known block
     */
    public async getHighestBlock(): Promise<number> {
        return this.#state.highestBlock = await this.#bc.getBlockHeight();
    }
    /**
     * Gives the number received messages in this session, i.e. since initialization
     * @returns th number of received messages
     */
    public messageCount() {
        return this.#nMessages;
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Stops the next iteration
     * @private
     */
    #cancelNextIteration(): void {
        if (this.#iid) {
            clearTimeout(this.#iid);
            this.#iid = null;
        }
    }
    /**
     * Secedules a block iteration
     * @private
     * @param immediate if `true` the next block iteration is started immediately, else it waits for the configured block time
     */
    async #scheduleNextIteration(immediate: boolean = false): Promise<void> {
        if (this.#listening) {
            if (immediate) return this.#executeIteration();
            wfLogger.trace(`Scheduling next block iteration in ${this.#config.blockIntervalTime} ms`, this.#bc.name);
            this.#iid = setTimeout(this.#executeIteration.bind(this), this.#config.blockIntervalTime);
        }
        return;
    }
    /**
     * Executes a block iteration
     * @private
     */
    async #executeIteration(): Promise<void> {
        /* Determine where we are and process next batch of blocks */
        this.#cursor = Math.max(this.#cursor, (this.#state.processedBlock + 1));
        await this.getHighestBlock();
        try {
            /* Process blocks and retry on error */
            await retryPromise(
                this.#processBlocks(),
                this.#config.blockMaxRetries,
                MINBLOCKINTERVAL,
                this.#logWarning
            );
        } catch(err) {
            /* Log any error as a warning and skip block */
            this.#logWarning(err as Error, this.#cursor);
            this.#cursor++;
        } finally {
            if (this.#state.processedBlock < this.#state.highestBlock) {
                this.#scheduleNextIteration(true);
            } else {
                this.#scheduleNextIteration();
            }
        }
    }
    /**
     * Processes one or more blocks
     * @private
     * @remarks No messages are returned; found messages are emitted as a Whiteflag protocol events
     */
    async #processBlocks(): Promise<void> {
        /* Determine batch size; if 0 then no blocks to process */
        const batchSize = this.#determineBlockBatchSize(this.#cursor, this.#state.highestBlock);
        if (batchSize === 0) {
            wfLogger.trace(`No blocks to retrieve at block ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
            return;
        } else {
            wfLogger.trace(`Retrieving ${batchSize} blocks starting at block ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
        }
        /* Process transactions from incoming stream of blocks */
        const blockStream = this.#bc.getTransactions(this.#cursor, this.#cursor + batchSize - 1);
        try {
            for await (const block of blockStream) {
                /* Update counters */
                this.#state.currentBlock = this.#cursor;
                
                /* Process the block */
                const [ nMessages, nErrors ] = await this.#processBlock(block);
                wfLogger.debug(`Found ${nMessages} messages in block ${this.#state.currentBlock}/${this.#state.highestBlock}`, this.#bc.name);
                if (nErrors > 0) {
                    wfLogger.warn(`Encountered ${nErrors} transaction errors while processing block ${this.#state.currentBlock}/${this.#state.highestBlock}`, this.#bc.name);
                }
                /* Update counters */
                this.#state.processedBlock = this.#state.currentBlock;
                this.#cursor++;
            }
        } catch(err) {
            return handleError(err);
        }
    }
    /**
     * Processes a block
     * @param block the block to process transaction from
     * @returns the number of Whiteflag message found in the block
     */
    async #processBlock(block: Block): Promise<[number, number]> {
        wfEvent.emit(WfEvent.BLOCK_DISCOVERED, block);
        const results = await this.#processTransactionBatch(block);

        /* Check results */
        const nMessages = results.filter(result => result.status === 'fulfilled' && result.value).length;
        const nErrors = results.filter(result => result.status === 'rejected').length;

        /* Log errors and return result */
        return [ nMessages, nErrors ];
    }
    /**
     * Processes the transactions from a block
     * @private
     * @param transactions an array with the transactions, e.g. all transactions of a block
     * @returns a boolean array with `true` indicating the transactions in the block that contained a Whiteflag message
     * @remarks No messages are returned; found messages are emitted as a Whiteflag protocol events
     */
    async #processTransactionBatch(transactions: TransactionData[]): Promise<PromiseSettledResult<boolean>[]> {
        /* Bind function to process a transaction to this listener */
        const fnProcessTransaction = this.#processTransaction.bind(this);

        /* Create a promise of promises that process the transactions */
        return Promise.allSettled(
            transactions.map(fnProcessTransaction)
        );
    }
    /**
     * Processes a blockchain transaction
     * @private
     * @param transaction a blockchain transaction
     * @returns `true` if the transaction contained a Whiteflag message, else `false`
     * @remarks No message is returned; found message are emitted as a Whiteflag protocol event
     */
    async #processTransaction(transaction: TransactionData): Promise<boolean> {
        const message = extractMessage(transaction);
        if (message instanceof WfMessage) {
            this.#nMessages++;
            wfEvent.emit(WfEvent.MESSAGE_RECEIVED, message);
            return true;
        }
        return false;
    }
    /**
     * Determines the block cursor based on the blockchain state and configuration
     * @private
     * @returns the initial block cursor
     */
    #determineBlockCursor(): number {
        /* Ensure state paramters are defined */
        checkCurrentState(this.#state);

        /* Use the starting block if configured, unless already processed block is higher */
        if (this.#config.blockRetrievalStart > 0) {
            wfLogger.trace(`Setting block cursor to configured starting block, unless already processed block is higher`, this.#bc.name);
            return Math.max(this.#config.blockRetrievalStart, (this.#state.processedBlock + 1));
        }
        /* ... else use the specified number blocks before the highest block, unless already processed block is higher */
        if (this.#config.blockRetrievalRestart > 0) {
            wfLogger.trace(`Setting block cursor to configured number of blocks before highest block, unless already processed block is higher`, this.#bc.name);
            return Math.max((this.#state.highestBlock - this.#config.blockRetrievalRestart), (this.#state.processedBlock + 1));
        }
        /* ... else use next block from highest processed block */
        if (this.#state.processedBlock > 0) {
            wfLogger.trace(`Setting block cursor to one block after highest processed block`, this.#bc.name);
            return Number(this.#state.processedBlock + 1);
        }
        /* ... else resume at current block, if known (i.e. higher than 0) */
        if (this.#state.currentBlock > 0) {
            wfLogger.trace(`Setting block cursor to block that is currently processed`, this.#bc.name);
            return Number(this.#state.currentBlock);
        }
        /* ... else use the highest known block */
        if (this.#state.highestBlock > 1) {
            wfLogger.trace(`Setting block cursor to highest knwon block onm the chain`, this.#bc.name);
            return Number(this.#state.highestBlock - 1);
        }
        /* ... else use the first block */
        wfLogger.trace(`Setting block cursor to first block`, this.#bc.name);
        return 1;
    }
    /**
     * Determines the block batch size, i.e. how many blocks to proces in one iteration
     * @private
     * @param firstBlock the first block of the batch
     * @param lastBlock the last block of the batch (inclusive)
     * @returns the number of blocks to process
     */
    #determineBlockBatchSize(firstBlock: number, lastBlock: number): number {
        const nBlocks = lastBlock - firstBlock + 1;
        if (nBlocks > this.#config.blockBatchSize) return this.#config.blockBatchSize;
        if (nBlocks < 0) return 0;
        return nBlocks;
    }
    /**
     * Logs an error as a warning
     * @private
     * @param err the error to log
     * @param block the block that will be skipped because of the error
     */
    #logWarning(err: Error, skippedBlock?: number): void {
        if (skippedBlock) {
            wfLogger.warn(`Skipping block ${skippedBlock}: ${err.message}`, this.#bc.name);
        } else {
            wfLogger.warn(err.message, this.#bc.name);
        }
    }
}

/* PUBLIC FUNCTIONS */
/**
 * Extracts a Whiteflag message from a blockchain transaction
 * @param transaction a blockchain transaction
 * @returns a Whiteflag message, or `null` if no message in the transaction
 */
function extractMessage(transaction: TransactionData): WfMessage | null {
    /* Check for data and WF prefix */
    if (!transaction?.data?.startsWith(WFMSG_HEXPREFIX)) return null;

    /* Create message and add metadata */
    const message = WfMessage.fromHex(transaction.data);
    if (transaction.blockchain) message.setMeta(WfMetaField.BLOCKCHAIN, transaction.blockchain);
    if (transaction.block) message.setMeta(WfMetaField.BLOCK_NR, transaction.block);
    if (transaction.index) message.setMeta(WfMetaField.TX_INDEX, transaction.index);
    if (transaction.hash) message.setMeta(WfMetaField.TX_HASH, transaction.hash);
    if (transaction.time) message.setMeta(WfMetaField.TX_TIME, getIso8601(transaction.time));
    if (transaction.sender) message.setMeta(WfMetaField.ORIGINATOR_ADDR, transaction.sender);
    if (transaction.receiver) message.setMeta(WfMetaField.RECIPIENT_ADDR, transaction.receiver);
    return message;
}

/* PRIVATE FUNCTIONS */
/**
 * Gets the current state of the specified blockchain
 * @private
 * @param blockchain the blockchain name
 * @returns the current blockchain state
 */
function getCurrentState(blockchain: string): WfBlockchainData['state'] {
    const state = WfState.getInstance().getBlockchain(blockchain);
    if (state instanceof WfBlockchainState) return state.getCurrentState();
    throw new WfRuntimeError(`State of blockchain ${blockchain} is not available`);
}
/**
 * Checks the current blockchain state parameters
 * @private
 * @param state the current blockchain state
 * @returns the current blockchain state
 */
function checkCurrentState(state: WfBlockchainData['state']): WfBlockchainData['state'] {
    if (!state?.highestBlock) state.highestBlock = 0;
    if (!state?.processedBlock) state.processedBlock = 0;
    if (!state?.currentBlock) state.currentBlock = 0;
    return state;
}
/**
 * Checks the configurstion paramteres for the block listener
 * @private
 * @param config the blockchain configuration data
 */
function checkListenerConfig(config: BlockchainConfigData): string[] {
    let errors: string[] = [];

    /* Block retrieval interval */
    if (isNumber(config.blockIntervalTime)) {
        if (config.blockIntervalTime < MINBLOCKINTERVAL) config.blockIntervalTime = MINBLOCKINTERVAL;
        if (config.blockIntervalTime > MAXBLOCKINTERVAL) config.blockIntervalTime = MAXBLOCKINTERVAL;
    } else {
        errors.push('Missing or invalid block retrieval interval');
    }
    /* Starting block */
    if (!isNumber(config.blockRetrievalStart) || config.blockRetrievalStart < 0) {
        config.blockRetrievalStart = 0;
    }
    /* Restarting block history */
    if (!isNumber(config.blockRetrievalRestart) || config.blockRetrievalRestart < 0) {
        config.blockRetrievalRestart = 0;
    }
    /* Block retries */
    if (isNumber(config.blockMaxRetries)) {
        if (config.blockMaxRetries < MINBLOCKRETRIES) config.blockMaxRetries = MINBLOCKRETRIES;
        if (config.blockMaxRetries > MAXBLOCKRETRIES) config.blockMaxRetries = MAXBLOCKRETRIES;
    } else {
        config.blockMaxRetries = DEFAULTBLOCKRETRIES;
    }
    /* Restarting block history */
    if (isNumber(config.transactionBatchSize)) {
        if (config.transactionBatchSize < MINTXBATCH) config.transactionBatchSize = MINTXBATCH;
        if (config.transactionBatchSize > MAXTXBATCH) config.transactionBatchSize = MAXTXBATCH;
    } else {
        config.transactionBatchSize = DEFAULTTXBATCH;
    }
    /* Return results */
    return errors;
}
