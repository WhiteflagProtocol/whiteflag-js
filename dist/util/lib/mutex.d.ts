/**
 * @module util/mutex
 * @summary Whiteflag JS mutex utility module
 */
export { Mutex };
/**
 * An object to protect a shared resource from simultaneous access
 * @remarks A function may register a read-write operation to be tracked by
 * a mutex instance. If some operation requires exclusive access, the function
 * may request a lock; the mutex then returns a promise that resolves
 * if no more tracked operations, else it waits. Registering a read-write
 * operation to track also returns a promise, which resolves if no lock exists
 * anymore, else it waits.
 */
declare class Mutex {
    #private;
    /**
     * Constructs the mutex object
     * @param delaytime the time in ms before checking again if active read-write operations or locked
     */
    constructor(delaytime?: number);
    /**
     * Locks to prevent read-write operations
     * @returns the resolved or rejected promise with the mutex value
     */
    lock(): Promise<number>;
    /**
     * Unlocks to allow read-write operations
     * @returns the new mutex value
     */
    unlock(): number;
    /**
     * Waits for to unlock
     * @returns the resolved or rejected promise with the mutex value
     */
    locked(): Promise<number>;
    /**
     * Set tracker for read-write operations
     * @returns the resolved or rejected promise with the mutex value
     */
    track(): Promise<number>;
    /**
     * Unsets tracker for read-write operations
     * @returns the new mutex value
     */
    untrack(): number;
    /**
     * Waits for tracked read-write operations, including a lock, to finish
     * @returns the resolved or rejected promise with the mutex value
     */
    tracked(): Promise<number>;
}
