'use strict';
export { WfSignature, createAuthSignature, createAuthToken, isValidAuthSignature, validateAuthSignature, isValidAuthToken };
import { WfVersion, WfAuthMethod, WfProtocolError, WfErrorCode, handleError } from '@whiteflagprotocol/common';
import { deriveToken } from '@whiteflagprotocol/crypto';
import { Jws } from '@whiteflagprotocol/util';
import { arrayEquals, b64uToU8a, strToU8a, u8aToB64u } from '@whiteflagprotocol/util';
class WfSignature extends Jws {
    static create(signAlgorithm, payload) {
        if (!payload?.addr)
            throw new WfProtocolError(`Missing address in signature payload`, null, WfErrorCode.SIGNATURE);
        if (!payload?.orgname)
            throw new WfProtocolError(`Missing originator name in signature payload`, null, WfErrorCode.SIGNATURE);
        if (!payload?.url)
            throw new WfProtocolError(`Missing url in signature payload`, null, WfErrorCode.SIGNATURE);
        const header = {
            alg: signAlgorithm
        };
        return new this(header, payload);
    }
}
async function createAuthSignature(blockchain, account, originator, url) {
    if (!account.isSelf()) {
        throw new WfProtocolError(`Cannot create signature without private key of account ${account.getAddress()}`, null, WfErrorCode.SIGNATURE);
    }
    const authSignature = WfSignature.create(blockchain.signAlgorithm, {
        addr: account.getAddress(),
        orgname: originator.getName(),
        url: url.toString()
    });
    try {
        const data = authSignature.getBinSignInput();
        const privateKey = await account.getPrivateKey();
        if (!privateKey)
            throw new Error(`Error retrieving private key from keystore`);
        const signature = u8aToB64u(await blockchain.requestSignature(data, privateKey));
        if (!authSignature.setSignature(signature).isSigned())
            throw new Error(`Error setting signtaure on JWS`);
    }
    catch (err) {
        return handleError(err, `Could not create authentication signature for account ${account.getAddress()}`, WfErrorCode.SIGNATURE);
    }
    return authSignature;
}
async function isValidAuthSignature(blockchain, account, signature, url) {
    const errors = await validateAuthSignature(blockchain, account, signature, url);
    if (errors.length > 0)
        return false;
    return true;
}
async function validateAuthSignature(blockchain, account, signature, url) {
    let errors = [];
    if (!Object.hasOwn(signature.payload, 'addr')) {
        errors.push('Missing address in signature payload');
    }
    else if (signature.payload.addr !== account.getAddress()) {
        errors.push('Signature address does not match account address');
    }
    if (!Object.hasOwn(signature.payload, 'url')) {
        errors.push('Missing URL in signature payload');
    }
    else if (signature.payload.url !== url.toString()) {
        errors.push('Signature URL does not match provided URL');
    }
    if (!Object.hasOwn(signature.payload, 'orgname')) {
        errors.push('Missing originator name in signature payload');
    }
    const publicKey = account.getPublicKey();
    if (!publicKey) {
        throw new WfProtocolError(`Cannot validate signature without public key of account ${account.getAddress()}`, null, WfErrorCode.SIGNATURE);
    }
    else {
        const valid = await blockchain.verifySignature(strToU8a(signature.getSignInput()), b64uToU8a(signature.getSignature()), publicKey);
        if (!valid)
            errors.push('Digital signature is invalid for the payload');
    }
    return errors;
}
async function createAuthToken(account, secret) {
    const binAddress = account.getBinAddress();
    const authToken = await deriveToken(secret, WfAuthMethod.SECRET, binAddress, WfVersion.v1);
    return authToken;
}
async function isValidAuthToken(token, account, secret) {
    const result = await createAuthToken(account, secret);
    return arrayEquals(token, result);
}
