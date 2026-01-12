"use strict";

// ============================================
// UI MODULE
// ============================================
// Handles UI initialization, event listeners, and button handlers

// Flags to prevent duplicate initialization
let eventListenersInitialized = false;
let uiButtonsInitialized = false;

function handleInfoClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    const infoModal = document.getElementById('info-modal');
    if (infoModal) {
        infoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        localStorage.setItem('infoModalOpen', 'true');
        // Lower dark mode toggle z-index when modal is open
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.style.zIndex = '999999';
        }
    }
    return false;
}


function isDarkModeActive() {
    // First check body class (most reliable - reflects current state)
    const hasDarkModeClass = document.body.classList.contains('dark-mode');
    
    // If body has dark-mode class, it's dark mode
    if (hasDarkModeClass) {
        return true;
    }
    
    // Otherwise it's light mode (even if localStorage says 'true', if body doesn't have class, it's not active)
    return false;
}


function handleDarkModeToggle(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    // Store as string 'true' or 'false' for consistent checking
    localStorage.setItem('darkMode', String(isDarkMode));
    
    // If answers review is currently displayed, refresh it to apply new colors
    const answersReview = document.getElementById('answers-review');
    if (answersReview && (answersReview.style.display === 'block' || answersReview.offsetParent !== null)) {
        // Force refresh (don't toggle off) after a short delay
        setTimeout(() => {
            if (typeof showAnswersReview === 'function') {
                showAnswersReview(true); // Pass true to force refresh
            }
        }, 150);
    }
    
    // Refresh score summary box if it exists (use the same isDarkMode value we just set)
    const scoreBox = document.getElementById('quiz-set-score-box');
    const totalText = document.getElementById('quiz-set-total-text');
    if (scoreBox) {
        // LIGHT mode (isDarkMode = false) = white background (#ffffff)
        // DARK mode (isDarkMode = true) = dark background (#2a2a2a)
        const bgColor = isDarkMode ? '#2a2a2a' : '#ffffff';
        scoreBox.style.setProperty('background', bgColor, 'important');
    }
    if (totalText) {
        // LIGHT mode (isDarkMode = false) = dark text (#666)
        // DARK mode (isDarkMode = true) = light text (#b0b0b0)
        const textColor = isDarkMode ? '#b0b0b0' : '#666';
        totalText.style.setProperty('color', textColor, 'important');
    }
    
    // Remove any inline styles from result-item elements to let CSS handle it
    // This ensures CSS rules (body.dark-mode .result-item) work correctly when mode changes
    // Use multiple requestAnimationFrame calls to ensure DOM is fully updated after class toggle
    const removeInlineStyles = () => {
        const resultItems = document.querySelectorAll('.results-display .result-item');
        resultItems.forEach(item => {
            item.style.removeProperty('background');
            item.style.removeProperty('border-color');
            const label = item.querySelector('.result-label');
            if (label) label.style.removeProperty('color');
            const value = item.querySelector('.result-value');
            if (value) value.style.removeProperty('color');
        });
    };
    
    // Call immediately and also after a short delay to catch any delayed DOM updates
    removeInlineStyles();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            removeInlineStyles();
        });
    });
    setTimeout(removeInlineStyles, 100);
    
    return false;
}


