"use strict";

// ============================================
// FIREBASE AUTHENTICATION MODULE
// ============================================
// Handles user registration, login, logout, and session management

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK is not loaded. Make sure Firebase SDK is included in HTML before this script.');
}

// Initialize Firebase Authentication and Firestore
let auth;
let db;

try {
  // Firebase should already be initialized by firebase.config.js
  // Just get the auth and firestore instances
  if (typeof firebase !== 'undefined') {
    // Initialize Authentication
    auth = firebase.auth();
    
    // Initialize Firestore
    db = firebase.firestore();
    
    console.log('✅ Firebase Auth and Firestore initialized successfully');
  } else {
    console.error('❌ Firebase SDK not loaded!');
  }
} catch (error) {
  console.error('❌ Firebase Auth/Firestore initialization error:', error);
}

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
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    // Get user data from Firestore
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
  return auth.currentUser !== null;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
function onAuthStateChanged(callback) {
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

