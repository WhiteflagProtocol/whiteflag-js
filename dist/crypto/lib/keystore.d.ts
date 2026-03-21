/**
 * @module crypto/keystore
 * @summary Whiteflag JS cryptographic keystore module
 */
export { KeyStoreCtrl, KeyStoreAccess, getWfKeyId };
import { WfKeyType } from '@whiteflagprotocol/common';
import { ByteArray, Base64url } from '@whiteflagprotocol/util';
import { EncryptedData } from './encrypt.ts';
/** A unique value to identify a key in the keystore */
export type KeyId = Base64url;
/**
 * The keystore access control to import and export cryptographic keys and secrets
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to control access to the Whiteflag keystore, by setting the
 * master encryption key, and importing and exporting the encrypted keystore
 * data. It is therefore part of the main programming interface. It does not
 * expose functions providing access to keystore, because that is only
 * required for classes internally to manage their keys. In order to prevent
 * tampering with the keystore after the initialisation, the keystore
 * control may be sealed. Once sealed, it cannot be unsealed and only exports
 * of encrypted keys are possible.
 */
declare class KeyStoreCtrl {
    #private;
    /**
     * Constructs the keystore control
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Gets the controls of the keystore
     * @returns the keystore control singular instance
     */
    static getInstance(): KeyStoreCtrl;
    /**
     * Seals the keystore control, preventing importing keys and changing the master key
     * @returns `true` if sealed, else `false`
     */
    seal(): boolean;
    /**
     * Indicates if the keystore control is sealed
     * @returns `true` if sealed, else `false`
    */
    isSealed(): boolean;
    /**
     * Sets the master encryption key to access the keystore
     * @param masterKey the new master encryption key
     * @returns `true` is master encryption key is successfully set, else `false` (e.g. when sealed)
     */
    setMasterKey(masterKey: ByteArray): Promise<boolean>;
    /**
     * Imports the encrypted serialized keystore data
     * @param ekdo the encrypted keystore data object
     * @returns `true` if the import was successfull, else `false` (e.g. when sealed)
     */
    import(ekdo: EncryptedData): Promise<boolean>;
    /**
     * Exports the encrypted serialized keystore data
     * @returns a data object with the encrypted keystore and initialisation vector
     */
    export(): Promise<EncryptedData>;
}
/**
 * The keystore access to store and retrieve cryptographic keys and secrets
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to access the Whiteflag keystore, and should only be used by
 * specific classes that actually need to store and retrieve their keys.
 * Therefore it is not part of the main programming interface.
 */
declare class KeyStoreAccess {
    #private;
    /**
     * Constructs the keystore access object
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Gets access to the keystore
     * @returns the keystore access singular instance
     */
    static getInstance(): KeyStoreAccess;
    /**
     * Gets a key from the keystore
     * @param kid the unique base64url key identifier
     * @returns the binary raw key from the keystore, or `null` if no key
     * @throws if the keystore is not accessible
     */
    getKey(kid: KeyId): Promise<ByteArray | null>;
    /**
     * Upserts a key in the keystore
     * @param kid the unique base64url key identifier
     * @param key the binary raw key to be stored in the keystore
     * @returns `true` if succesfull, else `false`
     * @throws if the keystore is not accessible
     */
    upsertKey(kid: KeyId, key: ByteArray): Promise<KeyId>;
    /**
     * Removes a key from the keystore
     * @param kid the unique base64url identifier of the key to be remnoved
     * @returns `true` if succesfull, else `false`
     * @throws if the keystore is not accessible
     */
    removeKey(kid: KeyId): Promise<boolean>;
}
/**
 * Creates a unique identifier for a key or secret stored in the vault
 * @param type the type of the key or secret, i.e. its usage for Whiteflag
 * @param info additional information about the key or secret, e.g. the address of the account it is bound to
 * @param length the length of the key id, default is 16 bytes (128 bits)
 * @returns the base64url key id
 * @remarks Any unique base64url value works as a key identifier for the
 * keystore, but this function is to ensure that all Whiteflag packages,
 * classes and functions create the key identifier in a similar manner.
 */
declare function getWfKeyId(type: WfKeyType, info: string, length?: number): Promise<KeyId>;
