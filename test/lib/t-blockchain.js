'use strict';
/**
 * @module common/blockchain
 * @summary Whiteflag JS blockchain test implementation
 */

/* Dependencies */
import {
    hash,
    sign,
    verify,
    generateSignKeyPair
} from '@whiteflagprotocol/crypto';
import {
    b58ToU8a,
    b64ToU8a,
    b64uToU8a,
    hexToU8a,
    u8aToB64u,
    isBase58,
    isBase64,
    isBase64u,
    isHex,
    noHexPrefix,
    strToU8a,
    deepCopy,
    getPosixEpoch
} from '@whiteflagprotocol/util';

/* Test data */
import chain from './data/t-blockchain-data.json' with { type: 'json' };

/* Constants */
const PEERS = 2;
const BLOCKBATCHSIZE = 10;
const BLOCKTIME = 20;

/**
 * A simulated blockchain for testing
 * @remarks This class is an instance of the blockchain interface for testing
 * purposes, simulating a blockchain using ES256 as the default signing
 * algorithm and the base64url encoding of the first 16 bytes of the SHA-256
 * hash of the public key as the address.
 */
export class Blockchain {
    /* PROPERTIES */
    /** Holds the blockchain configuration */
    #config = {};
    /** Boolean simulating if connection is active */
    #initialized = false;
    /** Simulated blockchain node */
    #node = '';
    /** Boolean simulating if connection is active */
    #connected = false;
    /** Simulated number of peers */
    #syncing = null;
    /** Simulated number of peers */
    #peers = null;
    /** Simulated block height */
    #height = 0;

    /* CONSTRUCTOR */
    /**
     * Constructs a blockchain object
     * @param {string} [name] the name of the blockchain
     * @param {string} [alg] the identifier of the signature algorithm of the blockchain
     */
    constructor(name = 'dummychain', alg = 'ES256') {
        this.name = name;
        this.signAlgorithm = alg;
    }

