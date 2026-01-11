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
if (typeof firebase !== 'undefined') {
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized successfully");
        } else {
            console.log("✅ Firebase already initialized");
        }
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
    }
} else {
    console.error("❌ Firebase SDK not loaded! Make sure Firebase SDK scripts are included before this script.");
}

// Expose firebaseConfig to the window for other modules
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}
