'use strict';
export { WfBlockchainState, WfBlockListener, extractMessage };
import { WfLogger, WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { WFMSG_PREFIX } from '@whiteflagprotocol/core';
import { DataItem } from '@whiteflagprotocol/util';
import { retryPromise, getPosixEpoch, getIso8601, isNumber, jsonToObj, b64ToStr, strToHex } from '@whiteflagprotocol/util';
import { WfState } from "./state.js";
import { WfEvent, WfEventEmitter } from "./events.js";
import { WfMessage, WfMetaField } from "./message.js";
const wfLogger = WfLogger.getInstance();
const wfEvent = WfEventEmitter.getInstance();
const _listeners = new WeakSet();
const WFMSG_HEXPREFIX = strToHex(WFMSG_PREFIX);
const MINBLOCKINTERVAL = 10;
const MAXBLOCKINTERVAL = 100000;
const DEFAULTBLOCKRETRIES = 1;
const MINBLOCKRETRIES = 0;
const MAXBLOCKRETRIES = 10;
const MINTXBATCH = 1;
const MAXTXBATCH = 1000;
const DEFAULTTXBATCH = 64;
class WfBlockchainState extends DataItem {
    #data;
    constructor(data, ddat = Symbol('WfBlockchainState')) {
        if (!data?.name)
            throw new WfRuntimeError('Missing blockchain name in blockchain status data');
        super(data, data.name, ddat);
        this.#data = super.getDataReference(ddat);
    }
    static create(name) {
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
    static deserialize(data, blockchain) {
        return this.fromJson(b64ToStr(data), blockchain);
    }
    static fromJson(data, blockchain) {
        return this.fromObject(jsonToObj(data), blockchain);
    }
    static fromObject(data, blockchain) {
        if (data?.name !== blockchain) {
            throw new WfRuntimeError(`Blockchain name ${data?.name} does not match blockchain identifier ${blockchain}`);
        }
        return new this(data);
    }
    get name() {
        return this.#data.name;
    }
    get highestBlock() {
        return this.#data.state.highestBlock;
    }
    get currentBlock() {
        return this.#data.state.currentBlock;
    }
    get processedBlock() {
        return this.#data.state.processedBlock;
    }
    getName() {
        return this.#data.name;
    }
    getCurrentState() {
        return this.#data.state;
    }
}
class WfBlockListener {
    static #cit = Symbol('WfBlockListener');
    #bc;
    #state;
    #config;
    #nMessages = 0;
    #cursor = 0;
    #listening = false;
    #iid = null;
    constructor(bc, cit) {
        if (cit !== WfBlockListener.#cit) {
            throw new WfRuntimeError('Cannot directly instantiate a blockchain listener');
        }
        this.#bc = bc;
        _listeners.add(this.#bc);
        this.#state = getCurrentState(this.#bc.name);
        this.#config = this.#bc.getConfig();
    }
    static init(bc) {
        try {
            const errors = checkListenerConfig(bc.getConfig());
            if (errors.length > 0)
                throw new WfRuntimeError('Invalid blockchain configuration parameters', errors);
            if (_listeners.has(bc))
                throw new WfRuntimeError(`Listener for ${bc.name} already exists`);
        }
        catch (err) {
            return handleError(err, `Cannot initialize listener for blockchain ${bc.name}`);
        }
        return new this(bc, this.#cit);
    }
    get blockchain() {
        return this.#bc.name;
    }
    get name() {
        return this.#bc.name;
    }
    active() {
        return this.#listening;
    }
    get cursor() {
        return +this.#cursor;
    }
    async start() {
        if (!this.#bc.isConnected()) {
            throw new WfRuntimeError(`Blockchain ${this.#bc.name} is not connected`);
        }
        if (this.#cursor < 1) {
            await this.getHighestBlock();
            this.#cursor = this.#determineBlockCursor();
            wfLogger.debug(`Block cursor set to ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
        }
        this.#listening = true;
        this.#scheduleNextIteration(true);
        return this.#listening;
    }
    stop() {
        this.#cancelNextIteration();
        return !(this.#listening = false);
    }
    isActive() {
        return this.isListening();
    }
    isListening() {
        return this.#listening;
    }
    async getHighestBlock() {
        return this.#state.highestBlock = await this.#bc.getBlockHeight();
    }
    messageCount() {
        return this.#nMessages;
    }
    #cancelNextIteration() {
        if (this.#iid) {
            clearTimeout(this.#iid);
            this.#iid = null;
        }
    }
    async #scheduleNextIteration(immediate = false) {
        if (this.#listening) {
            if (immediate)
                return this.#executeIteration();
            wfLogger.trace(`Scheduling next block iteration in ${this.#config.blockIntervalTime} ms`, this.#bc.name);
            this.#iid = setTimeout(this.#executeIteration.bind(this), this.#config.blockIntervalTime);
        }
        return;
    }
    async #executeIteration() {
        this.#cursor = Math.max(this.#cursor, (this.#state.processedBlock + 1));
        await this.getHighestBlock();
        try {
            await retryPromise(this.#processBlocks(), this.#config.blockMaxRetries, MINBLOCKINTERVAL, this.#logWarning);
        }
        catch (err) {
            this.#logWarning(err, this.#cursor);
            this.#cursor++;
        }
        finally {
            if (this.#state.processedBlock < this.#state.highestBlock) {
                this.#scheduleNextIteration(true);
            }
            else {
                this.#scheduleNextIteration();
            }
        }
    }
    async #processBlocks() {
        const batchSize = this.#determineBlockBatchSize(this.#cursor, this.#state.highestBlock);
        if (batchSize === 0) {
            wfLogger.trace(`No blocks to retrieve at block ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
            return;
        }
        else {
            wfLogger.trace(`Retrieving ${batchSize} blocks starting at block ${this.#cursor}/${this.#state.highestBlock}`, this.#bc.name);
        }
        const blockStream = this.#bc.getTransactions(this.#cursor, this.#cursor + batchSize - 1);
        try {
            for await (const block of blockStream) {
                this.#state.currentBlock = this.#cursor;
                const [nMessages, nErrors] = await this.#processBlock(block);
                wfLogger.debug(`Found ${nMessages} messages in block ${this.#state.currentBlock}/${this.#state.highestBlock}`, this.#bc.name);
                if (nErrors > 0) {
                    wfLogger.warn(`Encountered ${nErrors} transaction errors while processing block ${this.#state.currentBlock}/${this.#state.highestBlock}`, this.#bc.name);
                }
                this.#state.processedBlock = this.#state.currentBlock;
                this.#cursor++;
            }
        }
        catch (err) {
            return handleError(err);
        }
    }
    async #processBlock(block) {
        wfEvent.emit(WfEvent.BLOCK_DISCOVERED, block);
        const results = await this.#processTransactionBatch(block);
        const nMessages = results.filter(result => result.status === 'fulfilled' && result.value).length;
        const nErrors = results.filter(result => result.status === 'rejected').length;
        return [nMessages, nErrors];
    }
    async #processTransactionBatch(transactions) {
        const fnProcessTransaction = this.#processTransaction.bind(this);
        return Promise.allSettled(transactions.map(fnProcessTransaction));
    }
    async #processTransaction(transaction) {
        const message = extractMessage(transaction);
        if (message instanceof WfMessage) {
            this.#nMessages++;
            wfEvent.emit(WfEvent.MESSAGE_RECEIVED, message);
            return true;
        }
        return false;
    }
    #determineBlockCursor() {
        checkCurrentState(this.#state);
        if (this.#config.blockRetrievalStart > 0) {
            wfLogger.trace(`Setting block cursor to configured starting block, unless already processed block is higher`, this.#bc.name);
            return Math.max(this.#config.blockRetrievalStart, (this.#state.processedBlock + 1));
        }
        if (this.#config.blockRetrievalRestart > 0) {
            wfLogger.trace(`Setting block cursor to configured number of blocks before highest block, unless already processed block is higher`, this.#bc.name);
            return Math.max((this.#state.highestBlock - this.#config.blockRetrievalRestart), (this.#state.processedBlock + 1));
        }
        if (this.#state.processedBlock > 0) {
            wfLogger.trace(`Setting block cursor to one block after highest processed block`, this.#bc.name);
            return Number(this.#state.processedBlock + 1);
        }
        if (this.#state.currentBlock > 0) {
            wfLogger.trace(`Setting block cursor to block that is currently processed`, this.#bc.name);
            return Number(this.#state.currentBlock);
        }
        if (this.#state.highestBlock > 1) {
            wfLogger.trace(`Setting block cursor to highest knwon block onm the chain`, this.#bc.name);
            return Number(this.#state.highestBlock - 1);
        }
        wfLogger.trace(`Setting block cursor to first block`, this.#bc.name);
        return 1;
    }
    #determineBlockBatchSize(firstBlock, lastBlock) {
        const nBlocks = lastBlock - firstBlock + 1;
        if (nBlocks > this.#config.blockBatchSize)
            return this.#config.blockBatchSize;
        if (nBlocks < 0)
            return 0;
        return nBlocks;
    }
    #logWarning(err, skippedBlock) {
        if (skippedBlock) {
            wfLogger.warn(`Skipping block ${skippedBlock}: ${err.message}`, this.#bc.name);
        }
        else {
            wfLogger.warn(err.message, this.#bc.name);
        }
    }
}
function extractMessage(transaction) {
    if (!transaction?.data?.startsWith(WFMSG_HEXPREFIX))
        return null;
    const message = WfMessage.fromHex(transaction.data);
    if (transaction.blockchain)
        message.setMeta(WfMetaField.BLOCKCHAIN, transaction.blockchain);
    if (transaction.block)
        message.setMeta(WfMetaField.BLOCK_NR, transaction.block);
    if (transaction.index)
        message.setMeta(WfMetaField.TX_INDEX, transaction.index);
    if (transaction.hash)
        message.setMeta(WfMetaField.TX_HASH, transaction.hash);
    if (transaction.time)
        message.setMeta(WfMetaField.TX_TIME, getIso8601(transaction.time));
    if (transaction.sender)
        message.setMeta(WfMetaField.ORIGINATOR_ADDR, transaction.sender);
    if (transaction.receiver)
        message.setMeta(WfMetaField.RECIPIENT_ADDR, transaction.receiver);
    return message;
}
function getCurrentState(blockchain) {
    const state = WfState.getInstance().getBlockchain(blockchain);
    if (state instanceof WfBlockchainState)
        return state.getCurrentState();
    throw new WfRuntimeError(`State of blockchain ${blockchain} is not available`);
}
function checkCurrentState(state) {
    if (!state?.highestBlock)
        state.highestBlock = 0;
    if (!state?.processedBlock)
        state.processedBlock = 0;
    if (!state?.currentBlock)
        state.currentBlock = 0;
    return state;
}
function checkListenerConfig(config) {
    let errors = [];
    if (isNumber(config.blockIntervalTime)) {
        if (config.blockIntervalTime < MINBLOCKINTERVAL)
            config.blockIntervalTime = MINBLOCKINTERVAL;
        if (config.blockIntervalTime > MAXBLOCKINTERVAL)
            config.blockIntervalTime = MAXBLOCKINTERVAL;
    }
    else {
        errors.push('Missing or invalid block retrieval interval');
    }
    if (!isNumber(config.blockRetrievalStart) || config.blockRetrievalStart < 0) {
        config.blockRetrievalStart = 0;
    }
    if (!isNumber(config.blockRetrievalRestart) || config.blockRetrievalRestart < 0) {
        config.blockRetrievalRestart = 0;
    }
    if (isNumber(config.blockMaxRetries)) {
        if (config.blockMaxRetries < MINBLOCKRETRIES)
            config.blockMaxRetries = MINBLOCKRETRIES;
        if (config.blockMaxRetries > MAXBLOCKRETRIES)
            config.blockMaxRetries = MAXBLOCKRETRIES;
    }
    else {
        config.blockMaxRetries = DEFAULTBLOCKRETRIES;
    }
    if (isNumber(config.transactionBatchSize)) {
        if (config.transactionBatchSize < MINTXBATCH)
            config.transactionBatchSize = MINTXBATCH;
        if (config.transactionBatchSize > MAXTXBATCH)
            config.transactionBatchSize = MAXTXBATCH;
    }
    else {
        config.transactionBatchSize = DEFAULTTXBATCH;
    }
    return errors;
}
