'use strict';
/**
 * @module common/blockchain
 * @summary Whiteflag JS common blockchain module
 */
export {
    Blockchain,
    BlockListener,
    BlockchainConfigData,
    BlockchainStatusData,
    TransactionData
};

/* Dependencies */
import { ByteArray, Hex, Iso8601, Serializable, serializable } from '@whiteflagprotocol/util';

/* MODULE DECLARATIONS */
/** A blockchain address in the encoding specified for that blockchain */
export type Address = string;

/**
 * The blockchain used to send Whiteflag messages
 * @remarks The Whiteflag Protocol works on top of one or more blockchains.
 * While Whiteflag is blockchain-agnostic, the protocol requires some 
 * information about the underlying blockchain to function correctly.
 * This interface is an abstraction of a blockchain class that contains the
 * blockchain-specific parameters and methods that Whiteflag depends on.
 */
interface Blockchain {
    /* PROPERTIES */
    /** The name uniquely identifying the blockchain */
    name: string;
    /** The URL of the underlying blockchain node */
    node: URL
    /** The name or identifier of the signature algorithm of the blockchain */
    signAlgorithm: string;

    /* PUBLIC METHODS (Control) */
    /**
     * Initilaizes the blockchain
     * @param config the blockchain configuration paramters
     * @param status the last known blockchain status
     * @returns `true` if the initialization was succesful, else `false`
     */
    init(config: BlockchainConfigData, status: BlockchainStatusData): Promise<Blockchain>;
    /**
     * Connects with the blockchain node
     * @returns `true` if the connection has been established, else `false`
     * @remarks The blockchain should have been initialized before connecting.
     */
    connect(): Promise<boolean>;
    /**
     * Disconnects from the blockchain node
     * @returns `true` if the connection has been closed cleanly, else `false`
     */
    disconnect(): Promise<boolean>;
    /**
     * Indicates if the underlying blockchain node is synchronizing with the blockchain
     * @returns `true` if syncing, or `false` if synchronized
     */
    isConnected(): Promise<boolean>;

    /* PUBLIC METHODS (Offline) */
    /**
     * Creates a new key pair for this blockchain
     * @param secret optional blockchain-specific secret to create account from
     * @returns a new blockchain raw key pair with private key and public key
     * @remarks Should also work if not connected to the blockchain.
     */
    createKeypair(secret?: string): Promise<[ ByteArray, ByteArray ]>;
    /**
     * Returns the blockchain address of an account identified by its private key
     * @param publicKey the raw public key of the account to derive the address from
     * @returns the blockchain address in the regular encoding for this blockchain
     * @remarks Should also work if not connected to the blockchain.
     */
    deriveAddress(publicKey: ByteArray): Promise<string>;
    /**
     * Returns the binary blockchain address
     * @param address the blockchain address in the regular encoding for this blockchain
     * @returns the binary blockchain address
     * @remarks Should also work if not connected to the blockchain.
     */
    getBinAddress(address: string): Promise<ByteArray>;
        /**
     * Requests a signature using the blockchain's signature algorithm
     * @param data the binary data to sign
     * @param privateKey the raw private key of the account to sign the data with
     * @returns the binary signature
     * @remarks Should also work if not connected to the blockchain.
     */
    requestSignature(data: ByteArray, privateKey: ByteArray): Promise<ByteArray>;
    /**
     * Verifies a signature using the blockchain's signature algorithm
     * @param data the binary data that has been signed
     * @param signature the binary signature
     * @param publicKey the raw binary public key of the account used to create the signature
     * @returns `true` if the signature is valid, else `false`
     * @remarks Should also work if not connected to the blockchain.
     */
    verifySignature(data: ByteArray, signature: ByteArray, publicKey: ByteArray): Promise<boolean>;

