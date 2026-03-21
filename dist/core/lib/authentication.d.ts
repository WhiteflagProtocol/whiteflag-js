/**
 * @module core/authentication
 * @summary Whiteflag JS core authentication module
 */
export { WfSignature, createAuthSignature, createAuthToken, isValidAuthSignature, validateAuthSignature, isValidAuthToken };
import { Blockchain } from '@whiteflagprotocol/common';
import { Jws, JwsPayload } from '@whiteflagprotocol/util';
import { WfAccount } from './account.ts';
import { WfOriginator } from './originator.ts';
/**
 * A Whiteflag authentication signature
 * @wfversion v1-draft.7
 * @wfreference 5.1.2.1 Method 1: URL Validation
 * @remarks Whiteflag uses JSON Web Signatures (JWS) as the structure for
 * digital signatures used for authentication method 1. The Whiteflag digital
 * authentication signature must be published at the URL where the `A1`
 * authentication message points to.
 */
declare class WfSignature extends Jws {
    /**
     * Creates a new Whiteflag authentication signature
     * @param signAlgorithm the name or identifier of the signature algorithm of the blockchain
     * @param payload the payload with `orgname`, `url` and optionally `extpubkey` i.a.w. the Whiteflag specification
     */
    static create(signAlgorithm: string, payload: JwsPayload): WfSignature;
}
/**
 * Creates a Whiteflag authentication signature for authentication method 1
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param originator the originator to be authenticated
 * @param url the URL used to publish the authentication signature
 * @returns a JWS used as the Whiteflag authentication signature
 */
declare function createAuthSignature(blockchain: Blockchain, account: WfAccount, originator: WfOriginator, url: URL): Promise<WfSignature>;
/**
 * Checks if a Whiteflag authentication signature is valid
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param signature the Whiteflag authentication signature to validate
 * @param url the url the signature has been obtained from
 * @returns `true` if signature is valid, else `false`
 */
declare function isValidAuthSignature(blockchain: Blockchain, account: WfAccount, signature: WfSignature, url: URL): Promise<boolean>;
/**
 * Checks a Whiteflag authentication signature for validation errors
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param signature the Whiteflag authentication signature to validate
 * @param url the url the signature has been obtained from
 * @returns an array of validation errors
 */
declare function validateAuthSignature(blockchain: Blockchain, account: WfAccount, signature: WfSignature, url: URL): Promise<string[]>;
/**
 * Creates a Whiteflag authentication token for authentication method 2
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns the binary authentication token
 */
declare function createAuthToken(account: WfAccount, secret: Uint8Array): Promise<Uint8Array>;
/**
 * Checks if a Whiteflag authentication token is valid
 * @param token the Whiteflag authentication token to validate
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns `true` if token is valid, else `false`
 */
declare function isValidAuthToken(token: Uint8Array, account: WfAccount, secret: Uint8Array): Promise<boolean>;
