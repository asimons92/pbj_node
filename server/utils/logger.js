/**
 * Simple logger utility that respects NODE_ENV
 * 
 * In production, only errors and warnings are logged.
 * In development, all log levels are enabled.
 * 
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started');
 *   logger.debug('Debug info', { data });
 *   logger.warn('Warning message');
 *   logger.error('Error occurred', error);
 */

const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    /**
     * Debug level - only in development
     */
    debug: (...args) => {
        if (!isProduction) {
            console.log('[DEBUG]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Info level - only in development
     */
    info: (...args) => {
        if (!isProduction) {
            console.log('[INFO]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Warning level - always logged
     */
    warn: (...args) => {
        console.warn('[WARN]', new Date().toISOString(), ...args);
    },

    /**
     * Error level - always logged
     */
    error: (...args) => {
        console.error('[ERROR]', new Date().toISOString(), ...args);
    }
};

module.exports = logger;

