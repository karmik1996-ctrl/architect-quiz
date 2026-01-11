"use strict";

// ============================================
// PAYMENT MODULE
// ============================================
// Handles all payment-related functions: submission, verification, session management, cloud sync

// Payment constants
const PAYMENT_AMOUNT = 15000; // 15,000 դրամ
const PAYMENT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwarQPmrBy3dLKYQJZuSU_7qVPgrdjZWUAet8qS_MXC3cA4kcQkpJlkcZIWwt84bDTajg/exec';


// Session validity check interval
let sessionCheckInterval = null;

async function submitPaymentRequest(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-payment-btn');
    const statusDiv = document.getElementById('payment-request-status');
    const form = document.getElementById('payment-form');
    
    // Get form data
    const formData = {
        name: document.getElementById('payment-name').value.trim(),
        phone: document.getElementById('payment-phone').value.trim(),
        email: document.getElementById('payment-email').value.trim(),
        paymentMethod: document.getElementById('payment-method').value,
        message: document.getElementById('payment-message').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Validate
    if (!formData.name || !formData.phone || !formData.paymentMethod) {
        statusDiv.innerHTML = '<div class="payment-status error">⚠️ Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը</div>';
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Ուղարկվում է...';
    statusDiv.innerHTML = '<div class="payment-status info">🔄 Վճարման հարցումը ուղարկվում է...</div>';
    
    try {
        // Try Netlify Forms first, then fallback to Google Apps Script
        const netlifyFormData = new FormData();
        netlifyFormData.append('form-name', 'payment-request');
        netlifyFormData.append('name', formData.name);
        netlifyFormData.append('phone', formData.phone);
        netlifyFormData.append('email', formData.email || '');
        netlifyFormData.append('paymentMethod', formData.paymentMethod);
        netlifyFormData.append('message', formData.message || '');
        netlifyFormData.append('timestamp', formData.timestamp);
        
        // Submit to Netlify Forms
        try {
            const netlifyResponse = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(netlifyFormData).toString()
            });
            
            if (netlifyResponse.ok) {
                statusDiv.innerHTML = '<div class="payment-status success">✅ Վճարման հարցումը հաջողությամբ ուղարկված է!<br>Վճարիր 15,000 դրամ և սպասիր վճարման կոդին email-ով:</div>';
                
                // Hide form and show payment code input (after request)
                document.getElementById('payment-request-form').style.display = 'none';
                document.getElementById('payment-code-section').style.display = 'none';
                document.getElementById('payment-code-section-after-request').style.display = 'block';
                
                // Scroll to payment code section
                document.getElementById('payment-code-section-after-request').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                submitBtn.disabled = false;
                submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
                return;
            }
        } catch (netlifyError) {
            }
        
        // Fallback to Google Apps Script using JSONP
        // Use a simple callback name that passes sanitization
        const callbackName = 'handlePaymentRequest' + Date.now();
        
        // Create callback function
        window[callbackName] = function(result) {
            // Remove script tag
            const scripts = document.querySelectorAll('script[src*="savePaymentRequest"]');
            scripts.forEach(script => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
            
            // Clean up callback
            delete window[callbackName];
            
            if (result && result.success) {
                statusDiv.innerHTML = '<div class="payment-status success">✅ Վճարման հարցումը հաջողությամբ ուղարկված է!<br>Վճարիր 15,000 դրամ և սպասիր վճարման կոդին email-ով:</div>';
                
                // Hide form and show payment code input (after request)
                const requestForm = document.getElementById('payment-request-form');
                const codeSection = document.getElementById('payment-code-section');
                const codeSectionAfter = document.getElementById('payment-code-section-after-request');
                
                if (requestForm) requestForm.style.display = 'none';
                if (codeSection) codeSection.style.display = 'none';
                if (codeSectionAfter) {
                    codeSectionAfter.style.display = 'block';
                    codeSectionAfter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
                // Save user name to localStorage for welcome message
                if (formData.name && formData.name.trim()) {
                    localStorage.setItem('userName', formData.name.trim());
                }
                
                submitBtn.disabled = false;
                submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
            } else {
                statusDiv.innerHTML = '<div class="payment-status error">❌ Սխալ: Վճարման հարցումը չի կարող ուղարկվել: ' + (result?.error || 'Unknown error') + '</div>';
                submitBtn.disabled = false;
                submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
            }
        };
        
        // Build JSONP URL
        const params = new URLSearchParams({
            action: 'savePaymentRequest',
            name: formData.name,
            phone: formData.phone,
            email: formData.email || '',
            paymentMethod: formData.paymentMethod,
            message: formData.message || '',
            timestamp: formData.timestamp,
            callback: callbackName
        });
        
        // Create and append script tag for JSONP
        const script = document.createElement('script');
        const fullUrl = PAYMENT_WEB_APP_URL + '?' + params.toString();
        script.src = fullUrl;
        
        // Add error handler
        script.onerror = function(error) {
            // Remove script tag
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            
            // Clean up callback
            if (window[callbackName]) {
                delete window[callbackName];
            }
            
            // Show user-friendly error message
            statusDiv.innerHTML = '<div class="payment-status error">❌ Սխալ: Վճարման հարցումը չի կարող ուղարկվել:<br>Ստուգեք ինտերնետ կապը կամ փորձեք ավելի ուշ</div>';
            submitBtn.disabled = false;
            submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
        };
        
        // Add load handler (but note: JSONP success is handled by callback)
        script.onload = function() {
            };
        
        // Append script to body
        document.body.appendChild(script);
        
        // Also set a timeout to detect if callback never fires
        const timeoutId = setTimeout(() => {
            if (window[callbackName]) {
                statusDiv.innerHTML = '<div class="payment-status error">❌ Սխալ: Վճարման հարցումը չի կարող ուղարկվել:<br>Timeout - ստուգեք Google Apps Script deployment-ը<br>Կամ փորձեք ավելի ուշ</div>';
                submitBtn.disabled = false;
                submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
                
                // Clean up
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                delete window[callbackName];
            }
        }, 30000); // 30 second timeout
        
        // Store timeout ID in callback function to clear it on success
        const originalCallback = window[callbackName];
        window[callbackName] = function(result) {
            clearTimeout(timeoutId);
            // Remove script tag
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            if (originalCallback) {
                originalCallback(result);
            }
        };
        
        // Set timeout for JSONP request
        setTimeout(() => {
            if (window[callbackName]) {
                const scripts = document.querySelectorAll('script[src*="savePaymentRequest"]');
                scripts.forEach(script => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                });
                delete window[callbackName];
                
                // Try no-cors as final fallback
                const formBody = new URLSearchParams({
                    action: 'savePaymentRequest',
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || '',
                    paymentMethod: formData.paymentMethod,
                    message: formData.message || '',
                    timestamp: formData.timestamp
                }).toString();
                
                fetch(PAYMENT_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formBody
                }).then(() => {
                    statusDiv.innerHTML = '<div class="payment-status success">✅ Վճարման հարցումը ուղարկված է (no-cors mode):<br>Վճարիր 15,000 դրամ և սպասիր վճարման կոդին email-ով:</div>';
                    
                    const requestForm = document.getElementById('payment-request-form');
                    const codeSection = document.getElementById('payment-code-section');
                    const codeSectionAfter = document.getElementById('payment-code-section-after-request');
                    
                    if (requestForm) requestForm.style.display = 'none';
                    if (codeSection) codeSection.style.display = 'none';
                    if (codeSectionAfter) {
                        codeSectionAfter.style.display = 'block';
                        codeSectionAfter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
                }).catch(() => {
                    statusDiv.innerHTML = '<div class="payment-status error">❌ Սխալ: Վճարման հարցումը չի կարող ուղարկվել</div>';
                    submitBtn.disabled = false;
                    submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
                });
            }
        }, 10000); // 10 second timeout
        
    } catch (error) {
        statusDiv.innerHTML = '<div class="payment-status error">❌ Սխալ: ' + error.message + '<br>Խնդրում ենք փորձել կրկին:</div>';
        submitBtn.disabled = false;
        submitBtn.textContent = '📤 Ուղարկել Վճարման Հարցում';
    }
}


function getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 50),
        canvas: canvas.toDataURL().substring(0, 50),
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
    };
    
    return btoa(JSON.stringify(fingerprint)).substring(0, 64);
}