    /** PUBLIC METHODS (Online) */
    /**
     * Indicates if the underlying blockchain node is synchronizing with the blockchain
     * @returns `true` if syncing, or `false` if synchronized
     */
    isSyncing(): Promise<boolean>;
    /**
     * Returns the highest known block of the blockchain
     * @returns the block height
     * @remarks Requires connection with the blockchain.
     */
    getBlockHeight(): Promise<number>;
    /**
     * Gets the transactions from the specified blocks
     * @param firstBlock the starting block
     * @param lastBlock the ending block (inclusive)
     * @returns an array with transaction data from the scanned blocks
     * @remarks Requires connection with the blockchain.
     */
    getTransactions(firstBlock: number, lastBlock?: number): Promise<Array<TransactionData>>;
    /**
     * Looks up a transaction on a blockchain by its transaction hash
     * @param txHash the hexadecimal encoded transaction hash
     * @returns an object with the transaction data, or `null` if the transaction does not exist
     * @remarks Requires connection with the blockchain.
     */
    getTransaction(txHash: Hex): Promise<TransactionData | null>;
    /**
     * Makes a transaction on the blockchain
     * @param txData an object with all relevant transaction data
     * @param privateKey the private key used to sign the transaction
     * @returns the updated transaction data
     * @remarks Requires connection with the blockchain. A transaction may
     * contain an encoded Whiteflag message in the `data` property, or be used
     * to transfer funds by including the `amount` property, or both.
     */
    makeTransaction(txData: TransactionData, privateKey: ByteArray): Promise<TransactionData>;
}
/**
 * A listener for blockchain transactions
 * @remarks This class defines an object that listens on a specific blockchain
 * and keeps track of the blocks using the Whiteflag state.
 * @todo Develop blockchain listener class
 */
class BlockListener {
    /* CLASS PROPERTIES */
    /** The blockchain to listen */
    readonly #blockchain: Blockchain;
    /** The interval between blocks in ms */
    readonly #interval: number;

    /* CONSTRUCTOR */
    /**
     * Constructor to create a blockchain account
     * @param blockchain the blockchain to listen on
     */
    constructor(blockchain: Blockchain, interval: number) {
        this.#blockchain = blockchain;
        this.#interval = interval;
    }
}
/**
 * Blockchain configuration data structure
 */
interface BlockchainConfigData extends Serializable {
    /* Additional configuration paramters are alloweed */
    [key: string]: serializable;
    /** The name of the blockchain */
    name: string;
    /** Indicates if this is a test chain */
    testnet: boolean;
    /** Indicates if this blockchain should be activated */
    active: boolean;
    /** The time is milliseconds between block retrievals */
    blockRetrievalInterval: number;
    /** The block number  */
    blockRetrievalStart: number;
    /** The maximum number of blocks to look back after a disconnect */
    blockRetrievalRestart: number;
    /** The maximum number retries if a block could not be retrieved */
    blockMaxRetries: number;
    /** The maximum number of transactions to be processed in parallel */
    transactionBatchSize: number;
    /** The timeout in milliseconds for connecting to a blockchain node */
    rpcTimeout: number;
    /** The protocol or scheme of the blockchain node's URI, e.g. `https` or `wss` */
    rpcProtocol: string;
    /** The fullt qualified host name of the blockchain node's URI */
    rpcHost: string;
    /** The port number of the blockchain node's URI */
    rpcPort: string;
    /** The resourve location the blockchain node's URI */
    rpcPath: string;
    /** The username required for access to the blockchain node */
    rpcUsername: string;
    /** The password required for access to the blockchain node */
    rpcPassword: string;
}
/**
 * Blockchain status data structure
 */
interface BlockchainStatusData extends Serializable {
    /* Additional configuration paramters are alloweed */
    [key: string]: Serializable | serializable | undefined;
    /** The name of the blockchain */
    name: string;
    /** The blockchain status */
    status: {
        /** The date-time of the last blockchain update */
        updated: Iso8601;
        /** Indicates if the blockchain is currently synchronizing */
        syncing: boolean;
        /** The highest known existing block on the blockchain */
        highestBlock: number;
        /** The block that is currently processed */
        currentBlock: number;
        /** The highest block that has been processed */
        processedBlock: number;
    }
}
/**
 * Blockchain transaction data structure
 */
interface TransactionData extends Serializable {
    /** The name of the blockchain */
    blockchain: string;
    /** Indicates if the transaction was successful */
    success?: boolean;
    /** The epoch timestamp of the transaction or the block */
    time?: number;
    /** The address of the sending account */
    sender?: Address;
    /** The address of the receiving account */
    receiver?: Address;
    /** The hexadecimal encoded transaction hash */
    hash?: Hex;
    /** The block number of the transaction */
    block?: number;
    /** The index of the transaction in the block */
    index?: number;
    /** The amount of tokens or currency sent with the transaction */
    amount?: number;
    /** The hexadecimal encoded data embedded in the transaction,
     *  e.g. an encoded Whiteflag message */
    data?: Hex;
}
