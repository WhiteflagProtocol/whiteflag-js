'use strict';
export { WfSignature, createAuthSignature, createAuthToken, isValidAuthSignature, validateAuthSignature, isValidAuthToken };
import { WfVersion, WfAuthMethod } from '@whiteflagprotocol/common';
import { deriveToken } from '@whiteflagprotocol/crypto';
import { Jws, arrayEquals, b64uToU8a, u8aToB64u } from '@whiteflagprotocol/util';
class WfSignature extends Jws {
    static create(account, orgname, url, extpubkey) {
        const header = {
            alg: account.blockchain.signAlgorithm
        };
        const payload = {
            addr: account.address,
            orgname: orgname,
            url: url.toString()
        };
        if (extpubkey)
            payload.extpubkey = extpubkey;
        return new Jws(header, payload);
    }
}
async function createAuthSignature(originator, account, url) {
    const authSignature = WfSignature.create(account, originator.name, url);
    const signature = account.sign(b64uToU8a(authSignature.getSignInput()));
    authSignature.setSignature(u8aToB64u(signature));
    return authSignature;
}
async function isValidAuthSignature(signature, account, url) {
    const result = await validateAuthSignature(signature, account, url);
    if (result.length > 0)
        return false;
    return true;
}
async function validateAuthSignature(signature, account, url) {
    let errors = [];
    if (!Object.hasOwn(signature.payload, 'addr')) {
        errors.push('Missing address in signature payload');
    }
    else if (signature.payload.addr !== account.address) {
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
    if (!account.verify(b64uToU8a(signature.getSignInput()), b64uToU8a(signature.getSignature()))) {
        errors.push('Digital signature is invalid for the payload');
    }
    return errors;
}
async function createAuthToken(account, secret) {
    const authToken = await deriveToken(secret, WfAuthMethod.SECRET, account.getBinaryAddress(), WfVersion.v1);
    return authToken;
}
async function isValidAuthToken(token, account, secret) {
    const result = await createAuthToken(account, secret);
    return arrayEquals(token, result);
}
