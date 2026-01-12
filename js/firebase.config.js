"use strict";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2I0qi4",
    authDomain: "architect-quiz-c5273.firebaseapp.com",
    projectId: "architect-quiz-c5273",
    storageBucket: "architect-quiz-c5273.firebasestorage.app",
    messagingSenderId: "566027889328",
    appId: "1:566027889328:web:efb894feed4b74bd4ca975",
    measurementId: "G-57NQ5TB1NP" // Optional - for Analytics
};

// Initialize Firebase (compat version - using firebase.initializeApp)
// Wait for Firebase SDK to load with retry mechanism
let firebaseInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 200; // 20 seconds max wait (increased from 100)

function initializeFirebaseWhenReady() {
    firebaseInitAttempts++;
    
    // Check if Firebase SDK is loaded (try multiple ways)
    // Try multiple methods to find firebase object
    let firebaseObj = null;
    
    // Method 1: Global firebase
    if (typeof firebase !== 'undefined') {
        firebaseObj = firebase;
    }
    // Method 2: window.firebase
    else if (typeof window !== 'undefined' && window.firebase) {
        firebaseObj = window.firebase;
    }
    // Method 3: Search in window object
    else if (typeof window !== 'undefined') {
        for (const key in window) {
            if (key.toLowerCase() === 'firebase' && window[key] && typeof window[key] === 'object') {
                firebaseObj = window[key];
                break;
            }
        }
    }
    
    const firebaseLoaded = firebaseObj && 
                          typeof firebaseObj.initializeApp === 'function' &&
                          typeof firebaseObj.apps !== 'undefined';
    
    if (firebaseLoaded) {
        try {
            // Ensure global firebase is set for compatibility
            if (typeof window !== 'undefined' && !window.firebase) {
                window.firebase = firebaseObj;
            }
            
            // Use the firebase object we found
            const firebase = firebaseObj;
            
            // Check if Firebase is already initialized
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
                console.log("✅ Firebase initialized successfully");
                // Trigger custom event for other scripts
                if (typeof window !== 'undefined') {
                    window.firebaseInitialized = true;
                    window.dispatchEvent(new Event('firebaseInitialized'));
                }
            } else {
                console.log("✅ Firebase already initialized");
                if (typeof window !== 'undefined') {
                    window.firebaseInitialized = true;
                    window.dispatchEvent(new Event('firebaseInitialized'));
                }
            }
        } catch (error) {
            console.error("❌ Firebase initialization error:", error);
            console.error("Error details:", error.message, error.stack);
            // Retry initialization if error occurs
            if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
                setTimeout(initializeFirebaseWhenReady, 100);
            }
        }
    } else if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
        // Retry after a short delay
        setTimeout(initializeFirebaseWhenReady, 100);
    } else {
        console.error("❌ Firebase SDK failed to load after", MAX_INIT_ATTEMPTS, "attempts");
        console.error("Make sure Firebase SDK scripts are loaded in HTML before this script");
        console.error("Debug: typeof firebase =", typeof firebase);
        console.error("Debug: typeof window.firebase =", typeof window !== 'undefined' ? typeof window.firebase : 'N/A');
        console.error("Debug: window keys containing 'firebase':", typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('firebase')) : []);
        
        // Last resort: try to manually create firebase object from scripts
        if (typeof window !== 'undefined') {
            console.error("Attempting manual firebase object creation...");
            // This is a fallback - scripts should have created it
        }
    }
}

// Start initialization - wait for Firebase SDK to be available
// Listen for firebaseSDKReady event from dynamic loader
(function startFirebaseInit() {
    // Check immediately (scripts might be loaded already)
    if (typeof firebase !== 'undefined') {
        initializeFirebaseWhenReady();
    } else {
        // Wait for firebaseSDKReady event (from dynamic loader)
        if (typeof window !== 'undefined') {
            window.addEventListener('firebaseSDKReady', function() {
                setTimeout(initializeFirebaseWhenReady, 50);
            }, { once: true });
            
            // Also check periodically as fallback
            setTimeout(initializeFirebaseWhenReady, 100);
            
            // Also try after window.onload as backup
            window.addEventListener('load', function() {
                if (!window.firebaseInitialized) {
                    setTimeout(initializeFirebaseWhenReady, 100);
                }
            }, { once: true });
        } else {
            // No window, just retry
            setTimeout(initializeFirebaseWhenReady, 100);
        }
    }
})();

// Expose firebaseConfig to the window for other modules
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}