    /* METHODS */
    /* 
     * PUBLIC CLASS METHODS for control
     * These functions are to control the blockchain object, e.g. initializing,
     * configuration, and connecting and disconnecting to the blockchain.
     */
    /**
     * Initilaizes the blockchain
     * @param config the blockchain configuration data
     * @returns `true` if the initialization was succesful, else `false`
     */
    async initialize(config) {
        /* Preserve configuration */
        this.#config = config;

        /* Determine host */
        const hScheme = config?.rpcProtocol ? `${config.rpcProtocol}://` : 'https://';
        const hHost = config?.hHost ? `${config.hHost}` : 'localhost';
        const hPort = config?.hPort ? `:${config?.hPort}` : '';
        const hPath = config?.hPath ? `${config?.hPath}` : '';
        this.#node = `${hScheme}${hHost}${hPort}${hPath}`;

        /* All done */
        this.#createNextBlock();
        return this.#initialized = true;
    };
    /**
     * Provides the simulated blockchain status
     * @returns the blockchain status data
     */
    status() {
        this.#isInitialized();
        const nBlocks = this.#connected ? this.#getBlockHeight() : null;
        return {
            name: this.name,
            node: this.#node,
            connected: this.#connected,
            syncing: this.#syncing,
            peers: this.#peers,
            blocks: nBlocks
        }
    };
    /**
     * Connects with a simulated blockchain node
     * @returns `true` if the connection has been established, else `false`
     * @remarks The blockchain should have been initialized before connecting.
     */
    async connect() {
        this.#isInitialized();
        this.#peers = PEERS;
        this.#syncing = true;
        return this.#connected = true;
    }
    /**
     * Disconnects from the simulated blockchain node
     * @returns `true` if the connection has been closed cleanly, else `false`
     */
    disconnect() {
        this.#isInitialized();
        this.#peers = null;
        this.#syncing = null;
        return !(this.#connected = false);
    }
    /**
     * Indicates if connected with the simulated blockchain node
     * @returns `true` if connected, or `false` if not connected
     */
    isConnected() {
        this.#isInitialized();
        return this.#connected;
    }
    /**
     * Provides the simulated blockchain configuration
     * @returns the blockchain configuration data
     */
    getConfig() {
        this.#isInitialized();
        return this.#config;
    }

    /* 
     * PUBLIC CLASS METHODS for offline use
     * These functions are available on all blockchain instances, even if
     * there is no connection.
     */
    /**
     * Creates a new key pair for this blockchain
     * @param {Uint8Array} secret optinal secret to create account from
     * @returns {Promise} resolves to a new blockchain key pair
     */
    async createKeypair(secret = null) {
        const keypair = await generateSignKeyPair(this.signAlgorithm);
        return keypair;
    }
    /**
     * Derives the blockchain address of an account from its public key
     * @param {string} publicKey the public key of the account
     * @returns {Promise} resolves to the blockchain address
     */
    async deriveAddress(publicKey) {
        const hashedPubkey = await hash(publicKey, 16);
        return u8aToB64u(hashedPubkey);
    }
    /**
     * Returns the binary blockchain address
     * @param {string} address the blockchain address in the regular encoding for this blockchain
     * @returns {Promise} resolves to the binary blockchain address
     */
    async getBinAddress(address) {
        if (isHex(address)) return hexToU8a(noHexPrefix(address));
        if (isBase58(address)) return b58ToU8a(address);
        if (isBase64(address)) return b64ToU8a(address);
        if (isBase64u(address)) return b64uToU8a(address);
        return strToU8a(address);
    }
    /**
     * Requests a signature using the blockchain's signature algorithm
     * @param {Uint8Array} data the binary data to sign
     * @param {CryptoKeyPair} keypair the private key of the account to sign the data with
     * @returns {Promise} resolves to the binary signature
     */
    async requestSignature(data, keypair) {
        const signature = await sign(data, keypair, this.signAlgorithm);
        return new Uint8Array(signature);
    }
    /**
     * Verifies a signature using the blockchain's signature algorithm
     * @param {Uint8Array} data the binary data that has been signed
     * @param {Uint8Array} signature the binary signature
     * @param {CryptoKey} publicKey the binary public key of the account used to create the signature
     * @returns {Promise} resolves to true if the signature is valid, else `false`
     */
    async verifySignature(data, signature, publicKey) {
        return verify(data, signature, publicKey, this.signAlgorithm);
    }

    /*
     * PUBLIC CLASS METHODS for online use
     * These functions are noramlly only available if there is a connection
     * with the * the underlying blockchain, and are therefore simulated here
     * for testing purposes.
     */
    /**
     * Indicates if the underlying blockchain node is synchronizing with the blockchain
     * @returns {boolean} `true` if syncing, or `false` if synchronized
     */
    async isSyncing() {
        return this.isConnected();
    }
    /**
     * Returns the highest known block of the blockchain
     * @returns {Promise} the block height
     */
    async getBlockHeight() {
        this.#isConnected();
        return this.#getBlockHeight();
    }
    /**
     * Gets the transactions from the specified blocks
     * @param firstBlock the starting block
     * @param lastBlock the ending block (inclusive)
     * @returns a readible stream returning arrays with transdaction data for each block
     */
    getTransactions(firstBlock, lastBlock) {
        this.#isConnected();
        return new ReadableStream({
            start: streamCtrl => {
                this.#queueBlocks(firstBlock, lastBlock, streamCtrl);
            }
        }, { highWaterMark: this.#config?.blockBatchSize || BLOCKBATCHSIZE });
    }
    /**
     * Looks up a transaction on a blockchain by its transaction hash
     * @param txHash the hexadecimal encoded transaction hash
     * @returns {Promise} the transaction data, or `null` if the transaction does not exist
     */
    async getTransaction(txHash) {
        this.#isConnected();
        for (const block of chain.blocks) {
            const transaction = block.transactions.find(tx => tx.hash === txHash);
            if (transaction) return this.#getTransactionData(block, transaction);
        }
        return null;
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Checks if the blockchain has been initialized
     * @throws if the blockchain has not been initialized
     */
    #isInitialized() {
        if (!this.#initialized) throw new Error('Blockchain has not been initialized');
    }
    /**
     * Checks if connected to the blockchain network
     * @throws if the blockchain has not been connected
     */
    #isConnected() {
        this.#isInitialized();
        if (!this.#connected) throw new Error('Blockchain is not connected');
    }
    /**
     * Gets the blockheight
     * @returns the number of the highest known block
     */
    #getBlockHeight() {
        return this.#height;
    }
    /**
     * Puts the transactions from the specified blocks in the writeable stream
     * @param {ReadableStreamDefaultController} stream the stream controller
     * @param {number} firstBlock the first block to retrieve
     * @param {number} lastBlock the last block to retrieve
     */
    #queueBlocks(firstBlock, lastBlock, streamCtrl) {
        /* Check block numbers */
        if (firstBlock < 1) firstBlock = 1;
        if (!lastBlock || lastBlock > this.#getBlockHeight()) lastBlock = this.#getBlockHeight();

        /* Get blocks and enqueue in stream */
        for (let b = firstBlock; b <= lastBlock; b++) {
            const block = chain.blocks[b];
            const data = block.transactions.map(transaction => this.#getTransactionData(block, transaction));
            streamCtrl.enqueue(data);
        }
        streamCtrl.close();
    }
    /**
     * Puts block and transaction data in standardized data structure
     * @param {Object} block a block from the blockchain
     * @param {Object} transaction a transaction in a block
     * @returns the data of a blockchain transaction
     */
    #getTransactionData(block, transaction) {
        return {
            blockchain: this.name,
            success: true,
            time: getPosixEpoch(block.timestamp),
            sender: transaction.sender,
            receiver: transaction.receiver,
            hash: transaction.hash,
            block: block.number,
            amount: transaction.amount,
            data: transaction.data
        }
    }
    /**
     * Creates the next block
     */
    #createNextBlock() {
        const highestBlock = (chain.blocks.length - 1);
        if (this.#height < highestBlock) this.#height++;
        if (this.#height < highestBlock) setTimeout(this.#createNextBlock.bind(this), BLOCKTIME);
    }
};
