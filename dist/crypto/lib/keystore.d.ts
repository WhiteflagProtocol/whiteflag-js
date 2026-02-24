/**
 * @module crypto/keystore
 * @summary Whiteflag JS cryptographic keystore module
 */
export { KeyStoreCtrl, KeyStoreAccess, getWfKeyId };
import { WfKeyType } from '@whiteflagprotocol/common';
import { Hex, Base64url } from "@whiteflagprotocol/util";
/**
 * A class to control access to cryptographic keys and secrets
 * @class KeyStoreCtrl
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to control access to the Whiteflag keystore, by setting the
 * master encryption key, and to import and export the encrypted key store
 * data. It is therefore part of the main programming interface. It does not
 * expose functions providing access to keystore, because that is only
 * required for classes internally to manage their keys. In order to prevent
 * tampering with the key store after the initialisation, the key store
 * control may be sealed. Once sealed, it cannot be unsealed and only exports
 * are possible.
 */
declare class KeyStoreCtrl {
    #private;
    /**
     * Constructor for the keystore control object
     */
    private constructor();
    /**
     * Static factory method always returning the same instance
     */
    static getInstance(): KeyStoreCtrl;
    /**
     * Seals the key store control, preventing importing keys and changing the master key
     * @returns true if sealed, else false
     */
    seal(): boolean;
    /**
     * Indicates if the key store control is sealed
     * @returns true if sealed, else false
    */
    isSealed(): boolean;
    /**
     * Sets the master encryption key to access the keystore
     * @param rawKey the raw hexadecimal master key
     * @returns true is master encryption key is successfully set, else false (e.g. when sealed)
     */
    setMasterKey(rawKey: Hex): Promise<boolean>;
    /**
     * Imports the encrypted serialized keystore data
     * @param data the encrypted base64url encoded keystore data
     * @returns true if the import was successfull, else false (e.g. when sealed)
     */
    import(data: Base64url): Promise<boolean>;
    /**
     * Exports the encrypted serialsed keystore data
     * @returns the encrypted base64url encoded keystore data
     */
    export(): Promise<Base64url>;
}
/**
 * A class to provide access to cryptographic keys and secrets
 * @class KeyStoreAccess
 * @remarks The Whiteflag keystore is not directly accessible. This singleton
 * class is used to access the Whiteflag keystore, and should only be used by
 * specific classes that actually need to store and retrieve their keys.
 * Therefore it is not part of the main programming interface.
 */
declare class KeyStoreAccess {
    #private;
    /**
     * Constructor for the keystore control object
     */
    private constructor();
    /**
     * Static factory method always returning the same instance
     */
    static getInstance(): KeyStoreAccess;
    /**
     * Gets a key from the keystore
     * @param kid the unique hexadecimal key identifier
     * @returns the binary raw key from the keystore, or null if no key
     */
    getKey(kid: Hex): Promise<Uint8Array | null>;
    /**
     * Upserts a key in the keystore
     * @param kid the unique hexadecimal key identifier
     * @param key the binary raw key to be stored in the keystore
     * @returns true if succesfull, else false
     */
    upsertKey(kid: Hex, key: Uint8Array<ArrayBuffer>): Promise<boolean>;
    /**
     * Removes a key from the keystore
     * @param kid the unique key identifier to be remnoved
     * @returns true if succesfull, else false
     */
    removeKey(kid: Hex): Promise<boolean>;
}
/**
 * Creates a unique identifier for a key or secret stored in the vault
 * @private
 * @param type the type of the key or secret, i.e. its usage for Whiteflag
 * @param info additional information about the key or secret, e.g. the address of the account it is bound to
 * @param length the length of the key id, default is 16 bytes (128 bits)
 * @returns the hexadecimal key id
 * @remarks Any unique hexedecimal key identifier works as a key identifier
 * for the key store, but this function is to ensure that all Whiteflag
 * packages, classes and functions create the key identifier in a similar
 * manner.
 */
declare function getWfKeyId(type: WfKeyType, info: string, length?: number): Promise<Hex>;
