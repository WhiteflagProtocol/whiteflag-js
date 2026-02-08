'use strict';
/**
 * @module common/blockchain
 * @summary Whiteflag JS common blockchain module
 */
export {
    Blockchain
};

/* MODULE DECLARATIONS */
/**
 * The blockchain used to send Whiteflag messages
 * @interface Blockchain
 * @remarks The Whiteflag Protocol works on top of one or more blockchains.
 * While Whiteflag is blockchain-agnostic, the protocol requires some 
 * information about the underlying blockchain to function correctly.
 * This interface is an abstraction of a blockchain class that contains the
 * blockchain-specific parameters and methods that Whiteflag depends on.
 */
interface Blockchain {
    /* PROPERTIES */
    /**
     * The name of the blockchain
     */
    name: string;
    /**
     * The name or identifier of the signature algorithm of the blockchain
     */
    signAlgorithm: string;

    /* METHODS */
    /**
     * Creates a new key pair for this blockchain
     * @param secret optional blockchain-specific secret to create account from
     * @returns a new blockchain raw key pair with private key and public key
     */
    createKeypair(secret?: string): Promise<[ Uint8Array, Uint8Array ]>;
    /**
     * Returns the blockchain address of an account identified by its private key
     * @param publicKey the raw public key of the account to derive the address from
     * @returns the blockchain address in the regular encoding for this blockchain
     */
    deriveAddress(publicKey: Uint8Array): Promise<string>;
    /**
     * Returns the binary blockchain address
     * @param address the blockchain address in the regular encoding for this blockchain
     * @returns the binary blockchain address
     */
    getBinAddress(address: string): Promise<Uint8Array>;
    /**
     * Requests a signature using the blockchain's signatrue algorithm
     * @param data the binary data to sign
     * @param privateKey the raw private key of the account to sign the data with
     * @returns the binary signature
     */
    requestSignature(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
    /**
     * Verifies a signature using the blockchain's signatrue algorithm
     * @param data the binary data that has been signed
     * @param signature the binary signature
     * @param publicKey the raw binary public key of the account used to create the signature
     * @returns true if the signature is valid, else false
     */
    verifySignature(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
}
