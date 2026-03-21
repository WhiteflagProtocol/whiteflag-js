/**
 * @module main/blockchain
 * @summary Whiteflag JS state module
 */
export { WfBlockchainLayer, WfBlockchainStatus, WfBlockchainData };
import { Blockchain, BlockchainConfigData, BlockchainStatusData } from '@whiteflagprotocol/common';
import { Base64, DataItem, Json } from '@whiteflagprotocol/util';
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
declare class WfBlockchainLayer {
    #private;
    /**
     * Constructs the Whiteflag blockchain layer
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Gets the blockchain layer
     * @returns the blockchain layer singular instance
     */
    static getInstance(): WfBlockchainLayer;
    /**
     * Configures a blockchain
     * @param blockchain the blockchain implementation
     * @param config the blockchain configuration data
     * @returns `true` if the blockchain is succesfully configured, else false
     * @emits blockchain:configured when the blockchain is configured
     * @todo Implement blockchain configuration
     */
    configure(blockchain: Blockchain, config: BlockchainConfigData): Promise<boolean>;
    /**
     * Connects to a blockchain
     * @param blockchain the name of the blockchain to connect to
     * @returns `true` if succesfully connected to the blockchain, else false
     * @emits blockchain:connected when the blockchain is configured
     * @todo Implement blockchain connection
     */
    connect(blockchain: string): Promise<boolean>;
}
/**
 * The status of a blockchain
 * @remarks This class only keeps track of the status of a blockchain;
 * it doens not provide any functions for blockchain operations, such
 * as processing transactions.
 */
declare class WfBlockchainStatus extends DataItem<WfBlockchainData> {
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
    static create(name: string): WfBlockchainStatus;
    /**
     * Deserializes the blockchain status data
     * @param data the base64 encoded JSON serialized blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns the blockchain status
     */
    static deserialize(data: Base64, blockchain: string): WfBlockchainStatus;
    /**
     * Creates a blockchain status from a JSON serialized object
     * @param data the JSON serialized object
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new data item
     */
    static fromJson(data: Json, blockchain?: string): WfBlockchainStatus;
    /**
     * Creates a blockchain status from a plain JavaScript object
     * @param data a plain JavaScript object  with the blockchain status data
     * @param blockchain the blockchain name as the unique identifier
     * @returns a new blockchain account
     */
    static fromObject(data: WfBlockchainData, blockchain?: string): WfBlockchainStatus;
    /**
     * Provides the name of the blockchain
     * @returns the human readible name of the blockchain
     */
    getName(): string;
}
