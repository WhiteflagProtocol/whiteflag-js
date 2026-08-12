'use strict';
/**
 * @module util/mutex
 * @summary Whiteflag JS mutex utility module
 */
export {
    Mutex
};

/* Package modules */
import { delay } from './processing.ts';

/* Constants */
const DEFAULTDELAY = 50;
const MINSLEEP = 10;
const MAXSLEEP = 1000;

/**
 * An object to protect a shared resource from simultaneous access
 * @remarks A function may register a read-write operation to be tracked by
 * a mutex instance. If some operation requires exclusive access, the function
 * may request a lock; the mutex then returns a promise that resolves
 * if no more tracked operations, else it waits. Registering a read-write
 * operation to track also returns a promise, which resolves if no lock exists
 * anymore, else it waits.
 */
class Mutex {
    /* CLASS PROPERTIES */
    /** The time to delay in ms before checking for a lock or tracked operations */
    readonly #delaytime: number = DEFAULTDELAY;
    /** The mutex value counts active read-write operations, or is set to -1 ad a lock */
    #mutex: number = 0;

    /* CONSTRUCTOR */
    /**
     * Constructs the mutex object
     * @param delaytime the time in ms before checking again if active read-write operations or locked
     */
    constructor(delaytime?: number) {
        if (delaytime && delaytime >= MINSLEEP && delaytime <= MAXSLEEP) {
            this.#delaytime = delaytime;
        }
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the mutex state as a property
     */
    get state(): number {
        return this.#mutex
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Locks to prevent read-write operations
     * @returns the resolved or rejected promise with the mutex value
     */
    public async lock(): Promise<number> {
        await this.tracked();    // Wait until no more active read-write operations, including a lock
        return this.#mutex = -1;
    }
    /**
     * Unlocks to allow read-write operations
     * @returns the new mutex value
     */
    public unlock(): number {
        return this.#mutex = 0;
    }
    /**
     * Waits for to unlock
     * @returns the resolved or rejected promise with the mutex value
     */
    public async locked(): Promise<number> {
        while (this.#mutex < 0) await delay(this.#delaytime);
        return this.#mutex;
    }
    /**
     * Set tracker for read-write operations
     * @returns the resolved or rejected promise with the mutex value
     */
    public async track(): Promise<number> {
        await this.locked();      // Wait until no more lock
        return this.#mutex++;
    }
    /**
     * Unsets tracker for read-write operations
     * @returns the new mutex value
     */
    public untrack(): number {
        if (this.#mutex <= 0) return this.#mutex;
        return this.#mutex--;
    }
    /**
     * Waits for tracked read-write operations, including a lock, to finish
     * @returns the resolved or rejected promise with the mutex value
     */
    public async tracked(): Promise<number> {
        while (this.#mutex !== 0) await delay(this.#delaytime);
        return this.#mutex;
    }
}
