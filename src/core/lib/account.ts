'use strict';
/**
 * @module core/account
 * @summary Whiteflag JS core account module
 */
export {
    WfAccount,
    WfOriginator
};

/* Module imports */
import { WfBlockchain } from './blockchain.ts';

/**
 * The account used by an originator to send Whiteflag messages
 * @interface WfAccount
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This interface is an abstraction of a blockchain account class.
 * Note that some blockchains lack the concept of an account, whereas
 * Whiteflag assumes an identifiable originator that has an account on
 * a blockchain. An account for Whiteflag is nothing else than a key pair
 * for signing blockchain transactions, with some related information,
 * e.g. an address, balance etc.
 */
interface WfAccount {
    /* PROPERTIES */
    /**
     * The blockchain of the account
     */
    blockchain: WfBlockchain;
    /**
     * The address of the account
     */
    address: string;

    /* METHODS */
    /**
     * Provides the binary blockchain address 
     */
    getBinaryAddress(): Uint8Array;
    /**
     * Signs data with the account's private key
     */
    sign(data: Uint8Array): Uint8Array;
    /**
     * Verifies signature with the account's public key
     */
    verify(data: Uint8Array, signature: Uint8Array): boolean;
}

/**
 * The organisation or person sending Whiteflag messages
 * @interface WfOriginator
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This interface is an abstraction of an originator class.
 * An originator is a Whiteflag participant that sends Whiteflag messages
 * on a blockchain. An originator may use multiple blockchain accounts.
 */
interface WfOriginator {
    /* PROPERTIES */
    /**
     * The name of the originator
     */
    name: string;
    /**
     * The blockchain accounts used by the originator
     */
    accounts: WfAccount[];
}
