'use strict';
/**
 * @module core/originator
 * @summary Whiteflag JS core originator module
 */
export {
    WfOriginator,
    WfOriginatorData
};

/* Dependencies */
import { Address, WfKeyType, WfRuntimeError } from '@whiteflagprotocol/common';
import { KeyStoreAccess, KeyId, getWfKeyId  } from '@whiteflagprotocol/crypto';
import { ByteArray, Base64, DataItem, DataId, Hex, Json, Serializable } from '@whiteflagprotocol/util';
import { b64ToStr, hexToU8a, jsonToObj } from '@whiteflagprotocol/util';

/* Related singleton classes */
const wfKeystore = KeyStoreAccess.getInstance();

/* MODULE DECLARATIONS */
/**
 * Whiteflag originator data structure as used by the `WfOriginator` class
 */
interface WfOriginatorData extends Serializable {
    /** The name of the originator */
    name: string;
    /** The blockchain accounts addresses of
     *  the originator */
    accounts: Address[];
    /** The identifier of the pre-sahered encryption
     *  key of the originator */
    pskId?: KeyId;
    /** The identifier of the pre-shared seceret for
     *  authentication of the originator */
    pssId?: KeyId;
}
/**
 * An organisation or person sending Whiteflag messages
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a Whiteflag participant, e.g. a person or
 * organisation, that sends Whiteflag messages on a blockchain. An originator
 * may use multiple blockchain accounts.
 */
class WfOriginator extends DataItem<WfOriginatorData> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: WfOriginatorData;

    /* CONSTRUCTOR */
    /**
     * Constructs an originator
     * @param data the serialized originator data
     * @param id a unique identifier for the originator; automatically generated if not specified
     * @remarks This class should not be directly instantiated;
     * a static factory method should be used.
     */
    constructor(data: WfOriginatorData, id?: DataId) {
        const ddat = Symbol('WfOriginator');
        super(data, id, ddat);
        this.#data = super.getDataReference(ddat) as WfOriginatorData;
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the originator name as a property
     */
    get name(): string {
        return this.#data.name;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new originator
     * @param name a human readible name for the originator
     * @returns the originator
     */
    public static create(name: string): WfOriginator {
        return new this({
            name: name,
            accounts: []
        });
    }
    /**
     * Deserializes the originator data
     * @param data the base64 encoded JSON serialized originator data
     * @returns the originator
     */
    public static override deserialize(data: Base64, id: DataId): WfOriginator {
        return this.fromJson(b64ToStr(data), id);
    }
    /**
     * Creates an originator from a JSON serialized object
     * @param data the JSON serialized object
     * @param id the unique identifier of the originator
     * @returns a new data item
     */
    public static override fromJson(data: Json, id?: DataId): WfOriginator {
        return this.fromObject(jsonToObj(data) as WfOriginatorData, id);
    }
    /**
     * Creates an originator from a plain JavaScript object
     * @param data a plain JavaScript object with the originator data
     * @param id the unique identifier of the originator
     * @returns a new blockchain account
     */
    public static override fromObject(data: WfOriginatorData, id?: DataId): WfOriginator {
        return new this(data, id);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Provides the name of the originator
     * @param name a human readible name for the originator
     * @returns the human readible name of the originator
     */
    public setName(name: string): string {
        return this.#data.name = name;
    }
    /**
     * Provides the name of the originator
     * @returns the human readible name of the originator
     */
    public getName(): string {
        return this.#data.name;
    }
    /**
     * Adds an account to the originator, if not yet owned
     * @param address the address of the account owned by the originator
     * @returns the number of accounts
     */
    public addAccount(address: Address): number {
        if (this.ownsAccount(address)) {
            return +this.#data.accounts.length;
        }
        return +this.#data.accounts.push(address);
    }
    /**
     * Lists the addresses of the accounts of the originator
     * @returns an array of account addresses
     */
    public listAccounts(): Array<Address> {
        return Array.from(this.#data.accounts);
    }
    /**
     * Checks if the originator owns the specified account
     * @param address the address of the account
     * @returns `true` if the originator owns the account, else `false`
     */
    public ownsAccount(address: Address): boolean {
        return this.#data.accounts.includes(address);
    }
    /**
     * Stores a pre-shared encryption key for this originator
     * @param psk a pre-shared key
     * @returns `true` if succesfully stored
     */
    public async storePSK(psk: Hex): Promise<boolean> {
        const secretId = await getWfKeyId(WfKeyType.ENCRYPT_PSK, this.id);
        this.#data.pskId = await storeSecret(secretId, hexToU8a(psk));
        return !!this.#data.pskId;
    }
    /**
     * Removes a pre-shared encryption key for this originator
     * @returns `true` if succesfully deleted
     */
    public async removePSK(): Promise<boolean> {
        if (this.#data.pskId) return wfKeystore.removeKey(this.#data.pskId);
        return false;
    }
    /**
     * Stores a pre-shared authentication secret key for this originator
     * @param pss `true` if succesfully stored
     * @returns 
     */
    public async storePSS(pss: Hex): Promise<boolean> {
        const secretId = await getWfKeyId(WfKeyType.AUTH_PSS, this.id);
        this.#data.pssId = await storeSecret(secretId, hexToU8a(pss));
        return !!this.#data.pssId;
    }
    /**
     * Removes a pre-shared authentication secret key for this originator
     * @returns `true` if succesfully deleted
     */
    public async removePSS(): Promise<boolean> {
        if (this.#data.pssId) return wfKeystore.removeKey(this.#data.pssId);
        return false;
    }
}

/* PRIVATE FUNCTIONS */
/**
 * Retrieves the secret from the key store
 * @private
 * @param secretId the secret identifier
 * @returns the secret
 */
async function getSecret(secretId: KeyId): Promise<ByteArray | null> {
    const secret = await wfKeystore.getKey(secretId);
    return secret;
}
/**
 * Stores a secret in the key store
 * @private
 * @param secretId the secret identifier
 * @param secret the secret
 * @returns `true` if secret is successfully stored, else `false`
 */
async function storeSecret(secretId: KeyId, secret: ByteArray): Promise<KeyId> {
    const stored = await wfKeystore.upsertKey(secretId, secret);
    if (!stored) throw new WfRuntimeError('Key store did not store secret for the originator');
    return stored;
}
