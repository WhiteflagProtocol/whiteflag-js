'use strict';
export { WfSignature };
import { Jws } from '@whiteflagprotocol/util';
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
