'use strict';
/**
 * @module crypto/authentication
 * @summary Whiteflag JS cryptographic authentication functions
 * @todo Test crypto auth module
 */
export {
    deriveToken
};

/* Dependencies */
import { WfVersion, WfAuthMethod } from '@whiteflagprotocol/common';
import { hexToU8a, noNumber, noString } from '@whiteflagprotocol/util';

/* Module imports */
import { hkdf } from './hash.ts';

/* Whiteflag specification */
import authSpec_v1 from '../static/v1/wf-auth-params.json' with { type: 'json' };

/* MODULE DECLARATIONS */
/**
 * Whiteflag encryption parameters for each method
 */
const PARAMS = compileAuthParams();

/* MODULE FUNCTIONS */
/**
 * Derives the authentication token based on the Whiteflag authentication method
 * @function deriveToken
 * @wfversion v1-draft.7
 * @wfreference 5.2.3 Encryption Key and Authentication Token Derivation
 * @param secret the shared authentication secret
 * @param method the Whiteflag authentication method
 * @param info information to bind the token, e.g. the blockchain address of the originator
 * @param version the Whiteflag protocol version
 * @returns the authentication token
 */
async function deriveToken(secret: Uint8Array<ArrayBuffer>,
                           method: WfAuthMethod,
                           info: Uint8Array<ArrayBuffer>,
                           version = WfVersion.v1
                        ): Promise<Uint8Array> {
    /* Derive token based on authentication method */
    switch (method) {
        case WfAuthMethod.SECRET: {
            /* Derive token with HKDF */
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

/* PRIVATE MODULE DECLARATIONS */
/**
 * Defines an object with authentication parameters
 * @private
 * @interface WfAuthParams
 */
interface WfAuthParams {
    [key: string]: {                // Authentication method
        [key: string]: {            // Whiteflag version
            $description: string,   // Description of the authentication method
            tokenLength?: number,   // Byte length of the authentication token
            salt?: string           // Salt for HKDF token generation
        }
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Compiles an object with all authentication parameters
 * @private
 * @returns an object with authentication parameters
 */
function compileAuthParams(): WfAuthParams {
    const params: WfAuthParams = {};
    for (const method of Object.values(WfAuthMethod)) {
        params[method] = {};

        /* Whiteflag version 1 */ {
            const version = WfVersion.v1;
            params[method][version] = authSpec_v1[method];
        }
    }
    return params;
}