function getBrowserSessionId() {
    let sessionId = sessionStorage.getItem('browserSessionId');
    if (!sessionId) {
        // Generate unique session ID: device fingerprint + random string + timestamp
        const deviceFp = getDeviceFingerprint();
        const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now();
        sessionId = btoa(deviceFp + randomPart + timestamp).substring(0, 64);
        sessionStorage.setItem('browserSessionId', sessionId);
    }
    return sessionId;
}


async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        return 'unknown';
    }
}


async function checkPaymentStatus() {
    const paymentToken = localStorage.getItem('paymentToken');
    const paymentTimestamp = localStorage.getItem('paymentTimestamp');
    const storedIP = localStorage.getItem('paymentIP');
    const storedDevice = localStorage.getItem('paymentDevice');
    
    if (paymentToken && paymentTimestamp) {
        const now = new Date().getTime();
        const paymentTime = parseInt(paymentTimestamp);
        const hoursSincePayment = (now - paymentTime) / (1000 * 60 * 60);
        
        if (hoursSincePayment < 24) {
            // Security checks
            // IMPORTANT: Do not break the user flow on legitimate changes (IP can change, browser can restart).
            // Especially for localhost/dev testing, we never want to invalidate payment state.
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const enforceBinding = !isLocalhost && localStorage.getItem('enforcePaymentBinding') === 'true';
            
            const currentIP = enforceBinding ? await getUserIP() : 'unknown';
            const currentDevice = enforceBinding ? getDeviceFingerprint() : storedDevice;
            
            // Check IP match
            if (enforceBinding && storedIP && storedIP !== 'unknown' && currentIP !== 'unknown' && storedIP !== currentIP) {
                // Do NOT clear token; keep user paid state
            }
            
            // Check device fingerprint match
            if (enforceBinding && storedDevice && storedDevice !== currentDevice) {
                // Do NOT clear token; keep user paid state
            }
            
            return { paid: true, token: paymentToken };
        } else {
            localStorage.removeItem('paymentToken');
            localStorage.removeItem('paymentTimestamp');
            localStorage.removeItem('paymentIP');
            localStorage.removeItem('paymentDevice');
            return { paid: false };
        }
    }
    
    return { paid: false };
}


async function verifyPaymentCodeQuick(paymentCode) {
    if (!paymentCode) {
        return false;
    }
    
    // Special code: karmik1996
    const codeUpper = paymentCode.toUpperCase();
    if (codeUpper === 'KARMIK1996') {
        return true;
    }
    
    return new Promise((resolve) => {
        const callbackName = 'handleVerifyPaymentCodeQuick' + Date.now();
        const timeout = setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
            }
            // On timeout, allow access (fail open for better UX)
            resolve(true);
        }, 5000); // 5 second timeout
        
        window[callbackName] = function(result) {
            clearTimeout(timeout);
            // Clean up
            delete window[callbackName];
            const scripts = document.querySelectorAll('script[src*="verify"]');
            scripts.forEach(script => {
                if (script.parentNode && script.src.includes('action=verify')) {
                    script.parentNode.removeChild(script);
                }
            });
            
            // Check if code exists (verified = true means code was found)
            const exists = result && result.success && result.verified === true;
            resolve(exists);
        };
        
        const script = document.createElement('script');
        script.src = PAYMENT_WEB_APP_URL + '?action=verify&code=' + encodeURIComponent(paymentCode) + '&ip=unknown&device=unknown&callback=' + callbackName;
        script.onerror = function() {
            clearTimeout(timeout);
            if (window[callbackName]) {
                delete window[callbackName];
            }
            // On error, allow access (fail open for better UX)
            resolve(true);
        };
        document.body.appendChild(script);
    });
}


