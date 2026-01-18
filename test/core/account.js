'use strict';
/**
 * @module test/core/account
 * @summary Whiteflag JS account test implementation
 */

/* Dependencies */
import { BinaryBuffer, hexToU8a } from '@whiteflagprotocol/util';

export class Account {
    constructor(address) {
        this.address = address;
    }
    getBinaryAddress() {
        return hexToU8a(this.address);
    }
}
