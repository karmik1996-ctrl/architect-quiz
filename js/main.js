"use strict";

// ============================================
// MAIN INITIALIZATION MODULE
// ============================================
// This module orchestrates all other modules
// DO NOT add business logic here - only initialization

// Global error handler - catches all unhandled errors
window.onerror = function (msg, url, line, col, error) {
    console.error("JS ERROR:", msg, url, line, col, error?.stack);
    return false; // Allow default error handling too
};

// CRITICAL: Prevent unwanted screen sharing dialog
// Block getDisplayMedia calls to prevent screen sharing dialog from appearing
if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getDisplayMedia = function() {
        return Promise.reject(new DOMException('Screen sharing is not allowed', 'NotAllowedError'));
    };
}

// Initialize when DOM is ready
function initializeApp() {
    try {
        // Security system must be initialized first
        if (typeof initializeContentProtection === 'function') {
            initializeContentProtection();
        }
        
        // Initialize event listeners
        if (typeof initializeEventListeners === 'function') {
            initializeEventListeners();
        }
        
        // Initialize UI buttons
        if (typeof initializeUIButtons === 'function') {
            initializeUIButtons();
        }
        
        // Initialize idle detection
        if (typeof initIdleDetection === 'function') {
            initIdleDetection();
        }
        
        // Initialize game (payment check, progress restore, etc.)
        if (typeof initGame === 'function') {
            initGame();
        }
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// Handle DOM ready state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

