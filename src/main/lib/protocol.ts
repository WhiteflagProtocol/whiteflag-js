'use strict';
/**
 * @module main/protocol
 * @summary Whiteflag JS protocol handler module
 * @todo Develop and implement the protocol rule set
 */
export {
    WfProtocol,
    WfProtocolRule,
    WfProtocolHandler
};

/* Dependencies */
import { WfRuntimeError } from '@whiteflagprotocol/common';
import { FunctionChain, delay } from '@whiteflagprotocol/util';

/* Package modules */
import { WfEvent, WfEventEmitter, WfEventData } from './events.ts';
import { WfState } from './state.ts';

/* Related singleton classes */
const wfEvent: WfEventEmitter = WfEventEmitter.getInstance();
let wfState: WfState;

/* Constants */
const DELAYTIME = 50;

/* MODULE DECLARATIONS */
/** Function that handles Whiteflag protocol events */
type WfProtocolHandler = (data: WfEventData) => void;

/**
 * Whiteflag protocol rule defintion structure as used by the `WfProtocol` class
 */
interface WfProtocolRule {
    /** A unqiue short descriptive name
     *  identifying the protocol rule */
    name: string;
    /** The protocol event that triggers
     *  the rule */
    trigger: WfEvent;
    /** The function chain implements the rule
        and will be called upon the triggering event */
    chain: FunctionChain<WfEventData>
    /** The event that is emitted when
     *  the function chain completes */
    emits: WfEvent;
}
/**
 * The Whiteflag protocol layer
 * @remarks This class represents the Whiteflag protocol protocol layer. It
 * is implemented as a set of rules. A rule consists of a protocol event (as
 * defined by `WfEvents`) that triggers the rule, a chain of functions
 * (created with the `FunctionChain` class) that executes the rule by
 * operating on the provided data, and a protocol event that is emitted with
 * the resulting data when the function chain completes.
 */
class WfProtocol {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('WfProtocol');
    /** Property to keep a single instance of the class */
    static #instance: WfProtocol;
    /** The ruleset */
    readonly #rules: Map<WfProtocolRule, WfProtocolHandler> = new Map();

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the Whiteflag blockchain overlay network
     * @param sit the singleton instantiation token
     */
    private constructor(sit: Symbol) {
        if (sit !== WfProtocol.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate Whiteflag protocol layer');
        }
        Object.freeze(this);
    }
    /**
     * Initializes the Whiteflag protocol layer
     * @returns the Whiteflag protocol layer singular instance
     * @throws if called before Whiteflag state has been initialized
     */
    public static async init(rules?: WfProtocolRule[]): Promise<WfProtocol> {
        /* Cannot initialize again */
        if (this.#instance) {
            throw new WfRuntimeError('Whiteflag protocol layer has already been initialized');
        }
        /* Get state; throws if not initialized */
        wfState = WfState.getInstance();
        /**
         * @todo Protocol initialisation
         */
        /* Seal keystore control and create protocol layer */
        this.#instance = new WfProtocol(this.#sit);
        wfEvent.emit(WfEvent.PROTOCOL_INITIALIZED, this.#instance);
        return this.#instance;
    }
    /**
     * Gets the Whiteflag protocol protocol layer
     * @returns the Whiteflag protocol protocol layer singular instance
     * @throws if the Whiteflag protocol layer has not been initialized
     */
    public static getInstance(): WfProtocol {
        if (!this.#instance) {
            throw new WfRuntimeError('Whiteflag protocol layer has not been been initialized');
        }
        return this.#instance;
    }
    /**
     * Waits for the initialized Whiteflag protocol layer
     * @returns the Whiteflag protocol layer singular instance
     * @remarks This is a safer method to get the Whiteflag protocol layer
     * instance, because it waits for the Whiteflag protocol layer to have
     * been initialized.
     */
    public static async readyInstance(): Promise<WfProtocol> {
        while (!this.#instance) await delay(DELAYTIME);
        return this.#instance;
    }

    /* PUBLIC METHODS */
    /**
     * Adds a protocol rule
     * @param rule the Whiteflag protocol rule to add
     * @returns `true` if rule has been added, else `false`
     */
    public addRule(rule: WfProtocolRule): boolean {
        if (this.#rules.has(rule)) return false;

        /* Create handler for the rule */
        const handler = this.#createHandler(rule);

        /* Store and activate rule and handler */
        this.#rules.set(rule, handler);
        wfEvent.addListener(rule.trigger, handler);
        return true;
    }
    /**
     * Adds a protocol rule set
     * @param ruleset the Whiteflag protocol rule set to add
     * @returns a corresponding array with `true` for a rule has been added, and `false` if not
     */
    public addRuleSet(ruleset: WfProtocolRule[]): boolean[] {
        return ruleset.map(this.addRule);
    }
    /**
     * Removes a protocol rule
     * @param rule the Whiteflag protocol rule to remove
     * @returns `true` if rule has been removed, or `false` if the rule did not exist
     */
    public removeRule(rule: WfProtocolRule): boolean {
        const handler = this.#rules.get(rule);
        if (!handler) return false;

        /* Deactivate and remove rule and handler */
        wfEvent.removeListener(rule.trigger, handler);
        return this.#rules.delete(rule);
    }
    /**
     * Removes a protocol rule set
     * @param ruleset the Whiteflag protocol rule set to remove
     * @returns a corresponding array with `true` for a rule has been removed, and `false` if not
     */
    public removeRuleSet(ruleset: WfProtocolRule[]): boolean[] {
        return ruleset.map(this.removeRule);
    }

    /* PRIVATE METHODS */
    /**
     * Creates a handler function for a protocol rule
     * @param rule the rule to create a handler function for
     * @returns a handler function
     * @remarks The handler executes the function chain of the rule
     * and emits the protocol event with the resulting data upon completion.
     */
    #createHandler(rule: WfProtocolRule): WfProtocolHandler {
        return function(data: WfEventData) {
            const result = rule.chain.execute(data);
            wfEvent.emit(rule.emits, result);
        }
    }
}
