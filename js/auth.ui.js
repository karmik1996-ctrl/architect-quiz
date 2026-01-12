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
    try {
        const authForms = document.getElementById('auth-forms');
        const authSection = document.getElementById('auth-section');
        const quizContainer = document.querySelector('.quiz-container');
        const quizTypeSection = document.getElementById('quiz-type-section');
        const choiceSection = document.getElementById('choice-section');
        const paymentCodeSection = document.getElementById('payment-code-section');
        const paymentSection = document.getElementById('payment-section');
        const logoutContainer = document.getElementById('logout-container');
        const startSection = document.getElementById('start-section');
        
        // Ensure quiz-container is visible
        if (quizContainer) {
            quizContainer.style.display = 'block';
            quizContainer.style.setProperty('display', 'block', 'important');
            quizContainer.style.visibility = 'visible';
            console.log('✅ Quiz container shown');
        } else {
            console.warn('⚠️ Quiz container not found');
        }
        
        // Hide auth forms (IMPORTANT: Must be hidden when user is logged in)
        if (authForms) {
            authForms.style.display = 'none';
            authForms.style.setProperty('display', 'none', 'important');
            console.log('✅ Auth forms hidden');
        } else {
            console.warn('⚠️ Auth forms not found');
        }
        
        // Hide auth section (IMPORTANT: Must be hidden when user is logged in)
        if (authSection) {
            authSection.style.display = 'none';
            authSection.style.setProperty('display', 'none', 'important');
            console.log('✅ Auth section hidden');
        } else {
            console.warn('⚠️ Auth section not found');
        }
        
        // Show logout button at bottom
        if (logoutContainer) {
            logoutContainer.style.display = 'block';
            logoutContainer.style.setProperty('display', 'block', 'important');
        }
        
        // Hide payment code section (will show when user chooses to pay)
        if (paymentCodeSection) {
            paymentCodeSection.style.display = 'none';
            paymentCodeSection.style.setProperty('display', 'none', 'important');
        }
        
        // Hide start section (will show when user starts quiz)
        if (startSection) {
            startSection.style.display = 'none';
            startSection.style.setProperty('display', 'none', 'important');
        }
        
        // Check if quiz type is already selected
        const selectedType = localStorage.getItem('selectedQuizType');
        
        // Validate selected type
        const isValidType = selectedType && (selectedType === 'architect' || selectedType === 'constructor');
        
        // Hide payment section content BUT keep payment-section visible if quiz-type-section needs to be shown
        if (paymentSection) {
            // Hide payment section's initial content (h1, info-btn, payment-instructions, auth-section)
            const paymentH1 = paymentSection.querySelector('h1');
            const infoBtn = paymentSection.querySelector('#info-btn');
            const paymentInfo = paymentSection.querySelector('.payment-info');
            
            if (paymentH1) {
                paymentH1.style.display = 'none';
                paymentH1.style.setProperty('display', 'none', 'important');
            }
            if (infoBtn) {
                infoBtn.style.display = 'none';
                infoBtn.style.setProperty('display', 'none', 'important');
            }
            
            // Hide payment-instructions but keep payment-info visible for quiz-type-section
            if (paymentInfo) {
                const paymentInstructions = paymentInfo.querySelector('.payment-instructions');
                if (paymentInstructions) {
                    paymentInstructions.style.display = 'none';
                    paymentInstructions.style.setProperty('display', 'none', 'important');
                }
            }
            
            // IMPORTANT: Keep payment-section visible - it contains quiz-type-section
            paymentSection.style.display = 'block';
            paymentSection.style.setProperty('display', 'block', 'important');
            console.log('✅ Payment section content hidden (keeping container visible for quiz-type-section)');
        } else {
            console.warn('⚠️ Payment section not found');
        }
        
        if (isValidType) {
            // Quiz type already selected, show choice section
            if (choiceSection) {
                choiceSection.style.display = 'block';
                choiceSection.style.setProperty('display', 'block', 'important');
                console.log('✅ Choice section shown');
            } else {
                console.warn('⚠️ Choice section not found');
            }
            if (quizTypeSection) {
                quizTypeSection.style.display = 'none';
                quizTypeSection.style.setProperty('display', 'none', 'important');
            }
        } else {
            // Quiz type not selected or invalid, show quiz type selection section first (choose Architect or Constructor)
            // Clear invalid selection
            if (selectedType && !isValidType) {
                localStorage.removeItem('selectedQuizType');
                console.warn('Invalid quiz type removed:', selectedType);
            }
            
            if (choiceSection) {
                choiceSection.style.display = 'none';
                choiceSection.style.setProperty('display', 'none', 'important');
            }
            if (quizTypeSection) {
                // CRITICAL: Ensure payment-section is visible (it contains quiz-type-section)
                if (paymentSection) {
                    paymentSection.style.display = 'block';
                    paymentSection.style.setProperty('display', 'block', 'important');
                    paymentSection.style.visibility = 'visible';
                    paymentSection.style.opacity = '1';
                    console.log('✅ Payment section made visible for quiz-type-section');
                    console.log('Payment section computed style:', window.getComputedStyle(paymentSection).display);
                }
                
                quizTypeSection.style.display = 'block';
                quizTypeSection.style.setProperty('display', 'block', 'important');
                quizTypeSection.style.visibility = 'visible';
                quizTypeSection.style.opacity = '1';
                
                // Fix text color for dark mode
                const isDarkMode = document.body.classList.contains('dark-mode');
                const title = quizTypeSection.querySelector('.quiz-type-section-title');
                if (title) {
                    if (isDarkMode) {
                        title.style.color = '#e0e0e0';
                        title.style.setProperty('color', '#e0e0e0', 'important');
                    } else {
                        title.style.color = '#1a1a1a';
                        title.style.setProperty('color', '#1a1a1a', 'important');
                    }
                }
                
                // Fix quiz-type-option colors for dark mode
                const options = quizTypeSection.querySelectorAll('.quiz-type-option');
                options.forEach(option => {
                    if (isDarkMode) {
                        option.style.color = '#e0e0e0';
                        option.style.setProperty('color', '#e0e0e0', 'important');
                        const h4 = option.querySelector('h4');
                        if (h4) {
                            h4.style.color = '#e0e0e0';
                            h4.style.setProperty('color', '#e0e0e0', 'important');
                        }
                        const paragraphs = option.querySelectorAll('p');
                        paragraphs.forEach(p => {
                            p.style.color = '#e0e0e0';
                            p.style.setProperty('color', '#e0e0e0', 'important');
                        });
                    }
                });
                
                console.log('✅ Quiz type section shown');
                console.log('Quiz type section computed style:', window.getComputedStyle(quizTypeSection).display);
                console.log('Quiz type section offsetHeight:', quizTypeSection.offsetHeight);
                console.log('Quiz type section parent:', quizTypeSection.parentElement?.id);
                // Scroll to quiz type section
                setTimeout(() => {
                    if (quizTypeSection) {
                        quizTypeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            } else {
                console.warn('⚠️ Quiz type section not found');
            }
        }
        
        console.log('✅ User info shown, quiz type:', isValidType ? selectedType : 'not selected');
    } catch (error) {
        console.error('Error in showUserInfo:', error);
    }
}

/**
 * Hide user info and show auth forms
 */
function hideUserInfo() {
    try {
        const authForms = document.getElementById('auth-forms');
        const quizTypeSection = document.getElementById('quiz-type-section');
        const choiceSection = document.getElementById('choice-section');
        const paymentCodeSection = document.getElementById('payment-code-section');
        const paymentSection = document.getElementById('payment-section');
        const logoutContainer = document.getElementById('logout-container');
        const startSection = document.getElementById('start-section');
        
        // Show payment section (main page)
        if (paymentSection) {
            paymentSection.style.display = 'block';
            console.log('✅ Payment section shown');
        } else {
            console.warn('⚠️ Payment section not found');
        }
        
        // Show auth forms
        if (authForms) {
            authForms.style.display = 'block';
            console.log('✅ Auth forms shown');
        } else {
            console.warn('⚠️ Auth forms not found');
        }
        
        // Hide logout button
        if (logoutContainer) {
            logoutContainer.style.display = 'none';
        }
        
        // Hide quiz type section
        if (quizTypeSection) {
            quizTypeSection.style.display = 'none';
        }
        
        // Hide choice section
        if (choiceSection) {
            choiceSection.style.display = 'none';
        }
        
        // Hide payment code section
        if (paymentCodeSection) {
            paymentCodeSection.style.display = 'none';
        }
        
        // Hide start section
        if (startSection) {
            startSection.style.display = 'none';
        }
        
        console.log('✅ User info hidden, payment section shown');
    } catch (error) {
        console.error('Error in hideUserInfo:', error);
    }
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
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('✅ handleLogin called');
    
    const loginBtn = document.getElementById('login-btn');
    const statusDiv = document.getElementById('login-status');
    
    // Get form data
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ Login form inputs not found');
        if (statusDiv) {
            setStatusMessage(statusDiv, 'error', '❌ Սխալ: Login form-ի inputs չեն գտնվել');
        }
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Login attempt:', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
    
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
        let result = await loginUser(email, password);
        
        // If login fails with "user-not-found" error, try to auto-register test account
        if (!result.success && result.error && result.error.includes('user-not-found')) {
            // Check if this is the test account
            if (email === 'karmik1996@mail.ru') {
                console.log('🔄 Test account not found, auto-creating...');
                setStatusMessage(statusDiv, 'info', '🔄 Account-ը չի գտնվել, ստեղծվում է...');
                
                // Auto-register test account
                if (typeof registerUser === 'function') {
                    const registerResult = await registerUser(email, password, 'Test User', '000000000');
                    
                    if (registerResult.success) {
                        console.log('✅ Test account created successfully');
                        // Now try to login again
                        result = await loginUser(email, password);
                    } else {
                        throw new Error(registerResult.error || 'Auto-registration failed');
                    }
                } else {
                    throw new Error('Register function not available');
                }
            }
        }
        
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
 * Handle forgot password form submission
 * @param {Event} event - Form submit event
 */
async function handleForgotPassword(event) {
    if (event) event.preventDefault();
    
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const statusDiv = document.getElementById('forgot-password-status');
    
    // Get form data
    const email = document.getElementById('forgot-password-email')?.value.trim();
    
    // Validate
    if (!email) {
        setStatusMessage(statusDiv, 'error', '⚠️ Խնդրում ենք մուտքագրել email');
        return;
    }
    
    // Disable button and show loading
    if (forgotPasswordBtn) forgotPasswordBtn.disabled = true;
    setStatusMessage(statusDiv, 'info', '🔄 Վերականգնման հղում է ուղարկվում...');
    
    try {
        // Check if sendPasswordResetEmail function exists
        if (typeof sendPasswordResetEmail !== 'function') {
            throw new Error('Firebase Auth functions not loaded. Make sure firebase.auth.js is loaded.');
        }
        
        // Send password reset email
        const result = await sendPasswordResetEmail(email);
        
        if (result.success) {
            setStatusMessage(statusDiv, 'success', '✅ Վերականգնման հղում ուղարկվեց ձեր email-ին: Խնդրում ենք ստուգել ձեր inbox-ը (և spam folder-ը):');
            
            // Clear form after success
            const forgotPasswordForm = document.getElementById('forgot-password-form');
            if (forgotPasswordForm) forgotPasswordForm.reset();
        } else {
            throw new Error(result.error || 'Password reset failed');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        const errorMsg = error && error.message ? error.message : 'Unknown error';
        
        // Translate common Firebase errors
        let userFriendlyMsg = errorMsg;
        if (errorMsg.includes('user-not-found')) {
            userFriendlyMsg = '❌ Այս email-ով account չի գտնվել';
        } else if (errorMsg.includes('invalid-email')) {
            userFriendlyMsg = '❌ Սխալ email հասցե';
        } else if (errorMsg.includes('too-many-requests')) {
            userFriendlyMsg = '❌ Չափից շատ հարցումներ: Խնդրում ենք փորձել մի փոքր ուշ';
        }
        
        setStatusMessage(statusDiv, 'error', userFriendlyMsg);
    } finally {
        if (forgotPasswordBtn) forgotPasswordBtn.disabled = false;
    }
}

/**
 * Show forgot password form
 */
function showForgotPasswordForm() {
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const forgotPasswordFormContainer = document.getElementById('forgot-password-form-container');
    
    // Hide other forms
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    if (registerFormContainer) registerFormContainer.style.display = 'none';
    
    // Show forgot password form
    if (forgotPasswordFormContainer) {
        forgotPasswordFormContainer.style.display = 'block';
        // Clear status messages
        const statusDiv = document.getElementById('forgot-password-status');
        if (statusDiv) statusDiv.innerHTML = '';
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('forgot-password-email');
            if (emailInput) emailInput.focus();
        }, 100);
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
        // Check if quiz type is selected
        let selectedType = localStorage.getItem('selectedQuizType');
        
        // Validate selected type
        if (!selectedType || (selectedType !== 'architect' && selectedType !== 'constructor')) {
            // Quiz type not selected, show quiz type selection section
            alert('⚠️ Խնդրում ենք նախ ընտրել թեստի տեսակը (Ճարտարապետ կամ Կոնստրուկտոր):');
            const quizTypeSection = document.getElementById('quiz-type-section');
            const choiceSection = document.getElementById('choice-section');
            const paymentSection = document.getElementById('payment-section');
            
            // CRITICAL: Ensure payment-section is visible (it contains quiz-type-section)
            if (paymentSection) {
                paymentSection.style.display = 'block';
                paymentSection.style.setProperty('display', 'block', 'important');
                paymentSection.style.visibility = 'visible';
                paymentSection.style.opacity = '1';
                console.log('✅ Payment section made visible for quiz-type-section (from startFreeTrial)');
            }
            
            if (quizTypeSection) {
                quizTypeSection.style.display = 'block';
                quizTypeSection.style.setProperty('display', 'block', 'important');
                quizTypeSection.style.visibility = 'visible';
                quizTypeSection.style.opacity = '1';
                
                // Fix text color for dark mode
                const isDarkMode = document.body.classList.contains('dark-mode');
                const title = quizTypeSection.querySelector('.quiz-type-section-title');
                if (title) {
                    if (isDarkMode) {
                        title.style.color = '#e0e0e0';
                        title.style.setProperty('color', '#e0e0e0', 'important');
                    } else {
                        title.style.color = '#1a1a1a';
                        title.style.setProperty('color', '#1a1a1a', 'important');
                    }
                }
                
                // Fix quiz-type-option colors for dark mode
                const options = quizTypeSection.querySelectorAll('.quiz-type-option');
                options.forEach(option => {
                    if (isDarkMode) {
                        option.style.color = '#e0e0e0';
                        option.style.setProperty('color', '#e0e0e0', 'important');
                        const h4 = option.querySelector('h4');
                        if (h4) {
                            h4.style.color = '#e0e0e0';
                            h4.style.setProperty('color', '#e0e0e0', 'important');
                        }
                        const paragraphs = option.querySelectorAll('p');
                        paragraphs.forEach(p => {
                            p.style.color = '#e0e0e0';
                            p.style.setProperty('color', '#e0e0e0', 'important');
                        });
                    }
                });
                
                quizTypeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            if (choiceSection) {
                choiceSection.style.display = 'none';
                choiceSection.style.setProperty('display', 'none', 'important');
            }
            return;
        }
        
        // Check if free trial is available (skip in test mode)
        let canStartTrial = true;
        if (typeof checkFreeTrialStatus === 'function') {
            try {
                const trialStatus = await checkFreeTrialStatus();
                if (trialStatus && trialStatus.used) {
                    // Check if test mode is enabled
                    if (typeof isTestModeEnabled === 'function' && isTestModeEnabled()) {
                        canStartTrial = true; // Allow in test mode
                    } else {
                        alert('⚠️ Թեստային հարցերը արդեն օգտագործված են:\n\nԽնդրում ենք վճարել 15,000 դրամ ամբողջ թեստը մուտք գործելու համար:');
                        return;
                    }
                }
            } catch (error) {
                console.warn('Error checking free trial status:', error);
                // Continue anyway in test mode
                if (typeof isTestModeEnabled === 'function' && isTestModeEnabled()) {
                    canStartTrial = true;
                }
            }
        }
        
        if (!canStartTrial) {
            return;
        }
        
        // Hide choice section
        const choiceSection = document.getElementById('choice-section');
        if (choiceSection) choiceSection.style.display = 'none';
        
        // Hide quiz type section (if visible)
        const quizTypeSection = document.getElementById('quiz-type-section');
        if (quizTypeSection) {
            quizTypeSection.style.display = 'none';
            quizTypeSection.style.setProperty('display', 'none', 'important');
        }
        
        // Hide payment section (IMPORTANT: must be hidden for start-section to be visible)
        // BUT only if quiz-type-section is not supposed to be shown
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
            paymentSection.style.display = 'none';
            paymentSection.style.setProperty('display', 'none', 'important');
            console.log('✅ Payment section hidden');
        }
        
        // quizTypeSection already declared above, no need to redeclare
        
        // Show start section and start quiz with free trial
        const startSection = document.getElementById('start-section');
        if (!startSection) {
            console.error('Start section not found');
            alert('Սխալ: Start section-ը չի գտնվել:');
            return;
        }
        
        startSection.style.display = 'block';
        console.log('✅ Start section displayed');
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
        
        console.log('✅ Free trial started successfully, quiz type:', selectedType);
    } catch (error) {
        console.error('Error starting free trial:', error);
        alert('Սխալ: Հնարավոր չէ սկսել թեստային հարցերը: ' + (error.message || error));
    }
}

/**
 * Show quiz type selection section (go back to Architect/Constructor selection)
 */
function showQuizTypeSelection() {
    try {
        // Remove selected quiz type from localStorage
        localStorage.removeItem('selectedQuizType');
        if (typeof window !== 'undefined') {
            window.selectedQuizType = null;
        }
        
        // Hide choice section
        const choiceSection = document.getElementById('choice-section');
        if (choiceSection) {
            choiceSection.style.display = 'none';
            choiceSection.style.setProperty('display', 'none', 'important');
        }
        
        // Show quiz type section
        const quizTypeSection = document.getElementById('quiz-type-section');
        const paymentSection = document.getElementById('payment-section');
        
        // CRITICAL: Ensure payment-section is visible (it contains quiz-type-section)
        if (paymentSection) {
            paymentSection.style.display = 'block';
            paymentSection.style.setProperty('display', 'block', 'important');
            paymentSection.style.visibility = 'visible';
            paymentSection.style.opacity = '1';
        }
        
        if (quizTypeSection) {
            quizTypeSection.style.display = 'block';
            quizTypeSection.style.setProperty('display', 'block', 'important');
            quizTypeSection.style.visibility = 'visible';
            quizTypeSection.style.opacity = '1';
            
            // Fix text color for dark mode
            const isDarkMode = document.body.classList.contains('dark-mode');
            const title = quizTypeSection.querySelector('.quiz-type-section-title');
            if (title) {
                if (isDarkMode) {
                    title.style.color = '#e0e0e0';
                    title.style.setProperty('color', '#e0e0e0', 'important');
                } else {
                    title.style.color = '#1a1a1a';
                    title.style.setProperty('color', '#1a1a1a', 'important');
                }
            }
            
            // Fix quiz-type-option colors for dark mode
            const options = quizTypeSection.querySelectorAll('.quiz-type-option');
            options.forEach(option => {
                if (isDarkMode) {
                    option.style.color = '#e0e0e0';
                    option.style.setProperty('color', '#e0e0e0', 'important');
                    const h4 = option.querySelector('h4');
                    if (h4) {
                        h4.style.color = '#e0e0e0';
                        h4.style.setProperty('color', '#e0e0e0', 'important');
                    }
                    const paragraphs = option.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.color = '#e0e0e0';
                        p.style.setProperty('color', '#e0e0e0', 'important');
                    });
                }
            });
            
            // Scroll to quiz type section
            setTimeout(() => {
                if (quizTypeSection) {
                    quizTypeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
        
        console.log('✅ Quiz type selection shown');
    } catch (error) {
        console.error('Error in showQuizTypeSelection:', error);
        alert('Սխալ: Հնարավոր չէ ցուցադրել ընտրության էջը: ' + (error.message || error));
    }
}

/**
 * Select quiz type (Architect or Constructor)
 * @param {string} type - 'architect' or 'constructor'
 */
function selectQuizType(type) {
    try {
        // Validate type
        if (type !== 'architect' && type !== 'constructor') {
            console.error('Invalid quiz type:', type);
            return;
        }
        
        // Store selected quiz type
        if (typeof window !== 'undefined') {
            window.selectedQuizType = type;
            localStorage.setItem('selectedQuizType', type);
        }
        
        // Update title immediately
        if (typeof getQuizTypeTitle === 'function') {
            try {
                const title = getQuizTypeTitle();
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) pageTitle.textContent = title;
                if (document.title) document.title = title;
            } catch (error) {
                console.warn('Error updating title:', error);
            }
        }
        
        // Hide quiz type section
        const quizTypeSection = document.getElementById('quiz-type-section');
        if (quizTypeSection) quizTypeSection.style.display = 'none';
        
        // Show choice section (payment or trial)
        const choiceSection = document.getElementById('choice-section');
        if (choiceSection) {
            choiceSection.style.display = 'block';
            // Scroll to choice section
            setTimeout(() => {
                if (choiceSection) {
                    choiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
        
        console.log('✅ Quiz type selected:', type);
    } catch (error) {
        console.error('Error in selectQuizType:', error);
        alert('Սխալ: Հնարավոր չէ ընտրել թեստի տեսակը: ' + (error.message || error));
    }
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
    window.showQuizTypeSelection = showQuizTypeSelection;
    window.showPaymentCodeSection = showPaymentCodeSection;
    window.showChoiceSection = showChoiceSection;
    window.startFreeTrial = startFreeTrial;
    window.togglePasswordVisibility = togglePasswordVisibility;
    
    // Debug: Verify function is exported
    console.log('✅ showQuizTypeSelection exported:', typeof window.showQuizTypeSelection);
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

