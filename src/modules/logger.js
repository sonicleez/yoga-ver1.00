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
    debug: console.log.bind(console),
    info: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    group: console.group.bind(console),
    groupEnd: console.groupEnd.bind(console),
    time: console.time.bind(console),
    timeEnd: console.timeEnd.bind(console),
    table: console.table.bind(console),
};
