"use strict";

// ============================================
// QUIZ CORE MODULE
// ============================================
// Handles core quiz logic: questions, scoring, quiz flow, results

// Global quiz state variables
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let gameStarted = false;
let userName = '';
let shuffledQuizData = []; // Shuffled version of quizData
let savedShuffledQuizData = []; // Saved shuffled data for repeat

// Quiz sets: 17 sets of 10 questions + 1 set of 5 questions (18th test) = 175 questions
let quizSets = []; // Array of quiz sets, each containing 10 or 5 questions
let currentQuizSetIndex = 0; // Current quiz set (0-17)
let quizSetResults = []; // Results for each quiz set: [{correct: X, wrong: Y}, ...]
let userData = {
    name: '',
    score: 0,
    totalQuestions: 0,
    percentage: 0,
    deviceInfo: {},
    location: {},
    timestamp: '',
    answers: []
};

// Initialization flags
let gameInitialized = false;
let progressRestored = false;
let initializationInProgress = false; // Prevent concurrent initialization attempts
let pageInitialized = false;

function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


function extractMaterials(text) {
    const materials = [];
    
    // Pattern to match: ԿՈ, 19.03.2015, N596-Ն
    const koPattern = /ԿՈ,?\s*\d{2}\.\d{2}\.\d{4},?\s*N\d+-Ն/g;
    const koMatches = text.match(koPattern);
    if (koMatches) {
        materials.push(...koMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ԿՈ, 20.04.2002, N438
    const ko438Pattern = /ԿՈ,?\s*20\.04\.2002,?\s*N438/g;
    const ko438Matches = text.match(ko438Pattern);
    if (ko438Matches) {
        materials.push(...ko438Matches.map(m => m.trim()));
    }
    
    // Pattern to match: ՀՕ, հոդվ. 60
    const hoPattern = /ՀՕ,?\s*հոդվ\.?\s*\d+/g;
    const hoMatches = text.match(hoPattern);
    if (hoMatches) {
        materials.push(...hoMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՔՇՕ, հոդվ. 6 or ՔՇՕ, Հոդվ. 22.1
    const qshoPattern = /ՔՇՕ,?\s*[Հհ]ոդվ\.?\s*[\d.]+/g;
    const qshoMatches = text.match(qshoPattern);
    if (qshoMatches) {
        materials.push(...qshoMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՊՀՊՕ, հոդվ. 6
    const phpPattern = /ՊՀՊՕ,?\s*հոդվ\.?\s*\d+/g;
    const phpMatches = text.match(phpPattern);
    if (phpMatches) {
        materials.push(...phpMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՔՕ, հոդվ. 700
    const qoPattern = /ՔՕ,?\s*հոդվ\.?\s*\d+/g;
    const qoMatches = text.match(qoPattern);
    if (qoMatches) {
        materials.push(...qoMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՔՕ, 760,2 2.6. Հեղինակային իրավ-նք
    const qo760Pattern = /ՔՕ,?\s*760,?\s*\d+\.?\s*\d+\.?\s*[Հհ]եղինակային\s*իրավ[-\s]*նք?/g;
    const qo760Matches = text.match(qo760Pattern);
    if (qo760Matches) {
        materials.push(...qo760Matches.map(m => m.trim()));
    }
    
    // Pattern to match: ՔՕ, 760,2 or ՔՕ, 760
    const qo760SimplePattern = /ՔՕ,?\s*760,?\s*\d*/g;
    const qo760SimpleMatches = text.match(qo760SimplePattern);
    if (qo760SimpleMatches) {
        materials.push(...qo760SimpleMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՀՀՇՆ 30-01-2014, աղ.6 or ՀՀՇՆ 31-03-2018
    const hhshnPattern = /ՀՀՇՆ\s*\d{2}-\d{2}-\d{4}(,?\s*աղ\.?\d+)?/g;
    const hhshnMatches = text.match(hhshnPattern);
    if (hhshnMatches) {
        materials.push(...hhshnMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ԿՈ, 19.03.2015, N596-Ն 1.2.Ինժեներաերկրաբանական հետազննումներ (with topic)
    const koWithTopicPattern = /ԿՈ,?\s*\d{2}\.\d{2}\.\d{4},?\s*N\d+-Ն\s*[\d.]+\.\S+/g;
    const koWithTopicMatches = text.match(koWithTopicPattern);
    if (koWithTopicMatches) {
        materials.push(...koWithTopicMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ՃԳՄՕ, հոդվ. 13
    const jgmoPattern = /ՃԳՄՕ,?\s*հոդվ\.?\s*\d+/g;
    const jgmoMatches = text.match(jgmoPattern);
    if (jgmoMatches) {
        materials.push(...jgmoMatches.map(m => m.trim()));
    }
    
    // Pattern to match: ԿՈ,29.12,2011, N1920-Ն (without spaces)
    const koPattern2 = /ԿՈ,?\d{2}\.\d{2},?\d{4},?\s*N\d+-Ն/g;
    const koMatches2 = text.match(koPattern2);
    if (koMatches2) {
        materials.push(...koMatches2.map(m => m.trim()));
    }
    
    // Pattern to match: ԿՈ, 31.12.1999, N802
    const ko802Pattern = /ԿՈ,?\s*31\.12\.1999,?\s*N802/g;
    const ko802Matches = text.match(ko802Pattern);
    if (ko802Matches) {
        materials.push(...ko802Matches.map(m => m.trim()));
    }
    
    // Pattern to match: ԿՈ, 31.12.1999, N802 1.11.Քաղաքաշինական գործունեության վերահսկողություն (with topic)
    const ko802WithTopicPattern = /ԿՈ,?\s*31\.12\.1999,?\s*N802\s*[\d.]+\.[Ա-Ֆա-ֆ\s]+/g;
    const ko802WithTopicMatches = text.match(ko802WithTopicPattern);
    if (ko802WithTopicMatches) {
        materials.push(...ko802WithTopicMatches.map(m => m.trim()));
    }
    
    // Remove duplicates and return
    return [...new Set(materials)];
}

// Remove materials from answer text


function cleanAnswerText(text) {
    if (!text) return text;
    
    let cleaned = text;
    
    // Remove: ԿՈ, 19.03.2015, N596-Ն
    cleaned = cleaned.replace(/ԿՈ,?\s*\d{2}\.\d{2}\.\d{4},?\s*N\d+-Ն/g, '').trim();
    
    // Remove: ՀՕ, հոդվ. 60
    cleaned = cleaned.replace(/ՀՕ,?\s*հոդվ\.?\s*\d+/g, '').trim();
    
    // Remove: ՔՇՕ, հոդվ. 6 or ՔՇՕ, Հոդվ. 22.1
    cleaned = cleaned.replace(/ՔՇՕ,?\s*[Հհ]ոդվ\.?\s*[\d.]+/g, '').trim();
    
    // Remove: ՊՀՊՕ, հոդվ. 6
    cleaned = cleaned.replace(/ՊՀՊՕ,?\s*հոդվ\.?\s*\d+/g, '').trim();
    
    // Remove: ՔՕ, հոդվ. 700
    cleaned = cleaned.replace(/ՔՕ,?\s*հոդվ\.?\s*\d+/g, '').trim();
    
    // Remove: ՔՕ, 760,2 2.6. Հեղինակային իրավ-նք
    cleaned = cleaned.replace(/ՔՕ,?\s*760,?\s*\d+\.?\s*\d+\.?\s*[Հհ]եղինակային\s*իրավ[-\s]*նք?/g, '').trim();
    
    // Remove: ՔՕ, 760,2 or ՔՕ, 760
    cleaned = cleaned.replace(/ՔՕ,?\s*760,?\s*\d*/g, '').trim();
    
    // Remove: ՀՀՇՆ 30-01-2014, աղ.6 or ՀՀՇՆ 31-03-2018
    cleaned = cleaned.replace(/ՀՀՇՆ\s*\d{2}-\d{2}-\d{4}(,?\s*աղ\.?\d+)?/g, '').trim();
    
    // Remove: ՃԳՄՕ, հոդվ. 13
    cleaned = cleaned.replace(/ՃԳՄՕ,?\s*հոդվ\.?\s*\d+/g, '').trim();
    
    // Remove: ԿՈ,29.12,2011, N1920-Ն
    cleaned = cleaned.replace(/ԿՈ,?\d{2}\.\d{2},?\d{4},?\s*N\d+-Ն/g, '').trim();
    
    // Remove: ԿՈ, 20.04.2002, N438
    cleaned = cleaned.replace(/ԿՈ,?\s*20\.04\.2002,?\s*N438/g, '').trim();
    
    // Remove: ԿՈ, 31.12.1999, N802
    cleaned = cleaned.replace(/ԿՈ,?\s*31\.12\.1999,?\s*N802/g, '').trim();
    
    // Remove: ԿՈ, 31.12.1999, N802 1.11.Քաղաքաշինական գործունեության վերահսկողություն (with topic)
    cleaned = cleaned.replace(/ԿՈ,?\s*31\.12\.1999,?\s*N802\s*[\d.]+\.[Ա-Ֆա-ֆ\s]+/g, '').trim();
    
    // Remove: ԿՈ, 19.03.2015, N596-Ն 1.2.Ինժեներաերկրաբանական հետազննումներ (with topic)
    cleaned = cleaned.replace(/ԿՈ,?\s*\d{2}\.\d{2}\.\d{4},?\s*N\d+-Ն\s*[\d.]+\.\S+/g, '').trim();
    
    // Clean up extra spaces and commas
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/,\s*$/, ''); // Remove trailing comma
    cleaned = cleaned.replace(/^\s*,\s*/, ''); // Remove leading comma
    
    return cleaned;
}

// Display materials (used sources) for current question


function displayMaterials(question) {
    const materialsSection = document.getElementById('materials-section');
    const materialsList = document.getElementById('materials-list');
    
    if (!materialsSection || !materialsList) return;
    
    // First check if question has materials field
    if (question.materials && question.materials.trim()) {
        materialsList.textContent = question.materials;
        materialsSection.style.display = 'block';
        return;
    }
    
    // Collect all materials from answers
    const allMaterials = [];
    if (question.answers) {
        question.answers.forEach(answer => {
            const materials = extractMaterials(answer);
            allMaterials.push(...materials);
        });
    }
    
    // Remove duplicates
    const uniqueMaterials = [...new Set(allMaterials)];
    
    if (uniqueMaterials.length > 0) {
        // Create HTML for materials
        const materialsHtml = uniqueMaterials.map(material => {
            return material;
        }).join(', ');
        
        materialsList.textContent = materialsHtml;
        materialsSection.style.display = 'block';
    } else {
        materialsSection.style.display = 'none';
    }
}

// Find abbreviations in text (for abbreviation definitions)


function findAbbreviations(text) {
    const found = [];
    for (const abbrev in abbreviations) {
        if (text.includes(abbrev)) {
            found.push(abbrev);
        }
    }
    return found;
}

// Display abbreviations for current question


function displayAbbreviations(question) {
    const abbreviationsSection = document.getElementById('abbreviations-section');
    const abbreviationsList = document.getElementById('abbreviations-list');
    
    if (!abbreviationsSection || !abbreviationsList) return;
    
    // Find abbreviations in question and answers
    const questionText = question.question || '';
    const answersText = (question.answers || []).join(' ');
    const allText = questionText + ' ' + answersText;
    
    const foundAbbrevs = findAbbreviations(allText);
    
    if (foundAbbrevs.length > 0) {
        // Remove duplicates
        const uniqueAbbrevs = [...new Set(foundAbbrevs)];
        
        // Create HTML for abbreviations
        const abbrevsHtml = uniqueAbbrevs.map(abbrev => {
            return `<strong>${abbrev}</strong> – ${abbreviations[abbrev]}`;
        }).join('<br>');
        
        abbreviationsList.innerHTML = abbrevsHtml;
        abbreviationsSection.style.display = 'block';
    } else {
        abbreviationsSection.style.display = 'none';
    }
}

// Get quiz attempts count from localStorage


function findNextAvailableQuizSet() {
    for (let i = 0; i < quizSets.length; i++) {
        const quizSetNumber = i < 17 ? i + 1 : 18;
        const attempts = getQuizSetAttempts(quizSetNumber);
        if (attempts < 3) {
            return i;
        }
    }
    return -1; // All exhausted
}


function updateExhaustedQuizSetsDisplay() {
    const exhaustedDisplay = document.getElementById('exhausted-quiz-sets-display');
    const exhaustedText = document.getElementById('exhausted-quiz-sets-text');
    
    if (!exhaustedDisplay || !exhaustedText) return;
    
    const exhausted = [];
    for (let i = 0; i < quizSets.length; i++) {
        const quizSetNumber = i < 17 ? i + 1 : 18;
        const attempts = getQuizSetAttempts(quizSetNumber);
        if (attempts >= 3) {
            exhausted.push(quizSetNumber);
        }
    }
    
    if (exhausted.length > 0) {
        exhaustedText.textContent = `Հարցաթերթիկ ${exhausted.join(', ')} սպառված`;
        exhaustedDisplay.style.display = 'block';
    } else {
        exhaustedDisplay.style.display = 'none';
    }
}


function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        });
}


async function initGame() {
    // CRITICAL: Prevent multiple calls to initGame() - check ALL possible flags
    if (initializationInProgress) {
        return;
    }
    
    if (gameInitialized && pageInitialized) {
        return;
    }
    
    // Check window.name first (most reliable)
    if (window.name && window.name.includes('quizPageInitialized')) {
        return;
    }
    
    // Mark as in progress IMMEDIATELY to prevent race conditions
    initializationInProgress = true;
    gameInitialized = true;
    pageInitialized = true;
    window.name = 'quizPageInitialized_' + Date.now();
    try {
        sessionStorage.setItem('pageInitialized', 'true');
        localStorage.setItem('pageInitialized', 'true');
    } catch (e) {
        // sessionStorage/localStorage not available
    }
    
    // CRITICAL: Check payment status FIRST - if user has active payment, restore UI immediately
    const paymentCode = localStorage.getItem('paymentCode');
    const paymentToken = localStorage.getItem('paymentToken');
    if (paymentCode && paymentToken) {
        // User has active payment - check if we should restore UI
        const paymentStatus = await checkPaymentStatus();
        if (paymentStatus.paid) {
            // Payment is valid - restore UI to start section (don't show payment form)
            if (paymentSection) paymentSection.style.display = 'none';
            if (startSection) startSection.style.display = 'block';
            // Check if we have saved progress to continue from
            const savedProgress = await loadQuizProgress();
            if (savedProgress && savedProgress.gameStarted && savedProgress.paymentCode === paymentCode) {
                // Restore progress and continue quiz
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
                
                // Restore UI to quiz state
                if (paymentSection) paymentSection.style.display = 'none';
                if (startSection) startSection.style.display = 'none';
                if (topicSection) topicSection.style.display = 'block';
                if (questionSection) questionSection.style.display = 'block';
                if (answersSection) answersSection.style.display = 'flex';
                if (nextSection) nextSection.style.display = 'none';
                if (resultsSection) resultsSection.style.display = 'none';
                
                // Load the current question
                loadQuestion();
                
                progressRestored = true;
                gameInitialized = true;
                pageInitialized = true;
                window.name = 'quizPageInitialized_' + Date.now();
                try {
                    sessionStorage.setItem('pageInitialized', 'true');
                    localStorage.setItem('pageInitialized', 'true');
                } catch (e) {}
                
                return; // Early return - don't do heavy operations
            }
        }
    }
    
    // CRITICAL: Check if page was already initialized (multiple methods - MAXIMUM RELIABILITY)
    // Check window.name first (most reliable)
    if (window.name && window.name.includes('quizPageInitialized')) {
        return;
    }
    
    // Check sessionStorage AND localStorage (backup)
    try {
        if (sessionStorage.getItem('pageInitialized') === 'true' || localStorage.getItem('pageInitialized') === 'true') {
            return;
        }
    } catch (e) {
        // sessionStorage/localStorage not available, continue
    }
    
    // Check pageUnloading flag (BOTH sessionStorage AND localStorage)
    try {
        if (sessionStorage.getItem('pageUnloading') === 'true' || localStorage.getItem('pageUnloading') === 'true') {
            return;
        }
    } catch (e) {
        // sessionStorage/localStorage not available, continue
    }
    
    // Check variable
    if (pageInitialized) {
        return;
    }
    
    // If progress was already restored by pageshow, skip heavy operations
    if (progressRestored && gameInitialized) {
        return;
    }
    
    // Don't reset if we're restoring from pageshow (minimize/maximize)
    if (isRestoringFromPageshow) {
        return;
    }
    
    // Don't reset if page was just hidden and is now visible again (minimize/maximize)
    // Check if we have saved progress in localStorage (fast check)
    // Note: paymentCode is already declared at the start of initGame()
    if (paymentCode) {
        const localProgress = localStorage.getItem('quizProgress');
        if (localProgress) {
            try {
                const progress = JSON.parse(localProgress);
                const hoursSinceSave = (new Date().getTime() - progress.timestamp) / (1000 * 60 * 60);
                // If we have recent progress (within 24 hours) and game was started, don't reset
                if (hoursSinceSave < 24 && progress.gameStarted && progress.paymentCode === paymentCode) {
                    return;
                }
            } catch (e) {
                // Continue with normal init if parsing fails
            }
        }
    }
    
    // Check for saved progress first (from localStorage and Google Apps Script)
    const savedProgress = await loadQuizProgress();
    
    if (savedProgress && savedProgress.gameStarted) {
        progressRestored = true;
        // Restore progress
        currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
        score = savedProgress.score || 0;
        userAnswers = savedProgress.userAnswers || [];
        gameStarted = savedProgress.gameStarted;
        if (typeof currentQuizSetIndex !== 'undefined' && savedProgress.currentQuizSetIndex >= 0) {
            currentQuizSetIndex = savedProgress.currentQuizSetIndex;
        }
        
        // Check payment status
        const paymentStatus = await checkPaymentStatus();
        
        // SECURITY: Also verify that payment code still exists in Google Sheets
        // This prevents access if code was deleted from admin panel
        if (paymentStatus.paid) {
            const currentPaymentCode = localStorage.getItem('paymentCode') || '';
            if (currentPaymentCode) {
                try {
                    // Quick verification: check if code exists in Google Sheets
                    const codeStillValid = await verifyPaymentCodeQuick(currentPaymentCode);
                    if (!codeStillValid) {
                        // Clear all payment-related data
                        localStorage.removeItem('paymentToken');
                        localStorage.removeItem('paymentTimestamp');
                        localStorage.removeItem('paymentIP');
                        localStorage.removeItem('paymentDevice');
                        localStorage.removeItem('paymentCode');
                        localStorage.removeItem('quizProgress');
                        // Show payment section again
                        if (paymentSection) paymentSection.style.display = 'block';
                        if (startSection) startSection.style.display = 'none';
                        if (quizSection) quizSection.style.display = 'none';
                        const paymentStatusEl = document.getElementById('payment-status');
                        if (paymentStatusEl) {
                            paymentStatusEl.innerHTML = '<div class="payment-status error">❌ Վճարման կոդը չի գտնվել կամ անվավեր է</div>';
                        }
                        return; // Don't restore progress
                    }
                } catch (error) {
                    // On error, allow access (fail open for better UX, but log the error)
                }
            }
        }
        
        if (paymentStatus.paid) {
            // User has paid and has saved progress, show continue option
            if (paymentSection) paymentSection.style.display = 'none';
            if (startSection) startSection.style.display = 'block';
            
            // Auto-continue if progress exists (no confirmation needed)
            // Restore quiz state
            if (savedProgress.shuffledQuizData && savedProgress.shuffledQuizData.length > 0) {
                // Restore shuffled quiz data by finding questions
                shuffledQuizData = [];
                for (const questionText of savedProgress.shuffledQuizData) {
                    const foundQuestion = quizData.find(q => q.question === questionText);
                    if (foundQuestion) {
                        shuffledQuizData.push(foundQuestion);
                    }
                }
            }
            
            // If we have quiz sets, restore them
            if (typeof quizSets !== 'undefined' && quizSets.length > 0 && currentQuizSetIndex >= 0) {
                // Quiz sets already exist, just restore current state
            } else {
                // Need to recreate quiz sets
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
            
            // Restore UI to quiz state
            if (paymentSection) paymentSection.style.display = 'none';
            if (startSection) startSection.style.display = 'none';
            if (topicSection) topicSection.style.display = 'block';
            if (questionSection) questionSection.style.display = 'block';
            if (answersSection) answersSection.style.display = 'flex';
            if (nextSection) nextSection.style.display = 'none';
            if (resultsSection) resultsSection.style.display = 'none';
            
            // Track quiz continue
            const quizSetNumber = savedProgress.currentQuizSetIndex >= 0 ? 
                (savedProgress.currentQuizSetIndex < 17 ? savedProgress.currentQuizSetIndex + 1 : 18) : 0;
            trackQuizProgress('continue', quizSetNumber);
            
            // Load the current question
            loadQuestion();
            
            gameInitialized = true;
            pageInitialized = true; // Mark page as initialized to prevent re-init
            window.name = 'quizPageInitialized_' + Date.now();
            try {
                sessionStorage.setItem('pageInitialized', 'true');
                localStorage.setItem('pageInitialized', 'true'); // Also set in localStorage as backup
            } catch (e) {}
            return; // Early return - don't do heavy operations
        }
    }
    
    // No saved progress or user chose to start fresh
    // CRITICAL: Don't reset if payment code and token exist (user was in middle of quiz)
    // Note: paymentCode and paymentToken are already declared at the start of initGame()
    const hasPayment = paymentCode && paymentToken;
    
    if (!savedProgress || !savedProgress.gameStarted) {
        // Only reset if progress wasn't already restored AND user doesn't have active payment
        if (!progressRestored && !hasPayment) {
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            gameStarted = false;
        } else if (hasPayment) {
            // User has payment but no saved progress - don't reset, let them continue
            }
    }
    
    // Only do heavy operations if progress wasn't already restored
    if (!progressRestored) {
        // Load quiz set attempts from localStorage first (faster)
        loadQuizSetAttempts();
        loadQuizSetQuestionsUsed();
        // Also try to load from cloud to sync (in case localStorage was cleared)
        loadQuizSetAttemptsFromCloud().then(cloudAttempts => {
            if (cloudAttempts) {
                }
        });
        
        // Check payment status (fast localStorage check first)
        const paymentStatus = await checkPaymentStatus();
        
        if (paymentStatus.paid) {
            // User has paid, hide payment section and show quiz
            if (paymentSection) paymentSection.style.display = 'none';
            if (startSection) startSection.style.display = 'block';
        } else {
            // User hasn't paid
            // IMPORTANT: Don't force payment screen if user is already in quiz (e.g., after restore)
            if (!gameStarted) {
                if (paymentSection) paymentSection.style.display = 'block';
                if (startSection) startSection.style.display = 'none';
            }
        }
        
        if (topicSection) topicSection.style.display = 'none';
        if (questionSection) questionSection.style.display = 'none';
        if (answersSection) answersSection.style.display = 'none';
        if (nextSection) nextSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
    }
    
    // Only update UI if progress wasn't already restored
    if (!progressRestored) {
        if (totalQuestions) totalQuestions.textContent = quizData.length;
        
        // Update attempts display if element exists
        // Calculate remaining attempts based on quiz sets (18 sets * 3 attempts each = 54 total)
        const attemptsDisplay = document.getElementById('quiz-attempts');
        if (attemptsDisplay) {
            loadQuizSetAttempts();
            
            // Calculate total remaining attempts across all quiz sets
            const totalQuizSets = 18;
            const maxAttemptsPerSet = 3;
            const totalMaxAttempts = totalQuizSets * maxAttemptsPerSet; // 54
            
            let totalUsedAttempts = 0;
            for (let i = 1; i <= totalQuizSets; i++) {
                const setAttempts = getQuizSetAttempts(i.toString());
                totalUsedAttempts += setAttempts;
            }
            
            const remaining = Math.max(0, totalMaxAttempts - totalUsedAttempts);
            // Display as: Used/Total (e.g., 27/54 or 54/54)
            attemptsDisplay.innerHTML = `Առկա է <strong>18 թեստ</strong>, ունեք իրավունք անցնելու ամեն թեստը <strong>3 անգամ</strong>։<br><strong>${totalUsedAttempts}/${totalMaxAttempts} օգտագործված</strong>${remaining > 0 ? `, <strong>մնաց ${remaining}</strong>` : ''}`;
            if (remaining === 0) {
                attemptsDisplay.style.color = '#dc3545';
            } else {
                attemptsDisplay.style.color = '#28a745';
            }
        }
        
        // Update attempts header display (use current quiz set attempts if available)
        let attempts;
        if (typeof currentQuizSetIndex !== 'undefined' && currentQuizSetIndex >= 0) {
            const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
            attempts = getQuizSetAttempts(quizSetNumber.toString());
        } else {
            attempts = getQuizAttempts();
        }
        updateAttemptsDisplay(attempts);
        
        if (scoreDisplay) scoreDisplay.textContent = score;
    }
    
    gameInitialized = true;
    pageInitialized = true; // Mark page as initialized to prevent re-init
    window.name = 'quizPageInitialized_' + Date.now();
    try {
        sessionStorage.setItem('pageInitialized', 'true');
        localStorage.setItem('pageInitialized', 'true'); // Also set in localStorage as backup
    } catch (e) {}
    
    // CRITICAL: Reset initializationInProgress flag after initGame completes
    // This allows re-initialization if needed (e.g., after page reload)
    // But prevents concurrent initialization attempts
    initializationInProgress = false;
}


async function startQuiz() {
    // Check payment status before starting (with security checks)
    const paymentStatus = await checkPaymentStatus();
    
    if (!paymentStatus.paid) {
        alert('⚠️ Խնդրում ենք վճարել հարցաթերթիկները մուտք գործելու համար');
        if (paymentSection) paymentSection.style.display = 'block';
        if (startSection) startSection.style.display = 'none';
        return;
    }
    
    // CRITICAL: Load attempts from cloud before starting quiz
    // This ensures that attempts from other browsers are visible
    await loadQuizSetAttemptsFromCloud();
    // Load quiz set attempts from localStorage first
    loadQuizSetAttempts();
    
    // Check if all quiz sets are exhausted (each completed 3 times)
    // Don't check global attempts - check individual quiz set attempts
    // All 18 quiz sets should be available (each can be done 3 times)
    // Only prevent if ALL quiz sets are exhausted (all 18 sets completed 3 times each)
    
    // Get user name if available
    const nameInput = document.getElementById('user-name');
    if (nameInput) {
        userName = nameInput.value.trim() || 'Անանուն';
    }
    
    // Load quiz set attempts from localStorage
    loadQuizSetAttempts();
    
    // Don't shuffle - keep questions in same order for consistent quiz sets
    // Each quiz set will always have the same questions
    const orderedQuizData = [...quizData]; // Use original order, no shuffle
    
    // Divide into 18 quiz sets: 17 sets of 10 + 1 set of 5 (18th test) = 175 questions
    quizSets = [];
    quizSetResults = [];
    for (let i = 0; i < 17; i++) {
        quizSets.push(orderedQuizData.slice(i * 10, (i + 1) * 10));
        quizSetResults.push({ correct: 0, wrong: 0 });
    }
    // Last set (18th test) with 5 questions
    quizSets.push(orderedQuizData.slice(170, 175));
    quizSetResults.push({ correct: 0, wrong: 0 });
    
    // Find first available (not exhausted) quiz set
    currentQuizSetIndex = findNextAvailableQuizSet();
    if (currentQuizSetIndex === -1) {
        alert('⚠️ Բոլոր հարցաթերթիկները սպառված են (3 անգամ անցել):\nՆոր վճարում կատարեք, որպեսզի կարողանաք նորից անցնել հարցաթերթիկները:');
        return;
    }
    
    shuffledQuizData = [...quizSets[currentQuizSetIndex]]; // Start with first available set
    
    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    gameStarted = true;
    if (startSection) startSection.style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'none';
    if (topicSection) topicSection.style.display = 'block';
    if (questionSection) questionSection.style.display = 'block';
    if (answersSection) answersSection.style.display = 'flex';
    if (resultsSection) resultsSection.style.display = 'none';
    
    // Save progress when quiz starts
    saveQuizProgress();
    
    // CRITICAL: Save deviceId to cloud IMMEDIATELY when quiz starts
    // This ensures that if another session starts with same payment code, it will be detected quickly
    const paymentCode = localStorage.getItem('paymentCode') || '';
    if (paymentCode) {
        const currentDeviceId = getBrowserSessionId();
        // Save progress immediately to update deviceId in cloud
        const progress = {
            paymentCode: paymentCode,
            currentQuestionIndex: 0,
            currentQuizSetIndex: currentQuizSetIndex,
            score: 0,
            userAnswers: [],
            gameStarted: true,
            shuffledQuizData: [],
            deviceId: currentDeviceId,
            sessionId: currentDeviceId,
            timestamp: new Date().getTime()
        };
        saveQuizProgressToCloud(progress).catch(err => {
            });
    }
    
    // Start periodic session validity check (prevent multiple simultaneous sessions)
    startSessionValidityCheck();
    
    // Track quiz start in Google Apps Script
    const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
    trackQuizProgress('start', quizSetNumber);
    
    // Update attempts display for current quiz set after sections are visible
    setTimeout(() => {
        const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
        const quizSetAttempts = getQuizSetAttempts(quizSetNumber.toString());
        updateAttemptsDisplay(quizSetAttempts);
    }, 100);
    
    loadQuestion();
}

// Update attempts display in header (based on current quiz set)


function updateAttemptsDisplay(attempts) {
    // IMPORTANT: Always load attempts from localStorage first to ensure we have the latest data
    loadQuizSetAttempts();
    
    // If attempts is not provided, get it from current quiz set
    if (attempts === undefined) {
        const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
        attempts = getQuizSetAttempts(quizSetNumber.toString());
    }
    
    // Get questions used for current quiz set
    loadQuizSetQuestionsUsed();
    const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
    const questionsUsed = getQuizSetQuestionsUsed(quizSetNumber.toString());
    
    const attemptsHeaderText = document.getElementById('quiz-attempts-header-text');
    if (attemptsHeaderText) {
        if (questionsUsed > 0) {
            attemptsHeaderText.textContent = `${questionsUsed} հարց օգտագործված, ${attempts}/3 փորձ`;
        } else {
            attemptsHeaderText.textContent = `3-ից ${attempts} սպառված`;
        }
        if (attempts >= 3) {
            attemptsHeaderText.style.color = '#dc3545';
        } else if (attempts >= 2) {
            attemptsHeaderText.style.color = '#ffc107';
        } else {
            attemptsHeaderText.style.color = '#28a745';
        }
        } else {
        }
}

// Repeat quiz with same questions (same test attempt, no new attempt)


function repeatQuiz() {
    // Load quiz set attempts from localStorage
    loadQuizSetAttempts();
    
    // Don't shuffle - keep questions in same order for consistent quiz sets
    const orderedQuizData = [...quizData]; // Use original order, no shuffle
    
    // Divide into 18 quiz sets: 17 sets of 10 + 1 set of 5 (18th test) = 175 questions
    quizSets = [];
    quizSetResults = [];
    for (let i = 0; i < 17; i++) {
        quizSets.push(orderedQuizData.slice(i * 10, (i + 1) * 10));
        quizSetResults.push({ correct: 0, wrong: 0 });
    }
    // Last set (18th test) with 5 questions
    quizSets.push(orderedQuizData.slice(170, 175));
    quizSetResults.push({ correct: 0, wrong: 0 });
    
    // Find first available (not exhausted) quiz set
    currentQuizSetIndex = findNextAvailableQuizSet();
    if (currentQuizSetIndex === -1) {
        alert('⚠️ Բոլոր հարցաթերթիկները սպառված են (3 անգամ անցել):\nՆոր վճարում կատարեք, որպեսզի կարողանաք նորից անցնել հարցաթերթիկները:');
        return;
    }
    
    shuffledQuizData = [...quizSets[currentQuizSetIndex]]; // Start with first available set
    
    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Show quiz sections
    if (resultsSection) resultsSection.style.display = 'none';
    if (topicSection) topicSection.style.display = 'block';
    if (questionSection) questionSection.style.display = 'block';
    if (answersSection) answersSection.style.display = 'flex';
    if (nextSection) nextSection.style.display = 'none';
    
    // Update attempts display for current quiz set after sections are visible
    setTimeout(() => {
        const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
        const quizSetAttempts = getQuizSetAttempts(quizSetNumber.toString());
        updateAttemptsDisplay(quizSetAttempts);
    }, 100);
    
    loadQuestion();
}

// Change quiz with new random questions (same test attempt, no new attempt)


function changeQuiz() {
    // Load quiz set attempts from localStorage
    loadQuizSetAttempts();
    
    // Don't shuffle - keep questions in same order for consistent quiz sets
    const orderedQuizData = [...quizData]; // Use original order, no shuffle
    
    // Divide into 18 quiz sets: 17 sets of 10 + 1 set of 5 (18th test) = 175 questions
    quizSets = [];
    quizSetResults = [];
    for (let i = 0; i < 17; i++) {
        quizSets.push(orderedQuizData.slice(i * 10, (i + 1) * 10));
        quizSetResults.push({ correct: 0, wrong: 0 });
    }
    // Last set (18th test) with 5 questions
    quizSets.push(orderedQuizData.slice(170, 175));
    quizSetResults.push({ correct: 0, wrong: 0 });
    
    // Find first available (not exhausted) quiz set
    currentQuizSetIndex = findNextAvailableQuizSet();
    if (currentQuizSetIndex === -1) {
        alert('⚠️ Բոլոր հարցաթերթիկները սպառված են (3 անգամ անցել):\nՆոր վճարում կատարեք, որպեսզի կարողանաք նորից անցնել հարցաթերթիկները:');
        return;
    }
    
    shuffledQuizData = [...quizSets[currentQuizSetIndex]]; // Start with first available set
    
    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Show quiz sections
    if (resultsSection) resultsSection.style.display = 'none';
    if (topicSection) topicSection.style.display = 'block';
    if (questionSection) questionSection.style.display = 'block';
    if (answersSection) answersSection.style.display = 'flex';
    if (nextSection) nextSection.style.display = 'none';
    
    // Update attempts display for current quiz set after sections are visible
    setTimeout(() => {
        const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
        const quizSetAttempts = getQuizSetAttempts(quizSetNumber.toString());
        updateAttemptsDisplay(quizSetAttempts);
    }, 100);
    
    loadQuestion();
}

// Load current question


function loadQuestion() {
    // Check if current quiz set is finished
    if (currentQuestionIndex >= shuffledQuizData.length) {
        showQuizSetResults();
        return;
    }
    
    // Save progress when question is loaded
    saveQuizProgress();
    
    // Update attempts display when question is loaded (section is visible)
    // Use current quiz set attempts instead of global attempts
    // IMPORTANT: Load attempts from localStorage first to ensure we have the latest data
    loadQuizSetAttempts();
    const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
    const attempts = getQuizSetAttempts(quizSetNumber.toString());
    updateAttemptsDisplay(attempts);
    
    const question = shuffledQuizData[currentQuestionIndex];
    
    // Update question number (show question number within set: 1/10, 2/10, etc.)
    const questionInSet = currentQuestionIndex + 1;
    const totalInSet = shuffledQuizData.length;
    
    // Track questions used for this quiz set (update max questions reached)
    loadQuizSetQuestionsUsed();
    updateQuizSetQuestionsUsed(quizSetNumber.toString(), questionInSet);
    if (questionNumber) {
        questionNumber.textContent = questionInSet;
    }
    const totalQuestionsSpan = document.getElementById('total-questions');
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = totalInSet;
    }
    
    // Update quiz set number display
    const quizSetNumberDisplay = document.getElementById('quiz-set-number-display');
    if (quizSetNumberDisplay) {
        // Display 1-17 for first 17 tests, then 18 for the last test (18th test)
        if (currentQuizSetIndex < 17) {
            quizSetNumberDisplay.textContent = currentQuizSetIndex + 1;
        } else {
            quizSetNumberDisplay.textContent = 18; // Last test is the 18th test
        }
    }
    
    // Update exhausted quiz sets display
    updateExhaustedQuizSetsDisplay();
    
    // Display topic
    if (question.topic && question.topic.trim()) {
        topicTitle.textContent = question.topic;
        topicTitle.style.display = 'block';
    } else {
        topicTitle.style.display = 'none';
    }
    
    // Display question
    questionText.textContent = question.question;
    
    // Display answers (cleaned from materials)
    const answerButtons = answersSection.querySelectorAll('.answer-btn');
    answerButtons.forEach((btn, index) => {
        const answerText = btn.querySelector('.answer-text');
        if (question.answers && question.answers[index]) {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
            btn.style.display = 'flex'; // Show button
            // Clean answer text - remove materials
            const cleanedAnswer = cleanAnswerText(question.answers[index]);
            // Only set text if cleaned answer is not empty
            if (cleanedAnswer && cleanedAnswer.trim()) {
                answerText.textContent = cleanedAnswer;
            } else {
                // If cleaned answer is empty, use original answer
                answerText.textContent = question.answers[index];
            }
        } else {
            btn.style.display = 'none'; // Hide button if no answer
        }
    });
    
    // Display materials (used sources) for this question
    displayMaterials(question);
    
    // Display abbreviations for this question
    displayAbbreviations(question);
    
    if (nextSection) nextSection.style.display = 'none';
}

// Handle answer selection


function selectAnswer(selectedIndex) {
    if (!gameStarted) {
        return;
    }
    
    if (!shuffledQuizData || shuffledQuizData.length === 0) {
        return;
    }
    
    const question = shuffledQuizData[currentQuestionIndex];
    if (!question) {
        return;
    }
    
    const answerButtons = answersSection.querySelectorAll('.answer-btn');
    
    // Disable all buttons
    answerButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Mark user's answer
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    // Show correct answer in green
    answerButtons[question.correct].classList.add('correct');
    
    // Show incorrect answer in red if wrong
    if (selectedIndex !== question.correct) {
        answerButtons[selectedIndex].classList.add('incorrect');
        // Update score display (but don't increment score yet)
    } else {

        score++;
        if (scoreDisplay) scoreDisplay.textContent = score;
    }
    
    // Save progress after answering
    saveQuizProgress();
    
    // CRITICAL: Check session validity after answering (another device might have taken over)
    // Check multiple times to catch any device takeover
    if (gameStarted) {
        setTimeout(() => {
            checkSessionValidity().then(isValid => {
                if (!isValid) {
                    }
            });
        }, 500); // First check after 500ms
        setTimeout(() => {
            checkSessionValidity().then(isValid => {
                if (!isValid) {
                    showSessionInvalidatedError('Մեկ այլ սարք օգտագործում է այս վճարման կոդը: Թեստը դադարեցված է:');
                }
            });
        }, 1500); // Second check after 1.5 seconds
    }
    
    // Show next button
    if (nextSection) nextSection.style.display = 'block';
}

// Move to next question


function nextQuestion() {
    // Prevent double execution
    if (nextQuestion.inProgress) {
        return;
    }
    nextQuestion.inProgress = true;
    
    currentQuestionIndex++;
    loadQuestion();
    
    // Reset flag after a short delay
    setTimeout(() => {
        nextQuestion.inProgress = false;
    }, 100);
}

// Handle info button click - opens info modal


function showAnswersReview(forceRefresh = false) {
    // Prevent double execution (unless it's a forced refresh)
    if (showAnswersReview.inProgress && !forceRefresh) {
        return;
    }
    showAnswersReview.inProgress = true;
    
    const answersReview = document.getElementById('answers-review');
    const answersList = document.getElementById('answers-list');
    
    if (!answersReview || !answersList) {
        showAnswersReview.inProgress = false;
        return;
    }
    
    // Check if answers are already displayed - only toggle off if NOT a forced refresh
    if (!forceRefresh && answersReview.style.display === 'block' && answersList.innerHTML.trim() !== '') {
        // Toggle off - hide answers
        answersReview.style.display = 'none';
        // Update button text to "Դիտել պատասխանները"
        const viewAnswersBtn = document.getElementById('view-answers-btn');
        if (viewAnswersBtn) {
            viewAnswersBtn.textContent = '📋 Դիտել պատասխանները';
        }
        showAnswersReview.inProgress = false;
        return;
    }
    
    // Get all questions and answers from the current quiz set or all quiz sets
    let questionsToShow = [];
    
    if (shuffledQuizData && shuffledQuizData.length > 0 && userAnswers && userAnswers.length > 0) {
        // Show answers from current quiz set
        questionsToShow = shuffledQuizData.map((question, index) => ({
            question: question,
            userAnswer: userAnswers[index],
            questionIndex: index + 1
        }));
    } else if (quizSets && quizSets.length > 0) {
        // Show answers from all quiz sets that have been completed
        quizSets.forEach((quizSet, setIndex) => {
            if (quizSetResults[setIndex] && (quizSetResults[setIndex].correct > 0 || quizSetResults[setIndex].wrong > 0)) {
                quizSet.forEach((question, qIndex) => {
                    questionsToShow.push({
                        question: question,
                        userAnswer: null, // Can't get individual answers for completed sets
                        questionIndex: `${setIndex + 1}.${qIndex + 1}`,
                        quizSetIndex: setIndex + 1
                    });
                });
            }
        });
    }
    
    // Check if dark mode is active - prioritize localStorage, fallback to body class
    // localStorage stores 'true' or 'false' as string
    const savedDarkModeValue = localStorage.getItem('darkMode');
    const hasDarkModeClass = document.body.classList.contains('dark-mode');
    
    // isDarkMode = true means DARK MODE (need dark colors), false means LIGHT MODE (need white/light colors)
    // Priority: localStorage value > body class
    let isDarkMode = false;
    if (savedDarkModeValue === 'true') {
        isDarkMode = true;
    } else if (savedDarkModeValue === 'false') {
        isDarkMode = false;
    } else {
        // If localStorage is not set, use body class
        isDarkMode = hasDarkModeClass;
    }
    
    // Generate HTML for answers review with dark mode support
    let html = '<div style="max-width: 800px; margin: 0 auto;">';
    
    // COLOR LOGIC: 
    // If isDarkMode = true (DARK MODE) -> use DARK colors (#1a1a1a, #2a2a2a, etc.)
    // If isDarkMode = false (LIGHT MODE) -> use WHITE/LIGHT colors (#ffffff, #f9f9f9, etc.)
    
    // Question card background: DARK mode = dark (#1a1a1a), LIGHT mode = white (#ffffff)
    const questionCardBg = isDarkMode ? '#1a1a1a' : '#ffffff';
    
    // Question text color: DARK mode = light text (#e0e0e0), LIGHT mode = dark text (#1a1a1a)
    const questionTextColor = isDarkMode ? '#e0e0e0' : '#1a1a1a';
    
    // Empty message color
    const emptyTextColor = isDarkMode ? '#999' : '#666';
    
    // Materials background: DARK mode = dark (#2a2a2a), LIGHT mode = light blue (#e8f4f8)
    const materialsBg = isDarkMode ? '#2a2a2a' : '#e8f4f8';
    const materialsColor = isDarkMode ? '#b0b0b0' : '#666';
    
    // Default answer background: DARK mode = dark (#2a2a2a), LIGHT mode = white (#ffffff)
    const defaultAnswerBg = isDarkMode ? '#2a2a2a' : '#ffffff';
    const defaultBorderColor = isDarkMode ? '#444' : '#ddd';
    
    // Correct answer background: DARK mode = dark green (#1e4d2b), LIGHT mode = light green (#d4edda)
    const correctAnswerBg = isDarkMode ? '#1e4d2b' : '#d4edda';
    const correctBorderColor = '#28a745';
    
    // Wrong answer background: DARK mode = dark red (#4d2b2b), LIGHT mode = light red (#f8d7da)
    const wrongAnswerBg = isDarkMode ? '#4d2b2b' : '#f8d7da';
    const wrongBorderColor = '#dc3545';
    
    // Answer text color: DARK mode = light text (#e0e0e0), LIGHT mode = dark text (#1a1a1a)
    const answerTextColor = isDarkMode ? '#e0e0e0' : '#1a1a1a';
    
    if (questionsToShow.length === 0) {
        html += `<p style="text-align: center; color: ${emptyTextColor}; padding: 20px;">Պատասխանները դեռ հասանելի չեն:</p>`;
    } else {
        questionsToShow.forEach((item, index) => {
            const question = item.question;
            const userAnswerIndex = item.userAnswer;
            const correctAnswerIndex = question.correct;
            
            html += `<div style="margin-bottom: 30px; padding: 20px; background: ${questionCardBg}; border-radius: 10px; border-left: 4px solid #4a90e2;">`;
            html += `<div style="font-weight: bold; margin-bottom: 10px; color: ${questionTextColor};">Հարց ${item.questionIndex}: ${question.question}</div>`;
            
            if (question.materials) {
                html += `<div style="font-size: 0.9em; color: ${materialsColor}; margin-bottom: 15px; padding: 8px; background: ${materialsBg}; border-radius: 5px;">📖 ${question.materials}</div>`;
            }
            
            html += `<div style="margin-top: 15px;">`;
            question.answers.forEach((answer, ansIndex) => {
                const isCorrect = ansIndex === correctAnswerIndex;
                const isUserAnswer = userAnswerIndex !== null && ansIndex === userAnswerIndex;
                
                let bgColor = defaultAnswerBg;
                let borderColor = defaultBorderColor;
                let icon = '';
                
                if (isCorrect) {
                    bgColor = correctAnswerBg;
                    borderColor = correctBorderColor;
                    icon = '✅';
                } else if (isUserAnswer && !isCorrect) {
                    bgColor = wrongAnswerBg;
                    borderColor = wrongBorderColor;
                    icon = '❌';
                }
                
                html += `<div style="padding: 12px; margin-bottom: 8px; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 8px; display: flex; align-items: center;">`;
                html += `<span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">${String.fromCharCode(65 + ansIndex)}</span>`;
                html += `<span style="flex: 1; color: ${answerTextColor};">${answer}</span>`;
                if (icon) {
                    html += `<span style="margin-left: 10px; font-size: 1.2em;">${icon}</span>`;
                }
                html += `</div>`;
            });
            html += `</div>`;
            
            html += `</div>`;
        });
    }
    
    html += '</div>';
    
    answersList.innerHTML = html;
    answersReview.style.display = 'block';
    
    // Update button text to "Թաքցնել պատասխանները" when answers are shown
    const viewAnswersBtnForUpdate = document.getElementById('view-answers-btn');
    if (viewAnswersBtnForUpdate) {
        viewAnswersBtnForUpdate.textContent = '👁️ Թաքցնել պատասխանները';
    }
    
    // Scroll to answers review
    answersReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Reset flag after a short delay
    setTimeout(() => {
        showAnswersReview.inProgress = false;
    }, 100);
}

// Note: showResults() is defined later as async function showResults()

// Show results for current quiz set


function showQuizSetResults() {
    // Calculate results for current quiz set
    let correctCount = 0;
    let wrongCount = 0;
    
    for (let i = 0; i < shuffledQuizData.length; i++) {
        const question = shuffledQuizData[i];
        const userAnswer = userAnswers[i];
        if (userAnswer === question.correct) {
            correctCount++;
        } else if (userAnswer !== undefined) {
            wrongCount++;
        }
    }
    
    // Save results for this quiz set
    quizSetResults[currentQuizSetIndex] = {
        correct: correctCount,
        wrong: wrongCount
    };
    
    // Increment attempt for this quiz set
    const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
    const newAttempts = incrementQuizSetAttempt(quizSetNumber);
    // Track quiz complete in Google Apps Script
    trackQuizProgress('complete', quizSetNumber);
    
    // Hide quiz sections
    if (topicSection) topicSection.style.display = 'none';
    if (questionSection) questionSection.style.display = 'none';
    if (answersSection) answersSection.style.display = 'none';
    if (nextSection) nextSection.style.display = 'none';
    
    // Show results section
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) {
        return;
    }
    resultsSection.style.display = 'block';
    
    // Show quiz set results
    const quizSetResultsSection = document.getElementById('quiz-set-results-section');
    if (!quizSetResultsSection) {
        // Create results section if it doesn't exist
        createQuizSetResultsSection();
    }
    
    displayQuizSetResults(correctCount, wrongCount);
    
    // Force show next button if there are more quiz sets (backup check)
    setTimeout(() => {
        const resultsNextBtn = document.getElementById('next-quiz-set-btn');
        const resultsFinishBtn = document.getElementById('finish-all-quiz-sets-btn');
        
        if (resultsNextBtn && resultsFinishBtn) {
            const currentIndex = typeof currentQuizSetIndex === 'number' ? currentQuizSetIndex : 0;
            const totalSets = Array.isArray(quizSets) ? quizSets.length : 18;
            const hasMoreSets = currentIndex < totalSets - 1;
            
            if (hasMoreSets) {
                resultsNextBtn.style.display = 'inline-block';
                resultsNextBtn.style.visibility = 'visible';
                resultsNextBtn.style.opacity = '1';
                resultsNextBtn.style.flex = '1';
                resultsNextBtn.style.minWidth = '200px';
                resultsFinishBtn.style.display = 'none';
            }
        }
    }, 200);
}

// Create quiz set results section


function createQuizSetResultsSection() {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) {
        return;
    }
    
    // Check if already exists
    if (document.getElementById('quiz-set-results-section')) {
        return;
    }
    
    // Check dark mode using consistent helper function
    const isDarkMode = isDarkModeActive();
    
    // LIGHT mode (isDarkMode = false) = white background (#ffffff)
    // DARK mode (isDarkMode = true) = dark background (#2a2a2a)
    const initialScoreBoxBg = isDarkMode ? '#2a2a2a' : '#ffffff';
    const initialTotalTextColor = isDarkMode ? '#b0b0b0' : '#666';
    
    const quizSetResultsDiv = document.createElement('div');
    quizSetResultsDiv.id = 'quiz-set-results-section';
    quizSetResultsDiv.style.display = 'none';
    quizSetResultsDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #4a90e2; margin-bottom: 20px;">📊 Հարցաթերթիկ #<span id="quiz-set-number">1</span> ավարտված է</h2>
            <div id="quiz-set-score-box" style="background: ${initialScoreBoxBg}; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 1.2em; margin-bottom: 15px;">
                    <span style="color: #28a745; font-weight: bold;">✅ Ճիշտ: <span id="quiz-set-correct">0</span></span>
                    <span style="margin: 0 20px;">|</span>
                    <span style="color: #dc3545; font-weight: bold;">❌ Սխալ: <span id="quiz-set-wrong">0</span></span>
                </div>
                <div id="quiz-set-total-text" style="color: ${initialTotalTextColor}; font-size: 0.9em;">
                    Ընդամենը: <span id="quiz-set-total">0</span> հարց
                </div>
            </div>
            <div id="quiz-set-navigation" style="margin-top: 20px; display: none;">
                <button id="finish-all-quiz-sets-btn" class="btn-primary" style="margin: 5px; display: none;">Ավարտել Բոլոր Հարցաթերթիկները</button>
            </div>
        </div>
    `;
    
    resultsSection.insertBefore(quizSetResultsDiv, resultsSection.firstChild);
    
    // Event listeners for buttons in results-section will be added in displayQuizSetResults
}

// Display quiz set results


function displayQuizSetResults(correctCount, wrongCount) {
    const quizSetResultsSection = document.getElementById('quiz-set-results-section');
    if (!quizSetResultsSection) {
        return;
    }
    
    // Check dark mode using consistent helper function
    const isDarkMode = isDarkModeActive();
    
    // Apply dark mode colors to score summary box
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
    // This ensures CSS rules (body.dark-mode .result-item) work correctly
    const resultItems = document.querySelectorAll('.results-display .result-item');
    resultItems.forEach(item => {
        item.style.removeProperty('background');
        item.style.removeProperty('border-color');
        const label = item.querySelector('.result-label');
        if (label) label.style.removeProperty('color');
        const value = item.querySelector('.result-value');
        if (value) value.style.removeProperty('color');
    });
    
    const quizSetNumber = document.getElementById('quiz-set-number');
    const quizSetCorrect = document.getElementById('quiz-set-correct');
    const quizSetWrong = document.getElementById('quiz-set-wrong');
    const quizSetTotal = document.getElementById('quiz-set-total');
    const nextQuizSetBtn = document.getElementById('next-quiz-set-btn');
    const finishAllBtn = document.getElementById('finish-all-quiz-sets-btn');
    
    // Display quiz set number: 1-17 for first 17 tests, 18 for last test
    if (quizSetNumber) {
        if (currentQuizSetIndex < 17) {
            quizSetNumber.textContent = currentQuizSetIndex + 1;
        } else {
            quizSetNumber.textContent = 18; // Last test is the 18th test
        }
    }
    if (quizSetCorrect) quizSetCorrect.textContent = correctCount;
    if (quizSetWrong) quizSetWrong.textContent = wrongCount;
    if (quizSetTotal) quizSetTotal.textContent = correctCount + wrongCount;
    
    // Show/hide buttons based on whether there are more available quiz sets
    // Get buttons from results-section (moved from quiz-set-navigation)
    const resultsNextBtn = document.getElementById('next-quiz-set-btn');
    const resultsFinishBtn = document.getElementById('finish-all-quiz-sets-btn');
    
    // Always show button if buttons exist - simpler logic
    if (resultsNextBtn && resultsFinishBtn) {
        // Check if there are more quiz sets (simple check - if not the last quiz set)
        // Make sure currentQuizSetIndex is a valid number
        const currentIndex = typeof currentQuizSetIndex === 'number' ? currentQuizSetIndex : 0;
        const totalSets = Array.isArray(quizSets) ? quizSets.length : 18;
        const hasMoreSets = currentIndex < totalSets - 1;
        
        if (hasMoreSets) {
            // Show "Հաջորդ Հարցաթերթիկ" button next to "Կրկնել Հարցաթերթիկը"
            resultsNextBtn.style.display = 'inline-block';
            resultsNextBtn.style.flex = '1';
            resultsNextBtn.style.minWidth = '200px';
            resultsFinishBtn.style.display = 'none';
        } else {
            // Show "Ավարտել Բոլոր Հարցաթերթիկները" button if this is the last quiz set
            resultsNextBtn.style.display = 'none';
            resultsFinishBtn.style.display = 'inline-block';
            resultsFinishBtn.style.flex = '1';
            resultsFinishBtn.style.minWidth = '200px';
        }
        
        // Add event listeners if not already added
        if (!resultsNextBtn.hasAttribute('data-listener-added')) {
            resultsNextBtn.addEventListener('click', startNextQuizSet);
            resultsNextBtn.setAttribute('data-listener-added', 'true');
            }
        if (!resultsFinishBtn.hasAttribute('data-listener-added')) {
            resultsFinishBtn.addEventListener('click', showAllResults);
            resultsFinishBtn.setAttribute('data-listener-added', 'true');
            }
    } else {
        }
    
    // Also update the old buttons in quiz-set-navigation (for backward compatibility)
    if (nextQuizSetBtn && finishAllBtn) {
        nextQuizSetBtn.style.display = 'none';
        finishAllBtn.style.display = 'none';
    }
    
    quizSetResultsSection.style.display = 'block';
    
    // Ensure results section is visible
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        } else {
        }
    
    // Update final score and percentage display in results section
    // Calculate total score across all completed quiz sets
    let totalCorrect = 0;
    let totalWrong = 0;
    for (let i = 0; i <= currentQuizSetIndex; i++) {
        if (quizSetResults[i]) {
            totalCorrect += quizSetResults[i].correct;
            totalWrong += quizSetResults[i].wrong;
        }
    }
    
    const totalQuestions = totalCorrect + totalWrong;
    
    // Update immediately and also with setTimeout as fallback
    const updateScoreDisplay = () => {
        const finalScore = document.getElementById('final-score');
        const finalTotal = document.getElementById('final-total');
        const resultsPercentage = document.getElementById('final-percentage');
        
        if (finalScore) {
            finalScore.textContent = totalCorrect;
            } else {
            }
        if (finalTotal) {
            finalTotal.textContent = totalQuestions;
            } else {
            }
        if (resultsPercentage) {
            if (totalQuestions > 0) {
                const percentage = Math.round((totalCorrect / totalQuestions) * 100);
                resultsPercentage.textContent = `${percentage}%`;
        } else {
            resultsPercentage.textContent = '0%';
            }
        } else {
            }
    };
    
    // Try immediately
    updateScoreDisplay();
    
    // Also try with setTimeout as fallback
    setTimeout(updateScoreDisplay, 100);
    setTimeout(updateScoreDisplay, 500);
    
    }

// Start next quiz set


function startNextQuizSet() {
    currentQuizSetIndex++;
    
    if (currentQuizSetIndex >= quizSets.length) {
        showAllResults();
        return;
    }
    
    // Load next quiz set
    shuffledQuizData = [...quizSets[currentQuizSetIndex]];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Update attempts display for the new quiz set
    const quizSetNumber = currentQuizSetIndex < 17 ? currentQuizSetIndex + 1 : 18;
    const attempts = getQuizSetAttempts(quizSetNumber.toString());
    updateAttemptsDisplay(attempts);
    
    // Hide results, show quiz
    const quizSetResultsSection = document.getElementById('quiz-set-results-section');
    if (quizSetResultsSection) {
        quizSetResultsSection.style.display = 'none';
    }
    
    // Hide results section (score and percentage) when starting new quiz set
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    if (topicSection) topicSection.style.display = 'block';
    if (questionSection) questionSection.style.display = 'block';
    if (answersSection) answersSection.style.display = 'flex';
    if (nextSection) nextSection.style.display = 'none';
    
    loadQuestion();
}

// Show all quiz sets results


function showAllResults() {
    // Calculate total results
    let totalCorrect = 0;
    let totalWrong = 0;
    
    quizSetResults.forEach(result => {
        totalCorrect += result.correct;
        totalWrong += result.wrong;
    });
    
    // Hide quiz set results
    const quizSetResultsSection = document.getElementById('quiz-set-results-section');
    if (quizSetResultsSection) {
        quizSetResultsSection.style.display = 'none';
    }
    
    // Show final results
    score = totalCorrect;
    const totalQuestions = totalCorrect + totalWrong;
    
    // Update final score and percentage display
    const finalScore = document.getElementById('final-score');
    const finalTotal = document.getElementById('final-total');
    const resultsPercentage = document.getElementById('final-percentage');
    
    if (finalScore) {
        finalScore.textContent = totalCorrect;
    }
    if (finalTotal) {
        finalTotal.textContent = totalQuestions;
    }
    if (resultsPercentage && totalQuestions > 0) {
        const percentage = Math.round((totalCorrect / totalQuestions) * 100);
        resultsPercentage.textContent = `${percentage}%`;
        
        if (percentage === 100) {
            resultsPercentage.textContent += ' - Գերազանց!';
        } else if (percentage >= 70) {
            resultsPercentage.textContent += ' - Լավ արդյունք!';
        } else if (percentage >= 50) {
            resultsPercentage.textContent += ' - Միջին արդյունք';
        } else {
            resultsPercentage.textContent += ' - Կարող եք ավելի լավ անել';
        }
    }
    
    userAnswers = []; // Clear for final results display
    shuffledQuizData = []; // Clear for final results display
    
    showResults();
}

// Collect device information



// ============================================
// EXPORTS
// ============================================

// Expose functions to window (if needed by other modules or HTML onclick attributes)
if (typeof window !== 'undefined') {
    window.initGame = initGame;
    window.startQuiz = startQuiz;
    window.nextQuestion = nextQuestion;
    window.showAnswersReview = showAnswersReview;
    window.repeatQuiz = repeatQuiz;
    window.startNextQuizSet = startNextQuizSet;
    window.showAllResults = showAllResults;
    window.copyToClipboard = copyToClipboard;
    
    // Utility functions (if needed)
    window.shuffleArray = shuffleArray;
    window.extractMaterials = extractMaterials;
    window.cleanAnswerText = cleanAnswerText;
    window.displayMaterials = displayMaterials;
    window.findAbbreviations = findAbbreviations;
    window.displayAbbreviations = displayAbbreviations;
    window.findNextAvailableQuizSet = findNextAvailableQuizSet;
    window.updateExhaustedQuizSetsDisplay = updateExhaustedQuizSetsDisplay;
}
