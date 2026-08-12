'use strict';
/**
 * @module main/protocol
 * @summary Whiteflag JS protocol handler module
 * @todo Develop and implement the default protocol rule set
 */
export {
    wfDefaultRuleSet,
};

/* Dependencies */
import { WfRuntimeError } from '@whiteflagprotocol/common';
import { FunctionChain, delay } from '@whiteflagprotocol/util';

/* Package modules */
import { WfProtocolRule } from './protocol.ts';
import { WfState } from './state.ts';

/* Related singleton classes */
let wfState: WfState;

/* Constants */
const wfDefaultRuleSet: WfProtocolRule[] = [];

