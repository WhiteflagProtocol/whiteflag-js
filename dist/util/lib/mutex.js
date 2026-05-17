'use strict';
export { Mutex };
import { delay } from "./processing.js";
const DEFAULTDELAY = 50;
const MINSLEEP = 10;
const MAXSLEEP = 1000;
class Mutex {
    #delaytime = DEFAULTDELAY;
    #mutex = 0;
    constructor(delaytime) {
        if (delaytime && delaytime >= MINSLEEP && delaytime <= MAXSLEEP) {
            this.#delaytime = delaytime;
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
            await delay(this.#delaytime);
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
            await delay(this.#delaytime);
        return this.#mutex;
    }
}
