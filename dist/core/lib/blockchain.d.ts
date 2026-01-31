/**
 * @module core/blockchain
 * @summary Whiteflag JS core blockchain module
 */
export { WfBlockchain };
/**
 * The blockchain used to send Whiteflag messages
 * @interface WfBlockchain
 * @remarks The Whiteflag Protocol works on top of one or more blockchains.
 * While Whiteflag is blockchain-agnostic, the protocol requires some
 * information about the underlying blockchain to function correctly.
 * This interface is an abstraction of a blockchain class that contains the
 * blockchain-specific parameters and methods that Whiteflag depends on.
 */
interface WfBlockchain {
    /**
     * The blockchain of the account
     */
    name: string;
    /**
     * The name or identifier fo rthe signature algorithm of the blockchain
     */
    signAlgorithm: string;
}
