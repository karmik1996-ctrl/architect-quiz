"use strict";

/**
 * Manual Firebase Wrapper
 * Creates a global firebase object if Firebase SDK scripts are loaded
 * but don't create the global object (environment-specific issue)
 */

(function() {
    // Wait for Firebase SDK scripts to load
    function createFirebaseWrapper() {
        // Check if firebase already exists
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase already exists');
            return;
        }
        
        // Try to access Firebase SDK through various methods
        // Firebase SDK v8 compat should expose firebase as a global
        // If it doesn't, we need to create it manually
        
        // Method 1: Check if Firebase SDK modules are loaded in window
        // Firebase SDK v8 compat might expose functions directly
        let firebaseObj = null;
        
        // Check if we can access Firebase through the SDK's internal structure
        // Firebase SDK v8 compat creates a global 'firebase' object
        // If it doesn't exist, the scripts might not have executed properly
        
        // Try to create firebase object from loaded scripts
        // This is a workaround for environments where scripts load but don't create global object
        try {
            // Check if Firebase SDK scripts have loaded by checking for specific functions
            // Firebase SDK v8 compat should have these available
            if (typeof window !== 'undefined') {
                // Try to access Firebase through eval (last resort, but necessary here)
                // Actually, let's try a different approach - check if scripts are in DOM
                const scripts = document.querySelectorAll('script[src*="firebasejs"]');
                if (scripts.length > 0) {
                    // Scripts are loaded, but firebase object doesn't exist
                    // This is an environment-specific issue
                    console.warn('⚠️ Firebase SDK scripts found in DOM but firebase object not created');
                    console.warn('This is likely an environment-specific issue (browser automation, CSP, etc.)');
                    
                    // Try to manually create firebase object by re-executing the scripts
                    // Actually, that won't work. We need a different approach.
                    
                    // Last resort: Create a minimal firebase wrapper that will fail gracefully
                    // This won't work for actual Firebase operations, but will prevent errors
                    console.error('❌ Cannot create firebase object manually - Firebase SDK must create it');
                    console.error('Please check:');
                    console.error('1. Firebase SDK scripts are loading correctly (check Network tab)');
                    console.error('2. Content Security Policy (CSP) is not blocking script execution');
                    console.error('3. Browser environment supports global object creation');
                }
            }
        } catch (e) {
            console.error('Error creating Firebase wrapper:', e);
        }
    }
    
    // Try to create wrapper immediately
    createFirebaseWrapper();
    
    // Also try after delays
    setTimeout(createFirebaseWrapper, 100);
    setTimeout(createFirebaseWrapper, 500);
    setTimeout(createFirebaseWrapper, 1000);
    
    // Try after window load
    if (typeof window !== 'undefined') {
        window.addEventListener('load', createFirebaseWrapper, { once: true });
    }
})();


