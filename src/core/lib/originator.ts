'use strict';
/**
 * @module core/origintaor
 * @summary Whiteflag JS core originator module
 */
export {
    WfOriginator
};

/* Module imports */
import { WfAccount } from './account.ts';

/* MODULE DECLARATIONS */
/**
 * The organisation or person sending Whiteflag messages
 * @class WfOriginator
 * @wfversion v1-draft.7
 * @wfreference 2.4.1.2 Originator and Account
 * @remarks This class represents a Whiteflag participant, e.g. a person or
 * organisation, that sends Whiteflag messages on a blockchain. An originator
 * may use multiple blockchain accounts.
 */
class WfOriginator {
    /* CLASS PROPERTIES */

    /** The name of the originator */
    public name: string;
    /** The blockchain accounts used by the originator */
    public accounts: WfAccount[] = [];

    /* CONSTRUCTOR */
    /**
     * Constructor for an originator object
     * @param name the name of the originator
     */
    constructor(name: string) {
        this.name = name;
    }
}
