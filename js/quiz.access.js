"use strict";

// ============================================
// ACCESS CONTROL MODULE
// ============================================
// Handles access control: demo/trial feature, payment checks, attempts tracking

// ============================================
// DEMO/TRIAL FEATURE
// ============================================
// Allow 1 free test (10 questions) before payment required

const DEMO_QUESTIONS_LIMIT = 10; // 10 questions for free trial
const DEMO_MAX_ATTEMPTS = 1; // Only 1 free test allowed

// ============================================
// TEST MODE (TEMPORARY - WILL BE REMOVED)
// ============================================
// Test mode allows unlimited free testing - clears all data on logout
const TEST_MODE_ENABLED = true; // Set to false to disable test mode
const TEST_MODE_KEY = 'architectQuizTestMode';

// Test account credentials (TEMPORARY - WILL BE REMOVED)
const TEST_ACCOUNT_EMAIL = 'test@architect-quiz.com';
const TEST_ACCOUNT_PASSWORD = 'Test123456!';

/**
 * Check if test mode is enabled
 * @returns {boolean}
 */
function isTestModeEnabled() {
    if (!TEST_MODE_ENABLED) return false;
    return localStorage.getItem(TEST_MODE_KEY) === 'true';
}

/**
 * Enable test mode
 */
function enableTestMode() {
    localStorage.setItem(TEST_MODE_KEY, 'true');
    console.log('🧪 Test mode enabled - unlimited free testing');
}

/**
 * Disable test mode
 */
function disableTestMode() {
    localStorage.removeItem(TEST_MODE_KEY);
    console.log('🧪 Test mode disabled');
}

/**
 * Clear all test data (called on logout)
 */
function clearTestData() {
    if (isTestModeEnabled()) {
        // Clear all quiz-related data
        localStorage.removeItem('freeTrialUsed');
        localStorage.removeItem('quizProgress');
        localStorage.removeItem('quizSetAttempts');
        localStorage.removeItem('quizSetQuestionsUsed');
        localStorage.removeItem('paymentToken');
        localStorage.removeItem('paymentTimestamp');
        localStorage.removeItem('paymentIP');
        localStorage.removeItem('paymentDevice');
        localStorage.removeItem('paymentCode');
        console.log('🧪 Test mode: All quiz data cleared');
    }
}

/**
 * Check if user has used free trial
 * @returns {Promise<Object>} {used: boolean, questionsUsed: number, attempts: number}
 */
async function checkFreeTrialStatus() {
    try {
        // TEST MODE: Always allow free trial if test mode is enabled
        if (isTestModeEnabled()) {
            return { used: false, questionsUsed: 0, attempts: 0 };
        }
        
        // Check if Firebase Auth and Firestore are available
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
            return { used: false, questionsUsed: 0, attempts: 0 };
        }
        
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
            // Not logged in - allow free trial (will be tracked by email if they register later)
            // For now, check localStorage as fallback
            const trialData = localStorage.getItem('freeTrialUsed');
            if (trialData) {
                try {
                    const parsed = JSON.parse(trialData);
                    return {
                        used: parsed.attempts >= DEMO_MAX_ATTEMPTS,
                        questionsUsed: parsed.questionsUsed || 0,
                        attempts: parsed.attempts || 0
                    };
                } catch (e) {
                    return { used: false, questionsUsed: 0, attempts: 0 };
                }
            }
            return { used: false, questionsUsed: 0, attempts: 0 };
        }
        
        // User is logged in - check Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const freeTrial = userData.free_trial || {};
            
            return {
                used: (freeTrial.attempts || 0) >= DEMO_MAX_ATTEMPTS,
                questionsUsed: freeTrial.questions_used || 0,
                attempts: freeTrial.attempts || 0
            };
        }
        
        return { used: false, questionsUsed: 0, attempts: 0 };
    } catch (error) {
        console.error('Error checking free trial status:', error);
        // On error, fallback to localStorage
        const trialData = localStorage.getItem('freeTrialUsed');
        if (trialData) {
            try {
                const parsed = JSON.parse(trialData);
                return {
                    used: parsed.attempts >= DEMO_MAX_ATTEMPTS,
                    questionsUsed: parsed.questionsUsed || 0,
                    attempts: parsed.attempts || 0
                };
            } catch (e) {
                return { used: false, questionsUsed: 0, attempts: 0 };
            }
        }
        return { used: false, questionsUsed: 0, attempts: 0 };
    }
}

