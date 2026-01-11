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
    const firebaseLoaded = typeof firebase !== 'undefined' && 
                          typeof firebase.initializeApp === 'function' &&
                          typeof firebase.apps !== 'undefined';
    
    if (firebaseLoaded) {
        try {
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
    }
}

// Start initialization - wait for Firebase SDK to be available
// Use window.onload to ensure all scripts are loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM is already loaded, start checking
    setTimeout(initializeFirebaseWhenReady, 100);
} else {
    // Wait for window load event
    window.addEventListener('load', function() {
        setTimeout(initializeFirebaseWhenReady, 100);
    }, { once: true });
    
    // Also try immediate check as fallback
    setTimeout(initializeFirebaseWhenReady, 100);
}

// Expose firebaseConfig to the window for other modules
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}
