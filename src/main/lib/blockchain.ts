'use strict';
/**
 * @module main/blockchain
 * @summary Whiteflag JS state module
 */
export {
    WfBlockchainLayer,
    WfBlockchainStatus,
    WfBlockchainData
};

/* Dependencies */
import { Blockchain, BlockchainConfigData, BlockchainStatusData, WfRuntimeError } from '@whiteflagprotocol/common';
import { Base64, DataItem, Json } from '@whiteflagprotocol/util';
import { jsonToObj, b64ToStr } from '@whiteflagprotocol/util';

/* PRIVATE MODULE DATA */
/** The configured blockchains */
let _blockchains: Map<string,Blockchain> = new Map();

/* MODULE DECLARATIONS */
/**
 * Whiteflag blockchain data structure as used by the `WfBlockchainState` class
 */
interface WfBlockchainData extends BlockchainStatusData {
    /** The name of the blockchain */
    name: string;
    /** Inicates if the blockchain is actively used */
    active: boolean;
}
/**
 * The Whiteflag blockchain layer
 * @todo Implement blockchain layer, including status and listener
 */
class WfBlockchainLayer {
    /** Singleton instantiation token */
    static #sit: Symbol = Symbol('WfBlockchainLayer');
    /** Property to keep a single instance of the class */
    static #instance: WfBlockchainLayer;

    /* CONSTRUCTOR AND STATIC FACTORY METHOD */
    /**
     * Constructs the Whiteflag blockchain layer
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== WfBlockchainLayer.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag blockchain layer');
        }
        Object.freeze(this);
    }
    /**
     * Gets the blockchain layer
     * @returns the blockchain layer singular instance
     */
    public static getInstance(): WfBlockchainLayer {
        if (!this.#instance) {
            this.#instance = new WfBlockchainLayer(this.#sit);
        }
        return this.#instance;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Configures a blockchain
     * @param blockchain the blockchain implementation
     * @param config the blockchain configuration data
     * @returns `true` if the blockchain is succesfully configured, else false
     * @emits `blockchain:configured` when the blockchain is configured
     * @todo Implement blockchain configuration
     */
    public async configure(blockchain: Blockchain, config: BlockchainConfigData): Promise<boolean> {
        /* todo: check if not already active */
        /* todo: get or create blockchain state */
        /* todo: initialize the blockchain */
        return true;
    }
    /**
     * Connects to a blockchain
     * @param blockchain the name of the blockchain to connect to
     * @returns `true` if succesfully connected to the blockchain, else false
     * @emits `blockchain:connected` when the blockchain is connected
     * @todo Implement blockchain connection
     */
    public async connect(blockchain: string): Promise<boolean> {
        /* todo: connect the blockchain */
        return true;
    }
}

/**
 * The status of a blockchain
 * @remarks This class only keeps track of the status of a blockchain;
 * it doens not provide any functions for blockchain operations, such
 * as processing transactions.
 */
class WfBlockchainStatus extends DataItem<WfBlockchainData> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: WfBlockchainData;

    /* CONSTRUCTOR */
    /**
     * Constructs a blockchain status
     * @param data the serialized blockchain status data
     * @param ddat a direct data acces stoken for access to the private data property
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfBlockchainData, ddat = Symbol('WfBlockchainStatus')) {
        /* Check essential data */
        if (!data?.name) throw new WfRuntimeError('Missing blockchain name in blockchain status data');

        /* Create account as data item using the address as the data item identifier */
        super(data, data.name, ddat);
        this.#data = super.getDataReference(ddat) as WfBlockchainData;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new blockchain status
     * @param name the name uniquely identifying the blockchain
     * @returns the blockchain status
     */
    public static create(name: string): WfBlockchainStatus {
        return new WfBlockchainStatus({
            name: name,
            active: true,
            parameters: Object.create(null),
            status: Object.assign(Object.create(null), {
                updated: new Date().toISOString(),
                syncing: false,
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
    public static override deserialize(data: Base64, blockchain: string): WfBlockchainStatus {
        return this.fromJson(b64ToStr(data), blockchain);
    }
    /**
     * Creates a blockchain status from a JSON serialized object
     * @param data the JSON serialized object
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new data item
     */
    public static override fromJson(data: Json, blockchain?: string): WfBlockchainStatus {
        return this.fromObject(jsonToObj(data) as WfBlockchainData, blockchain);
    }
    /**
     * Creates a blockchain status from a plain JavaScript object
     * @param data a plain JavaScript object  with the blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new blockchain account
     */
    public static override fromObject(data: WfBlockchainData, blockchain?: string): WfBlockchainStatus {
        /* Check identifier */
        if (data?.name !== blockchain) {
            throw new WfRuntimeError(`Blockchain name ${data?.name} does not match blockchain identifier ${blockchain}`);
        }
        return new WfBlockchainStatus(data);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Provides the name of the blockchain
     * @returns the human readible name of the blockchain
     */
    public getName() {
        return this.#data?.name;
    }
}
