/**
 * @module core/account
 * @summary Whiteflag JS accounts module
 */
export {
    WfOriginator,
    WfAccount
};

/**
 * The organisation or person sending Whiteflag messages
 * @remarks An originator is a Whiteflag participant that sends
 * Whiteflag messages on a blockchain. An originator may use
 * multiple blockchain accounts.
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * 
 */
interface WfOriginator {
    /** The name of the originator */
    name:string;
    /** The blockchain used by the originator */
    blockchain: string;
    /** The blockchain accounts used by the originator */
    accounts: WfAccount[];
}

/**
 * The account used by an originator to send Whiteflag messages
 * @remarks Some blockchains lack the concept of an account, whereas Whiteflag
 * assumes an identifiable originator that has an account on a blockchain.
 * An account for Whiteflag is nothing else than a key pair for signing
 * blockchain transactions, with some related information, e.g. an address,
 * balance etc. 
 */
interface WfAccount {
    /** The blockchain of the account */
    blockchain: string;
    /** The address of the account */
    address: string;
}