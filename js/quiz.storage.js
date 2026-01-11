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
    // Use safe localStorage wrapper if available, otherwise use direct access with error handling
    const attempts = (typeof safeLocalStorageGet === 'function') 
        ? safeLocalStorageGet('quizAttempts', '0')
        : (() => {
            try {
                const value = localStorage.getItem('quizAttempts');
                return value || '0';
            } catch (error) {
                console.error('Error reading quizAttempts:', error);
                return '0';
            }
        })();
    const parsed = parseInt(attempts, 10);
    return isNaN(parsed) ? 0 : parsed;
}

function incrementQuizAttempts() {
    const attempts = getQuizAttempts() + 1;
    const success = (typeof safeLocalStorageSet === 'function')
        ? safeLocalStorageSet('quizAttempts', attempts.toString())
        : (() => {
            try {
                localStorage.setItem('quizAttempts', attempts.toString());
                return true;
            } catch (error) {
                console.error('Error writing quizAttempts:', error);
                return false;
            }
        })();
    return success ? attempts : getQuizAttempts();
}

function decrementQuizAttempts() {
    const attempts = Math.max(0, getQuizAttempts() - 1);
    const success = (typeof safeLocalStorageSet === 'function')
        ? safeLocalStorageSet('quizAttempts', attempts.toString())
        : (() => {
            try {
                localStorage.setItem('quizAttempts', attempts.toString());
                return true;
            } catch (error) {
                console.error('Error writing quizAttempts:', error);
                return false;
            }
        })();
    return success ? attempts : getQuizAttempts();
}

function resetQuizAttempts() {
    const success = (typeof safeLocalStorageSet === 'function')
        ? safeLocalStorageSet('quizAttempts', '0')
        : (() => {
            try {
                localStorage.setItem('quizAttempts', '0');
                return true;
            } catch (error) {
                console.error('Error resetting quizAttempts:', error);
                return false;
            }
        })();
}

// ============================================
// QUIZ SET ATTEMPTS (per quiz set)
// ============================================

function loadQuizSetAttempts() {
    try {
        const stored = (typeof safeLocalStorageGet === 'function')
            ? safeLocalStorageGet('quizSetAttempts', null)
            : (() => {
                try {
                    return localStorage.getItem('quizSetAttempts');
                } catch (error) {
                    console.error('Error reading quizSetAttempts:', error);
                    return null;
                }
            })();
        
        if (stored) {
            // Validate data structure
            if (typeof stored === 'object' && stored !== null) {
                quizSetAttempts = stored;
            } else if (typeof stored === 'string') {
                try {
                    const parsed = JSON.parse(stored);
                    if (typeof parsed === 'object' && parsed !== null) {
                        quizSetAttempts = parsed;
                    } else {
                        quizSetAttempts = {};
                    }
                } catch (e) {
                    console.error('Error parsing quizSetAttempts:', e);
                    quizSetAttempts = {};
                }
            } else {
                quizSetAttempts = {};
            }
        } else {
            quizSetAttempts = {};
        }
    } catch (error) {
        console.error('Error loading quizSetAttempts:', error);
        quizSetAttempts = {};
    }
}

function saveQuizSetAttempts() {
    try {
        const success = (typeof safeLocalStorageSet === 'function')
            ? safeLocalStorageSet('quizSetAttempts', quizSetAttempts)
            : (() => {
                try {
                    localStorage.setItem('quizSetAttempts', JSON.stringify(quizSetAttempts));
                    return true;
                } catch (error) {
                    console.error('Error writing quizSetAttempts:', error);
                    return false;
                }
            })();
        if (!success) {
            console.warn('Failed to save quizSetAttempts');
        }
    } catch (error) {
        console.error('Error saving quizSetAttempts:', error);
    }
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
    try {
        const stored = (typeof safeLocalStorageGet === 'function')
            ? safeLocalStorageGet('quizSetQuestionsUsed', null)
            : (() => {
                try {
                    return localStorage.getItem('quizSetQuestionsUsed');
                } catch (error) {
                    console.error('Error reading quizSetQuestionsUsed:', error);
                    return null;
                }
            })();
        
        if (stored) {
            // Validate data structure
            if (typeof stored === 'object' && stored !== null) {
                quizSetQuestionsUsed = stored;
            } else if (typeof stored === 'string') {
                try {
                    const parsed = JSON.parse(stored);
                    if (typeof parsed === 'object' && parsed !== null) {
                        quizSetQuestionsUsed = parsed;
                    } else {
                        quizSetQuestionsUsed = {};
                    }
                } catch (e) {
                    console.error('Error parsing quizSetQuestionsUsed:', e);
                    quizSetQuestionsUsed = {};
                }
            } else {
                quizSetQuestionsUsed = {};
            }
        } else {
            quizSetQuestionsUsed = {};
        }
    } catch (error) {
        console.error('Error loading quizSetQuestionsUsed:', error);
        quizSetQuestionsUsed = {};
    }
}

