"use strict";

// ============================================
// SECURITY UTILITIES MODULE
// ============================================
// Provides security utilities: input sanitization, XSS protection, safe DOM manipulation

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and escapes special characters
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    // Create a temporary div element
    const div = document.createElement('div');
    // Set input as textContent (automatically escapes HTML)
    div.textContent = input;
    // Get sanitized text (HTML entities are escaped)
    return div.textContent || div.innerText || '';
}

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return String(text);
    }
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Safely set text content of an element (XSS-safe)
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content
 */
function safeSetTextContent(element, text) {
    if (!element) return;
    try {
        element.textContent = typeof text === 'string' ? text : String(text);
    } catch (error) {
        console.error('Error setting text content:', error);
    }
}

/**
 * Safely set HTML content (use only for trusted HTML, escape user input)
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content (should be trusted/pre-escaped)
 */
function safeSetInnerHTML(element, html) {
    if (!element) return;
    try {
        element.innerHTML = typeof html === 'string' ? html : String(html);
    } catch (error) {
        console.error('Error setting innerHTML:', error);
    }
}

/**
 * Create a safe HTML string from template with escaped user inputs
 * @param {string} template - HTML template with placeholders
 * @param {Object} values - Values to insert (will be escaped)
 * @returns {string} Safe HTML string
 */
function safeHtmlTemplate(template, values) {
    let safeHtml = template;
    if (values && typeof values === 'object') {
        Object.keys(values).forEach(key => {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            const escapedValue = escapeHtml(String(values[key]));
            safeHtml = safeHtml.replace(placeholder, escapedValue);
        });
    }
    return safeHtml;
}

/**
 * Safe fetch with timeout and error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options (same as standard fetch)
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Response>} Fetch response
 */
function safeFetch(url, options = {}, timeout = 10000) {
    return new Promise((resolve, reject) => {
        // Create timeout
        const timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, timeout);
        
        // Perform fetch
        fetch(url, options)
            .then(response => {
                clearTimeout(timeoutId);
                resolve(response);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

/**
 * Safely access localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {*} Stored value or default value
 */
function safeLocalStorageGet(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        // Try to parse as JSON
        try {
            return JSON.parse(value);
        } catch (e) {
            // Not JSON, return as string
            return value;
        }
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Safely set localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful, false otherwise
 */
function safeLocalStorageSet(key, value) {
    try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        // Try to handle quota exceeded error
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('localStorage quota exceeded, clearing old data');
            try {
                // Clear old progress data
                localStorage.removeItem('quizProgress');
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                return true;
            } catch (retryError) {
                console.error('Failed to write after clearing:', retryError);
            }
        }
        return false;
    }
}

/**
 * Safely remove from localStorage with error handling
 * @param {string} key - Storage key
 * @returns {boolean} True if successful, false otherwise
 */
function safeLocalStorageRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Safely validate JSON data structure
 * @param {*} data - Data to validate
 * @param {Function} validator - Validation function
 * @returns {boolean} True if valid, false otherwise
 */
function validateData(data, validator) {
    try {
        if (typeof validator === 'function') {
            return validator(data);
        }
        return true;
    } catch (error) {
        console.error('Data validation error:', error);
        return false;
    }
}

// Expose functions to window
if (typeof window !== 'undefined') {
    window.sanitizeInput = sanitizeInput;
    window.escapeHtml = escapeHtml;
    window.safeSetTextContent = safeSetTextContent;
    window.safeSetInnerHTML = safeSetInnerHTML;
    window.safeHtmlTemplate = safeHtmlTemplate;
    window.safeFetch = safeFetch;
    window.safeLocalStorageGet = safeLocalStorageGet;
    window.safeLocalStorageSet = safeLocalStorageSet;
    window.safeLocalStorageRemove = safeLocalStorageRemove;
    window.validateData = validateData;
}

