"use strict";

// ============================================
// FIREBASE AUTHENTICATION MODULE
// ============================================
// Handles user registration, login, logout, and session management

// Initialize Firebase Authentication and Firestore
// Wait for Firebase to be initialized
let auth;
let db;

let authInitAttempts = 0;
const MAX_AUTH_INIT_ATTEMPTS = 100; // 10 seconds max wait

function initializeAuthWhenReady() {
  authInitAttempts++;
  
  try {
    // Check if Firebase is loaded and initialized
    if (typeof firebase !== 'undefined' && 
        typeof firebase.apps !== 'undefined' && 
        firebase.apps && 
        firebase.apps.length > 0 &&
        typeof firebase.auth === 'function' &&
        typeof firebase.firestore === 'function') {
      // Initialize Authentication
      auth = firebase.auth();
      
      // Initialize Firestore
      db = firebase.firestore();
      
      console.log('✅ Firebase Auth and Firestore initialized successfully');
      
      // Trigger custom event for other scripts
      if (typeof window !== 'undefined') {
        window.firebaseAuthReady = true;
        window.dispatchEvent(new Event('firebaseAuthReady'));
      }
    } else if (authInitAttempts < MAX_AUTH_INIT_ATTEMPTS) {
      // Wait for Firebase to initialize
      if (typeof window !== 'undefined' && window.firebaseInitialized) {
        // Firebase initialized, but auth might not be ready yet
        setTimeout(initializeAuthWhenReady, 100);
      } else if (typeof window !== 'undefined') {
        // Wait for Firebase initialization event
        window.addEventListener('firebaseInitialized', function() {
          setTimeout(initializeAuthWhenReady, 200);
        }, { once: true });
        // Also retry in case event already fired
        setTimeout(initializeAuthWhenReady, 200);
      } else {
        // Retry after a short delay
        setTimeout(initializeAuthWhenReady, 100);
      }
    } else {
      console.error('❌ Firebase Auth/Firestore failed to initialize after', MAX_AUTH_INIT_ATTEMPTS, 'attempts');
    }
  } catch (error) {
    console.error('❌ Firebase Auth/Firestore initialization error:', error);
  }
}

// Start initialization - wait for Firebase to be ready
initializeAuthWhenReady();

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @param {string} phone - User phone
 * @returns {Promise<Object>} User data
 */
async function registerUser(email, password, name, phone) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Save user data to Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      name: name,
      phone: phone,
      payment_status: 'unpaid',
      payment_date: null,
      access_expiry_date: null,
      quiz_attempts_remaining: 0,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User registered successfully:', user.uid);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: name,
        phone: phone
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    console.log('User logged in successfully:', user.uid);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        ...userData
      },
      token: await user.getIdToken()
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
async function logoutUser() {
  try {
    await auth.signOut();
    console.log('User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current user
 * @returns {Promise<Object|null>} Current user or null
 */
async function getCurrentUser() {
  try {
    if (!auth) {
      // Auth not initialized yet
      return null;
    }
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    // Get user data from Firestore
    if (!db) {
      return null;
    }
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      ...userData
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isUserLoggedIn() {
  if (!auth) {
    return false;
  }
  return auth.currentUser !== null;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
function onAuthStateChanged(callback) {
  if (!auth) {
    // Auth not initialized yet, set up listener for when it's ready
    if (typeof window !== 'undefined') {
      let unsubscribe = null;
      const checkAndSetup = () => {
        if (auth) {
          unsubscribe = auth.onAuthStateChanged(callback);
        }
      };
      // Wait for auth to be ready
      if (window.firebaseAuthReady) {
        // Already ready, set up immediately
        setTimeout(checkAndSetup, 100);
      } else {
        // Wait for event
        window.addEventListener('firebaseAuthReady', checkAndSetup, { once: true });
      }
      // Return unsubscribe function
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
    // Return no-op unsubscribe if no window
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
}

// ============================================
// EXPOSE FUNCTIONS TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
  window.registerUser = registerUser;
  window.loginUser = loginUser;
  window.logoutUser = logoutUser;
  window.getCurrentUser = getCurrentUser;
  window.isUserLoggedIn = isUserLoggedIn;
  window.onAuthStateChanged = onAuthStateChanged;
  
  // Expose Firebase instances (if needed)
  window.firebaseAuth = auth;
  window.firebaseDb = db;
}

