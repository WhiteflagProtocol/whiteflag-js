'use strict';
export { WfLogger, LogEvent, LogLevel, checkLogLevel };
import { EventEmitter } from 'node:events';
import { getPosixEpoch } from '@whiteflagprotocol/util';
import { WfRuntimeError } from "./errors.js";
const DEFAULTLOGLEVEL = 3;
const NOLOG = 0;
const MINLOGLEVEL = 1;
const MAXLOGLEVEL = 6;
const INDICATORS = ['none', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NONE"] = 0] = "NONE";
    LogLevel[LogLevel["FATAL"] = 1] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["INFO"] = 4] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 5] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 6] = "TRACE";
})(LogLevel || (LogLevel = {}));
var LogEvent;
(function (LogEvent) {
    LogEvent["FATAL"] = "log:fatal";
    LogEvent["ERROR"] = "log:error";
    LogEvent["WARN"] = "log:warn";
    LogEvent["INFO"] = "log:info";
    LogEvent["DEBUG"] = "log:debug";
    LogEvent["TRACE"] = "log:trace";
})(LogEvent || (LogEvent = {}));
class WfLogger extends EventEmitter {
    static #sit = Symbol('WfLogger');
    static #instance;
    #level = DEFAULTLOGLEVEL;
    constructor(level, sit) {
        if (sit !== WfLogger.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate the Whiteflag logger');
        }
        if (level < MINLOGLEVEL)
            throw new RangeError(`Logging level cannot be lower than ${MINLOGLEVEL}`);
        if (level > MAXLOGLEVEL)
            throw new RangeError(`Logging level cannot be higher than ${MAXLOGLEVEL}`);
        super();
        this.#level = level;
    }
    static init(level = LogLevel.WARN, console = false) {
        if (this.#instance) {
            this.#instance.setLogLevel(level);
            this.#instance.setConsole(console);
            return this.#instance;
        }
        this.#instance = new WfLogger(level, this.#sit);
        return this.#instance.setConsole(console);
    }
    static getInstance() {
        return this.#instance ?? this.init();
    }
    log(level, message, source, err) {
        if (level > this.#level || level <= NOLOG)
            return false;
        const indicator = getIndicator(level);
        return this.emit(getLogEventName(indicator), {
            level: level,
            indicator: indicator,
            time: getPosixEpoch(),
            source: source,
            message: message,
            error: err
        });
    }
    onAll(listener) {
        for (const [level, indicator] of INDICATORS.entries()) {
            if (!indicator || level === NOLOG)
                continue;
            this.addListener(getLogEventName(indicator), listener);
        }
        return this;
    }
    offAll(listener) {
        for (const [level, indicator] of INDICATORS.entries()) {
            if (!indicator || level === NOLOG)
                continue;
            this.removeListener(getLogEventName(indicator), listener);
        }
        return this;
    }
    setConsole(enable) {
        if (enable)
            return this.onAll(consoleLog);
        return this.offAll(consoleLog);
    }
    getLogLevel() {
        return +this.#level;
    }
    setLogLevel(level) {
        this.#level = checkLogLevel(level);
        return this;
    }
    fatal(message, source) {
        return this.log(LogLevel.FATAL, message, source);
    }
    error(message, source) {
        return this.log(LogLevel.ERROR, message, source);
    }
    warn(message, source) {
        return this.log(LogLevel.WARN, message, source);
    }
    info(message, source) {
        return this.log(LogLevel.INFO, message, source);
    }
    debug(message, source) {
        return this.log(LogLevel.DEBUG, message, source);
    }
    trace(message, source) {
        return this.log(LogLevel.TRACE, message, source);
    }
}
function checkLogLevel(level) {
    if (level < MINLOGLEVEL)
        return MINLOGLEVEL;
    if (level > MAXLOGLEVEL)
        return MAXLOGLEVEL;
    return level;
}
function getLogEventName(indicator) {
    return `log:${indicator}`.toLowerCase();
}
function getIndicator(level) {
    return INDICATORS[level];
}
function consoleLog(log) {
    let ind = getIndicator(log.level).padEnd(5, ' ').substring(0, 5).toUpperCase();
    let mod = '';
    if (log.source)
        mod = `${log.source}: `;
    let msg = log.message;
    const message = `[${ind}] ${mod}${msg}`;
    switch (log.level) {
        case 1:
        case 2:
            return console.error(message);
        case 3:
            return console.warn(message);
        case 4:
            return console.info(message);
        case 5:
        case 6:
            return console.debug(message);
        default:
            return undefined;
    }
}
