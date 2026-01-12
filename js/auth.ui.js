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
    const quizTypeSection = document.getElementById('quiz-type-section');
    const choiceSection = document.getElementById('choice-section');
    const paymentCodeSection = document.getElementById('payment-code-section');
    const logoutContainer = document.getElementById('logout-container');
    
    // Hide auth forms
    if (authForms) authForms.style.display = 'none';
    
    // Show logout button at bottom
    if (logoutContainer) logoutContainer.style.display = 'block';
    
    // Hide payment code section (will show when user chooses to pay)
    if (paymentCodeSection) paymentCodeSection.style.display = 'none';
    
    // Hide choice section (will show after quiz type selection)
    if (choiceSection) choiceSection.style.display = 'none';
    
    // Show quiz type selection section first (choose Architect or Constructor)
    if (quizTypeSection) quizTypeSection.style.display = 'block';
}

/**
 * Hide user info and show auth forms
 */
function hideUserInfo() {
    const authForms = document.getElementById('auth-forms');
    const quizTypeSection = document.getElementById('quiz-type-section');
    const choiceSection = document.getElementById('choice-section');
    const paymentCodeSection = document.getElementById('payment-code-section');
    const logoutContainer = document.getElementById('logout-container');
    
    // Show auth forms
    if (authForms) authForms.style.display = 'block';
    
    // Hide logout button
    if (logoutContainer) logoutContainer.style.display = 'none';
    
    // Hide quiz type section
    if (quizTypeSection) quizTypeSection.style.display = 'none';
    
    // Hide choice section
    if (choiceSection) choiceSection.style.display = 'none';
    
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
        // Clear test data if test mode is enabled (TEMPORARY - WILL BE REMOVED)
        if (typeof clearTestData === 'function') {
            clearTestData();
        }
        
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
// CHOICE SECTION FUNCTIONS
// ============================================

/**
 * Show payment code section (when user chooses to pay)
 */
function showPaymentCodeSection() {
    const choiceSection = document.getElementById('choice-section');
    const paymentCodeSection = document.getElementById('payment-code-section');
    
    if (choiceSection) choiceSection.style.display = 'none';
    if (paymentCodeSection) paymentCodeSection.style.display = 'block';
}

/**
 * Show choice section (when user goes back from payment)
 */
function showChoiceSection() {
    const choiceSection = document.getElementById('choice-section');
    const paymentCodeSection = document.getElementById('payment-code-section');
    
    if (choiceSection) choiceSection.style.display = 'block';
    if (paymentCodeSection) paymentCodeSection.style.display = 'none';
}

/**
 * Start free trial (10 questions)
 */
async function startFreeTrial() {
    try {
        // Check if free trial is available
        if (typeof checkFreeTrialStatus === 'function') {
            const trialStatus = await checkFreeTrialStatus();
            
            if (trialStatus.used) {
                alert('⚠️ Թեստային հարցերը արդեն օգտագործված են:\n\nԽնդրում ենք վճարել 15,000 դրամ ամբողջ թեստը մուտք գործելու համար:');
                return;
            }
        }
        
        // Hide choice section
        const choiceSection = document.getElementById('choice-section');
        if (choiceSection) choiceSection.style.display = 'none';
        
        // Hide payment section
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) paymentSection.style.display = 'none';
        
        // Show start section and start quiz with free trial
        const startSection = document.getElementById('start-section');
        if (startSection) {
            startSection.style.display = 'block';
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Show info message about free trial
            const welcomeMessage = document.getElementById('welcome-message');
            const welcomeGreeting = document.getElementById('welcome-greeting');
            const welcomeInfo = document.getElementById('welcome-info');
            
            if (welcomeMessage && welcomeGreeting && welcomeInfo) {
                welcomeGreeting.textContent = '🎯 Թեստային 10 Հարց (Անվճար)';
                welcomeInfo.textContent = 'Դուք կարող եք լուծել 10 հարց անվճար: Սա օգնում է հասկանալ, թե արդյոք ցանկանում եք գնել ամբողջ թեստը:';
                welcomeMessage.style.display = 'block';
            }
            
            // REMOVED: Auto-start quiz - user should click start button manually
            // setTimeout(() => {
            //     if (typeof startQuiz === 'function') {
            //         startQuiz();
            //     } else {
            //         console.error('startQuiz function not found');
            //         alert('Սխալ: Quiz-ը չի կարող սկսվել:');
            //     }
            // }, 500);
        }
    } catch (error) {
        console.error('Error starting free trial:', error);
        alert('Սխալ: Հնարավոր չէ սկսել թեստային հարցերը: ' + error.message);
    }
}

/**
 * Select quiz type (Architect or Constructor)
 * @param {string} type - 'architect' or 'constructor'
 */
function selectQuizType(type) {
    // Store selected quiz type
    if (typeof window !== 'undefined') {
        window.selectedQuizType = type;
        localStorage.setItem('selectedQuizType', type);
    }
    
    // Update title immediately
    if (typeof getQuizTypeTitle === 'function') {
        const title = getQuizTypeTitle();
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = title;
        if (document.title) document.title = title;
    }
    
    // Hide quiz type section
    const quizTypeSection = document.getElementById('quiz-type-section');
    if (quizTypeSection) quizTypeSection.style.display = 'none';
    
    // Show choice section (payment or trial)
    const choiceSection = document.getElementById('choice-section');
    if (choiceSection) choiceSection.style.display = 'block';
    
    console.log('✅ Quiz type selected:', type);
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
    window.selectQuizType = selectQuizType;
    window.showPaymentCodeSection = showPaymentCodeSection;
    window.showChoiceSection = showChoiceSection;
    window.startFreeTrial = startFreeTrial;
    window.togglePasswordVisibility = togglePasswordVisibility;
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of password input
 * @param {string} buttonId - ID of toggle button
 */
function togglePasswordVisibility(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);
    
    if (!passwordInput || !toggleButton) return;
    
    // Get the SVG icon element
    const iconId = buttonId + '-icon';
    const icon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.title = 'Թաքցնել գաղտնաբառը';
        // Show closed eye icon
        if (icon) {
            icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
    } else {
        passwordInput.type = 'password';
        toggleButton.title = 'Ցուցադրել գաղտնաբառը';
        // Show open eye icon
        if (icon) {
            icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
    }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthUI);
} else {
    initializeAuthUI();
}

