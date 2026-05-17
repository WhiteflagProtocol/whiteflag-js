'use strict';
/**
 * @module core/authentication
 * @summary Whiteflag JS core authentication module
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
import { Blockchain, WfVersion, WfAuthMethod, WfProtocolError, WfErrorCode, handleError } from '@whiteflagprotocol/common';
import { deriveToken } from '@whiteflagprotocol/crypto';
import { ByteArray, Jws, JwsHeader, JwsPayload } from '@whiteflagprotocol/util';
import { arrayEquals, b64uToU8a, strToU8a, u8aToB64u } from '@whiteflagprotocol/util';

/* Module imports */
import { WfAccount } from './account.ts';
import { WfOriginator } from './originator.ts';

/* MODULE DECLARATIONS */
/**
 * A Whiteflag authentication signature
 * @wfversion v1-draft.7
 * @wfreference 5.1.2.1 Method 1: URL Validation
 * @remarks Whiteflag uses JSON Web Signatures (JWS) as the structure for
 * digital signatures used for authentication method 1. The Whiteflag digital
 * authentication signature must be published at the URL where the `A1`
 * authentication message points to.
 */
class WfSignature extends Jws {
    /* STATIC FACTORY METHODS */
    /**
     * Creates a new Whiteflag authentication signature
     * @param signAlgorithm the name or identifier of the signature algorithm of the blockchain
     * @param payload the payload with `orgname`, `url` and optionally `extpubkey` i.a.w. the Whiteflag specification
     */
    public static create(signAlgorithm: string, payload: JwsPayload): WfSignature {
        /* Check payload */
        if (!payload?.addr) throw new WfProtocolError(`Missing address in signature payload`, null, WfErrorCode.SIGNATURE);
        if (!payload?.orgname) throw new WfProtocolError(`Missing originator name in signature payload`, null, WfErrorCode.SIGNATURE);
        if (!payload?.url) throw new WfProtocolError(`Missing url in signature payload`, null, WfErrorCode.SIGNATURE);

        /* Create header i.a.w. Whiteflag specification */
        const header: JwsHeader = {
            alg: signAlgorithm
        };
        /* Create payload i.a.w. Whiteflag specification */
        return new this(header, payload);
    }
}
/**
 * Creates a Whiteflag authentication signature for authentication method 1
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param originator the originator to be authenticated
 * @param url the URL used to publish the authentication signature
 * @returns a JWS used as the Whiteflag authentication signature
 */
async function createAuthSignature(blockchain: Blockchain, account: WfAccount, originator: WfOriginator, url: URL): Promise<WfSignature> {
    /* Check if own account */
    if (!account.isSelf()) {
        throw new WfProtocolError(`Cannot create signature without private key of account ${account.getAddress()}`, null, WfErrorCode.SIGNATURE);
    }
    /* Create JWS */
    const authSignature  = WfSignature.create(blockchain.signAlgorithm, {
        addr: account.getAddress(),
        orgname: originator.getName(),
        url: url.toString()
    });
    /* Sign JWS */
    try {
        /* Get data and private key */
        const data = authSignature.getBinSignInput();
        const privateKey = await account.getPrivateKey();
        if (!privateKey) throw new Error(`Error retrieving private key from keystore`);

        /* Create and set signature on JWS */
        const signature = u8aToB64u(await blockchain.requestSignature(data, privateKey));
        if (!authSignature.setSignature(signature).isSigned()) throw new Error(`Error setting signtaure on JWS`);
    } catch(err) {
        return handleError(err, `Could not create authentication signature for account ${account.getAddress()}`, WfErrorCode.SIGNATURE)
    }
    /* Return JWS */
    return authSignature;
}
/**
 * Checks if a Whiteflag authentication signature is valid
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param signature the Whiteflag authentication signature to validate
 * @param url the url the signature has been obtained from
 * @returns `true` if signature is valid, else `false`
 */
async function isValidAuthSignature(blockchain: Blockchain, account: WfAccount, signature: WfSignature, url: URL): Promise<boolean> {
    const errors = await validateAuthSignature(blockchain, account, signature, url);
    if (errors.length > 0) return false;
    return true;
}
/**
 * Checks a Whiteflag authentication signature for validation errors
 * @param blockchain the blockchain for which the account is authenticated
 * @param account the account used by the originator
 * @param signature the Whiteflag authentication signature to validate
 * @param url the url the signature has been obtained from
 * @returns an array of validation errors
 */
async function validateAuthSignature(blockchain: Blockchain, account: WfAccount, signature: WfSignature, url: URL): Promise<string[]> {
    let errors: string[] = [];

    /* Check JWS payload */
    if (!Object.hasOwn(signature.payload, 'addr')) {
        errors.push('Missing address in signature payload');
    } else if (signature.payload.addr !== account.getAddress()) {
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
    /* Get public key */
    const publicKey = account.getPublicKey();
    if (!publicKey) {
        throw new WfProtocolError(`Cannot validate signature without public key of account ${account.getAddress()}`, null, WfErrorCode.SIGNATURE);
    } else {
        /* Check signature */
        const valid = await blockchain.verifySignature(
            strToU8a(signature.getSignInput()),
            b64uToU8a(signature.getSignature()),
            publicKey
        );
        if (!valid) errors.push('Digital signature is invalid for the payload');
    }
    /* Return validation errors */
    return errors;
}
/**
 * Creates a Whiteflag authentication token for authentication method 2
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns the binary authentication token
 */
async function createAuthToken(account: WfAccount, secret: Uint8Array): Promise<Uint8Array> {
    const binAddress = account.getBinAddress();
    const authToken = await deriveToken(
        secret as ByteArray,
        WfAuthMethod.SECRET,
        binAddress as ByteArray,
        WfVersion.v1
    );
    return authToken;
}
/**
 * Checks if a Whiteflag authentication token is valid
 * @param token the Whiteflag authentication token to validate
 * @param account the account to be authenticated
 * @param secret the shared secret used to authenticate
 * @returns `true` if token is valid, else `false`
 */
async function isValidAuthToken(token: Uint8Array, account: WfAccount, secret: Uint8Array): Promise<boolean> {
    const result = await createAuthToken(account, secret);
    return arrayEquals(token, result);
}
