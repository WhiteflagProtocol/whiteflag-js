'use strict';
/**
 * @module common/logger
 * @summary Whiteflag JS common logger module
 */
export {
    WfLogger,
    LogEvent,
    LogEventData,
    LogLevel,
    checkLogLevel
};

/* Dependecies */
import { EventEmitter } from 'node:events';
import { getPosixEpoch, posixtime } from '@whiteflagprotocol/util';

/* Module imports */
import { WfRuntimeError } from './errors.ts';

/* Constants */
const DEFAULTLOGLEVEL = 3;
const NOLOG = 0;
const MINLOGLEVEL = 1;
const MAXLOGLEVEL = 6;
const INDICATORS = [ 'none', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE' ]

/* MODULE DECLARATIONS */
/** Function that listens to log events */
export type LogListener = (log: LogData) => void;
/** The data emitted upon a log event */
export type LogData = {
    /** The logging level of the event */
    level: LogLevel;
    /** The logging level indicator */
    indicator: string
    /** The name of source of the the event */
    source: string;
    /** The logging message */
    message: string;
    /** The POSIX epoch time of the event */
    time: posixtime;
    /** A related error, if any */
    err?: Error;
}
/**
 * Logging level definitions
 */
enum LogLevel {
    /** Nothing will be logged */
    NONE = 0,
    /** An unrecoverable condition that causes the process to abort */
    FATAL = 1,
    /** An error that prevents a specific operation to complete */
    ERROR = 2,
    /** An encountered problem that may require action, but the specific operation could continue */
    WARN = 3,
    /** Useful information about a specific operation */
    INFO = 4,
    /** Detailed behaviour during development and for validation */
    DEBUG = 5,
    /** Very detailed processing steps for fault isolation */
    TRACE = 6
}
/**
 * Logging event definitions
 */
enum LogEvent {
    /** An unrecoverable condition that causes the process to abort */
    FATAL = 'log:fatal',
    /** An error that prevents a specific operation to complete */
    ERROR = 'log:error',
    /** An encountered problem that may require action, but the specific operation could continue */
    WARN = 'log:warn',
    /** Useful information about a specific operation */
    INFO = 'log:info',
    /** Detailed behaviour during development and for validation */
    DEBUG = 'log:debug',
    /** Very detailed processing steps for fault isolation */
    TRACE = 'log:trace'
}
/**
 * Logging events and associated data
 */
interface LogEventData {
    [LogEvent.FATAL]: [ log: LogData ];
    [LogEvent.ERROR]: [ log: LogData ];
    [LogEvent.WARN]: [ log: LogData ];
    [LogEvent.INFO]: [ log: LogData ];
    [LogEvent.DEBUG]: [ log: LogData ];
    [LogEvent.TRACE]: [ log: LogData ];
}
/**
 * The Whiteflag logger
 * @extends EventEmitter
 * @remarks This singleton class defines the event emitter for WFJSL modules
 * to emit log event. This allows relevant logs to be  processed by an
 * application's main logger. It can also be used by other software to emit
 * log messages and to log events to the console.
 */
class WfLogger extends EventEmitter<LogEventData> {
    /* CLASS PROPERTIES */
    /** Singleton instantiation token */
    static readonly #sit: Symbol = Symbol('WfLogger');
    /** Property to keep a single instance of the class */
    static #instance: WfLogger;
    /** The current logging level */
    #level: LogLevel = DEFAULTLOGLEVEL;

    /* CONSTRUCTOR AND STATIC FACTORY METHODS */
    /**
     * Constructs the logger
     * @param level the log level
     * @param sit the singleton instantiation token
     */
    private constructor(level: LogLevel, sit: Symbol) {
        /* Prohibit direct instantiation */
        if (sit !== WfLogger.#sit) {
            throw new WfRuntimeError('Cannot directly instantiate the Whiteflag logger');
        }
        /* Check log level */
        if (level < MINLOGLEVEL) throw new RangeError(`Logging level cannot be lower than ${MINLOGLEVEL}`);
        if (level > MAXLOGLEVEL) throw new RangeError(`Logging level cannot be higher than ${MAXLOGLEVEL}`);

        /* Create instance */
        super();
        this.#level = level;
    }
    /**
     * Initializes the Whiteflag logger
     * @param level the logging level
     * @param console if `true`, the logger will also log to the console
     * @returns the Whiteflag logger instance
     */
    public static init(level: LogLevel = LogLevel.WARN, console = false) {
        if (this.#instance) {
            this.#instance.setLogLevel(level);
            this.#instance.setConsole(console);
            return this.#instance;
        }
        this.#instance = new WfLogger(level, this.#sit);
        return this.#instance.setConsole(console);
    }
    /**
     * Gets the Whiteflag logger
     * @returns the Whiteflag logger singular instance
     * @remarks If the logger has not been initialzed, this will initialze
     * the logger with default values.
     */
    public static getInstance(): WfLogger {
        return this.#instance ?? this.init();
    }

    /* PUBLIC METHODS */
    /**
     * Emits a log event if the level is lower than the set log level
     * @param level the log level of the message
     * @param message the message to be logged
     * @param source the name of the source creating the log message
     * @param err an optional underlying error object
     * @returns `true` if the event was emitted and there were listeners, else `false`
     */
    public log(level: LogLevel, message: string, source?: string, err?: Error): boolean {
        /* To log or not to log */
        if (level > this.#level || level <= NOLOG) return false;
        
        /* Get log level name*/
        const indicator = getIndicator(level);

        /* Emit log event */
        return this.emit(getLogEventName(indicator), {
            level: level,
            indicator: indicator,
            time: getPosixEpoch(),
            source: source,
            message: message,
            error: err
        });
    }
    /**
     * Adds a listener to all logging events
     * @param listener the callback function called upon all events
     * @returns this Whiteflag logger, for chaining functions
     */
    public onAll(listener: LogListener): this {
        for (const [level, indicator] of INDICATORS.entries()) {
            if (!indicator || level === NOLOG) continue;
            this.addListener(getLogEventName(indicator), listener);
        }
        return this;
    }
    /**
     * Removes a listener from all logging events
     * @param listener the callback function called upon all events
     * @returns this Whiteflag logger, for chaining functions
     */
    public offAll(listener: LogListener): this {
        for (const [level, indicator] of INDICATORS.entries()) {
            if (!indicator || level === NOLOG) continue;
            this.removeListener(getLogEventName(indicator), listener);
        }
        return this;
    }
    /**
     * Enables of disable logging to the console
     * @param enable enables direct logging to the console if `true`
     * @returns this Whiteflag logger, for chaining functions
     */
    public setConsole(enable: boolean): this {
        if (enable) return this.onAll(consoleLog);
        return this.offAll(consoleLog);
    }
    /**
     * Gets the logging level
     * @returns the current logging level of this Whiteflag logger
     */
    public getLogLevel(): LogLevel {
        return +this.#level;
    }
    /**
     * Sets the logging level
     * @param level the logging level
     * @returns this Whiteflag logger, for chaining functions
     */
    public setLogLevel(level: LogLevel): this {
        this.#level = checkLogLevel(level);
        return this;
    }
    /**
     * Logs a fatal error
     * @param message the fatal error message
     * @param source the name of the source generating the fatal error
     * @returns `true` if the event was emitted and there were listeners
     */
    public fatal(message: string, source?: string): boolean {
        return this.log(LogLevel.FATAL, message, source);
    }
    /**
     * Logs an error
     * @param message the error message
     * @param source the name of the source generating the error
     * @returns `true` if the event was emitted and there were listeners
     */
    public error(message: string, source?: string): boolean {
        return this.log(LogLevel.ERROR, message, source);
    }
    /**
     * Logs a warning
     * @param message the warning message
     * @param source the name of the source generating the warning
     * @returns `true` if the event was emitted and there were listeners
     */
    public warn(message: string, source?: string): boolean {
        return this.log(LogLevel.WARN, message, source);
    }
    /**
     * Logs general information
     * @param message the informational message
     * @param source the name of the source generating the information
     * @returns `true` if the event was emitted and there were listeners
     */
    public info(message: string, source?: string): boolean {
        return this.log(LogLevel.INFO, message, source);
    }
    /**
     * Logs debug data
     * @param message the debug message
     * @param source the name of the source generating the debug data
     * @returns `true` if the event was emitted and there were listeners
     */
    public debug(message: string, source?: string): boolean {
        return this.log(LogLevel.DEBUG, message, source);
    }
    /**
     * Logs trace data
     * @param message the trace message
     * @param source the name of the source generating the trace data
     * @returns `true` if the event was emitted and there were listeners
     */
    public trace(message: string, source?: string): boolean {
        return this.log(LogLevel.TRACE, message, source);
    }
}
/**
 * Checks and djust the logging level to a valid value
 * @param level the logging level
 * @returns the logging level, adjusted if necessary
 */
function checkLogLevel(level: LogLevel): number {
    if (level < MINLOGLEVEL) return MINLOGLEVEL;
    if (level > MAXLOGLEVEL) return MAXLOGLEVEL;
    return level;
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Gets the logging event name by indicator
 * @private
 * @param indicator the log level indicator (name)
 * @returns the logging event name
 */
function getLogEventName(indicator: string): string {
    return `log:${indicator}`.toLowerCase();
}
/**
 * Gets the log level indicator
 * @private
 * @param level the logging level
 * @returns the log level indicator (name)
 */
function getIndicator(level: LogLevel): string {
    return INDICATORS[level];
}
/**
 * Logs to the console
 * @private
 * @param log the log data item
 */
function consoleLog(log: LogData): void {
    /* Construct console message */
    let ind = getIndicator(log.level).padEnd(5, ' ').substring(0, 5).toUpperCase();
    let mod = ''; if (log.source) mod = `${log.source}: `;
    let msg = log.message;
    const message = `[${ind}] ${mod}${msg}`

    /* Log to console */
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
