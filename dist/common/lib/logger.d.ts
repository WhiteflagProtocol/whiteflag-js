/**
 * @module common/logger
 * @summary Whiteflag JS common logger module
 */
export { WfLogger, LogEvent, LogEventData, LogLevel, checkLogLevel };
import { EventEmitter } from 'node:events';
import { posixtime } from '@whiteflagprotocol/util';
/** Function that listens to log events */
export type LogListener = (log: LogData) => void;
/** The data emitted upon a log event */
export type LogData = {
    /** The logging level of the event */
    level: LogLevel;
    /** The logging level indicator */
    indicator: string;
    /** The name of source of the the event */
    source: string;
    /** The logging message */
    message: string;
    /** The POSIX epoch time of the event */
    time: posixtime;
    /** A related error, if any */
    err?: Error;
};
/**
 * Logging level definitions
 */
declare enum LogLevel {
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
declare enum LogEvent {
    /** An unrecoverable condition that causes the process to abort */
    FATAL = "log:fatal",
    /** An error that prevents a specific operation to complete */
    ERROR = "log:error",
    /** An encountered problem that may require action, but the specific operation could continue */
    WARN = "log:warn",
    /** Useful information about a specific operation */
    INFO = "log:info",
    /** Detailed behaviour during development and for validation */
    DEBUG = "log:debug",
    /** Very detailed processing steps for fault isolation */
    TRACE = "log:trace"
}
/**
 * Logging events and associated data
 */
interface LogEventData {
    [LogEvent.FATAL]: [log: LogData];
    [LogEvent.ERROR]: [log: LogData];
    [LogEvent.WARN]: [log: LogData];
    [LogEvent.INFO]: [log: LogData];
    [LogEvent.DEBUG]: [log: LogData];
    [LogEvent.TRACE]: [log: LogData];
}
/**
 * The Whiteflag logger
 * @extends EventEmitter
 * @remarks This singleton class defines the event emitter for WFJSL modules
 * to emit log event. This allows relevant logs to be  processed by an
 * application's main logger. It can also be used by other software to emit
 * log messages and to log events to the console.
 */
declare class WfLogger extends EventEmitter<LogEventData> {
    #private;
    /**
     * Constructs the logger
     * @param level the log level
     * @param sit the singleton instantiation token
     */
    private constructor();
    /**
     * Initializes the Whiteflag logger
     * @param level the logging level
     * @param console if `true`, the logger will also log to the console
     * @returns the Whiteflag logger instance
     */
    static init(level?: LogLevel, console?: boolean): WfLogger;
    /**
     * Gets the Whiteflag logger
     * @returns the Whiteflag logger singular instance
     * @remarks If the logger has not been initialzed, this will initialze
     * the logger with default values.
     */
    static getInstance(): WfLogger;
    /**
     * Emits a log event if the level is lower than the set log level
     * @param level the log level of the message
     * @param message the message to be logged
     * @param source the name of the source creating the log message
     * @param err an optional underlying error object
     * @returns `true` if the event was emitted and there were listeners, else `false`
     */
    log(level: LogLevel, message: string, source?: string, err?: Error): boolean;
    /**
     * Adds a listener to all logging events
     * @param listener the callback function called upon all events
     * @returns this Whiteflag logger, for chaining functions
     */
    onAll(listener: LogListener): this;
    /**
     * Removes a listener from all logging events
     * @param listener the callback function called upon all events
     * @returns this Whiteflag logger, for chaining functions
     */
    offAll(listener: LogListener): this;
    /**
     * Enables of disable logging to the console
     * @param enable enables direct logging to the console if `true`
     * @returns this Whiteflag logger, for chaining functions
     */
    setConsole(enable: boolean): this;
    /**
     * Gets the logging level
     * @returns the current logging level of this Whiteflag logger
     */
    getLogLevel(): LogLevel;
    /**
     * Sets the logging level
     * @param level the logging level
     * @returns this Whiteflag logger, for chaining functions
     */
    setLogLevel(level: LogLevel): this;
    /**
     * Logs a fatal error
     * @param message the fatal error message
     * @param source the name of the source generating the fatal error
     * @returns `true` if the event was emitted and there were listeners
     */
    fatal(message: string, source?: string): boolean;
    /**
     * Logs an error
     * @param message the error message
     * @param source the name of the source generating the error
     * @returns `true` if the event was emitted and there were listeners
     */
    error(message: string, source?: string): boolean;
    /**
     * Logs a warning
     * @param message the warning message
     * @param source the name of the source generating the warning
     * @returns `true` if the event was emitted and there were listeners
     */
    warn(message: string, source?: string): boolean;
    /**
     * Logs general information
     * @param message the informational message
     * @param source the name of the source generating the information
     * @returns `true` if the event was emitted and there were listeners
     */
    info(message: string, source?: string): boolean;
    /**
     * Logs debug data
     * @param message the debug message
     * @param source the name of the source generating the debug data
     * @returns `true` if the event was emitted and there were listeners
     */
    debug(message: string, source?: string): boolean;
    /**
     * Logs trace data
     * @param message the trace message
     * @param source the name of the source generating the trace data
     * @returns `true` if the event was emitted and there were listeners
     */
    trace(message: string, source?: string): boolean;
}
/**
 * Checks and djust the logging level to a valid value
 * @param level the logging level
 * @returns the logging level, adjusted if necessary
 */
declare function checkLogLevel(level: LogLevel): number;
