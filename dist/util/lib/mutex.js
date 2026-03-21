'use strict';
export { Mutex };
import { sleep } from "./process.js";
const DEFAULTSLEEP = 50;
const MINSLEEP = 10;
const MAXSLEEP = 5000;
class Mutex {
    #mutex = 0;
    #sleeptime = DEFAULTSLEEP;
    constructor(sleep) {
        if (sleep && sleep >= MINSLEEP && sleep <= MAXSLEEP) {
            this.#sleeptime = sleep;
        }
    }
    async lock() {
        await this.tracked();
        return this.#mutex = -1;
    }
    unlock() {
        return this.#mutex = 0;
    }
    async locked() {
        while (this.#mutex < 0)
            await sleep(this.#sleeptime);
        return this.#mutex;
    }
    async track() {
        await this.locked();
        return this.#mutex++;
    }
    untrack() {
        if (this.#mutex <= 0)
            return this.#mutex;
        return this.#mutex--;
    }
    async tracked() {
        while (this.#mutex !== 0)
            await sleep(this.#sleeptime);
        return this.#mutex;
    }
}