async function verifyPaymentCode() {
    // Check both payment code inputs (main and after-request)
    const paymentCodeInput = document.getElementById('payment-code');
    const paymentCodeInputAfter = document.getElementById('payment-code-after');
    const code = (paymentCodeInput?.value.trim() || paymentCodeInputAfter?.value.trim() || '').trim();
    
    if (!code) {
        paymentStatus.innerHTML = '<div class="payment-status error">⚠️ Մուտքագրեք վճարման կոդ</div>';
        return;
    }
    
    // Check if this code has saved progress (will be checked again in initGame after payment verification)
    // Note: loadQuizProgress is async, so we'll check in initGame
    
    verifyPaymentBtn.disabled = true;
    verifyPaymentBtn.textContent = '⏳ Ստուգվում է...';
    paymentStatus.innerHTML = '<div class="payment-status info">🔄 Ստուգվում է վճարման կոդը...</div>';
    
    try {
        // Special code: karmik1996
        const codeUpper = code.toUpperCase();
        
        if (codeUpper === 'KARMIK1996') {
            // Skip getUserIP for special code to speed up verification
            const userIP = '127.0.0.1';
            const deviceFingerprint = getDeviceFingerprint();
            
            // Simulate successful verification for special code
            const token = 'PAID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('paymentToken', token);
            localStorage.setItem('paymentTimestamp', new Date().getTime().toString());
            localStorage.setItem('paymentCode', codeUpper);
            localStorage.setItem('paymentIP', userIP);
            localStorage.setItem('paymentDevice', deviceFingerprint);
            
            // Reset quiz attempts when payment is verified (new payment = new 3 attempts)
            resetQuizAttempts();
            resetQuizSetAttempts(); // Also reset quiz set attempts
            resetQuizSetQuestionsUsed(); // Also reset quiz set questions used
            
            // CRITICAL: Load attempts from cloud to sync across browsers/devices
            // This ensures that attempts from other browsers are visible
            loadQuizSetAttemptsFromCloud().then(cloudAttempts => {
                if (cloudAttempts) {
                    }
            });
            
            paymentStatus.innerHTML = '<div class="payment-status success">✅ Վճարման կոդը հաստատված է! Հարցաթերթիկները բացվում են...</div>';
            
            // Hide payment section and show start section with smooth transition
            setTimeout(() => {
                const paymentSectionEl = document.getElementById('payment-section');
                const startSectionEl = document.getElementById('start-section');
                if (paymentSectionEl) paymentSectionEl.style.display = 'none';
                if (startSectionEl) startSectionEl.style.display = 'block';
                
                // Initialize content protection (watermark + blur)
                initializeContentProtection();
                
                // Show welcome message with user name
                const welcomeMessage = document.getElementById('welcome-message');
                const welcomeGreeting = document.getElementById('welcome-greeting');
                const welcomeInfo = document.getElementById('welcome-info');
                
                // Get user name from localStorage
                let userName = localStorage.getItem('userName') || '';
                
                // If no name in localStorage, try to get from payment request form
                if (!userName) {
                    const nameInput = document.getElementById('payment-name') || document.getElementById('name');
                    if (nameInput && nameInput.value.trim()) {
                        userName = nameInput.value.trim();
                        localStorage.setItem('userName', userName);
                    }
                }
                
                // Display welcome message if we have a name
                if (userName && welcomeMessage && welcomeGreeting && welcomeInfo) {
                    welcomeGreeting.textContent = `Բարև, ${userName}! 👋`;
                    welcomeInfo.textContent = 'Բարի գալուստ հարցաթերթիկներին:';
                    welcomeMessage.style.display = 'block';
                } else if (welcomeMessage) {
                    welcomeMessage.style.display = 'none';
                }
                
                // Update attempts display
                const attemptsDisplay = document.getElementById('quiz-attempts');
                if (attemptsDisplay) {
                    // Calculate total used attempts
                    loadQuizSetAttempts();
                    const totalQuizSets = 18;
                    const maxAttemptsPerSet = 3;
                    const totalMaxAttempts = totalQuizSets * maxAttemptsPerSet; // 54
                    
                    let totalUsedAttempts = 0;
                    for (let i = 1; i <= totalQuizSets; i++) {
                        const setAttempts = getQuizSetAttempts(i.toString());
                        totalUsedAttempts += setAttempts;
                    }
                    
                    const remaining = Math.max(0, totalMaxAttempts - totalUsedAttempts);
                    attemptsDisplay.innerHTML = `Առկա է <strong>18 թեստ</strong>, ունեք իրավունք անցնելու ամեն թեստը <strong>3 անգամ</strong>։<br><strong>${totalUsedAttempts}/${totalMaxAttempts} օգտագործված</strong>${remaining > 0 ? `, <strong>մնաց ${remaining}</strong>` : ''}`;
                    if (remaining === 0) {
                        attemptsDisplay.style.color = '#dc3545';
                    } else {
                        attemptsDisplay.style.color = '#28a745';
                    }
                }
                // Auto-scroll to top for better UX
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // CRITICAL: Check if there's saved progress to restore (cross-device sync)
                // Load progress after payment verification to continue from where user left off
                setTimeout(async () => {
                    try {
                        const savedProgress = await loadQuizProgress();
                        const progressInfo = savedProgress ? {
                            hasProgress: true,
                            gameStarted: savedProgress.gameStarted,
                            paymentCode: savedProgress.paymentCode,
                            currentCode: codeUpper,
                            match: savedProgress.paymentCode === codeUpper,
                            questionIndex: savedProgress.currentQuestionIndex
                        } : { hasProgress: false };
                        
                        // Check if progress matches current payment code (case-insensitive)
                        const progressCode = (savedProgress?.paymentCode || '').toUpperCase();
                        const currentCode = (codeUpper || '').toUpperCase();
                        const paymentCodeMatches = progressCode === currentCode;
                        
                        if (savedProgress && savedProgress.gameStarted && paymentCodeMatches) {
                            // Restore progress and continue quiz from where user left off
                            currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
                            score = savedProgress.score || 0;
                            userAnswers = savedProgress.userAnswers || [];
                            gameStarted = savedProgress.gameStarted;
                            if (typeof currentQuizSetIndex !== 'undefined' && savedProgress.currentQuizSetIndex >= 0) {
                                currentQuizSetIndex = savedProgress.currentQuizSetIndex;
                            }
                            
                            // Restore shuffled quiz data
                            if (savedProgress.shuffledQuizData && savedProgress.shuffledQuizData.length > 0) {
                                shuffledQuizData = [];
                                for (const questionText of savedProgress.shuffledQuizData) {
                                    const foundQuestion = quizData.find(q => q.question === questionText);
                                    if (foundQuestion) {
                                        shuffledQuizData.push(foundQuestion);
                                    }
                                }
                            }
                            
                            // Restore quiz sets if needed
                            if (typeof quizSets === 'undefined' || quizSets.length === 0) {
                                const orderedQuizData = [...quizData];
                                quizSets = [];
                                quizSetResults = [];
                                for (let i = 0; i < 17; i++) {
                                    quizSets.push(orderedQuizData.slice(i * 10, (i + 1) * 10));
                                    quizSetResults.push({ correct: 0, wrong: 0 });
                                }
                                quizSets.push(orderedQuizData.slice(170, 175));
                                quizSetResults.push({ correct: 0, wrong: 0 });
                            }
                            
                            // Restore UI to quiz state (hide start section, show quiz)
                            if (startSectionEl) startSectionEl.style.display = 'none';
                            if (topicSection) topicSection.style.display = 'block';
                            if (questionSection) questionSection.style.display = 'block';
                            if (answersSection) answersSection.style.display = 'flex';
                            if (nextSection) nextSection.style.display = 'none';
                            if (resultsSection) resultsSection.style.display = 'none';
                            
                            // Load the current question
                            loadQuestion();
                            
                            // CRITICAL: Explicitly update question number display after restore
                            // Sometimes loadQuestion() runs before UI elements are fully ready
                            setTimeout(() => {
                                const questionInSet = currentQuestionIndex + 1;
                                const totalInSet = shuffledQuizData.length;
                                const questionNumberEl = document.getElementById('question-number');
                                if (questionNumberEl) {
                                    questionNumberEl.textContent = questionInSet;
                                }
                                const totalQuestionsSpan = document.getElementById('total-questions');
                                if (totalQuestionsSpan) {
                                    totalQuestionsSpan.textContent = totalInSet;
                                }
                                const quizSetNumberDisplay = document.getElementById('quiz-set-number-display');
                                if (quizSetNumberDisplay && typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
                                    if (currentQuizSetIndex < 17) {
                                        quizSetNumberDisplay.textContent = currentQuizSetIndex + 1;
                                    } else {
                                        quizSetNumberDisplay.textContent = 18;
                                    }
                                }
                                // Question number updated
                            }, 100);
                            
                            progressRestored = true;
                            gameInitialized = true;
                            
                            // Start periodic session validity check (prevent multiple simultaneous sessions)
                            startSessionValidityCheck();
                            
                            // Update attempts display for current quiz set
                            if (typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
                                loadQuizSetAttempts();
                                const setAttempts = getQuizSetAttempts((currentQuizSetIndex + 1).toString());
                                const attemptsDisplay = document.getElementById('quiz-attempts');
                                if (attemptsDisplay) {
                                    loadQuizSetQuestionsUsed();
                                    const questionsUsed = getQuizSetQuestionsUsed((currentQuizSetIndex + 1).toString());
                                    if (questionsUsed > 0) {
                                        attemptsDisplay.innerHTML = `Հարցաթերթիկ #${currentQuizSetIndex + 1} - ${questionsUsed} հարց օգտագործված, <strong>${setAttempts}/3</strong> փորձ`;
                                    } else {
                                        attemptsDisplay.innerHTML = `Հարցաթերթիկ #${currentQuizSetIndex + 1} - Փորձեր: <strong>${setAttempts}/3</strong>`;
                                    }
                                    if (setAttempts >= 3) {
                                        attemptsDisplay.style.color = '#dc3545';
                                    } else {
                                        attemptsDisplay.style.color = '#28a745';
                                    }
                                }
                            }
                            return; // Don't focus on name input - user is already in quiz
                        }
                    } catch (error) {
                        // Error loading progress
                    }
                    
                    // If no progress to restore, focus on name input as usual
                    const userNameInput = document.getElementById('user-name');
                    if (userNameInput) {
                        userNameInput.focus();
                    }
                }, 500); // Small delay to let UI settle before restoring progress
            }, 1500);
            
            // Re-enable button
            verifyPaymentBtn.disabled = false;
            verifyPaymentBtn.textContent = '✅ Ստուգել Վճարում';
            return;
        }
        
        // Get security info before verification (only for non-special codes)
        const userIP = await getUserIP();
        const deviceFingerprint = getDeviceFingerprint();
        
        // Use JSONP instead of fetch to avoid CORS issues
        const callbackName = 'handleVerifyPayment' + Date.now();
        
        // Create promise for JSONP callback
        const verifyPromise = new Promise((resolve, reject) => {
            window[callbackName] = function(result) {
                // Clean up
                const scripts = document.querySelectorAll('script[src*="action=verify"]');
                scripts.forEach(script => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                });
                delete window[callbackName];
                
                if (result && result.success && result.verified) {
                    resolve(result);
                } else {
                    reject(new Error(result?.error || 'Payment verification failed'));
                }
            };
            
            // Build JSONP URL
            const url = PAYMENT_WEB_APP_URL + '?action=verify&code=' + encodeURIComponent(code) + '&ip=' + encodeURIComponent(userIP) + '&device=' + encodeURIComponent(deviceFingerprint) + '&callback=' + callbackName;
            
            // Create and append script tag
            const script = document.createElement('script');
            script.src = url;
            script.onerror = function(error) {
                delete window[callbackName];
                reject(new Error('Script load error'));
            };
            document.body.appendChild(script);
            
            // Set timeout
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    reject(new Error('Request timeout'));
                }
            }, 30000); // 30 second timeout
        });
        
        const data = await verifyPromise;
        
        // Check if payment code was not found or verification failed
        if (!data.success || !data.verified) {
            const errorMessage = data?.error || 'Վճարման կոդը չի գտնվել կամ անվավեր է';
            paymentStatus.innerHTML = `<div class="payment-status error">❌ ${errorMessage}</div>`;
            verifyPaymentBtn.disabled = false;
            verifyPaymentBtn.textContent = '✅ Ստուգել Վճարում';
            return;
        }
        
        if (data.success && data.verified) {
            // Check if payment code has changed BEFORE saving new code
            const previousPaymentCode = localStorage.getItem('paymentCode') || '';
            const currentPaymentCode = code;
            const paymentCodeChanged = previousPaymentCode !== currentPaymentCode;
            
            // Security info already retrieved above (userIP and deviceFingerprint)
            const token = 'PAID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('paymentToken', token);
            localStorage.setItem('paymentTimestamp', new Date().getTime().toString());
            localStorage.setItem('paymentIP', userIP);
            localStorage.setItem('paymentDevice', deviceFingerprint);
            // Save payment code to localStorage for progress recovery
            localStorage.setItem('paymentCode', code);
            
            // Send security info to Google Sheets
            try {
                await fetch(PAYMENT_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'updatePaymentSecurity',
                        code: code,
                        ip: userIP,
                        device: deviceFingerprint
                    }).toString()
                });
            } catch (error) {
                }
            
            // Only reset quiz attempts if this is a NEW payment (not re-verification)
            // If payment code changed, reset attempts (new payment)
            if (paymentCodeChanged) {
                // New payment code - reset attempts
                resetQuizAttempts();
                resetQuizSetAttempts();
                resetQuizSetQuestionsUsed();
                } else {
                // Re-verification with same code - keep existing attempts
                loadQuizSetAttempts();
                }
            
            // CRITICAL: Always load attempts from cloud to sync across browsers/devices
            // This ensures that attempts from other browsers are visible
            loadQuizSetAttemptsFromCloud().then(cloudAttempts => {
                if (cloudAttempts) {
                    // Update attempts display if visible
                    const attemptsDisplay = document.getElementById('quiz-attempts');
                    if (attemptsDisplay) {
                        const totalQuizSets = 18;
                        const maxAttemptsPerSet = 3;
                        const totalMaxAttempts = totalQuizSets * maxAttemptsPerSet; // 54
                        
                        let totalUsedAttempts = 0;
                        for (let i = 1; i <= totalQuizSets; i++) {
                            const setAttempts = getQuizSetAttempts(i.toString());
                            totalUsedAttempts += setAttempts;
                        }
                        
                        const remaining = Math.max(0, totalMaxAttempts - totalUsedAttempts);
                        attemptsDisplay.innerHTML = `Առկա է <strong>18 թեստ</strong>, ունեք իրավունք անցնելու ամեն թեստը <strong>3 անգամ</strong>։<br><strong>${totalUsedAttempts}/${totalMaxAttempts} օգտագործված</strong>${remaining > 0 ? `, <strong>մնաց ${remaining}</strong>` : ''}`;
                    }
                }
            });
            
            // Don't clear quiz progress on re-verification - allow user to continue
            // Only clear if starting fresh
            // localStorage.removeItem('quizProgress');
            
            paymentStatus.innerHTML = '<div class="payment-status success">✅ Վճարման կոդը հաստատված է! Հարցաթերթիկները բացվում են...</div>';
            
            // Hide payment section and show start section with smooth transition
            setTimeout(() => {
                if (paymentSection) paymentSection.style.display = 'none';
                if (startSection) startSection.style.display = 'block';
                
                // Show welcome message with user name
                const welcomeMessage = document.getElementById('welcome-message');
                const welcomeGreeting = document.getElementById('welcome-greeting');
                const welcomeInfo = document.getElementById('welcome-info');
                
                // Get user name from localStorage (saved from payment request) or from Google Sheets
                let userName = localStorage.getItem('userName') || '';
                
                // If no name in localStorage, try to get from payment request form
                if (!userName) {
                    const nameInput = document.getElementById('payment-name') || document.getElementById('name');
                    if (nameInput && nameInput.value.trim()) {
                        userName = nameInput.value.trim();
                        localStorage.setItem('userName', userName);
                    }
                }
                
                // If still no name, try to get from Google Sheets via payment code
                if (!userName && data.name) {
                    userName = data.name;
                    localStorage.setItem('userName', userName);
                }
                
                // Display welcome message if we have a name
                if (userName && welcomeMessage && welcomeGreeting && welcomeInfo) {
                    welcomeGreeting.textContent = `Բարև, ${userName}! 👋`;
                    welcomeInfo.textContent = 'Բարի գալուստ հարցաթերթիկներին:';
                    welcomeMessage.style.display = 'block';
                } else if (welcomeMessage) {
                    welcomeMessage.style.display = 'none';
                }
                
                // Update attempts display
                const attemptsDisplay = document.getElementById('quiz-attempts');
                if (attemptsDisplay) {
                    // Calculate total used attempts
                    loadQuizSetAttempts();
                    const totalQuizSets = 18;
                    const maxAttemptsPerSet = 3;
                    const totalMaxAttempts = totalQuizSets * maxAttemptsPerSet; // 54
                    
                    let totalUsedAttempts = 0;
                    for (let i = 1; i <= totalQuizSets; i++) {
                        const setAttempts = getQuizSetAttempts(i.toString());
                        totalUsedAttempts += setAttempts;
                    }
                    
                    const remaining = Math.max(0, totalMaxAttempts - totalUsedAttempts);
                    attemptsDisplay.innerHTML = `Առկա է <strong>18 թեստ</strong>, ունեք իրավունք անցնելու ամեն թեստը <strong>3 անգամ</strong>։<br><strong>${totalUsedAttempts}/${totalMaxAttempts} օգտագործված</strong>${remaining > 0 ? `, <strong>մնաց ${remaining}</strong>` : ''}`;
                    if (remaining === 0) {
                        attemptsDisplay.style.color = '#dc3545';
                    } else {
                        attemptsDisplay.style.color = '#28a745';
                    }
                }
                // Auto-scroll to top for better UX
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // CRITICAL: Check if there's saved progress to restore (cross-device sync)
                // Load progress after payment verification to continue from where user left off
                setTimeout(async () => {
                    try {
                        const savedProgress = await loadQuizProgress();
                        // If no progress found, it might be because progress belongs to different device
                        // User can still start fresh (security feature: prevent multiple simultaneous sessions)
                        if (!savedProgress) {
                            // Show message that user can start fresh (progress might be on different device)
                            // Note: Payment code is valid, so user can start quiz normally
                            return;
                        }
                        
                        // Check if progress matches current payment code (case-insensitive)
                        const progressCode = (savedProgress?.paymentCode || '').toUpperCase();
                        const currentCode = (code || '').toUpperCase();
                        const paymentCodeMatches = progressCode === currentCode;
                        
                        if (savedProgress && savedProgress.gameStarted && paymentCodeMatches) {
                            // Restore progress and continue quiz from where user left off
                            currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
                            score = savedProgress.score || 0;
                            userAnswers = savedProgress.userAnswers || [];
                            gameStarted = savedProgress.gameStarted;
                            if (typeof currentQuizSetIndex !== 'undefined' && savedProgress.currentQuizSetIndex >= 0) {
                                currentQuizSetIndex = savedProgress.currentQuizSetIndex;
                            }
                            
                            // Restore shuffled quiz data
                            if (savedProgress.shuffledQuizData && savedProgress.shuffledQuizData.length > 0) {
                                shuffledQuizData = [];
                                for (const questionText of savedProgress.shuffledQuizData) {
                                    const foundQuestion = quizData.find(q => q.question === questionText);
                                    if (foundQuestion) {
                                        shuffledQuizData.push(foundQuestion);
                                    }
                                }
                            }
                            
                            // Restore quiz sets if needed
                            if (typeof quizSets === 'undefined' || quizSets.length === 0) {
                                const orderedQuizData = [...quizData];
                                quizSets = [];
                                quizSetResults = [];
                                for (let i = 0; i < 17; i++) {
                                    quizSets.push(orderedQuizData.slice(i * 10, (i + 1) * 10));
                                    quizSetResults.push({ correct: 0, wrong: 0 });
                                }
                                quizSets.push(orderedQuizData.slice(170, 175));
                                quizSetResults.push({ correct: 0, wrong: 0 });
                            }
                            
                            // Restore UI to quiz state (hide start section, show quiz)
                            if (startSection) startSection.style.display = 'none';
                            if (topicSection) topicSection.style.display = 'block';
                            if (questionSection) questionSection.style.display = 'block';
                            if (answersSection) answersSection.style.display = 'flex';
                            if (nextSection) nextSection.style.display = 'none';
                            if (resultsSection) resultsSection.style.display = 'none';
                            
                            // Load the current question
                            loadQuestion();
                            
                            // CRITICAL: Explicitly update question number display after restore
                            // Sometimes loadQuestion() runs before UI elements are fully ready
                            setTimeout(() => {
                                const questionInSet = currentQuestionIndex + 1;
                                const totalInSet = shuffledQuizData.length;
                                const questionNumberEl = document.getElementById('question-number');
                                if (questionNumberEl) {
                                    questionNumberEl.textContent = questionInSet;
                                }
                                const totalQuestionsSpan = document.getElementById('total-questions');
                                if (totalQuestionsSpan) {
                                    totalQuestionsSpan.textContent = totalInSet;
                                }
                                const quizSetNumberDisplay = document.getElementById('quiz-set-number-display');
                                if (quizSetNumberDisplay && typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
                                    if (currentQuizSetIndex < 17) {
                                        quizSetNumberDisplay.textContent = currentQuizSetIndex + 1;
                                    } else {
                                        quizSetNumberDisplay.textContent = 18;
                                    }
                                }
                                }, 100);
                            
                            progressRestored = true;
                            gameInitialized = true;
                            
                            // Start periodic session validity check (prevent multiple simultaneous sessions)
                            startSessionValidityCheck();
                            
                            // Update attempts display for current quiz set
                            if (typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
                                loadQuizSetAttempts();
                                const setAttempts = getQuizSetAttempts((currentQuizSetIndex + 1).toString());
                                const attemptsDisplay = document.getElementById('quiz-attempts');
                                if (attemptsDisplay) {
                                    loadQuizSetQuestionsUsed();
                                    const questionsUsed = getQuizSetQuestionsUsed((currentQuizSetIndex + 1).toString());
                                    if (questionsUsed > 0) {
                                        attemptsDisplay.innerHTML = `Հարցաթերթիկ #${currentQuizSetIndex + 1} - ${questionsUsed} հարց օգտագործված, <strong>${setAttempts}/3</strong> փորձ`;
                                    } else {
                                        attemptsDisplay.innerHTML = `Հարցաթերթիկ #${currentQuizSetIndex + 1} - Փորձեր: <strong>${setAttempts}/3</strong>`;
                                    }
                                    if (setAttempts >= 3) {
                                        attemptsDisplay.style.color = '#dc3545';
                                    } else {
                                        attemptsDisplay.style.color = '#28a745';
                                    }
                                }
                            }
                            return; // Don't focus on name input - user is already in quiz
                        }
                    } catch (error) {
                        }
                    
                    // If no progress to restore, focus on name input as usual
                    const userNameInput = document.getElementById('user-name');
                    if (userNameInput) {
                        userNameInput.focus();
                    }
                }, 500); // Small delay to let UI settle before restoring progress
            }, 1500);
        } else {
            paymentStatus.innerHTML = '<div class="payment-status error">❌ Վճարման կոդը սխալ է կամ արդեն օգտագործված է</div>';
            verifyPaymentBtn.disabled = false;
            verifyPaymentBtn.textContent = '✅ Ստուգել Վճարում';
        }
    } catch (error) {
        paymentStatus.innerHTML = '<div class="payment-status error">❌ Սխալ: ' + error.message + '</div>';
        verifyPaymentBtn.disabled = false;
        verifyPaymentBtn.textContent = '✅ Ստուգել Վճարում';
    }
}


