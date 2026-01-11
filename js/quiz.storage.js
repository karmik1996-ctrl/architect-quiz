"use strict";

// ============================================
// STORAGE MODULE (localStorage)
// ============================================
// Handles all localStorage operations for quiz attempts and progress

// Global storage state
let quizSetAttempts = {}; // Track attempts per quiz set: {1: 2, 3: 3, ...} (quiz set number: attempts count)
let quizSetQuestionsUsed = {}; // Track max questions reached per quiz set

// ============================================
// QUIZ ATTEMPTS (global)
// ============================================

function getQuizAttempts() {
    const attempts = localStorage.getItem('quizAttempts');
    return attempts ? parseInt(attempts) : 0;
}

function incrementQuizAttempts() {
    const attempts = getQuizAttempts() + 1;
    localStorage.setItem('quizAttempts', attempts.toString());
    return attempts;
}

function decrementQuizAttempts() {
    const attempts = Math.max(0, getQuizAttempts() - 1);
    localStorage.setItem('quizAttempts', attempts.toString());
    return attempts;
}

function resetQuizAttempts() {
    localStorage.setItem('quizAttempts', '0');
}

// ============================================
// QUIZ SET ATTEMPTS (per quiz set)
// ============================================

function loadQuizSetAttempts() {
    const stored = localStorage.getItem('quizSetAttempts');
    quizSetAttempts = stored ? JSON.parse(stored) : {};
}

function saveQuizSetAttempts() {
    localStorage.setItem('quizSetAttempts', JSON.stringify(quizSetAttempts));
}

function getQuizSetAttempts(quizSetNumber) {
    return quizSetAttempts[quizSetNumber] || 0;
}

function resetQuizSetAttempts() {
    quizSetAttempts = {};
    saveQuizSetAttempts();
}

// ============================================
// QUIZ SET QUESTIONS USED (tracks max questions reached per quiz set)
// ============================================

function loadQuizSetQuestionsUsed() {
    const stored = localStorage.getItem('quizSetQuestionsUsed');
    quizSetQuestionsUsed = stored ? JSON.parse(stored) : {};
}

function saveQuizSetQuestionsUsed() {
    localStorage.setItem('quizSetQuestionsUsed', JSON.stringify(quizSetQuestionsUsed));
}

function getQuizSetQuestionsUsed(quizSetNumber) {
    return quizSetQuestionsUsed[quizSetNumber] || 0;
}

function updateQuizSetQuestionsUsed(quizSetNumber, questionsReached) {
    const current = getQuizSetQuestionsUsed(quizSetNumber);
    if (questionsReached > current) {
        quizSetQuestionsUsed[quizSetNumber] = questionsReached;
        saveQuizSetQuestionsUsed();
    }
}

function resetQuizSetQuestionsUsed() {
    quizSetQuestionsUsed = {};
    saveQuizSetQuestionsUsed();
}

// ============================================
// QUIZ PROGRESS
// ============================================

