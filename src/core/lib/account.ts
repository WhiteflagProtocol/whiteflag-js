'use strict';
/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export {
    WfAccount
};

/* Dependencies */
import { Blockchain,WfKeyType, WfError,  WfErrorCode, handleError } from '@whiteflagprotocol/common';
import { Hex } from '@whiteflagprotocol/util';
import { getWfKeyId, KeyStoreAccess } from '@whiteflagprotocol/crypto';

/* Module constants */
const keystore = KeyStoreAccess.getInstance();

/* MODULE DECLARATIONS */
/** A blockchain address in the encoding specified for that blockchain */
export type Address = string;
/**
 * The account used by an originator to send Whiteflag messages
 * @class WfAccount
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a blockchain account.
 * Note that some blockchains lack the concept of an account, whereas
 * Whiteflag assumes an identifiable originator that has one or more accounts
 * on a blockchain. An account for Whiteflag is nothing else than a key pair
 * for signing blockchain transactions, with some related information,
 * e.g. an address, balance etc.
 */
class WfAccount {
    /* CLASS PROPERTIES */

    /** The blockchain of the account */
    readonly blockchain: Blockchain;
    /** The address of the account */
    readonly address: Address;
    /** The public key of the account */
    readonly publicKey: Uint8Array = new Uint8Array(0);
    /** The private key of the account */
    readonly #privateKeyId: Hex = '';

    /* CONSTRUCTOR */
    /**
     * Constructor to create a blockchain account
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @param publicKey the public key of the account
     * @param privateKeyId the key store identifier of the private key of the account
     */
    constructor(blockchain: Blockchain, address: Address, publicKey?: Uint8Array, privateKeyId?: Hex) {
        /* Check required parameters */
        if (!blockchain) throw new TypeError('Missing blockchain');
        if (!address) throw new TypeError('Missing address');

        /* Set required properties */
        this.blockchain = blockchain;
        this.address = address;

        /* Set optional properties */
        if (publicKey) this.publicKey = publicKey;
        if (privateKeyId) this.#privateKeyId = privateKeyId;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new account from the blockchain address
     * @param blockchain the blockchain of which this is an account
     * @param address the address of the account
     * @returns the newly created blockchain account
     */
    static async fromAddress(blockchain: Blockchain, address: Address) {
        let account: WfAccount;
        try {
            account = new WfAccount(blockchain, address);
        } catch(err) {
            return handleError(err, 'Cannot create account from address', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    /**
     * Creates a new account from the public key
     * @param blockchain the blockchain of which this is an account
     * @param publicKey the public key of the account
     * @returns the newly created blockchain account
     */
    static async fromPublicKey(blockchain: Blockchain, publicKey: Uint8Array) {
        let account: WfAccount;
        try {
            const address = await blockchain.deriveAddress(publicKey);
            account =  new WfAccount(blockchain, address, publicKey);
        } catch(err) {
            return handleError(err, 'Cannot create account from public key', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    /**
     * Creates a new account from an existing key pair
     * @param blockchain the blockchain of which this is an account
     * @param secret a secret as used by the blockchain to create a keypair from
     * @returns the newly created blockchain account
     */
    static async fromSecret(blockchain: Blockchain, secret?: string) {
        let account: WfAccount;
        try {
            /* Generate key pair */
            const keypair = await blockchain.createKeypair(secret);

            /* Public key and address */
            const publicKey = keypair[1];
            const address = await blockchain.deriveAddress(publicKey);

            /* Handle private key */
            const privateKey = new Uint8Array(keypair[0]);
            const privateKeyId = await getPrivateKeyId(address);
            await storePrivateKey(privateKeyId, privateKey);

            /* Create account */
            account = new WfAccount(blockchain, address, publicKey, privateKeyId);
        } catch(err) {
            return handleError(err, 'Cannot create new account', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    /**
     * Creates a new account by generating a key pair
     * @param blockchain the blockchain of which this is an account
     * @returns the newly created blockchain account
     */
    static async create(blockchain: Blockchain) {
        return this.fromSecret(blockchain);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Checks if this account is own account
     * @returns true if the account has a private key, else false
     */
    isSelf(): boolean {
        return (this.#privateKeyId.length > 0);
    }
    /**
     * Provides the binary address of the account
     * @returns the binary address
     */
    async getBinAddress(): Promise<Uint8Array> {
        return this.blockchain.getBinAddress(this.address);
    }
    /**
     * Signs data with the account's private key
     * @param data the binary data to sign
     * @returns the binary signature
     */
    async createSignature(data: Uint8Array): Promise<Uint8Array> {
        if (!this.#privateKeyId) throw new WfError(`No private key avaible to create signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        let signature: Uint8Array;
        try {
            const privateKey = await getPrivateKey(this.#privateKeyId);
            signature = await this.blockchain.requestSignature(data, privateKey);
        } catch(err) {
            return handleError(err, `Cannot create signature for account ${this.address}`, WfErrorCode.SIGNATURE);
        }
        return signature;
    }
    /**
     * Verifies signature with the account's public key
     * @param data the binary data that has been signed
     * @param signature the binary signature
     * @returns true if the signature is valid, else false
     */
    async verifySignature(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
        if (!this.publicKey) throw new WfError(`No public key avaible to verify signature for account ${this.address}`, null, WfErrorCode.SIGNATURE);
        return this.blockchain.verifySignature(data, signature, this.publicKey);
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Gets the key identifier of the private key
 * @private
 * @param address the address of the account
 * @returns the private key identifier
 */
async function getPrivateKeyId(address: Address): Promise<Hex> {
    return getWfKeyId(WfKeyType.ACCOUNT_PRIVATEKEY, address);
}
/**
 * Retrieves the private key from the key store
 * @private
 * @param privateKeyId the private key identifier
 * @returns the private key
 */
async function getPrivateKey(privateKeyId: Hex): Promise<Uint8Array> {
    const privateKey = await keystore.getKey(privateKeyId);
    if (privateKey === null) throw new Error('Key store did not return private key');
    return privateKey;
}
/**
 * Stores the private key in the key store
 * @private
 * @param privateKeyId the private key identifier
 * @param privateKey the private key
 * @returns true if key is successfully stored, else false
 */
async function storePrivateKey(privateKeyId: Hex, privateKey: Uint8Array<ArrayBuffer>): Promise<boolean> {
    const stored = await keystore.upsertKey(privateKeyId, privateKey);
    if (!stored) throw new Error('Key store did not store private key');
    return stored;
}
