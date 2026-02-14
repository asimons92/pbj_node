const axios = require('axios');
const logger = require('../utils/logger');

// Configuration for the redaction service
const REDACTION_SERVICE_URL = process.env.REDACTION_SERVICE_URL || 'http://localhost:8000';

/**
 * Redact person names in text, replacing them with unique aliases (PERSON_1, PERSON_2, etc.)
 * @param {string} text - The text to redact
 * @returns {Promise<{redacted_text: string, name_mapping: Object}>} - Redacted text and mapping for de-anonymization
 */
async function redactText(text) {
    try {
        const response = await axios.post(`${REDACTION_SERVICE_URL}/redact`, {
            text: text
        });
        
        return {
            redacted_text: response.data.redacted_text,
            name_mapping: response.data.name_mapping
        };
    } catch (error) {
        logger.error('Redaction service error:', error.message);
        if (error.response) {
            throw new Error(`Redaction service failed: ${error.response.status} - ${error.response.data}`);
        }
        throw new Error(`Failed to connect to redaction service: ${error.message}`);
    }
}

/**
 * De-anonymize text by replacing aliases with original names
 * @param {string} text - Text containing aliases (PERSON_1, PERSON_2, etc.)
 * @param {Object} name_mapping - Mapping from alias to original name
 * @returns {string} - De-anonymized text
 */
function deanonymizeText(text, name_mapping) {
    let deanonymized = text;
    for (const [alias, originalName] of Object.entries(name_mapping)) {
        // Use global replace to handle multiple occurrences
        deanonymized = deanonymized.replace(new RegExp(alias, 'g'), originalName);
    }
    return deanonymized;
}

/**
 * De-anonymize an object recursively, replacing aliases in all string values
 * @param {any} obj - Object to de-anonymize (can be nested)
 * @param {Object} name_mapping - Mapping from alias to original name
 * @returns {any} - De-anonymized object
 */
function deanonymizeObject(obj, name_mapping) {
    if (typeof obj === 'string') {
        return deanonymizeText(obj, name_mapping);
    } else if (Array.isArray(obj)) {
        return obj.map(item => deanonymizeObject(item, name_mapping));
    } else if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = deanonymizeObject(value, name_mapping);
        }
        return result;
    }
    return obj;
}

module.exports = {
    redactText,
    deanonymizeText,
    deanonymizeObject
};

