/**
 * @module main/logger
 * @summary Whiteflag JS protocol events logger module
 */
export { logWfEvents };
import { LogLevel } from '@whiteflagprotocol/common';
import { WfEventEmitter } from './events.ts';
/**
 * Activates the logging of all Whiteflag protocol events
 * @param emitter the emitter of protocol events
 * @param level the highest level of the generated logs, default is `INFO`
 * @remarks The logging level determines the highest level at which the logs
 * are generated, not which events are logged. If set at `INFO` it means that
 * the logs will be at `INFO`, `DEBUG` and `TRACE`, depending on the event. If
 * set to the lowest level `TRACE`, all event logs will be at level `TRACE`.
 */
declare function logWfEvents(emitter: WfEventEmitter, level?: LogLevel): void;