async function saveQuizSetAttemptsToCloud(quizSetNumber, attempts) {
    try {
        const paymentCode = localStorage.getItem('paymentCode') || '';
        if (!paymentCode) {
            return;
        }
        
        // Note: We don't track 'start' here because:
        // 1. When quiz is completed, 'complete' event is already tracked separately
        // 2. When quiz is started, 'start' event is already tracked in startQuiz()
        // This function is called when incrementing attempts after completion,
        // so the 'complete' event will handle the attempt counting in getQuizUsage
        // We just need to ensure localStorage is synced, which is already done
        } catch (error) {
        }
}


async function loadQuizSetAttemptsFromCloud() {
    try {
        const paymentCode = localStorage.getItem('paymentCode') || '';
        if (!paymentCode) {
            return;
        }
        
        // Get quiz usage from Google Apps Script
        const callbackName = 'handleGetQuizUsageForAttempts' + Date.now();
        
        return new Promise((resolve) => {
            window[callbackName] = function(result) {
                // Clean up
                const scripts = document.querySelectorAll('script[src*="getQuizUsage"]');
                scripts.forEach(script => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                });
                delete window[callbackName];
                
                if (result && result.success && result.quizUsage) {
                    // Convert quizUsage to quizSetAttempts format
                    const loadedAttempts = {};
                    const loadedQuestionsUsed = {};
                    for (let i = 1; i <= 18; i++) {
                        const quizSet = result.quizUsage[i.toString()] || result.quizUsage[i];
                        if (quizSet && quizSet.attempts > 0) {
                            loadedAttempts[i.toString()] = quizSet.attempts;
                        }
                        if (quizSet && quizSet.questionsUsed > 0) {
                            loadedQuestionsUsed[i.toString()] = quizSet.questionsUsed;
                        }
                    }
                    
                    // Merge with localStorage (use higher value)
                    loadQuizSetAttempts();
                    loadQuizSetQuestionsUsed();
                    for (const [setNumber, attempts] of Object.entries(loadedAttempts)) {
                        const current = getQuizSetAttempts(setNumber);
                        if (attempts > current) {
                            quizSetAttempts[setNumber] = attempts;
                        }
                    }
                    saveQuizSetAttempts();
                    
                    // Merge questions used (use higher value)
                    for (const [setNumber, questionsUsed] of Object.entries(loadedQuestionsUsed)) {
                        const current = getQuizSetQuestionsUsed(setNumber);
                        if (questionsUsed > current) {
                            quizSetQuestionsUsed[setNumber] = questionsUsed;
                        }
                    }
                    saveQuizSetQuestionsUsed();
                    
                    // Update attempts display if quiz is already started
                    if (typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
                        const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
                        const attempts = getQuizSetAttempts(quizSetNumber.toString());
                        updateAttemptsDisplay(attempts);
                    }
                    
                    resolve(quizSetAttempts);
                } else {
                    resolve(null);
                }
            };
            
            const script = document.createElement('script');
            script.src = PAYMENT_WEB_APP_URL + '?action=getQuizUsage&paymentCode=' + encodeURIComponent(paymentCode) + '&callback=' + callbackName;
            script.onerror = function() {
                delete window[callbackName];
                resolve(null);
            };
            document.body.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    resolve(null);
                }
            }, 10000);
        });
    } catch (error) {
        return null;
    }
}


