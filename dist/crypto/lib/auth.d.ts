/**
 * @module crypto/authentication
 * @summary Whiteflag JS cryptographic authentication functions
 * @todo Test crypto auth module
 */
export { deriveToken };
import { WfVersion, WfAuthMethod } from '@whiteflagprotocol/common';
/**
 * Derives the authentication token based on the Whiteflag authentication method
 * @function deriveToken
 * @wfversion v1-draft.7
 * @wfreference 5.2.3 Encryption Key and Authentication Token Derivation
 * @param secret the shared authentication secret
 * @param method the Whiteflag authentication method
 * @param info information to bind the token, e.g. the blockchain address of the originator
 * @param version the Whiteflag protocol version
 * @returns the authentication token
 */
declare function deriveToken(secret: Uint8Array<ArrayBuffer>, method: WfAuthMethod, info: Uint8Array<ArrayBuffer>, version?: WfVersion): Promise<Uint8Array>;
