"use strict";

// ============================================
// CONTENT PROTECTION SYSTEM
// ============================================

// DevTools Detection State
let devToolsDetected = false;
let devToolsCheckInterval = null;

// ============================================
// 1. DEVTOOLS DETECTION
// ============================================

/**
 * Detect DevTools opening using multiple methods
 * - Resize method (window dimensions)
 * - Debugger timing method
 * - Console detection
 */
function detectDevTools() {
    // Method 1: Resize detection (DevTools changes window dimensions)
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    // Method 2: Debugger timing (DevTools slows down execution)
    let start = performance.now();
    debugger; // This will be slow if DevTools is open
    let end = performance.now();
    const debuggerTiming = (end - start) > 100; // 100ms threshold
    
    // Method 3: Console detection (trying to detect console access)
    let consoleDetected = false;
    const element = document.createElement('div');
    Object.defineProperty(element, 'id', {
        get: function() {
            consoleDetected = true;
            return 'test';
        }
    });
    try {
        console.log(element);
    } catch (e) {
        // Ignore
    }
    
    return widthThreshold || heightThreshold || debuggerTiming || consoleDetected;
}

/**
 * Show DevTools warning overlay
 */
function showDevToolsWarning() {
    // Check if warning already exists
    if (document.getElementById('devtools-warning-overlay')) {
        return;
    }
    
    // Create warning overlay
    const overlay = document.createElement('div');
    overlay.id = 'devtools-warning-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 24px;
        text-align: center;
        padding: 20px;
    `;
    
    overlay.innerHTML = `
        <div style="max-width: 600px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">⚠️ Developer Tools Detected</h2>
            <p style="margin-bottom: 30px;">Please close the Developer Tools to continue.</p>
            <button id="devtools-warning-close" style="
                padding: 12px 24px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 18px;
                cursor: pointer;
            ">OK</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close button handler
    const closeBtn = document.getElementById('devtools-warning-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });
    }
}

/**
 * Handle DevTools detection - blur UI, disable interactions, show warning
 */
function handleDevToolsDetection() {
    if (!devToolsDetected) {
        devToolsDetected = true;
        
        // Blur the UI
        document.body.style.filter = 'blur(10px)';
        document.body.style.transition = 'filter 0.3s ease';
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        
        // Disable interactions
        document.body.style.cursor = 'not-allowed';
        
        // Show warning overlay
        showDevToolsWarning();
    }
}

/**
 * Stop DevTools detection if closed
 */
function checkDevToolsClosed() {
    if (devToolsDetected && !detectDevTools()) {
        devToolsDetected = false;
        document.body.style.filter = 'none';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // Remove warning overlay if exists
        const overlay = document.getElementById('devtools-warning-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

/**
 * Setup DevTools detection
 */
function setupDevToolsDetection() {
    // Check every 500ms for DevTools
    if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval);
    }
    
    devToolsCheckInterval = setInterval(() => {
        if (detectDevTools()) {
            handleDevToolsDetection();
        } else {
            checkDevToolsClosed();
        }
    }, 500);
}

/**
 * Stop DevTools detection
 */
function stopDevToolsDetection() {
    if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval);
        devToolsCheckInterval = null;
    }
    devToolsDetected = false;
    document.body.style.filter = 'none';
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
}

// ============================================
// 2. WATERMARK SYSTEM (Enhanced)
// ============================================

/**
 * Create watermark overlay (when quiz is active)
 */
function createWatermark() {
    // Remove existing watermark
    const existing = document.getElementById('content-watermark');
    if (existing) existing.remove();
    
    // Check if quiz is active (gameStarted flag)
    const quizActive = typeof gameStarted !== 'undefined' && gameStarted === true;
    
    if (!quizActive) {
        return null;
    }
    
    // Create watermark overlay
    const watermark = document.createElement('div');
    watermark.id = 'content-watermark';
    watermark.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.1;
        font-family: Arial, sans-serif;
        font-size: 48px;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
        user-select: none;
    `;
    
    watermark.textContent = 'CONFIDENTIAL';
    
    document.body.appendChild(watermark);
    return watermark;
}

// ============================================
// 3. BLUR PROTECTION (Enhanced)
// ============================================

/**
 * Setup blur protection on focus loss and visibility change
 */
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
    
    // Enhanced visibility change protection
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden - blur content
            document.body.style.filter = 'blur(20px)';
            
            // Create watermark if quiz is active
            const quizActive = typeof gameStarted !== 'undefined' && gameStarted === true;
            if (quizActive) {
                createWatermark();
            }
        } else {
            // Page is visible - unblur
            document.body.style.filter = 'none';
        }
    });
}

// ============================================
// 4. INITIALIZE CONTENT PROTECTION
// ============================================

/**
 * Initialize all content protection features
 */
function initializeContentProtection() {
    // Create watermark (if quiz is active)
    createWatermark();
    
    // Setup blur protection
    setupBlurProtection();
    
    // Setup DevTools detection (deterrence, not real security)
    // Note: DevTools detection is not 100% reliable, but serves as deterrence
    setupDevToolsDetection();
}

// ============================================
// EXPOSE FUNCTIONS TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.createWatermark = createWatermark;
    window.setupBlurProtection = setupBlurProtection;
    window.initializeContentProtection = initializeContentProtection;
    window.setupDevToolsDetection = setupDevToolsDetection;
    window.stopDevToolsDetection = stopDevToolsDetection;
}
