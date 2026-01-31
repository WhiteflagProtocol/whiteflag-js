'use strict';
export { deriveToken };
import { WfVersion, WfAuthMethod } from '@whiteflagprotocol/common';
import { hexToU8a, noNumber, noString } from '@whiteflagprotocol/util';
import { hkdf } from "./hash.js";
import authSpec_v1 from '../static/v1/wf-auth-params.json' with { type: 'json' };
const PARAMS = compileAuthParams();
async function deriveToken(secret, method, info, version = WfVersion.v1) {
    switch (method) {
        case WfAuthMethod.SECRET: {
            const salt = hexToU8a(PARAMS[method][version].salt || noString('salt for token derivation'));
            const tokenLength = PARAMS[method][version].tokenLength || noNumber('token length');
            const token = await hkdf(secret, salt, info, tokenLength);
            return token;
        }
        default: {
            throw new Error(`Invalid authentication method: ${method}`);
        }
    }
}
function compileAuthParams() {
    const params = {};
    for (const method of Object.values(WfAuthMethod)) {
        params[method] = {};
        {
            const version = WfVersion.v1;
            params[method][version] = authSpec_v1[method];
        }
    }
    return params;
}
