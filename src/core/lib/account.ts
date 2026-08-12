'use strict';
/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export {
    WfAccount,
    WfAccountData
};

/* Dependencies */
import { Address, Blockchain, WfKeyType, WfRuntimeError, WfErrorCode, handleError, WfProtocolError } from '@whiteflagprotocol/common';
import { KeyStoreAccess, KeyId, generateEcdhRawKeyPair, deriveEcdhRawSecret, getWfKeyId } from '@whiteflagprotocol/crypto';
import { ByteArray, Base64, DataItem, Hex, Json, Serializable } from '@whiteflagprotocol/util';
import { b64ToStr, jsonToObj, hexToU8a, u8aToHex } from '@whiteflagprotocol/util';

/* Related singleton classes */
const wfKeystore = KeyStoreAccess.getInstance();

/* MODULE DECLARATIONS */
/**
 * Whiteflag account data structure as used by the `WfOriginator` class
 */
interface WfAccountData extends Serializable {
    /** The name identifying the blockchain of the account */
    readonly blockchain: string;
    /** The address of the account */
    readonly address: Address;
    /** The address of the account */
    readonly binAddress: Hex;
    /** The public key of the account */
    readonly publicKey?: Hex;
    /** The identifier of the private key of the account */
    readonly privateKeyId?: KeyId;
    /** The balance of the account */
    balance?: number;
    /** The identifier of the private ECDH key for encryption key negotiation */
    privateCryptoEcdhKeyId?: KeyId;
    /** The public ECDH key for encryption key negotiation */
    publicCryptoEcdhKey?: Hex;
    /** The identifier of the private ECDH key for auth secret negotiation */
    privateAuthEcdhKeyId?: KeyId;
    /** The public ECDH key for auth secret negotiation */
    publicAuthEcdhKey?: Hex;
}
/**
 * An account used by an originator to send Whiteflag messages
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a blockchain account.
 * Note that some blockchains lack the concept of an account, whereas
 * Whiteflag assumes an identifiable originator that has one or more accounts
 * on a blockchain. An account for Whiteflag is nothing else than a key pair
 * for signing blockchain transactions, with some related information,
 * e.g. an address, balance etc.
 */