async function saveQuizProgressToCloud(progress) {
    try {
        const paymentCode = progress.paymentCode || localStorage.getItem('paymentCode') || '';
        if (!paymentCode) {
            return;
        }
        
        // Get current browser session ID for session tracking (prevent multiple simultaneous sessions)
        // This is unique per browser/tab, so different browsers on same computer have different IDs
        const currentDeviceId = getBrowserSessionId();
        // Device ID logged
        
        const callbackName = 'handleSaveQuizProgress' + Date.now();
        const params = new URLSearchParams({
            action: 'saveQuizProgress',
            paymentCode: paymentCode,
            currentQuestion: progress.currentQuestionIndex || 0,
            totalQuestions: progress.shuffledQuizData ? progress.shuffledQuizData.length : 0,
            score: progress.score || 0,
            userAnswers: JSON.stringify(progress.userAnswers || []),
            gameStarted: progress.gameStarted ? 'true' : 'false',
            quizSetNumber: progress.currentQuizSetIndex >= 0 ? (progress.currentQuizSetIndex < 17 ? progress.currentQuizSetIndex + 1 : 18) : 0,
            shuffledQuizData: JSON.stringify(progress.shuffledQuizData || []),
            deviceId: currentDeviceId, // Track device to prevent multiple simultaneous sessions
            timestamp: new Date().toISOString(),
            callback: callbackName
        });
        
        window[callbackName] = function(result) {
            // Clean up
            delete window[callbackName];
            const scripts = document.querySelectorAll('script[src*="saveQuizProgress"]');
            scripts.forEach(script => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
            
            if (result && result.success) {
                // CRITICAL: Immediately check session validity after saving (to detect if another device took over)
                // This is the most important check - when progress is saved, we must verify we still own the session
                if (gameStarted) {
                    // Check multiple times with increasing delays to catch any device takeover
                    setTimeout(() => {
                        checkSessionValidity().then(isValid => {
                            if (!isValid) {
                                }
                        });
                    }, 300); // First check after 300ms
                    setTimeout(() => {
                        checkSessionValidity().then(isValid => {
                            if (!isValid) {
                                showSessionInvalidatedError('Մեկ այլ սարք օգտագործում է այս վճարման կոդը: Թեստը դադարեցված է:');
                            }
                        });
                    }, 1000); // Second check after 1 second
                }
            } else {
                }
        };
        
        const script = document.createElement('script');
        script.src = PAYMENT_WEB_APP_URL + '?' + params.toString();
        script.onerror = function() {
            delete window[callbackName];
            };
        document.body.appendChild(script);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                }
        }, 10000);
    } catch (error) {
        }
}


