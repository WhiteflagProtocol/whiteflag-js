'use strict';
export { WfKeyType, WfAuthMethod, WfCryptoMethod };
var WfKeyType;
(function (WfKeyType) {
    WfKeyType["ACCOUNT_PRIVATEKEY"] = "ACCOUNT_PRIVATEKEY";
    WfKeyType["ENCRYPT_ECDH"] = "ENCRYPTION_1_ECDH_NEGOTIATED_KEY";
    WfKeyType["ENCRYPT_PSK"] = "ENCRYPTION_2_PRESHARED_KEY";
    WfKeyType["AUTH_PSS"] = "AUTH_2_PRESHARED_SECRET";
    WfKeyType["AUTH_ECDH"] = "AUTH_2_ECDH_NEGOTIATED_SECRET";
    WfKeyType["ECDH_ENCRYPT"] = "ECDH_ENCRYPTION_PRIVATEKEY";
    WfKeyType["ECDH_AUTH"] = "ECDH_AUTHENTICATION_PRIVATEKEY";
})(WfKeyType || (WfKeyType = {}));
var WfAuthMethod;
(function (WfAuthMethod) {
    WfAuthMethod["URL"] = "1";
    WfAuthMethod["SECRET"] = "2";
})(WfAuthMethod || (WfAuthMethod = {}));
var WfCryptoMethod;
(function (WfCryptoMethod) {
    WfCryptoMethod["ECDH"] = "1";
    WfCryptoMethod["PSK"] = "2";
})(WfCryptoMethod || (WfCryptoMethod = {}));