class WfAccount extends DataItem<WfAccountData> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: WfAccountData;

    /* CONSTRUCTOR */
    /**
     * Constructor to create a blockchain account
     * @param data the account data
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfAccountData) {
        /* Check essential data */
        if (!data?.blockchain) throw new WfRuntimeError('Missing blockchain name in account data');
        if (!data?.address) throw new WfRuntimeError('Missing address in account data');
        if (!data?.binAddress) throw new WfRuntimeError('Missing binary address in account data');
        
        /* Create account as data item using the address as the data item identifier */
        const ddat = Symbol('WfAccount');
        super(data, data.address, ddat);
        this.#data = super.getDataReference(ddat) as WfAccountData;
    }
    /* STATIC FACTORY METHODS */
    /**
     * Deserializes the blockchain account data
     * @param data the base64 encoded JSON serialized account data
     * @param address the account address as the unique identifier for this data item
     * @returns the blockchain account
     */
    public static override deserialize(data: Base64, address: Address): WfAccount {
        return this.fromJson(b64ToStr(data), address);
    }
    /**
     * Creates a blockchain account from a JSON serialized object
     * @param data the JSON serialized object
     * @param address the account address as the unique identifier for this data item
     * @returns a new data item
     */
    public static override fromJson(data: Json, address: Address): WfAccount {
        return this.fromObject(jsonToObj(data) as WfAccountData, address);
    }
    /**
     * Creates a blockchain account from a plain JavaScript object
     * @param data a plain JavaScript object with the account data
     * @param address the account address as the unique identifier for this data item
     * @returns a new blockchain account
     */
    public static override fromObject(data: WfAccountData, address: Address): WfAccount {
        /* Check identifier */
        if (data?.address !== address) {
            throw new WfRuntimeError(`Account address ${data?.address} does not match account identifier ${address}`);
        }
        /* Create new account */
        return new this(data);
    }
    /**
     * Creates a new blockchain account by generating a key pair
     * @param blockchain the blockchain for which this is an account
     * @returns the newly created blockchain account
     */
    public static async create(blockchain: Blockchain): Promise<WfAccount> {
        return this.fromSecret(blockchain);
    }
    /**
     * Creates a new blockchain account from the blockchain address
     * @param blockchain the blockchain for which this is an account
     * @param address the address of the account
     * @returns the newly created blockchain account
     */
    public static async fromAddress(blockchain: Blockchain, address: Address): Promise<WfAccount> {
        let account: WfAccount;
        try {
            const binAddress = await blockchain.getBinAddress(address);
            account = new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress)
            });
        } catch(err) {
            return handleError(err, 'Cannot create account from address', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    /**
     * Creates a new blockchain account from the public key
     * @param blockchain the blockchain for which this is an account
     * @param publicKey the public key of the account
     * @returns the newly created blockchain account
     */
    public static async fromPublicKey(blockchain: Blockchain, publicKey: ByteArray): Promise<WfAccount> {
        let account: WfAccount;
        try {
            const address = await blockchain.deriveAddress(publicKey);
            const binAddress = await blockchain.getBinAddress(address);
            account =  new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress),
                publicKey: u8aToHex(publicKey)
            });
        } catch(err) {
            return handleError(err, 'Cannot create account from public key', WfErrorCode.ACCOUNT);
        }
        return account;
    }
    /**
     * Creates a new blockchain account from an existing secret
     * @param blockchain the blockchain for which this is an account
     * @param secret a secret as used by the blockchain to create a key pair from
     * @returns the newly created blockchain account
     */
    public static async fromSecret(blockchain: Blockchain, secret?: string): Promise<WfAccount> {
        let account: WfAccount;
        try {
            /* Generate key pair */
            const keypair = await blockchain.createKeypair(secret);

            /* Public key and address */
            const publicKey = keypair[1];
            const address = await blockchain.deriveAddress(publicKey);
            const binAddress = await blockchain.getBinAddress(address);

            /* Handle private key */
            const privateKey = new Uint8Array(keypair[0]);
            const privateKeyId = await getWfKeyId(WfKeyType.ACCOUNT_PRIVATEKEY, address);
            await storePrivateKey(privateKeyId, privateKey);

            /* Create account */
            account = new WfAccount({
                blockchain: blockchain.name,
                address: address,
                binAddress: u8aToHex(binAddress),
                publicKey: u8aToHex(publicKey),
                privateKeyId: privateKeyId
            });
        } catch(err) {
            return handleError(err, 'Cannot create new account', WfErrorCode.ACCOUNT);
        }
        return account;
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Checks if this account is own account, i.e. if it holds a private key
     * @returns `true` if the account has a private key, else `false`
     */
    public isSelf(): boolean {
        return !!this.#data.privateKeyId;
    }
    /**
     * Provides the blockchain name of the account
     * @returns a string with the blockchain name
     */
    public getBlockchainName(): string {
        return this.#data.blockchain;
    }
    /**
     * Provides the address of the account
     * @returns the account address encoded as specified by the blockchain
     */
    public getAddress(): Address {
        return this.#data.address;
    }
    /**
     * Provides the binary address of the account
     * @returns a byte array with the binary address
     */
    public getBinAddress(): ByteArray {
        return hexToU8a(this.#data.binAddress);
    }
    /**
     * Provides the public key of the account
     * @returns a byte array with the private key, or `null` if the public key is unknown
     */
    public getPublicKey(): ByteArray | null {
        if (!this.#data.publicKey) return null;
        return hexToU8a(this.#data.publicKey);
    }
    /**
     * Provides the private key of the account
     * @returns a byte array with the private key, or `null` if no private key available
     */
    public async getPrivateKey(): Promise<ByteArray | null> {
        if (!this.#data.privateKeyId) return null;
        return wfKeystore.getKey(this.#data.privateKeyId);
    }
    /**
     * Derives a shared encryption secret with an other account
     * @param account an other account with an ECDH public key for shared encryption secret negotiation
     * @returns the negotiated encryption secret
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks A shared encryption secret may only be derived for own
     * accounts. A HKDF function must be used i.a.w. the Whiteflag specification
     * to derive the actual encryption key from this secret.
     */
    public async deriveCryptoSharedSecret(account: WfAccount): Promise<ByteArray> {
        if (!this.isSelf()) throw new WfProtocolError('Can only negotiate cryptogtaphic keys for own accounts', null, WfErrorCode.ACCOUNT);

        /* Check own ECDH key pair */
        const publicKey = account.getPublicCryptoEcdhKey();
        if (!publicKey) throw new WfProtocolError('Other account does not have an ECDH public key for cryptogtaphic key negotiation', null, WfErrorCode.ACCOUNT);

        /* Check public ECDH key of other account */
        const privateKey = await wfKeystore.getKey(this.#data.privateCryptoEcdhKeyId || null);
        if (!privateKey) throw new WfProtocolError('No ECDH private key available for cryptogtaphic key negotiation', null, WfErrorCode.ACCOUNT);

        /* Derive secret */
        return deriveEcdhRawSecret(privateKey, publicKey);
    }
    /**
     * Derives a shared authentication secret with an other account 
     * @param account an other account with an ECDH public key for shared authentication secret negotiation
     * @returns the negotiated authentication secret
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks A shared authentication secret may only be derived for own
     * accounts. A HKDF function must be used i.a.w. the Whiteflag specification
     * to derive the actual authentication token from this secret.
     */
    public async deriveAuthSharedSecret(account: WfAccount): Promise<ByteArray> {
        if (!this.isSelf()) throw new WfProtocolError('Can only negotiate authentication secret for own accounts', null, WfErrorCode.ACCOUNT);

        /* Check own ECDH key pair */
        const publicKey = account.getPublicAuthEcdhKey();
        if (!publicKey) throw new WfProtocolError('Other account does not have an ECDH public key for  authentication secret negotiation', null, WfErrorCode.ACCOUNT);

        /* Check public ECDH key of other account */
        const privateKey = await wfKeystore.getKey(this.#data.privateAuthEcdhKeyId || null);
        if (!privateKey) throw new WfProtocolError('No ECDH private key available for  authentication secret negotiation', null, WfErrorCode.ACCOUNT);

        /* Derive secret */
        return deriveEcdhRawSecret(privateKey, publicKey);
    }
    /**
     * Generates ECDH key pair for shared encryption secret negotiation
     * @returns this account, for chaining functions
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks An ECDH key pair may only be generated for own accounts
     */
    public async generateCryptoEcdhKeys(): Promise<this> {
        /* Generate new ECDH key pair */
        if (!this.isSelf()) throw new WfProtocolError('Can only generate ECDH key pair for own accounts', null, WfErrorCode.ACCOUNT);
        const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair();

        /* Store private and public key */
        const keyId = await getWfKeyId(WfKeyType.ECDH_ENCRYPT, this.#data.address);
        this.#data.privateCryptoEcdhKeyId = await storePrivateKey(keyId, rawPrivateKey);
        this.#data.publicCryptoEcdhKey = u8aToHex(rawPublicKey);
        return this;
    }
    /**
     * Generates ECDH key pair for shared authentication secret negotiation
     * @returns this account, for chaining functions
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks An ECDH key pair may only be generated for own accounts
     */
    public async generateAuthEcdhKeys(): Promise<this> {
        /* Generate new ECDH key pair */
        if (!this.isSelf()) throw new WfProtocolError('Can only generate ECDH key pair for own accounts', null, WfErrorCode.ACCOUNT);
        const { rawPublicKey, rawPrivateKey } = generateEcdhRawKeyPair();

        /* Store private and public key */
        const keyId = await getWfKeyId(WfKeyType.ECDH_AUTH, this.#data.address);
        this.#data.privateAuthEcdhKeyId = await storePrivateKey(keyId, rawPrivateKey);
        this.#data.publicAuthEcdhKey = u8aToHex(rawPublicKey);
        return this;
    }
    /**
     * Stores the public public ECDH key for shared encryption secret negotiation
     * @param ecdhPublicKey the hexedecimal public ECDH key
     * @returns this account, for chaining functions
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks An ECDH public key may only be set for other accounts
     */
    public setPublicCryptoEcdhKey(ecdhPublicKey: Hex): this {
        if (this.isSelf()) throw new WfProtocolError('Can only set ECDH public for other accounts', null, WfErrorCode.ACCOUNT);
        this.#data.publicCryptoEcdhKey = ecdhPublicKey;
        return this;
    }
    /**
     * Gets the public public ECDH key for shared encryption secret negotiation
     * @returns the hexedecimal public ECDH key, or `null` if not available
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     */
    public getPublicCryptoEcdhKey(): ByteArray | null {
        if (!this.#data.publicCryptoEcdhKey) return null;
        return hexToU8a(this.#data.publicCryptoEcdhKey);
    }
    /**
     * Stores the public public ECDH key for shared authentication secret negotiation
     * @param ecdhPublicKey the hexedecimal public ECDH key
     * @returns this account, for chaining functions
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     * @remarks An ECDH public key may only be set for other accounts
     */
    public setPublicAuthEcdhKey(ecdhPublicKey: Hex): this {
        if (this.isSelf()) throw new WfProtocolError('Can only set ECDH public for other accounts', null, WfErrorCode.ACCOUNT);
        this.#data.publicAuthEcdhKey = ecdhPublicKey;
        return this;
    }
    /**
     * Gets the public public ECDH key for shared authentication secret negotiation
     * @returns the hexedecimal public ECDH key, or `null` if not available
     * @wfreference 5.2.2 Encryption Key and Authentication Token Negotiation
     */
    public getPublicAuthEcdhKey(): ByteArray | null {
        if (!this.#data.publicAuthEcdhKey) return null;
        return hexToU8a(this.#data.publicAuthEcdhKey);
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Stores the private key in the key store
 * @private
 * @param privateKeyId the private key identifier
 * @param privateKey the private key
 * @returns the key identifier
 */
async function storePrivateKey(privateKeyId: KeyId, privateKey: ByteArray): Promise<KeyId> {
    const keyId = await wfKeystore.upsertKey(privateKeyId, privateKey);
    if (!keyId) throw new WfRuntimeError('Key store did not store private key of the account');
    return keyId;
}
