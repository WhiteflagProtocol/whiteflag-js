'use strict';
export { BlockListener };
class BlockListener {
    #blockchain;
    #interval;
    constructor(blockchain, interval) {
        this.#blockchain = blockchain;
        this.#interval = interval;
    }
}