function saveQuizProgress() {
    try {
        // Note: This function requires global variables from quiz.core.js
        // It will be called from quiz.core.js after quiz variables are initialized
        // We keep the structure here, but actual implementation depends on quiz.core.js
        
        // Get current browser session ID for session tracking
        const currentSessionId = typeof getBrowserSessionId === 'function' ? getBrowserSessionId() : '';
        
        const progress = {
            currentQuestionIndex: typeof currentQuestionIndex !== 'undefined' ? currentQuestionIndex : 0,
            score: typeof score !== 'undefined' ? score : 0,
            userAnswers: typeof userAnswers !== 'undefined' ? userAnswers : [],
            gameStarted: typeof gameStarted !== 'undefined' ? gameStarted : false,
            currentQuizSetIndex: typeof currentQuizSetIndex !== 'undefined' ? currentQuizSetIndex : -1,
            shuffledQuizData: typeof shuffledQuizData !== 'undefined' && shuffledQuizData && shuffledQuizData.length > 0 ? shuffledQuizData.map(q => q.question) : [],
            quizSets: typeof quizSets !== 'undefined' && quizSets && quizSets.length > 0 ? quizSets.map(set => set.map(q => q.question)) : [],
            timestamp: new Date().getTime(),
            paymentCode: localStorage.getItem('paymentCode') || '',
            sessionId: currentSessionId
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
        
        // Also save to cloud (async, don't wait)
        if (typeof saveQuizProgressToCloud === 'function') {
            saveQuizProgressToCloud(progress).catch(err => {
                // Ignore errors
            });
        }
    } catch (error) {
        // Ignore errors
    }
}

function loadQuizProgress() {
    try {
        // First, try to load from localStorage (faster)
        const savedProgress = localStorage.getItem('quizProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            // Check if progress is recent (within 24 hours)
            const hoursSinceSave = (new Date().getTime() - progress.timestamp) / (1000 * 60 * 60);
            if (hoursSinceSave < 24) {
                // Check if payment code matches
                const currentPaymentCode = localStorage.getItem('paymentCode');
                if (currentPaymentCode && progress.paymentCode === currentPaymentCode) {
                    // SECURITY: Check if progress belongs to current browser session
                    const savedSessionId = progress.sessionId || '';
                    const currentSessionId = typeof getBrowserSessionId === 'function' ? getBrowserSessionId() : '';
                    
                    // Check if session matches
                    if (savedSessionId && currentSessionId && savedSessionId !== currentSessionId) {
                        // Clear old progress from different session
                        localStorage.removeItem('quizProgress');
                        return null;
                    }
                    
                    return progress;
                }
            } else {
                // Progress is too old, clear it
                localStorage.removeItem('quizProgress');
            }
        }
        
        // If no localStorage progress, try to load from cloud (if function exists)
        const currentPaymentCode = localStorage.getItem('paymentCode');
        if (currentPaymentCode && typeof loadQuizProgressFromCloud === 'function') {
            return loadQuizProgressFromCloud(currentPaymentCode).then(cloudProgress => {
                if (cloudProgress) {
                    // Also save to localStorage for faster access next time
                    localStorage.setItem('quizProgress', JSON.stringify(cloudProgress));
                    return cloudProgress;
                }
                return null;
            }).catch(err => {
                return null;
            });
        }
        
        return Promise.resolve(null);
    } catch (error) {
        return Promise.resolve(null);
    }
}

// ============================================
// SCROLL POSITION
// ============================================

function saveScrollPosition() {
    try {
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        localStorage.setItem('mainMenuScrollPosition', scrollY.toString());
    } catch (error) {
        // Ignore errors
    }
}

function restoreScrollPosition() {
    try {
        const savedScroll = localStorage.getItem('mainMenuScrollPosition');
        if (savedScroll !== null) {
            const scrollY = parseInt(savedScroll, 10);
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        }
    } catch (error) {
        // Ignore errors
    }
}

// ============================================
// EXPORTS
// ============================================

// Expose functions to window (if needed by other modules)
if (typeof window !== 'undefined') {
    window.getQuizAttempts = getQuizAttempts;
    window.incrementQuizAttempts = incrementQuizAttempts;
    window.decrementQuizAttempts = decrementQuizAttempts;
    window.resetQuizAttempts = resetQuizAttempts;
    
    window.loadQuizSetAttempts = loadQuizSetAttempts;
    window.saveQuizSetAttempts = saveQuizSetAttempts;
    window.getQuizSetAttempts = getQuizSetAttempts;
    window.resetQuizSetAttempts = resetQuizSetAttempts;
    
    window.loadQuizSetQuestionsUsed = loadQuizSetQuestionsUsed;
    window.saveQuizSetQuestionsUsed = saveQuizSetQuestionsUsed;
    window.getQuizSetQuestionsUsed = getQuizSetQuestionsUsed;
    window.updateQuizSetQuestionsUsed = updateQuizSetQuestionsUsed;
    window.resetQuizSetQuestionsUsed = resetQuizSetQuestionsUsed;
    
    window.saveQuizProgress = saveQuizProgress;
    window.loadQuizProgress = loadQuizProgress;
    
    window.saveScrollPosition = saveScrollPosition;
    window.restoreScrollPosition = restoreScrollPosition;
}

