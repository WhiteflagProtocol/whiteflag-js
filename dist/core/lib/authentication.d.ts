/**
 * @module core/codec
 * @summary Whiteflag JS core authentication module
 */
export { WfSignature };
import { Jws } from '@whiteflagprotocol/util';
import { WfAccount } from './account.ts';
/**
 * A class representing a Whiteflag authentication signature
 * @class WfSignature
 * @wfversion v1-draft.7
 * @wfreference 5.1.2.1 Method 1: URL Validation
 * @remarks Whiteflag uses JSON Web Signatures (JWS) as the structure for
 * digital signatures used for authentication method 1. The Whiteflag digital
 * authentication signature must be published at the URL where the `A1`
 * authentication message points to.
 * @todo implement signing algorithm
 */
declare class WfSignature extends Jws {
    /**
     * Creates a new Whiteflag authentication signature
     * @param account the blockchain account to create the signature for
     * @param name the name of the originator
     * @param url the url where the signature will be available
     */
    static create(account: WfAccount, orgname: String, url: URL, extpubkey?: string): WfSignature;
}
