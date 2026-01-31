/**
 * @module core/authentication
 * @summary Whiteflag JS core authentication module
 * @todo Test authentication module
 */
export { WfSignature, createAuthSignature, createAuthToken, isValidAuthSignature, validateAuthSignature, isValidAuthToken };
import { Jws } from '@whiteflagprotocol/util';
import { WfAccount, WfOriginator } from './account.ts';
/**
 * A class representing a Whiteflag authentication signature
 * @class WfSignature
 * @wfversion v1-draft.7
 * @wfreference 5.1.2.1 Method 1: URL Validation
 * @remarks Whiteflag uses JSON Web Signatures (JWS) as the structure for
 * digital signatures used for authentication method 1. The Whiteflag digital
 * authentication signature must be published at the URL where the `A1`
 * authentication message points to.
 * @todo Implement signing algorithm
 */
declare class WfSignature extends Jws {
    /**
     * Creates a new Whiteflag authentication signature
     * @param account the blockchain account to create the signature for
     * @param orgname the name of the originator
     * @param url the url where the signature will be available
     */
    static create(account: WfAccount, orgname: String, url: URL, extpubkey?: string): WfSignature;
}
/**
 * Creates a Whiteflag authentication signature for authentication method 1
 * @param originator the originator to be authenticated
 * @param account the account used by the originator
 * @param url the URL used to publish the authentication signature
 * @returns a JWS used as the Whiteflag authentication signature
 */
declare function createAuthSignature(originator: WfOriginator, account: WfAccount, url: URL): Promise<WfSignature>;
/**
 * Checks if a Whiteflag authentication signature is valid
 * @param signature the Whiteflag authentication signature to validate
 * @param account the account used by the originator to be authenticated
 * @param url the url the signature has been obtained from
 * @returns true if signature is valid, else false
 */
declare function isValidAuthSignature(signature: WfSignature, account: WfAccount, url: URL): Promise<boolean>;
/**
 * Checks a Whiteflag authentication signature for validation errors
 * @param signature the Whiteflag authentication signature to validate
 * @param account the account used by the originator to be authenticated
 * @param url the url the signature has been obtained from
 * @returns an array of validation errors
 */
declare function validateAuthSignature(signature: WfSignature, account: WfAccount, url: URL): Promise<string[]>;
/**
 * Creates a Whiteflag authentication token for authentication method 2
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns the binary authentication token
 */
declare function createAuthToken(account: WfAccount, secret: Uint8Array): Promise<Uint8Array>;
/**
 *
 * @param token the Whiteflag authentication token to validate
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns true if token is valid, else false
 */
declare function isValidAuthToken(token: Uint8Array, account: WfAccount, secret: Uint8Array): Promise<boolean>;