function initializeEventListeners() {
    if (eventListenersInitialized) {
        return;
    }
    
    // Get fresh references to DOM elements
    const startBtn = document.getElementById('start-btn');
    const backToPaymentBtn = document.getElementById('back-to-payment-btn');
    const backToPaymentFromQuizBtn = document.getElementById('back-to-payment-from-quiz-btn');
    const restartBtn = document.getElementById('restart-btn');
    const repeatQuizBtn = document.getElementById('repeat-quiz-btn');
    const changeQuizBtn = document.getElementById('change-quiz-btn');
    const verifyPaymentBtn = document.getElementById('verify-payment-btn');
    const verifyPaymentBtnAfter = document.getElementById('verify-payment-btn-after');
    const nextBtn = document.getElementById('next-btn');
    const viewAnswersBtn = document.getElementById('view-answers-btn');
    const paymentCodeInput = document.getElementById('payment-code');
    const paymentCodeInputAfter = document.getElementById('payment-code-after');
    const userNameInput = document.getElementById('user-name');
    const startSection = document.getElementById('start-section');
    const paymentSection = document.getElementById('payment-section');
    const topicSection = document.getElementById('topic-section');
    const questionSection = document.getElementById('question-section');
    const answersSection = document.getElementById('answers-section');
    const nextSection = document.getElementById('next-section');
    const resultsSection = document.getElementById('results-section');
    
    // Start Quiz button
    if (startBtn) {
        startBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            startQuiz();
            return false;
        };
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            startQuiz();
        }, { capture: true, passive: false });
        } else {
        }
    
    // Back to payment/choice button
    if (backToPaymentBtn) {
        backToPaymentBtn.addEventListener('click', () => {
            if (startSection) startSection.style.display = 'none';
            // Check if user is logged in - show choice section, otherwise show payment section
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                // User is logged in - show choice section
                const choiceSection = document.getElementById('choice-section');
                const paymentCodeSection = document.getElementById('payment-code-section');
                if (choiceSection) choiceSection.style.display = 'block';
                if (paymentCodeSection) paymentCodeSection.style.display = 'none';
                if (paymentSection) paymentSection.style.display = 'none';
            } else {
                // User is not logged in - show payment section
                if (paymentSection) paymentSection.style.display = 'block';
            }
        });
        }
    
    // Back to payment/choice from quiz button
    if (backToPaymentFromQuizBtn) {
        backToPaymentFromQuizBtn.addEventListener('click', () => {
            if (topicSection) topicSection.style.display = 'none';
            if (questionSection) questionSection.style.display = 'none';
            if (answersSection) answersSection.style.display = 'none';
            if (nextSection) nextSection.style.display = 'none';
            if (resultsSection) resultsSection.style.display = 'none';
            if (startSection) startSection.style.display = 'none';
            gameStarted = false;
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            
            // Check if user is logged in - show choice section, otherwise show payment section
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                // User is logged in - show choice section
                const choiceSection = document.getElementById('choice-section');
                const paymentCodeSection = document.getElementById('payment-code-section');
                if (choiceSection) choiceSection.style.display = 'block';
                if (paymentCodeSection) paymentCodeSection.style.display = 'none';
                if (paymentSection) paymentSection.style.display = 'none';
            } else {
                // User is not logged in - show payment section
                if (paymentSection) paymentSection.style.display = 'block';
            }
        });
        }
    
    // Restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', initGame);
        }
    
    // Repeat quiz button
    if (repeatQuizBtn) {
        repeatQuizBtn.addEventListener('click', repeatQuiz);
        }
    
    // Change quiz button
    if (changeQuizBtn) {
        // change-quiz-btn removed - replaced with next-quiz-set-btn
        // changeQuizBtn.addEventListener('click', changeQuiz);
    }
    
    // Verify payment buttons
    if (verifyPaymentBtn) {
        verifyPaymentBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            verifyPaymentCode();
            return false;
        };
        verifyPaymentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            verifyPaymentCode();
        }, { capture: true, passive: false });
        } else {
        }
    
    if (verifyPaymentBtnAfter) {
        verifyPaymentBtnAfter.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            verifyPaymentCode();
            return false;
        };
        verifyPaymentBtnAfter.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            verifyPaymentCode();
        }, { capture: true, passive: false });
    } else {
    }
    
    // Payment code input Enter key
    if (paymentCodeInput) {
        paymentCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyPaymentCode();
            }
        });
        }
    
    if (paymentCodeInputAfter) {
        paymentCodeInputAfter.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyPaymentCode();
            }
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
        }
    
    // View answers button
    if (viewAnswersBtn) {
        // Remove existing onclick handler if any
        viewAnswersBtn.removeAttribute('onclick');
        viewAnswersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showAnswersReview();
        });
        } else {
        }
    
    // User name input Enter key
    if (userNameInput) {
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                startQuiz();
            }
        });
        }
    
    // Answer buttons (dynamically added, so we use event delegation)
    // Handle clicks on button or any child element (answer-letter, answer-text)
    document.addEventListener('click', function(e) {
        let answerBtn = null;
        
        // Check if clicked element is the button itself
        if (e.target.classList.contains('answer-btn')) {
            answerBtn = e.target;
        }
        // Check if clicked element is answer-letter or answer-text
        else if (e.target.classList.contains('answer-letter') || e.target.classList.contains('answer-text')) {
            answerBtn = e.target.closest('.answer-btn');
        }
        // Try to find closest answer-btn parent
        else {
            answerBtn = e.target.closest('.answer-btn');
        }
        
        if (answerBtn) {
            }
        
        if (answerBtn && !answerBtn.disabled) {
            const selectedIndex = parseInt(answerBtn.getAttribute('data-index'));
            if (!isNaN(selectedIndex)) {
                e.preventDefault();
                e.stopPropagation();
                selectAnswer(selectedIndex);
            }
        } else if (answerBtn && answerBtn.disabled) {
            }
    });
    
    // Enter key to go to next question
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && nextSection && nextSection.style.display === 'block') {
            e.preventDefault();
            nextQuestion();
        }
    });
    // Mark as initialized
    eventListenersInitialized = true;
    
    }


