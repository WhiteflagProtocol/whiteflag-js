/**
 * @module crypto/encrypt
 * @summary Whiteflag JS generic data encryption module
 */
export { EncryptedData, encryptData, decryptData, generateDEK };
import { ByteArray, Base64, Serializable } from '@whiteflagprotocol/util';
/**
 * An encrypted data object
 * @remarks The Whiteflag generic data encryption function return this
 * object with encrypted data. All binary data is base64 encoded.
 */
interface EncryptedData extends Serializable {
    /** Optional information about the encrypted data */
    info?: string;
    /** The base64 encoded initialization vector used to encrypt the data */
    iv: Base64;
    /** The base64 encoded AES-256-GCM encrypted data */
    encrypted: Base64;
}
/**
 * Encrypts binary data using AES-256-GCM
 * @param key the cryptographic key object to encypt the data
 * @param plain the binary data to be encrypted
 * @param info optional additional information to be added to the returned object
 * @returns a data object with the encrypted data and initialization vector
 */
declare function encryptData(key: CryptoKey, plain: ByteArray, info?: string): Promise<EncryptedData>;
/**
 * Decrypts binary data using AES-256-GCM
 * @param key the cryptographic key object to decrypt the data
 * @param edo a data object with the encrypted data and initialization vector
 * @returns the decrypted data
 */
declare function decryptData(key: CryptoKey, edo: EncryptedData): Promise<ByteArray>;
/**
 * Generates the data encryption key from the master encryption key
 * @param info information that identifies the data encryption key
 * @param mek the master encryption key
 * @returns the data encryption key object
 */
declare function generateDEK(mek: ByteArray, info: ByteArray, salt?: ByteArray): Promise<CryptoKey>;
