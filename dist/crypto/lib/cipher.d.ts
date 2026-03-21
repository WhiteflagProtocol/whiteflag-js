/**
 * @module crypto/cipher
 * @summary Whiteflag JS message encryption module
 */
export { encryptMsg, decryptMsg, deriveKey };
import { WfCryptoMethod, WfVersion } from '@whiteflagprotocol/common';
import { ByteArray } from '@whiteflagprotocol/util';
/**
 * Encrypts a Whiteflag message based on the specified encryption method
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be encrypted
 * @param method the Whiteflag encryption method
 * @param key the input key material for the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
declare function encryptMsg(message: ByteArray, method: WfCryptoMethod, key: CryptoKey, iv?: ByteArray, version?: WfVersion): Promise<Uint8Array>;
/**
 * Decrypts a Whiteflag message based on the specified encryption method
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 * @param message the message to be decrypted
 * @param method the Whiteflag encryption method
 * @param key the encryption key
 * @param iv the initialisation vector, if required for the method
 * @param version the Whiteflag protocol version
 */
declare function decryptMsg(message: ByteArray, method: WfCryptoMethod, key: CryptoKey, iv?: ByteArray, version?: WfVersion): Promise<Uint8Array>;
/**
 * Derives the encryption key based on the Whiteflag encryption method
 * @wfversion v1-draft.7
 * @wfreference 5.2.3 Encryption Key and Authentication Token Derivation
 * @param ikm the raw input key material
 * @param method the Whiteflag encryption method
 * @param info information to bind the key, e.g. the blockchain address of the originator
 * @param version the Whiteflag protocol version
 * @returns the encryption key
 */
declare function deriveKey(ikm: ByteArray, method: WfCryptoMethod, info: ByteArray, version?: WfVersion): Promise<CryptoKey>;