function initializeUIButtons() {
    if (uiButtonsInitialized) {
        return;
    }
    
    // Info Modal functionality
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const infoModalClose = document.getElementById('info-modal-close');
    const infoBackBtn = document.getElementById('info-back-btn');

    if (infoBtn) {
        // Remove any existing listeners by cloning
        const newInfoBtn = infoBtn.cloneNode(true);
        infoBtn.parentNode.replaceChild(newInfoBtn, infoBtn);
        
        // Get fresh reference
        const freshInfoBtn = document.getElementById('info-btn');
        const freshInfoModal = document.getElementById('info-modal');
        
        if (freshInfoBtn) {
            // Use the global handleInfoClick function defined earlier
            freshInfoBtn.addEventListener('click', handleInfoClick, { capture: true, passive: false });
            freshInfoBtn.addEventListener('mousedown', handleInfoClick, { capture: true, passive: false });
            freshInfoBtn.onclick = handleInfoClick;
        }
    } else {
        }

    if (infoModalClose) {
        infoModalClose.addEventListener('click', () => {
            if (infoModal) {
                infoModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Save modal state
                localStorage.setItem('infoModalOpen', 'false');
                // Restore dark mode toggle z-index when modal is closed
                const darkModeToggle = document.getElementById('dark-mode-toggle');
                if (darkModeToggle) {
                    darkModeToggle.style.zIndex = '';
                }
            }
        });
    }

    if (infoBackBtn) {
        infoBackBtn.addEventListener('click', () => {
            if (infoModal) {
                infoModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Save modal state
                localStorage.setItem('infoModalOpen', 'false');
                // Restore dark mode toggle z-index when modal is closed
                const darkModeToggle = document.getElementById('dark-mode-toggle');
                if (darkModeToggle) {
                    darkModeToggle.style.zIndex = '';
                }
            }
        });
    }

    // Close modal when clicking outside
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Save modal state
                localStorage.setItem('infoModalOpen', 'false');
                // Restore dark mode toggle z-index when modal is closed
                const darkModeToggle = document.getElementById('dark-mode-toggle');
                if (darkModeToggle) {
                    darkModeToggle.style.zIndex = '';
                }
            }
        });
    }
    
    // Restore modal state if it was open
    const wasModalOpen = localStorage.getItem('infoModalOpen') === 'true';
    if (wasModalOpen && infoModal) {
        infoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Toggle dark mode - use onclick attribute (handleDarkModeToggle is global)
    // Don't remove onclick, just ensure handleDarkModeToggle is available
    if (darkModeToggle) {
        // Ensure handleDarkModeToggle is available globally (already done at end of file)
        if (typeof window.handleDarkModeToggle !== 'function') {
            window.handleDarkModeToggle = handleDarkModeToggle;
        }
        
        // Also add event listener as backup (onclick will work too)
        darkModeToggle.addEventListener('click', function(e) {
            // Let onclick handle it, but also do it here as backup
            if (!e.defaultPrevented) {
                handleDarkModeToggle(e);
            }
        }, { capture: false, passive: false });
    } else {
        }
    
    // Mark as initialized
    uiButtonsInitialized = true;
    }


// ============================================
// EXPORTS
// ============================================

// Expose functions to window (if needed by other modules or HTML onclick attributes)
if (typeof window !== 'undefined') {
    window.handleInfoClick = handleInfoClick;
    window.handleDarkModeToggle = handleDarkModeToggle;
    window.isDarkModeActive = isDarkModeActive;
    window.initializeEventListeners = initializeEventListeners;
    window.initializeUIButtons = initializeUIButtons;
}
