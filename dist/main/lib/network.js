'use strict';
export { WfNetwork };
import { WfLogger } from '@whiteflagprotocol/common';
import { WfErrorCode, WfProtocolError, WfRuntimeError, handleError } from '@whiteflagprotocol/common';
import { WfAccount } from '@whiteflagprotocol/core';
import { isString } from '@whiteflagprotocol/util';
import { WfState } from "./state.js";
import { WfBlockListener } from "./blockchain.js";
import { WfEvent, WfEventEmitter } from "./events.js";
import { WfMetaField } from "./message.js";
const wfLogger = WfLogger.getInstance();
const wfEvent = WfEventEmitter.getInstance();
let wfState;
let _blockchains = new Map();
let _listeners = new Map();
class WfNetwork {
    static #sit = Symbol('WfNetwork');
    static #instance;
    constructor(sit) {
        if (sit !== WfNetwork.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag blockchain overlay network');
        }
        Object.freeze(this);
    }
    static getInstance() {
        if (!this.#instance) {
            wfState = WfState.getInstance();
            this.#instance = new WfNetwork(this.#sit);
        }
        return this.#instance;
    }
    static async readyInstance() {
        if (!this.#instance) {
            wfState = await WfState.readyInstance();
            this.#instance = new WfNetwork(this.#sit);
        }
        return this.#instance;
    }
    async initialize(bc, config) {
        if (_blockchains.has(bc.name)) {
            throw new WfRuntimeError(`Blockchain ${bc.name} already exists`);
        }
        if (wfState.createBlockchain(bc.name)) {
            wfLogger.debug(`Created new empty blockchain state`, bc.name);
        }
        if (await bc.initialize(config)) {
            _blockchains.set(bc.name, bc);
            _listeners.set(bc.name, WfBlockListener.init(bc));
            wfEvent.emit(WfEvent.BLOCKCHAIN_INITIALIZED, bc);
            return true;
        }
        return false;
    }
    getBlockchain(blockchain) {
        const bc = _blockchains.get(blockchain);
        if (!bc)
            throw new WfRuntimeError(`Blockchain ${blockchain} does not exist`);
        return bc;
    }
    getListener(blockchain) {
        const listener = _listeners.get(blockchain);
        if (!listener)
            throw new WfRuntimeError(`Listener for blockchain ${blockchain} does not exist`);
        return listener;
    }
    isConnected(blockchain) {
        return this.getBlockchain(blockchain).isConnected();
    }
    isListening(blockchain) {
        return this.getListener(blockchain).isListening();
    }
    async status(blockchain) {
        return this.getBlockchain(blockchain).status();
    }
    async connect(blockchain) {
        const bc = this.getBlockchain(blockchain);
        if (bc.isConnected())
            return true;
        if (await bc.connect()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_CONNECTED, bc);
            return true;
        }
        return false;
    }
    async disconnect(blockchain) {
        const bc = this.getBlockchain(blockchain);
        if (!bc.isConnected())
            return true;
        const listener = this.getListener(blockchain);
        if (listener.isListening())
            listener.stop();
        if (await bc.disconnect()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_DISCONNECTED, bc);
            return true;
        }
        return false;
    }
    async listen(blockchain) {
        const listener = this.getListener(blockchain);
        if (await listener.start()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_LISTENING, listener);
            return true;
        }
        return false;
    }
    stop(blockchain) {
        const listener = this.getListener(blockchain);
        if (listener.stop()) {
            wfEvent.emit(WfEvent.BLOCKCHAIN_PAUSED, listener);
            return true;
        }
        return false;
    }
    async sendMessage(blockchain, message) {
        if (!message.isFinal())
            throw new WfRuntimeError(`Message to send on blockchain ${blockchain} has not been encoded`);
        const sender = message.getMeta(WfMetaField.ORIGINATOR_ADDR);
        if (!sender)
            throw new WfRuntimeError(`Message to send on blockchain ${blockchain} has no originator address in the metaheader`);
        const txData = {
            blockchain: blockchain,
            sender: getAddress(sender),
            data: message.toHex()
        };
        try {
            return await this.makeTransaction(blockchain, getAccount(sender), txData);
        }
        catch (err) {
            return handleError(err, `Cannot send message from account ${txData.sender} on blockchain ${blockchain}`);
        }
    }
    async transferFunds(blockchain, sender, receiver, amount) {
        const txData = {
            blockchain: blockchain,
            sender: getAddress(sender),
            receiver: getAddress(receiver),
            amount: amount
        };
        try {
            return this.makeTransaction(blockchain, getAccount(sender), txData);
        }
        catch (err) {
            return handleError(err, `Cannot transer funds from account ${txData.sender} to ${txData.receiver} on blockchain ${blockchain}`);
        }
    }
    async makeTransaction(blockchain, account, txData) {
        if (!this.getBlockchain(blockchain).isConnected()) {
            throw new WfRuntimeError(`No connection with blockchain ${blockchain}`);
        }
        const privateKey = await account.getPrivateKey();
        if (!privateKey) {
            throw new WfProtocolError(`No private key available for Whiteflag account: ${account.getAddress()}`, null, WfErrorCode.ACCOUNT);
        }
        const tx = await this.getBlockchain(blockchain).makeTransaction(txData, privateKey);
        return this.#emitTransactionResult(tx);
    }
    #emitTransactionResult(tx) {
        if (Object.hasOwn(tx, 'success')) {
            if (tx.success)
                wfEvent.emit(WfEvent.TRANSACTION_INCLUDED, tx);
        }
        else {
            wfEvent.emit(WfEvent.TRANSACTION_PENDING, tx);
        }
        return tx;
    }
}
function getAddress(a) {
    if (a instanceof WfAccount)
        return a.getAddress();
    if (isString(a))
        return a;
    throw new TypeError('Invalid blockchain account or address');
}
function getAccount(a) {
    if (a instanceof WfAccount)
        return a;
    if (isString(a)) {
        const account = wfState.getAccount(a);
        if (!account)
            throw new WfProtocolError(`Unknown Whiteflag account: ${a}`, null, WfErrorCode.ACCOUNT);
        return account;
    }
    throw new TypeError('Invalid blockchain account or address');
}
