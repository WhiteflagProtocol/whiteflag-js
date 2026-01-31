'use strict';
export { WfAuthMethod, WfCryptoMethod };
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
