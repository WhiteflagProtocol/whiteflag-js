/**
 * @module core/codec
 * @summary Whiteflag JS core authentication module
 */
export {
    WfSignature
};

/* Dependencies */
import { Jws } from '@whiteflagprotocol/util';

/* Module imports */
import { WfAccount } from './account.ts';

/* MODULE DECLARATIONS */
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
class WfSignature extends Jws {
    /* STATIC FACTORY METHODS */
    /**
     * Creates a new Whiteflag authentication signature
     * @param account the blockchain account to create the signature for
     * @param name the name of the originator
     * @param url the url where the signature will be available
     */
    public static create(account: WfAccount, orgname: String, url: URL, extpubkey?: string): WfSignature {
        /* Create header i.a.w. Whiteflag specification */
        const header: any = {
            alg: account.blockchain.signAlgorithm
        };
        /* Create payload i.a.w. Whiteflag specification */
        const payload: any = {
            addr: account.address,
            orgname: orgname,
            url: url.toString()
        };
        if (extpubkey) payload.extpubkey = extpubkey;

        /* Create payload i.a.w. Whiteflag specification */
        return new Jws(header, payload) as WfSignature;
    }
}
