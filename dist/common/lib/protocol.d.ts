/**
 * @module common/protocol
 * @summary Whiteflag JS common protocol definitions module
 */
export { WfVersion, WfMsgType, WfKeyType, WfAuthMethod, WfCryptoMethod };
/**
 * Defines Whiteflag versions
 */
declare enum WfVersion {
    /** Whiteflag version 1 */
    v1 = "1"
}
/**
 * Whiteflag message types, defining the types of Whiteflag message
 * as specified by the Whiteflag standard
 * @wfversion v1-draft.7
 * @wfreference 2.4.2.1 Functional Messages, 2.4.2.2 Management Messages
 *
 */
declare enum WfMsgType {
    /** unknown message type, e.g. when encrypted  */
    unknown = "unknown",
    /** Authentication message */
    A = "A",
    /** Cryptographic support message */
    K = "K",
    /** Test message */
    T = "T",
    /** Protection sign */
    P = "P",
    /** Protection sign */
    D = "D",
    /** Status signal */
    S = "S",
    /** Emergency signal */
    E = "E",
    /** Infrstructure sign */
    I = "I",
    /** Mission signal */
    M = "M",
    /** Request signal */
    Q = "Q",
    /** Reference message */
    R = "R",
    /** Free text message */
    F = "F"
}
/**
 * Cryptograhphic keys and secret usages
 */
declare enum WfKeyType {
    /** Blockchain account private key */
    ACCOUNT_PRIVATEKEY = "ACCOUNT_PRIVATEKEY",
    /** Negotiated secret for encryption method 1 */
    ENCRYPT_ECDH = "ENCRYPTION_1_ECDH_NEGOTIATED_KEY",
    /** Pre-shared secret for encryption method 2*/
    ENCRYPT_PSK = "ENCRYPTION_2_PRESHARED_KEY",
    /** Pre-shared secret for Authentication method 2 */
    AUTH_PSS = "AUTH_2_PRESHARED_SECRET",
    /** Negotiated shared secret for Authentication method 2 */
    AUTH_ECDH = "AUTH_2_ECDH_NEGOTIATED_SECRET",
    /** ECDH private key for encryption key negotiation */
    ECDH_ENCRYPT = "ECDH_ENCRYPTION_PRIVATEKEY",
    /** ECDH private key for authentication secret negotiation */
    ECDH_AUTH = "ECDH_AUTHENTICATION_PRIVATEKEY"
}
/**
 * Whiteflag authentication methods, defining the authentication methods
 * for Whiteflag accounts as specified by the Whiteflag standard
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.3 Authentication methods
 */
declare enum WfAuthMethod {
    /** Whiteflag encryption method 1: URL */
    URL = "1",
    /** Whiteflag encryption method 2: shared secret */
    SECRET = "2"
}
/**
 * Whiteflag encryption methods, defining the encryption methods
 * for Whiteflag messages as specified by the Whiteflag standard
 * @wfversion v1-draft.7
 * @wfreference 5.2.4 Message Encryption
 */
declare enum WfCryptoMethod {
    /** Whiteflag encryption method 1: negotiated key */
    ECDH = "1",
    /** Whiteflag encryption method 2: pre-shared key */
    PSK = "2"
}
