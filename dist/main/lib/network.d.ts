/**
 * @module main/network
 * @summary Whiteflag JS blockchain overlay network module
 */
export { WfNetwork };
import { Address, Blockchain, BlockchainConfigData, BlockchainStatusData, TransactionData } from '@whiteflagprotocol/common';
import { WfAccount } from '@whiteflagprotocol/core';
import { WfBlockListener } from './blockchain.ts';
import { WfMessage } from './message.ts';
/**
 * The Whiteflag blockchain overlay network
 * @todo Test sending transactions and messages
 */
declare class WfNetwork {
    #private;
    /**
     * Constructs the Whiteflag blockchain overlay network
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Gets the blockchain layer
     * @returns the blockchain layer singular instance
     * @throws if the Whiteflag state has not been initialized
     * @remarks The Whiteflag state must have been initialized before
     * the blockchain layer can be instantiated.
     */
    static getInstance(): WfNetwork;
    /**
     * Waits for the initialized Whiteflag state before instantiating the blockchain layer
     * @returns the blockchain layer singular instance
     * @remarks This is a safer method to get the blockchain layer instance
     * because it waits for the Whiteflag state to have been initialized.
     */
    static readyInstance(): Promise<WfNetwork>;
    /**
     * Configures a blockchain
     * @param bc the blockchain implementation
     * @param config the blockchain configuration data
     * @returns `true` if the blockchain is succesfully configured, else false
     * @emits `blockchain:initialized` when the blockchain is initialized
     */
    initialize(bc: Blockchain, config: BlockchainConfigData): Promise<boolean>;
    /**
     * Provides direct access to the specified blockchain instance
     * @param blockchain the name of the blockchain to access
     * @returns the blockchain instance
     * @throws if the blockchain does not exist
     */
    getBlockchain(blockchain: string): Blockchain;
    /**
     * Provides direct access to the specified blockchain listener instance
     * @param blockchain the name of the blockchain
     * @returns the blockchain listener instance
     * @throws if the blockchain does not exist
     */
    getListener(blockchain: string): WfBlockListener;
    /**
     * Checks if the blockchain is connected
     * @param blockchain the name of the blockchain
     * @returns `true` if connected, else `false`
     */
    isConnected(blockchain: string): boolean;
    /**
     * Checks if the blockchain listener is active
     * @param blockchain the name of the blockchain
     * @returns `true` if listening, else `false`
     */
    isListening(blockchain: string): boolean;
    /**
     * Provides the status of the specified blockchain
     * @param blockchain the name of the blockchain to get the status of
     * @returns the blockchain status data
     */
    status(blockchain: string): Promise<BlockchainStatusData>;
    /**
     * Connects with a blockchain
     * @param blockchain the name of the blockchain to connect
     * @emits `blockchain:connected` when the blockchain is connected
     * @returns `true` if succesfully connected to the blockchain, else false
     */
    connect(blockchain: string): Promise<boolean>;
    /**
     * Disconnects from a blockchain
     * @param blockchain the name of the blockchain to disconnect
     * @emits `blockchain:disconnected` when the blockchain is connected
     * @returns `true` if succesfully connected to the blockchain, else false
     */
    disconnect(blockchain: string): Promise<boolean>;
    /**
     * Starts the blockchain listener
     * @param blockchain the name of the blockchain to listen to
     * @returns `true` if the listener is started, else `false`
     */
    listen(blockchain: string): Promise<boolean>;
    /**
     * Stops listening to the blockchain
     * @param blockchain the name of the blockchain to stop listening to
     * @returns `true` if the listener is stopped, else `false`
     */
    stop(blockchain: string): boolean;
    /**
     * Sends a Whiteflag message on a blockchain
     * @param blockchain the name of the blockchain
     * @param message an encoded Whiteflag message, with the orginitaor's address in the metadata
     * @returns the transaction data
     */
    sendMessage(blockchain: string, message: WfMessage): Promise<TransactionData>;
    /**
     * Transfers funds from one account to another on a blockchain
     * @param blockchain the name of the blockchain
     * @param sender the account sending the funds
     * @param receiver the account receiving the funds
     * @param amount the ammount to transfer
     * @returns the transaction data
     */
    transferFunds(blockchain: string, sender: WfAccount | Address, receiver: WfAccount | Address, amount: number): Promise<TransactionData>;
    /**
     * Makes a transaction on a blockchain
     * @param blockchain the name of the blockchain
     * @param account the account making the transaction
     * @param txData the transaction data
     * @returns the updated transaction data
     */
    makeTransaction(blockchain: string, account: WfAccount, txData: TransactionData): Promise<TransactionData>;
}
