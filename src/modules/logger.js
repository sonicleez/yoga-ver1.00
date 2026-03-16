/**
 * LOGGER — Production-safe logging utility
 * 
 * In development (DEV): all logs are shown
 * In production (PROD): only warn and error are shown
 * 
 * Usage:
 *   import { log } from './logger.js';
 *   log.debug('details here');
 *   log.info('info message');
 *   log.warn('warning');
 *   log.error('critical error');
 */

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

const noop = () => {};

export const log = {
    debug: IS_DEV ? console.log.bind(console) : noop,
    info: IS_DEV ? console.log.bind(console) : noop,
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    group: IS_DEV ? console.group.bind(console) : noop,
    groupEnd: IS_DEV ? console.groupEnd.bind(console) : noop,
    time: IS_DEV ? console.time.bind(console) : noop,
    timeEnd: IS_DEV ? console.timeEnd.bind(console) : noop,
    table: IS_DEV ? console.table.bind(console) : noop,
};
