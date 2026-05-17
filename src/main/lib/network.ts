'use strict';
/**
 * @module main/network
 * @summary Whiteflag JS blockchain overlay network module
 */
export {
    WfNetwork
};

/* Dependencies */
import { Address, Blockchain, BlockchainConfigData, BlockchainStatusData, TransactionData, WfLogger } from '@whiteflagprotocol/common';
import { WfErrorCode, WfProtocolError, WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { WfAccount } from '@whiteflagprotocol/core';
import { isString } from '@whiteflagprotocol/util';

/* Module imports */
import { WfState } from './state.ts';
import { WfBlockListener } from './blockchain.ts';
import { WfEvent, WfEventEmitter } from './events.ts';
import { WfMessage, WfMetaField } from './message.ts';

/* Related singleton classes */
const wfLogger: WfLogger = WfLogger.getInstance();
const wfEvent: WfEventEmitter = WfEventEmitter.getInstance();
let wfState: WfState;

/* PRIVATE MODULE DATA */
/** The configured blockchains */
let _blockchains: Map<string,Blockchain> = new Map();
/** The blockchain listeners */
let _listeners: Map<string,WfBlockListener> = new Map();

/* MODULE DECLARATIONS */
/**
 * The Whiteflag blockchain overlay network
 * @todo Test sending transactions and messages
 */
class WfNetwork {
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('WfNetwork');
    /** Property to keep a single instance of the class */
    static #instance: WfNetwork;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the Whiteflag blockchain overlay network
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== WfNetwork.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag blockchain overlay network');
        }
        Object.freeze(this);
    }
    /**
     * Gets the blockchain layer
     * @returns the blockchain layer singular instance
     * @throws if the Whiteflag state has not been initialized
     * @remarks The Whiteflag state must have been initialized before
     * the blockchain layer can be instantiated.
     */
    public static getInstance(): WfNetwork {
        if (!this.#instance) {
            wfState = WfState.getInstance();
            this.#instance = new WfNetwork(this.#sit);
        }
        return this.#instance;
    }
    /**
     * Waits for the initialized Whiteflag protocol state before instantiating the blockchain layer
     * @returns the blockchain layer singular instance
     * @remarks This is a safer method to get the blockchain layer instance
     * because it waits for the Whiteflag state to have been initialized.
     */
    public static async readyInstance(): Promise<WfNetwork> {
        if (!this.#instance) {
            wfState = await WfState.readyInstance();
            this.#instance = new WfNetwork(this.#sit);
        }
        return this.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Configures a blockchain
     * @param bc the blockchain implementation
     * @param config the blockchain configuration data
     * @returns `true` if the blockchain is succesfully configured, else false
     * @emits `blockchain:initialized` when the blockchain is initialized
     */
    public async initialize(bc: Blockchain, config: BlockchainConfigData): Promise<boolean> {
        /* Check if blockchain already exists */
        if (_blockchains.has(bc.name)) {
            throw new WfRuntimeError(`Blockchain ${bc.name} already exists`);
        }
        /* Create new empty blockchain state if not existing */
        if (wfState.createBlockchain(bc.name)) {
            wfLogger.debug(`Created new empty blockchain state`, bc.name);
        }
        /* Initialize the blockchain */
        if (await bc.initialize(config)) {
            _blockchains.set(bc.name, bc);
            _listeners.set(bc.name, WfBlockListener.init(bc));
            wfEvent.emit(WfEvent.BLOCKCHAIN_INITIALIZED, bc);
            return true;
        }
        return false;
    }
    /**
     * Provides direct access to the specified blockchain instance
     * @param blockchain the name of the blockchain to access
     * @returns the blockchain instance
     * @throws if the blockchain does not exist
     */
    public getBlockchain(blockchain: string): Blockchain {
        const bc = _blockchains.get(blockchain);
        if (!bc) throw new WfRuntimeError(`Blockchain ${blockchain} does not exist`);
        return bc;
    }
    /**
     * Provides direct access to the specified blockchain listener instance
     * @param blockchain the name of the blockchain
     * @returns the blockchain listener instance
     * @throws if the blockchain does not exist
     */
    public getListener(blockchain: string): WfBlockListener {
        const listener = _listeners.get(blockchain);
        if (!listener) throw new WfRuntimeError(`Listener for blockchain ${blockchain} does not exist`);
        return listener;
    }
    /**
     * Checks if the blockchain is connected
     * @param blockchain the name of the blockchain
     * @returns `true` if connected, else `false`
     */
    public isConnected(blockchain: string): boolean {
        return this.getBlockchain(blockchain).isConnected();
    }
    /**
     * Checks if the blockchain listener is active
     * @param blockchain the name of the blockchain
     * @returns `true` if listening, else `false`
     */
    public isListening(blockchain: string): boolean {
        return this.getListener(blockchain).isListening();
    }
    /**
     * Provides the status of the specified blockchain
     * @param blockchain the name of the blockchain to get the status of
     * @returns the blockchain status data
     */
    public async status(blockchain: string): Promise<BlockchainStatusData> {
        return this.getBlockchain(blockchain).status();
    }
    /**
     * Connects with a blockchain
     * @param blockchain the name of the blockchain to connect
     * @emits `blockchain:connected` when the blockchain is connected
     * @returns `true` if succesfully connected to the blockchain, else false
     */
    public async connect(blockchain: string): Promise<boolean> {
        const bc = this.getBlockchain(blockchain);
        if (bc.isConnected()) return true;
        if (await bc.connect()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_CONNECTED, bc);
            return true;
        }
        return false;
    }
    /**
     * Disconnects from a blockchain
     * @param blockchain the name of the blockchain to disconnect
     * @emits `blockchain:disconnected` when the blockchain is connected
     * @returns `true` if succesfully connected to the blockchain, else false
     */
    public async disconnect(blockchain: string): Promise<boolean> {
        const bc = this.getBlockchain(blockchain);
        if (!bc.isConnected()) return true;
        
        /* Stop listener */
        const listener = this.getListener(blockchain);
        if (listener.isListening()) listener.stop();

        /* Disconnect from node */
        if (await bc.disconnect()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_DISCONNECTED, bc);
            return true;
        }
        return false;
    }
    /**
     * Starts the blockchain listener
     * @param blockchain the name of the blockchain to listen to
     * @returns `true` if the listener is started, else `false`
     */
    public async listen(blockchain: string): Promise<boolean> {
        const listener = this.getListener(blockchain);
        if (await listener.start()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_LISTENING, listener);
            return true;
        }
        return false;
    }
    /**
     * Stops listening to the blockchain
     * @param blockchain the name of the blockchain to stop listening to
     * @returns `true` if the listener is stopped, else `false`
     */
    public stop(blockchain: string): boolean {
        const listener = this.getListener(blockchain);
        if (listener.stop()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_PAUSED, listener);
            return true;
        }
        return false;
    }
    /**
     * Sends a Whiteflag message on a blockchain
     * @param blockchain the name of the blockchain
     * @param message an encoded Whiteflag message, with the orginitaor's address in the metadata
     * @returns the transaction data
     */
    public async sendMessage(blockchain: string, message: WfMessage): Promise<TransactionData> {
        /* Check if message has been encoded */
        if (!message.isFinal()) throw new WfRuntimeError(`Message to send on blockchain ${blockchain} has not been encoded`);

        /* Check sender */
        const sender = message.getMeta(WfMetaField.ORIGINATOR_ADDR) as Address;
        if (!sender) throw new WfRuntimeError(`Message to send on blockchain ${blockchain} has no originator address in the metaheader`);

        /* Transaction data for a Whiteflag message */
        const txData = {
            blockchain: blockchain,
            sender: getAddress(sender),
            data: message.toHex()
        }
        /* Make the transaction on the blockchain */
        try {
            return await this.makeTransaction(blockchain, getAccount(sender), txData);
        } catch(err) {
            return handleError(err, `Cannot send message from account ${txData.sender} on blockchain ${blockchain}`);
        }
    }
    /**
     * Transfers funds from one account to another on a blockchain
     * @param blockchain the name of the blockchain
     * @param sender the account sending the funds
     * @param receiver the account receiving the funds
     * @param amount the ammount to transfer
     * @returns the transaction data
     */
    public async transferFunds(blockchain: string, sender: WfAccount | Address, receiver: WfAccount | Address, amount: number): Promise<TransactionData> {
        /* Transaction data for a funds transfer */
        const txData = {
            blockchain: blockchain,
            sender: getAddress(sender),
            receiver: getAddress(receiver),
            amount: amount
        }
        /* Make the transaction on the blockchain */
        try {
            return this.makeTransaction(blockchain, getAccount(sender), txData);
        } catch(err) {
            return handleError(err, `Cannot transer funds from account ${txData.sender} to ${txData.receiver} on blockchain ${blockchain}`);
        }
    }
    /**
     * Makes a transaction on a blockchain
     * @param blockchain the name of the blockchain
     * @param account the account making the transaction
     * @param txData the transaction data
     * @returns the updated transaction data
     */
    public async makeTransaction(blockchain: string, account: WfAccount, txData: TransactionData):  Promise<TransactionData> {
        /* Check connection */
        if (!this.getBlockchain(blockchain).isConnected()) {
            throw new WfRuntimeError(`No connection with blockchain ${blockchain}`);
        }
        /* Get private key to sign the transaction */
        const privateKey = await account.getPrivateKey();
        if (!privateKey) {
            throw new WfProtocolError(`No private key available for Whiteflag account: ${account.getAddress()}`, null, WfErrorCode.ACCOUNT);
        }
        /* Make the transaction adn emit result */
        const tx = await this.getBlockchain(blockchain).makeTransaction(txData, privateKey);
        return this.#emitTransactionResult(tx);
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Emits transaction result based on the transaction data
     * @private
     * @param tx the data with the transaction result
     * @returns the data with the transaction result
     */
    #emitTransactionResult(tx: TransactionData): TransactionData {
        if (Object.hasOwn(tx, 'success')) {
            if (tx.success) wfEvent.emit(WfEvent.TRANSACTION_INCLUDED, tx);
        } else {
            wfEvent.emit(WfEvent.TRANSACTION_PENDING, tx);
        }
        return tx;
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Gives the blockchain address
 * @private
 * @param a the Whiteflag account or the blockchain address
 * @returns the blockchain address
 */
function getAddress(a: WfAccount | Address): Address {
    if (a instanceof WfAccount) return a.getAddress();
    if (isString(a)) return a;
    throw new TypeError('Invalid blockchain account or address');
}
/**
 * Gives the blockchain account
 * @private
 * @param a the Whiteflag account or the blockchain address
 * @returns the blockchain account
 */
function getAccount(a: WfAccount | Address): WfAccount {
    if (a instanceof WfAccount) return a;
    if (isString(a)) {
        const account = wfState.getAccount(a);
        if (!account) throw new WfProtocolError(`Unknown Whiteflag account: ${a}`, null, WfErrorCode.ACCOUNT);
        return account;
    }
    throw new TypeError('Invalid blockchain account or address');
}
