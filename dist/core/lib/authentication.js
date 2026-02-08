'use strict';
export { WfSignature, createAuthSignature, createAuthToken, isValidAuthSignature, validateAuthSignature, isValidAuthToken };
import { WfVersion, WfAuthMethod, WfProtocolError, WfErrorCode } from '@whiteflagprotocol/common';
import { Jws, arrayEquals, b64uToU8a, u8aToB64u, stringToU8a } from '@whiteflagprotocol/util';
import { deriveToken } from '@whiteflagprotocol/crypto';
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
        return new WfSignature(header, payload);
    }
}
async function createAuthSignature(originator, account, url) {
    const authSignature = WfSignature.create(account, originator.name, url);
    const data = authSignature.getBinSignInput();
    const signature = u8aToB64u(await account.createSignature(data));
    if (!authSignature.setSignature(signature).isSigned()) {
        throw new WfProtocolError(`Could not create authentication signature for account ${account.address}`, null, WfErrorCode.SIGNATURE);
    }
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
    const valid = await account.verifySignature(stringToU8a(signature.getSignInput()), b64uToU8a(signature.getSignature()));
    if (!valid)
        errors.push('Digital signature is invalid for the payload');
    return errors;
}
async function createAuthToken(account, secret) {
    const binAddress = await account.getBinAddress();
    const authToken = await deriveToken(secret, WfAuthMethod.SECRET, binAddress, WfVersion.v1);
    return authToken;
}
async function isValidAuthToken(token, account, secret) {
    const result = await createAuthToken(account, secret);
    return arrayEquals(token, result);
}