async function getDeviceIdFromCloud(paymentCode) {
    return new Promise((resolve) => {
        const callbackName = 'handleGetDeviceId' + Date.now();
        const url = PAYMENT_WEB_APP_URL + '?action=getQuizProgress&paymentCode=' + encodeURIComponent(paymentCode) + '&callback=' + callbackName;
        
        window[callbackName] = function(result) {
            // Clean up
            delete window[callbackName];
            const scripts = document.querySelectorAll('script[src*="getQuizProgress"]');
            scripts.forEach(script => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
            
            if (result && result.success && result.progress) {
                const deviceId = result.progress.deviceId || '';
                resolve(deviceId);
            } else {
                resolve('');
            }
        };
        
        const script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            delete window[callbackName];
            resolve(''); // On error, return empty
        };
        document.head.appendChild(script);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                resolve(''); // On timeout, return empty
            }
        }, 10000);
    });
}


async function checkSessionValidity() {
    try {
        const paymentCode = localStorage.getItem('paymentCode');
        if (!paymentCode || !gameStarted) {
            return true; // No active session, nothing to check
        }
        
        // SECURITY: First check if payment code still exists in Google Sheets
        // If code was deleted, immediately invalidate session
        const codeExists = await verifyPaymentCodeQuick(paymentCode);
        if (!codeExists) {
            showSessionInvalidatedError('Վճարման կոդը ջնջված է: Թեստը դադարեցված է');
            return false;
        }
        
        const currentSessionId = getBrowserSessionId();
        
        // Get deviceId directly from cloud (without filtering) to check if it matches
        const savedDeviceId = await getDeviceIdFromCloud(paymentCode);
        
        // Check if session matches
        if (savedDeviceId && savedDeviceId.length > 0) {
            // CRITICAL: If deviceId exists and doesn't match, session is INVALIDATED
            if (savedDeviceId !== currentSessionId) {
                // Another browser/device has taken over this payment code
                // Immediately show error and disable quiz
                showSessionInvalidatedError('Մեկ այլ սարք օգտագործում է այս վճարման կոդը: Թեստը դադարեցված է:');
                stopSessionValidityCheck(); // Stop checking since session is invalid
                
                // Also clear local progress to prevent confusion
                localStorage.removeItem('quizProgress');
                
                return false;
            } else {
                // DeviceId matches - session is still valid
                }
        } else {
            // No deviceId in cloud - this might be a new session or progress hasn't been saved yet
            // Don't invalidate, but log for debugging
        }
        
        return true;
    } catch (error) {
        // On error, assume session is still valid (don't block user)
        return true;
    }
}


