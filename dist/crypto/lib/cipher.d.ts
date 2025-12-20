/**
 * @module crypto/cipher
 * @summary Whiteflag JS encryption and decryption functions
 */
export { WfCryptoMethod, encrypt, decrypt, deriveKey };
import { WfVersion } from '@whiteflag/core';
/**
 * Whiteflag encryption methods
 * @enum WfCryptoMethod
 * @wfversion v1-draft.7
 */
declare enum WfCryptoMethod {
    ECDH = "1",
    PSK = "2"
}
/**
 * Encrypts a message
 * @function encrypt
 * @param message the message to be encrypted
 * @param method the Whiteflag encryption method
 * @param key the input key material for the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
declare function encrypt(message: Uint8Array<ArrayBuffer>, method: WfCryptoMethod, key: CryptoKey, iv?: Uint8Array<ArrayBuffer>, version?: WfVersion): Promise<Uint8Array>;
/**
 * Decrypts a message
 * @function decrypt
 * @param message the message to be decyrpted
 * @param method the Whiteflag encryption method
 * @param key the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
declare function decrypt(message: Uint8Array<ArrayBuffer>, method: WfCryptoMethod, key: CryptoKey, iv?: Uint8Array<ArrayBuffer>, version?: WfVersion): Promise<Uint8Array>;
/**
 * Derives the encryption key based on the Whiteflag encryption method
 * @function deriveKey
 * @param ikm the raw input key material
 * @param info information to bind the key, e.g. the blockchain address of the originator
 * @param method the Whiteflag encryption method
 * @param version the Whiteflag protocol version
 * @returns the encryption key
 */
declare function deriveKey(ikm: Uint8Array<ArrayBuffer>, method: WfCryptoMethod, info: Uint8Array<ArrayBuffer>, version?: WfVersion): Promise<CryptoKey>;