/**
 * Record free trial usage
 * @param {number} questionsAnswered - Number of questions answered in this trial
 * @returns {Promise<void>}
 */
async function recordFreeTrialUsage(questionsAnswered) {
    try {
        // Check if Firebase Auth and Firestore are available
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
            // Fallback to localStorage
            const trialData = localStorage.getItem('freeTrialUsed');
            let parsed = { attempts: 0, questionsUsed: 0 };
            if (trialData) {
                try {
                    parsed = JSON.parse(trialData);
                } catch (e) {
                    parsed = { attempts: 0, questionsUsed: 0 };
                }
            }
            
            parsed.attempts = (parsed.attempts || 0) + 1;
            parsed.questionsUsed = Math.max(parsed.questionsUsed || 0, questionsAnswered);
            parsed.lastUsed = new Date().toISOString();
            
            localStorage.setItem('freeTrialUsed', JSON.stringify(parsed));
            return;
        }
        
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Check if user is logged in
        const user = auth.currentUser;
        if (user) {
            // User is logged in - save to Firestore
            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            
            const currentTrial = userDoc.exists && userDoc.data().free_trial ? userDoc.data().free_trial : {};
            const newAttempts = (currentTrial.attempts || 0) + 1;
            const newQuestionsUsed = Math.max(currentTrial.questions_used || 0, questionsAnswered);
            
            await userRef.set({
                free_trial: {
                    attempts: newAttempts,
                    questions_used: newQuestionsUsed,
                    last_used: firebase.firestore.FieldValue.serverTimestamp(),
                    completed: newAttempts >= DEMO_MAX_ATTEMPTS
                }
            }, { merge: true });
            
            console.log('✅ Free trial usage recorded in Firestore');
        } else {
            // Not logged in - save to localStorage (will be synced when user registers)
            const trialData = localStorage.getItem('freeTrialUsed');
            let parsed = { attempts: 0, questionsUsed: 0 };
            if (trialData) {
                try {
                    parsed = JSON.parse(trialData);
                } catch (e) {
                    parsed = { attempts: 0, questionsUsed: 0 };
                }
            }
            
            parsed.attempts = (parsed.attempts || 0) + 1;
            parsed.questionsUsed = Math.max(parsed.questionsUsed || 0, questionsAnswered);
            parsed.lastUsed = new Date().toISOString();
            
            localStorage.setItem('freeTrialUsed', JSON.stringify(parsed));
        }
    } catch (error) {
        console.error('Error recording free trial usage:', error);
        // Fallback to localStorage on error
        const trialData = localStorage.getItem('freeTrialUsed');
        let parsed = { attempts: 0, questionsUsed: 0 };
        if (trialData) {
            try {
                parsed = JSON.parse(trialData);
            } catch (e) {
                parsed = { attempts: 0, questionsUsed: 0 };
            }
        }
        
        parsed.attempts = (parsed.attempts || 0) + 1;
        parsed.questionsUsed = Math.max(parsed.questionsUsed || 0, questionsAnswered);
        parsed.lastUsed = new Date().toISOString();
        
        localStorage.setItem('freeTrialUsed', JSON.stringify(parsed));
    }
}

/**
 * Check if user can access quiz (payment or free trial)
 * @returns {Promise<Object>} {canAccess: boolean, reason: string, isFreeTrial: boolean}
 */
