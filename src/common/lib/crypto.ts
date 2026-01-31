'use strict';
/**
 * @module common/crypto
 * @summary Whiteflag JS common authentication adn encryption method definitions
 */
export {
    WfAuthMethod,
    WfCryptoMethod
};

/* MODULE DECLARATIONS */
/**
 * Whiteflag authentication methods, defining the authentication methods
 * for Whiteflag accounts as specified by the Whiteflag standard
 * @enum WfAuthMethod
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.3 Authentication methods
 */
enum WfAuthMethod {
    /** Whiteflag encryption method 1: URL */
    URL = '1',
    /** Whiteflag encryption method 2: shared secret */
    SECRET = '2'
}
/**
 * Whiteflag encryption methods, defining the encryption methods
 * for Whiteflag messages as specified by the Whiteflag standard
 * @enum WfCryptoMethod
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 */
enum WfCryptoMethod {
    /** Whiteflag encryption method 1: negotiated key */
    ECDH = '1',
    /** Whiteflag encryption method 2: pre-shared key */
    PSK = '2'
}
