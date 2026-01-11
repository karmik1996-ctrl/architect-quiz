"use strict";

// ============================================
// CONTENT PROTECTION SYSTEM
// ============================================

// 1. Dynamic Watermark System (DISABLED)
function createWatermark() {
    // Watermark disabled - remove any existing watermark
    const existing = document.getElementById('content-watermark');
    if (existing) existing.remove();
    // No watermark is created
    return null;
}

// 2. Blur Content on Focus Loss
function setupBlurProtection() {
    // Blur on window blur
    window.addEventListener('blur', () => {
        document.body.style.filter = 'blur(20px)';
        document.body.style.transition = 'filter 0.3s ease';
    });
    
    // Unblur on window focus
    window.addEventListener('focus', () => {
        document.body.style.filter = 'none';
    });
    
    // Blur on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.style.filter = 'blur(20px)';
        } else {
            document.body.style.filter = 'none';
        }
    });
}

// 3. Initialize Content Protection
function initializeContentProtection() {
    // Create watermark
    createWatermark();
    
    // Setup blur protection
    setupBlurProtection();
}

// Expose functions to window (if needed by other modules)
if (typeof window !== 'undefined') {
    window.createWatermark = createWatermark;
    window.setupBlurProtection = setupBlurProtection;
    window.initializeContentProtection = initializeContentProtection;
}