async function checkQuizAccess() {
    try {
        // First, check payment status
        if (typeof checkPaymentStatus === 'function') {
            const paymentStatus = await checkPaymentStatus();
            if (paymentStatus.paid) {
                return {
                    canAccess: true,
                    reason: 'paid',
                    isFreeTrial: false
                };
            }
        }
        
        // No payment - check free trial
        const trialStatus = await checkFreeTrialStatus();
        
        if (!trialStatus.used && trialStatus.attempts < DEMO_MAX_ATTEMPTS) {
            return {
                canAccess: true,
                reason: 'free_trial',
                isFreeTrial: true,
                questionsRemaining: DEMO_QUESTIONS_LIMIT - (trialStatus.questionsUsed || 0),
                attemptsRemaining: DEMO_MAX_ATTEMPTS - trialStatus.attempts
            };
        }
        
        // Free trial used up
        return {
            canAccess: false,
            reason: trialStatus.used ? 'free_trial_used' : 'payment_required',
            isFreeTrial: false,
            message: 'Վճարեք 15,000 դրամ կամ գրանցվեք անվճար demo-ի համար'
        };
    } catch (error) {
        console.error('Error checking quiz access:', error);
        return {
            canAccess: false,
            reason: 'error',
            isFreeTrial: false,
            message: 'Սխալ: Հնարավոր չէ ստուգել մուտքը'
        };
    }
}

/**
 * Check if user can continue quiz (within free trial limit)
 * @param {number} currentQuestionIndex - Current question index (0-based)
 * @returns {Promise<Object>} {canContinue: boolean, reason: string}
 */
async function checkCanContinueQuiz(currentQuestionIndex) {
    try {
        // TEST MODE: Always allow continuation if test mode is enabled
        if (isTestModeEnabled()) {
            return { canContinue: true, reason: 'test_mode' };
        }
        
        // First, check payment status
        if (typeof checkPaymentStatus === 'function') {
            const paymentStatus = await checkPaymentStatus();
            if (paymentStatus.paid) {
                // Paid user - no limits
                return { canContinue: true, reason: 'paid' };
            }
        }
        
        // Free trial - check if within limit
        const trialStatus = await checkFreeTrialStatus();
        
        // If trial already used up, shouldn't be here (but check anyway)
        if (trialStatus.used) {
            return {
                canContinue: false,
                reason: 'free_trial_used',
                message: 'Անվճար demo-ն արդեն օգտագործված է: Վճարեք 15,000 դրամ'
            };
        }
        
        // Check question limit (0-based index, so question 10 is index 9)
        if (currentQuestionIndex >= DEMO_QUESTIONS_LIMIT) {
            // Reached limit - record usage and block
            await recordFreeTrialUsage(DEMO_QUESTIONS_LIMIT);
            return {
                canContinue: false,
                reason: 'free_trial_limit_reached',
                message: `Անվճար demo-ն ավարտվեց (${DEMO_QUESTIONS_LIMIT} հարց): Վճարեք 15,000 դրամ`
            };
        }
        
        // Within limit - can continue
        return {
            canContinue: true,
            reason: 'free_trial',
            questionsRemaining: DEMO_QUESTIONS_LIMIT - (currentQuestionIndex + 1)
        };
    } catch (error) {
        console.error('Error checking can continue quiz:', error);
        // On error, allow continuation (better UX)
        return { canContinue: true, reason: 'error_fallback' };
    }
}

// ============================================
// EXPOSE FUNCTIONS TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.checkFreeTrialStatus = checkFreeTrialStatus;
    window.recordFreeTrialUsage = recordFreeTrialUsage;
    window.checkQuizAccess = checkQuizAccess;
    window.checkCanContinueQuiz = checkCanContinueQuiz;
    
    // Test mode functions
    window.isTestModeEnabled = isTestModeEnabled;
    window.enableTestMode = enableTestMode;
    window.disableTestMode = disableTestMode;
    window.clearTestData = clearTestData;
    
    // Constants
    window.DEMO_QUESTIONS_LIMIT = DEMO_QUESTIONS_LIMIT;
    window.DEMO_MAX_ATTEMPTS = DEMO_MAX_ATTEMPTS;
    
    // Auto-enable test mode on page load (TEMPORARY - WILL BE REMOVED)
    if (TEST_MODE_ENABLED) {
        enableTestMode();
    }
}



