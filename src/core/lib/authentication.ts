'use strict';
/**
 * @module core/authentication
 * @summary Whiteflag JS core authentication module
 * @todo Test authentication module
 */
export {
    WfSignature,
    createAuthSignature,
    createAuthToken,
    isValidAuthSignature,
    validateAuthSignature,
    isValidAuthToken
};

/* Dependencies */
import { WfVersion, WfAuthMethod } from '@whiteflagprotocol/common';
import { deriveToken } from '@whiteflagprotocol/crypto';
import { Jws, arrayEquals, b64uToU8a, u8aToB64u } from '@whiteflagprotocol/util';

/* Module imports */
import { WfAccount, WfOriginator } from './account.ts';

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
 * @todo Implement signing algorithm
 */
class WfSignature extends Jws {
    /* STATIC FACTORY METHODS */
    /**
     * Creates a new Whiteflag authentication signature
     * @param account the blockchain account to create the signature for
     * @param orgname the name of the originator
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
/**
 * Creates a Whiteflag authentication signature for authentication method 1
 * @param originator the originator to be authenticated
 * @param account the account used by the originator
 * @param url the URL used to publish the authentication signature
 * @returns a JWS used as the Whiteflag authentication signature
 */
async function createAuthSignature(originator: WfOriginator, account: WfAccount, url: URL): Promise<WfSignature> {
    /* Create JWS */
    const authSignature  = WfSignature.create(
        account,
        originator.name,
        url
    );
    /* Sign and return JWS */
    const signature = account.sign(b64uToU8a(authSignature.getSignInput()));
    authSignature.setSignature(u8aToB64u(signature));
    return authSignature;
}
/**
 * Checks if a Whiteflag authentication signature is valid
 * @param signature the Whiteflag authentication signature to validate
 * @param account the account used by the originator to be authenticated
 * @param url the url the signature has been obtained from
 * @returns true if signature is valid, else false
 */
async function isValidAuthSignature(signature: WfSignature, account: WfAccount, url: URL): Promise<boolean> {
    const result = await validateAuthSignature(signature, account, url);
    if (result.length > 0) return false;
    return true;
}
/**
 * Checks a Whiteflag authentication signature for validation errors
 * @param signature the Whiteflag authentication signature to validate
 * @param account the account used by the originator to be authenticated
 * @param url the url the signature has been obtained from
 * @returns an array of validation errors
 */
async function validateAuthSignature(signature: WfSignature, account: WfAccount, url: URL): Promise<string[]> {
    let errors: string[] = [];
    if (!Object.hasOwn(signature.payload, 'addr')) {
        errors.push('Missing address in signature payload');
    } else if (signature.payload.addr !== account.address) {
        errors.push('Signature address does not match account address');
    }
    if (!Object.hasOwn(signature.payload, 'url')) {
        errors.push('Missing URL in signature payload');
    } else if (signature.payload.url !== url.toString()) {
        errors.push('Signature URL does not match provided URL');
    }
    if (!Object.hasOwn(signature.payload, 'orgname')) {
        errors.push('Missing originator name in signature payload');
    }
    if (!account.verify(b64uToU8a(signature.getSignInput()), b64uToU8a(signature.getSignature()))) {
        errors.push('Digital signature is invalid for the payload');
    }
    return errors;
}
/**
 * Creates a Whiteflag authentication token for authentication method 2
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns the binary authentication token
 */
async function createAuthToken(account: WfAccount, secret: Uint8Array): Promise<Uint8Array> {
    const authToken = await deriveToken(
        secret as Uint8Array<ArrayBuffer>,
        WfAuthMethod.SECRET,
        account.getBinaryAddress() as Uint8Array<ArrayBuffer>,
        WfVersion.v1
    );
    return authToken;
}
/**
 * 
 * @param token the Whiteflag authentication token to validate
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns true if token is valid, else false
 */
async function isValidAuthToken(token: Uint8Array, account: WfAccount, secret: Uint8Array) {
    const result = await createAuthToken(account, secret);
    return arrayEquals(token, result);
}