function showSessionInvalidatedError(customMessage) {
    // Check if error already shown to prevent duplicate
    const existingError = document.getElementById('session-invalidated-error');
    if (existingError) {
        return;
    }
    
    // Disable quiz interaction
    gameStarted = false;
    
    // Clear all payment-related data
    localStorage.removeItem('paymentToken');
    localStorage.removeItem('paymentTimestamp');
    localStorage.removeItem('paymentIP');
    localStorage.removeItem('paymentDevice');
    localStorage.removeItem('paymentCode');
    localStorage.removeItem('quizProgress');
    
    // Hide quiz sections
    if (questionSection) questionSection.style.display = 'none';
    if (answersSection) answersSection.style.display = 'none';
    if (nextSection) nextSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    if (startSection) startSection.style.display = 'none';
    
    // Show payment section again
    if (paymentSection) paymentSection.style.display = 'block';
    
    // Default message or custom message
    const message = customMessage || 'Ուրիշ օգտատեր մուտք է գործել նույն վճարման կոդով:<br>Խնդրում ենք թարմացնել էջը կամ օգտագործել նույն browser-ը:';
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.id = 'session-invalidated-error';
    errorMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #dc3545; color: white; padding: 30px; border-radius: 10px; z-index: 10000; max-width: 500px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    errorMessage.innerHTML = `
        <h2 style="margin-top: 0; color: white;">⚠️ Թեստը դադարեցված է</h2>
        <p style="font-size: 16px; line-height: 1.6;">
            ${message}
        </p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: #dc3545; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">
            🔄 Թարմացնել Էջը
        </button>
    `;
    
    document.body.appendChild(errorMessage);
    
    // Also show in payment status area
    if (paymentStatus) {
        paymentStatus.innerHTML = '<div class="payment-status error" style="background: #dc3545; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">⚠️ ' + message.replace('<br>', ' ') + '</div>';
    }
}


function startSessionValidityCheck() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    
    // Check immediately first time
    if (gameStarted) {
        checkSessionValidity().then(isValid => {
            if (!isValid) {
                // Session invalidated, stop checking
                if (sessionCheckInterval) {
                    clearInterval(sessionCheckInterval);
                    sessionCheckInterval = null;
                }
            }
        });
    }
    
    sessionCheckInterval = setInterval(async () => {
        if (gameStarted) {
            const isValid = await checkSessionValidity();
            if (!isValid) {
                // Session invalidated, stop checking
                if (sessionCheckInterval) {
                    clearInterval(sessionCheckInterval);
                    sessionCheckInterval = null;
                }
            }
        }
    }, 500); // Check every 0.5 seconds for very fast detection when new session starts
}


function stopSessionValidityCheck() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
}


async function loadQuizProgressFromCloud(paymentCode) {
    return new Promise((resolve, reject) => {
        const callbackName = 'handleGetQuizProgress' + Date.now();
        const url = PAYMENT_WEB_APP_URL + '?action=getQuizProgress&paymentCode=' + encodeURIComponent(paymentCode) + '&callback=' + callbackName;
        
        window[callbackName] = function(result) {
            // Clean up
            delete window[callbackName];
            const scripts = document.querySelectorAll('script[src*="getQuizProgress"]');
            scripts.forEach(script => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
            
            if (result && result.success && result.progress) {
                // SECURITY: Check if progress belongs to current browser session
                // Prevent multiple simultaneous sessions with same payment code
                const savedDeviceId = result.progress.deviceId || '';
                const currentDeviceId = getBrowserSessionId(); // Unique per browser/tab
                
                // Check if device matches
                
                if (savedDeviceId && currentDeviceId && savedDeviceId !== currentDeviceId) {
                    // Device mismatch detected
                    // Don't restore progress - this prevents multiple simultaneous sessions
                    resolve(null);
                    return;
                }
                
                // Convert cloud progress to local format
                let userAnswers = [];
                let shuffledQuizData = [];
                
                try {
                    if (typeof result.progress.userAnswers === 'string') {
                        userAnswers = JSON.parse(result.progress.userAnswers);
                    } else if (Array.isArray(result.progress.userAnswers)) {
                        userAnswers = result.progress.userAnswers;
                    } else {
                        userAnswers = [];
                    }
                } catch (e) {
                    userAnswers = [];
                }
                
                try {
                    if (typeof result.progress.shuffledQuizData === 'string') {
                        shuffledQuizData = JSON.parse(result.progress.shuffledQuizData);
                    } else if (Array.isArray(result.progress.shuffledQuizData)) {
                        shuffledQuizData = result.progress.shuffledQuizData;
                    } else {
                        shuffledQuizData = [];
                    }
                } catch (e) {
                    shuffledQuizData = [];
                }
                
                // Parse gameStarted - handle both boolean and string ('true'/'false')
                let gameStarted = true; // default
                if (result.progress.gameStarted !== undefined) {
                    if (typeof result.progress.gameStarted === 'string') {
                        gameStarted = result.progress.gameStarted.toLowerCase() === 'true';
                    } else {
                        gameStarted = Boolean(result.progress.gameStarted);
                    }
                }
                
                // CRITICAL: If we have a question index > 0, game MUST have started
                const currentQuestion = result.progress.currentQuestion || 0;
                if (currentQuestion > 0) {
                    gameStarted = true;
                }
                
                // If session ID matches, use current session ID (progress belongs to this session)
                // If session ID doesn't match, progress was rejected above, so we won't reach here
                const currentSessionId = getBrowserSessionId();
                // savedDeviceId already declared above (line 3633)
                
                const progress = {
                    currentQuestionIndex: result.progress.currentQuestion || 0,
                    score: result.progress.score || 0,
                    userAnswers: userAnswers,
                    gameStarted: gameStarted,
                    currentQuizSetIndex: result.progress.quizSetNumber ? (result.progress.quizSetNumber <= 17 ? result.progress.quizSetNumber - 1 : 17) : -1,
                    shuffledQuizData: shuffledQuizData,
                    timestamp: result.progress.timestamp ? new Date(result.progress.timestamp).getTime() : new Date().getTime(),
                    paymentCode: paymentCode,
                    sessionId: currentSessionId, // Update to current session ID (progress belongs to this session now)
                    deviceId: savedDeviceId // Keep original deviceId from cloud for session validity checking
                };
                resolve(progress);
            } else {
                resolve(null);
            }
        };
        
        const script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            delete window[callbackName];
            resolve(null); // Don't reject, just return null
        };
        document.body.appendChild(script);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                resolve(null);
            }
        }, 10000);
    });
}



// ============================================
// EXPORTS
// ============================================

// Expose constants to window (if needed)
if (typeof window !== 'undefined') {
    window.PAYMENT_AMOUNT = PAYMENT_AMOUNT;
    window.PAYMENT_WEB_APP_URL = PAYMENT_WEB_APP_URL;
    
    // Expose functions to window (if needed by other modules)
    window.submitPaymentRequest = submitPaymentRequest;
    window.getDeviceFingerprint = getDeviceFingerprint;
    window.getBrowserSessionId = getBrowserSessionId;
    window.getUserIP = getUserIP;
    window.checkPaymentStatus = checkPaymentStatus;
    window.verifyPaymentCodeQuick = verifyPaymentCodeQuick;
    window.verifyPaymentCode = verifyPaymentCode;
    window.saveQuizProgressToCloud = saveQuizProgressToCloud;
    window.getDeviceIdFromCloud = getDeviceIdFromCloud;
    window.checkSessionValidity = checkSessionValidity;
    window.showSessionInvalidatedError = showSessionInvalidatedError;
    window.startSessionValidityCheck = startSessionValidityCheck;
    window.stopSessionValidityCheck = stopSessionValidityCheck;
    window.saveQuizSetAttemptsToCloud = saveQuizSetAttemptsToCloud;
    window.loadQuizSetAttemptsFromCloud = loadQuizSetAttemptsFromCloud;
    window.loadQuizProgressFromCloud = loadQuizProgressFromCloud;
}
