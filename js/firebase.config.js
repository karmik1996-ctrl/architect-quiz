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
const MAX_INIT_ATTEMPTS = 50; // 5 seconds max wait

function initializeFirebaseWhenReady() {
    firebaseInitAttempts++;
    
    if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
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
        }
    } else if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
        // Retry after a short delay
        setTimeout(initializeFirebaseWhenReady, 100);
    } else {
        console.error("❌ Firebase SDK failed to load after", MAX_INIT_ATTEMPTS, "attempts");
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeFirebaseWhenReady, 100);
    });
} else {
    setTimeout(initializeFirebaseWhenReady, 100);
}

// Expose firebaseConfig to the window for other modules
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}
