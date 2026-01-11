"use strict";

// ============================================
// AUTHENTICATION UI MODULE
// ============================================
// Handles registration/login UI and integrates with Firebase Auth

// ============================================
// SECURITY HELPERS
// ============================================

/**
 * Safely set status message HTML (escapes user input)
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class (error, success, info)
 * @param {string} message - Message text (will be escaped)
 */
function setStatusMessage(element, className, message) {
    if (!element) return;
    
    // Escape user input to prevent XSS
    const escapedMessage = (typeof escapeHtml === 'function') 
        ? escapeHtml(message || '')
        : (() => {
            const div = document.createElement('div');
            div.textContent = message || '';
            return div.textContent || div.innerText || '';
        })();
    
    // Use safe method to set HTML (HTML template is trusted, message is escaped)
    const html = `<div class="payment-status ${className || 'info'}">${escapedMessage}</div>`;
    
    if (typeof safeSetInnerHTML === 'function') {
        safeSetInnerHTML(element, html);
    } else {
        try {
            element.innerHTML = html;
        } catch (error) {
            console.error('Error setting status message:', error);
            // Fallback to textContent
            element.textContent = message || '';
        }
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

/**
 * Show registration form
 */
function showRegisterForm() {
    const registerForm = document.getElementById('register-form-container');
    const loginForm = document.getElementById('login-form-container');
    
    if (registerForm) registerForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';
}

/**
 * Show login form
 */
function showLoginForm() {
    const registerForm = document.getElementById('register-form-container');
    const loginForm = document.getElementById('login-form-container');
    
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
}

/**
 * Show user info after login
 * @param {Object} userData - User data from Firebase
 */
function showUserInfo(userData) {
    const authForms = document.getElementById('auth-forms');
    const userInfo = document.getElementById('user-info');
    const paymentCodeSection = document.getElementById('payment-code-section');
    
    // Hide auth forms
    if (authForms) authForms.style.display = 'none';
    
    // Show user info
    if (userInfo) {
        userInfo.style.display = 'block';
        const displayName = document.getElementById('user-display-name');
        const userEmail = document.getElementById('user-email');
        const userPhone = document.getElementById('user-phone');
        
        if (displayName) displayName.textContent = userData.name || userData.email || 'User';
        if (userEmail) userEmail.textContent = userData.email || '';
        if (userPhone) userPhone.textContent = userData.phone || '';
    }
    
    // Show payment code section
    if (paymentCodeSection) paymentCodeSection.style.display = 'block';
}

/**
 * Hide user info and show auth forms
 */
function hideUserInfo() {
    const authForms = document.getElementById('auth-forms');
    const userInfo = document.getElementById('user-info');
    const paymentCodeSection = document.getElementById('payment-code-section');
    
    // Show auth forms
    if (authForms) authForms.style.display = 'block';
    
    // Hide user info
    if (userInfo) userInfo.style.display = 'none';
    
    // Hide payment code section
    if (paymentCodeSection) paymentCodeSection.style.display = 'none';
}

// ============================================
// FORM HANDLERS
// ============================================

/**
 * Handle registration form submission
 * @param {Event} event - Form submit event
 */
async function handleRegister(event) {
    if (event) event.preventDefault();
    
    const registerBtn = document.getElementById('register-btn');
    const statusDiv = document.getElementById('register-status');
    
    // Get form data
    const name = document.getElementById('register-name')?.value.trim();
    const phone = document.getElementById('register-phone')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    
    // Validate
    if (!name || !phone || !email || !password) {
        setStatusMessage(statusDiv, 'error', '⚠️ Խնդրում ենք լրացնել բոլոր դաշտերը');
        return;
    }
    
    if (password.length < 6) {
        setStatusMessage(statusDiv, 'error', '⚠️ Գաղտնաբառը պետք է լինի առնվազն 6 նիշ');
        return;
    }
    
    // Disable button and show loading
    if (registerBtn) registerBtn.disabled = true;
    setStatusMessage(statusDiv, 'info', '🔄 Գրանցումը կատարվում է...');
    
    try {
        // Check if registerUser function exists
        if (typeof registerUser !== 'function') {
            throw new Error('Firebase Auth functions not loaded. Make sure firebase.auth.js is loaded.');
        }
        
        // Register user
        const result = await registerUser(email, password, name, phone);
        
        if (result.success) {
            setStatusMessage(statusDiv, 'success', '✅ Գրանցումը հաջողությամբ ավարտվեց! Մուտք գործում եք...');
            
            // Automatically login after registration
            setTimeout(async () => {
                const loginResult = await loginUser(email, password);
                if (loginResult.success) {
                    showUserInfo(loginResult.user);
                }
            }, 1000);
        } else {
            throw new Error(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        const errorMsg = error && error.message ? error.message : 'Unknown error';
        setStatusMessage(statusDiv, 'error', '❌ Գրանցման սխալ: ' + errorMsg);
    } finally {
        if (registerBtn) registerBtn.disabled = false;
    }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
    if (event) event.preventDefault();
    
    const loginBtn = document.getElementById('login-btn');
    const statusDiv = document.getElementById('login-status');
    
    // Get form data
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    
    // Validate
    if (!email || !password) {
        setStatusMessage(statusDiv, 'error', '⚠️ Խնդրում ենք մուտքագրել email և գաղտնաբառ');
        return;
    }
    
    // Disable button and show loading
    if (loginBtn) loginBtn.disabled = true;
    setStatusMessage(statusDiv, 'info', '🔄 Մուտք գործում է...');
    
    try {
        // Check if loginUser function exists
        if (typeof loginUser !== 'function') {
            throw new Error('Firebase Auth functions not loaded. Make sure firebase.auth.js is loaded.');
        }
        
        // Login user
        const result = await loginUser(email, password);
        
        if (result.success) {
            setStatusMessage(statusDiv, 'success', '✅ Մուտք գործվեց հաջողությամբ!');
            
            // Show user info
            showUserInfo(result.user);
        } else {
            throw new Error(result.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = error && error.message ? error.message : 'Unknown error';
        setStatusMessage(statusDiv, 'error', '❌ Մուտքի սխալ: ' + errorMsg);
    } finally {
        if (loginBtn) loginBtn.disabled = false;
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Check if logoutUser function exists
        if (typeof logoutUser !== 'function') {
            throw new Error('Firebase Auth functions not loaded.');
        }
        
        // Logout user
        await logoutUser();
        
        // Hide user info and show auth forms
        hideUserInfo();
        
        // Clear forms
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        if (registerForm) registerForm.reset();
        if (loginForm) loginForm.reset();
        
        // Show register form by default
        showRegisterForm();
        
        console.log('✅ Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        alert('❌ Logout սխալ: ' + error.message);
    }
}

/**
 * Check if user is logged in and update UI
 */
async function checkAuthState() {
    try {
        if (typeof getCurrentUser !== 'function') {
            console.warn('Firebase Auth functions not loaded yet');
            return;
        }
        
        const user = await getCurrentUser();
        
        if (user) {
            // User is logged in
            showUserInfo(user);
        } else {
            // User is not logged in
            hideUserInfo();
            showRegisterForm();
        }
    } catch (error) {
        console.error('Auth state check error:', error);
        hideUserInfo();
        showRegisterForm();
    }
}

// ============================================
// INITIALIZE
// ============================================

/**
 * Initialize authentication UI
 */
function initializeAuthUI() {
    // Check auth state on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(checkAuthState, 1000); // Wait for Firebase to load
        });
    } else {
        setTimeout(checkAuthState, 1000); // Wait for Firebase to load
    }
    
    // Listen for auth state changes (wait for Firebase Auth to be ready)
    function setupAuthStateListener() {
        if (typeof onAuthStateChanged === 'function') {
            onAuthStateChanged((user) => {
                if (user) {
                    getCurrentUser().then((userData) => {
                        if (userData) {
                            showUserInfo(userData);
                        }
                    }).catch((error) => {
                        console.error('Error getting user data:', error);
                    });
                } else {
                    hideUserInfo();
                    showRegisterForm();
                }
            });
        } else {
            // Wait for Firebase Auth to be ready
            if (typeof window !== 'undefined') {
                window.addEventListener('firebaseAuthReady', setupAuthStateListener, { once: true });
            }
        }
    }
    
    setupAuthStateListener();
}

// ============================================
// EXPOSE FUNCTIONS TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.showRegisterForm = showRegisterForm;
    window.showLoginForm = showLoginForm;
    window.handleRegister = handleRegister;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.checkAuthState = checkAuthState;
    window.initializeAuthUI = initializeAuthUI;
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthUI);
} else {
    initializeAuthUI();
}