function saveQuizSetQuestionsUsed() {
    try {
        const success = (typeof safeLocalStorageSet === 'function')
            ? safeLocalStorageSet('quizSetQuestionsUsed', quizSetQuestionsUsed)
            : (() => {
                try {
                    localStorage.setItem('quizSetQuestionsUsed', JSON.stringify(quizSetQuestionsUsed));
                    return true;
                } catch (error) {
                    console.error('Error writing quizSetQuestionsUsed:', error);
                    return false;
                }
            })();
        if (!success) {
            console.warn('Failed to save quizSetQuestionsUsed');
        }
    } catch (error) {
        console.error('Error saving quizSetQuestionsUsed:', error);
    }
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
        const savedProgress = (typeof safeLocalStorageGet === 'function')
            ? safeLocalStorageGet('quizProgress', null)
            : (() => {
                try {
                    const value = localStorage.getItem('quizProgress');
                    return value ? JSON.parse(value) : null;
                } catch (error) {
                    console.error('Error reading quizProgress:', error);
                    return null;
                }
            })();
        if (savedProgress) {
            let progress = null;
            try {
                if (typeof savedProgress === 'object' && savedProgress !== null) {
                    progress = savedProgress;
                } else if (typeof savedProgress === 'string') {
                    try {
                        progress = JSON.parse(savedProgress);
                    } catch (e) {
                        console.error('Error parsing quizProgress:', e);
                        progress = null;
                    }
                }
            } catch (error) {
                console.error('Error processing savedProgress:', error);
                progress = null;
            }
            
            // Validate progress object
            if (!progress || typeof progress !== 'object' || typeof progress.timestamp !== 'number') {
                // Invalid progress data, clear it
                const removed = (typeof safeLocalStorageRemove === 'function')
                    ? safeLocalStorageRemove('quizProgress')
                    : (() => {
                        try {
                            localStorage.removeItem('quizProgress');
                            return true;
                        } catch (error) {
                            console.error('Error removing invalid quizProgress:', error);
                            return false;
                        }
                    })();
                return Promise.resolve(null);
            }
            
            // Check if progress is recent (within 24 hours)
            const hoursSinceSave = (new Date().getTime() - progress.timestamp) / (1000 * 60 * 60);
            if (hoursSinceSave < 24) {
                // Check if payment code matches
                const currentPaymentCode = (typeof safeLocalStorageGet === 'function')
                    ? (safeLocalStorageGet('paymentCode', '') || '')
                    : (() => {
                        try {
                            return localStorage.getItem('paymentCode') || '';
                        } catch (error) {
                            console.error('Error reading paymentCode:', error);
                            return '';
                        }
                    })();
                if (currentPaymentCode && progress.paymentCode === currentPaymentCode) {
                    // SECURITY: Check if progress belongs to current browser session
                    const savedSessionId = progress.sessionId || '';
                    const currentSessionId = typeof getBrowserSessionId === 'function' ? getBrowserSessionId() : '';
                    
                    // Check if session matches
                    if (savedSessionId && currentSessionId && savedSessionId !== currentSessionId) {
                        // Clear old progress from different session
                        const removed = (typeof safeLocalStorageRemove === 'function')
                            ? safeLocalStorageRemove('quizProgress')
                            : (() => {
                                try {
                                    localStorage.removeItem('quizProgress');
                                    return true;
                                } catch (error) {
                                    console.error('Error removing quizProgress:', error);
                                    return false;
                                }
                            })();
                        return null;
                    }
                    
                    return progress;
                }
            } else {
                // Progress is too old, clear it
                const removed = (typeof safeLocalStorageRemove === 'function')
                    ? safeLocalStorageRemove('quizProgress')
                    : (() => {
                        try {
                            localStorage.removeItem('quizProgress');
                            return true;
                        } catch (error) {
                            console.error('Error removing quizProgress:', error);
                            return false;
                        }
                    })();
            }
        }
        
        // If no localStorage progress, try to load from cloud (if function exists)
        const currentPaymentCode = (typeof safeLocalStorageGet === 'function')
            ? (safeLocalStorageGet('paymentCode', '') || '')
            : (() => {
                try {
                    return localStorage.getItem('paymentCode') || '';
                } catch (error) {
                    console.error('Error reading paymentCode:', error);
                    return '';
                }
            })();
        if (currentPaymentCode && typeof loadQuizProgressFromCloud === 'function') {
            return loadQuizProgressFromCloud(currentPaymentCode).then(cloudProgress => {
                if (cloudProgress) {
                    // Also save to localStorage for faster access next time
                    const success = (typeof safeLocalStorageSet === 'function')
                        ? safeLocalStorageSet('quizProgress', cloudProgress)
                        : (() => {
                            try {
                                localStorage.setItem('quizProgress', JSON.stringify(cloudProgress));
                                return true;
                            } catch (error) {
                                console.error('Error writing quizProgress:', error);
                                return false;
                            }
                        })();
                    if (success) {
                        return cloudProgress;
                    }
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
        const success = (typeof safeLocalStorageSet === 'function')
            ? safeLocalStorageSet('mainMenuScrollPosition', scrollY.toString())
            : (() => {
                try {
                    localStorage.setItem('mainMenuScrollPosition', scrollY.toString());
                    return true;
                } catch (error) {
                    console.error('Error writing scroll position:', error);
                    return false;
                }
            })();
        if (!success) {
            console.warn('Failed to save scroll position');
        }
    } catch (error) {
        console.error('Error saving scroll position:', error);
    }
}

function restoreScrollPosition() {
    try {
        const savedScroll = (typeof safeLocalStorageGet === 'function')
            ? safeLocalStorageGet('mainMenuScrollPosition', null)
            : (() => {
                try {
                    return localStorage.getItem('mainMenuScrollPosition');
                } catch (error) {
                    console.error('Error reading scroll position:', error);
                    return null;
                }
            })();
        if (savedScroll !== null) {
            const scrollY = parseInt(savedScroll, 10);
            if (!isNaN(scrollY)) {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollY);
                });
            }
        }
    } catch (error) {
        console.error('Error restoring scroll position:', error);
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

