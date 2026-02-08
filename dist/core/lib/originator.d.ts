/**
 * @module core/origintaor
 * @summary Whiteflag JS core originator module
 */
export { WfOriginator };
import { WfAccount } from './account.ts';
/**
 * The organisation or person sending Whiteflag messages
 * @class WfOriginator
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a Whiteflag participant, e.g. a person or
 * organisation, that sends Whiteflag messages on a blockchain. An originator
 * may use multiple blockchain accounts.
 */
declare class WfOriginator {
    /** The name of the originator */
    name: string;
    /** The blockchain accounts used by the originator */
    accounts: WfAccount[];
    /**
     * Constructor for an originator object
     * @param name the name of the originator
     */
    constructor(name: string);
}
