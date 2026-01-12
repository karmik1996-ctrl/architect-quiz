"use strict";

/**
 * Firebase SDK v9 Modular Version
 * This version uses ES modules and doesn't rely on global objects
 */

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2I0qi4",
    authDomain: "architect-quiz-c5273.firebaseapp.com",
    projectId: "architect-quiz-c5273",
    storageBucket: "architect-quiz-c5273.firebasestorage.app",
    messagingSenderId: "566027889328",
    appId: "1:566027889328:web:efb894feed4b74bd4ca975",
    measurementId: "G-57NQ5TB1NP"
};

// Use Firebase SDK v9 with compat mode for easier migration
// This allows using v9 API with v8-style code
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

/**
 * Initialize Firebase using v9 modular SDK
 */
async function initializeFirebaseV9() {
    try {
        // Check if Firebase SDK v9 is loaded
        if (typeof firebase === 'undefined' && typeof window !== 'undefined' && !window.firebase) {
            // Try to load Firebase SDK v9 dynamically
            await loadFirebaseSDKV9();
        }
        
        // Use compat mode for easier migration
        const { initializeApp } = firebase.app;
        const { getAuth } = firebase.auth;
        const { getFirestore } = firebase.firestore;
        
        // Initialize app
        firebaseApp = initializeApp(firebaseConfig);
        
        // Initialize auth and firestore
        firebaseAuth = getAuth(firebaseApp);
        firebaseDb = getFirestore(firebaseApp);
        
        console.log("✅ Firebase v9 initialized successfully");
        
        // Expose to window for compatibility
        if (typeof window !== 'undefined') {
            window.firebase = {
                app: firebase.app,
                auth: firebase.auth,
                firestore: firebase.firestore,
                apps: [firebaseApp],
                initializeApp: initializeApp
            };
            window.firebaseInitialized = true;
            window.dispatchEvent(new Event('firebaseInitialized'));
        }
        
        return true;
    } catch (error) {
        console.error("❌ Firebase v9 initialization error:", error);
        return false;
    }
}

/**
 * Load Firebase SDK v9 dynamically
 */
async function loadFirebaseSDKV9() {
    return new Promise((resolve, reject) => {
        // Load Firebase SDK v9 from CDN
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
        script.async = false;
        
        script.onload = () => {
            // Load auth and firestore
            const authScript = document.createElement('script');
            authScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
            authScript.async = false;
            
            authScript.onload = () => {
                const firestoreScript = document.createElement('script');
                firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';
                firestoreScript.async = false;
                
                firestoreScript.onload = () => {
                    resolve();
                };
                
                firestoreScript.onerror = reject;
                document.head.appendChild(firestoreScript);
            };
            
            authScript.onerror = reject;
            document.head.appendChild(authScript);
        };
        
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Auto-initialize
if (typeof window !== 'undefined') {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeFirebaseV9, 100);
        });
    } else {
        setTimeout(initializeFirebaseV9, 100);
    }
}

// Expose config
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.initializeFirebaseV9 = initializeFirebaseV9;
}

