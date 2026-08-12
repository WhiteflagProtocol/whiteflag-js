/**
 * @module main/protocol
 * @summary Whiteflag JS protocol handler module
 * @todo Chain events for full protocol message handling
 */
export { WfProtocol, WfProtocolRule, WfProtocolHandler };
import { FunctionChain } from '@whiteflagprotocol/util';
import { WfEvent, WfEventData } from './events.ts';
/** Function that handles Whiteflag protocol events */
type WfProtocolHandler = (data: WfEventData) => void;
/**
 * Whiteflag protocol rule defintion structure as used by the `WfProtocol` class
 */
interface WfProtocolRule {
    /** A unqiue short descriptive name
     *  identifying the protocol rule */
    name: string;
    /** The event that triggers the rule;
     *  this also defines the */
    trigger: WfEvent;
    /** The function chain implements the rule
        and will be called upon the triggering event */
    chain: FunctionChain<WfEventData>;
    /** The event that is emitted when
     *  the function chain completes */
    emits: WfEvent;
}
/**
 * The Whiteflag protocol layer
 * @todo Develop the protocol class and ruleset
 */
declare class WfProtocol {
    #private;
    /**
     * Constructs the Whiteflag blockchain overlay network
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Initializes the Whiteflag protocol layer
     * @returns the Whiteflag protocol layer singular instance
     * @throws if called before Whiteflag state has been initialized
     */
    static init(rules?: WfProtocolRule[]): Promise<WfProtocol>;
    /**
     * Gets the Whiteflag protocol protocol layer
     * @returns the Whiteflag protocol protocol layer singular instance
     * @throws if the Whiteflag protocol layer has not been initialized
     */
    static getInstance(): WfProtocol;
    /**
     * Waits for the initialized Whiteflag protocol layer
     * @returns the Whiteflag protocol layer singular instance
     * @remarks This is a safer method to get the Whiteflag protocol layer
     * instance, because it waits for the Whiteflag protocol layer to have
     * been initialized.
     */
    static readyInstance(): Promise<WfProtocol>;
    /**
     * Adds a protocol rule
     * @param rule the Whiteflag protocol rule to add
     * @returns `true` if rule has been added, else `false`
     */
    addRule(rule: WfProtocolRule): boolean;
    /**
     * Adds a protocol rule set
     * @param ruleset the Whiteflag protocol rule set to add
     * @returns a corresponding array with `true` for a rule has been added, and `false` if not
     */
    addRuleSet(ruleset: WfProtocolRule[]): boolean[];
    /**
     * Removes a protocol rule
     * @param rule the Whiteflag protocol rule to remove
     * @returns `true` if rule has been removed, or `false` if the rule did not exist
     */
    removeRule(rule: WfProtocolRule): boolean;
    /**
     * Removes a protocol rule set
     * @param ruleset the Whiteflag protocol rule set to remove
     * @returns a corresponding array with `true` for a rule has been removed, and `false` if not
     */
    removeRuleSet(ruleset: WfProtocolRule[]): boolean[];
}
