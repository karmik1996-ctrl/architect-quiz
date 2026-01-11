"use strict";

// ============================================
// TRACKING MODULE
// ============================================
// Handles device info, location, and tracking data submission

// Device info
function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    
    let deviceType = 'Desktop';
    if (isMobile) deviceType = 'Mobile';
    else if (isTablet) deviceType = 'Tablet';
    
    // Browser detection
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    
    // OS detection
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    return {
        deviceType: deviceType,
        browser: browser,
        os: os,
        userAgent: ua,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        language: navigator.language,
        platform: navigator.platform
    };
}

// Get user location (IP-based, approximate)
async function getUserLocation() {
    try {
        // Try to get precise location if user allows
        if (navigator.geolocation) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Get precise location with city info from IP
                        getIPLocation().then(ipData => {
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                country: ipData.country || 'Unknown',
                                city: ipData.city || 'Unknown',
                                region: ipData.region || 'Unknown',
                                source: 'geolocation'
                            });
                        });
                    },
                    () => {
                        // If geolocation fails, try IP-based location
                        getIPLocation().then(resolve);
                    },
                    { 
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });
        } else {
            // Fallback to IP-based location
            return await getIPLocation();
        }
    } catch (error) {
        return await getIPLocation();
    }
}

// Get approximate location from IP (with multiple fallback services)
async function getIPLocation() {
    // Try multiple IP geolocation services for better accuracy
    const services = [
        {
            url: 'https://ipapi.co/json/',
            parse: (data) => ({
                country: data.country_name || data.country || 'Unknown',
                city: data.city || 'Unknown',
                region: data.region || data.region_name || 'Unknown',
                latitude: data.latitude || null,
                longitude: data.longitude || null,
                ip: data.ip || 'Unknown'
            })
        },
        {
            url: 'https://ip-api.com/json/',
            parse: (data) => ({
                country: data.country || 'Unknown',
                city: data.city || 'Unknown',
                region: data.regionName || 'Unknown',
                latitude: data.lat || null,
                longitude: data.lon || null,
                ip: data.query || 'Unknown'
            })
        },
        {
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
            parse: (data) => ({
                country: data.country_name || 'Unknown',
                city: data.city || 'Unknown',
                region: data.state_prov || 'Unknown',
                latitude: data.latitude || null,
                longitude: data.longitude || null,
                ip: data.ip || 'Unknown'
            })
        }
    ];

    // Try each service until one works
    for (const service of services) {
        try {
            const response = await fetch(service.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const location = service.parse(data);
                return {
                    ...location,
                    source: 'ip-api'
                };
            }
        } catch (error) {
            continue;
        }
    }

    // If all services fail, return default
    return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        latitude: null,
        longitude: null,
        ip: 'Unknown',
        source: 'error'
    };
}

// Send tracking data to server
async function sendTrackingData(userData) {
    try {
        // Google Apps Script Web App URL
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw-3sJlF6BZwja_BrvRESuaEX_Hydi0heHTDIn8hmYfLS9TS1yTx689Rz0_CVr0iRbaHw/exec';
        
        if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            return;
        }
        
        // Method 1: Try JSON POST (no-cors)
        fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: userData.timestamp || new Date().toISOString(),
                name: userData.name || 'Անանուն',
                score: userData.score || 0,
                totalQuestions: userData.totalQuestions || 0,
                percentage: userData.percentage || 0,
                deviceType: userData.deviceInfo?.deviceType || 'Unknown',
                browser: userData.deviceInfo?.browser || 'Unknown',
                os: userData.deviceInfo?.os || 'Unknown',
                city: userData.location?.city || 'Unknown',
                country: userData.location?.country || 'Unknown'
            })
        }).then(() => {
            // Success
        }).catch((error) => {
            // Ignore errors
        });
        
        // Method 2: Try GET request (image tag - always works)
        const img = document.createElement('img');
        const params = new URLSearchParams();
        params.append('timestamp', userData.timestamp || new Date().toISOString());
        params.append('name', userData.name || 'Անանուն');
        params.append('score', userData.score || 0);
        params.append('totalQuestions', userData.totalQuestions || 0);
        params.append('percentage', userData.percentage || 0);
        params.append('deviceType', userData.deviceInfo?.deviceType || 'Unknown');
        params.append('browser', userData.deviceInfo?.browser || 'Unknown');
        params.append('os', userData.deviceInfo?.os || 'Unknown');
        params.append('city', userData.location?.city || 'Unknown');
        params.append('country', userData.location?.country || 'Unknown');
        
        img.src = WEB_APP_URL + '?' + params.toString();
        img.style.display = 'none';
        document.body.appendChild(img);
        
        // Remove after 1 second
        setTimeout(() => {
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
        }, 1000);
    } catch (error) {
        // Ignore errors
    }
}

// Track quiz progress (requires PAYMENT_WEB_APP_URL from quiz.payment.js)
async function trackQuizProgress(eventType, quizSetNumber) {
    try {
        const paymentCode = localStorage.getItem('paymentCode') || '';
        const userName = typeof currentQuestionIndex !== 'undefined' ? 
            (document.getElementById('user-name')?.value.trim() || 'Անանուն') : 'Անանուն';
        const currentQuestion = typeof currentQuestionIndex !== 'undefined' ? currentQuestionIndex : 0;
        const totalQuestions = typeof shuffledQuizData !== 'undefined' && shuffledQuizData ? shuffledQuizData.length : 0;
        const currentScore = typeof score !== 'undefined' ? score : 0;
        
        if (!paymentCode) {
            return;
        }
        
        // Check if PAYMENT_WEB_APP_URL is available (from quiz.payment.js)
        if (typeof PAYMENT_WEB_APP_URL === 'undefined') {
            return;
        }
        
        // Send to Google Apps Script using JSONP (more reliable than POST with no-cors)
        const callbackName = 'handleTrackQuizProgress' + Date.now();
        const params = new URLSearchParams({
            action: 'trackQuizProgress',
            paymentCode: paymentCode,
            eventType: eventType,
            userName: userName,
            quizSetNumber: quizSetNumber || 0,
            currentQuestion: currentQuestion,
            totalQuestions: totalQuestions,
            score: currentScore,
            timestamp: new Date().toISOString(),
            callback: callbackName
        });
        
        return new Promise((resolve, reject) => {
            window[callbackName] = function(result) {
                // Clean up
                delete window[callbackName];
                const scripts = document.querySelectorAll('script[src*="trackQuizProgress"]');
                scripts.forEach(script => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                });
                
                if (result && result.success) {
                    resolve(result);
                } else {
                    resolve(result); // Don't reject, just log error
                }
            };
            
            const script = document.createElement('script');
            script.src = PAYMENT_WEB_APP_URL + '?' + params.toString();
            script.onerror = function() {
                delete window[callbackName];
                resolve({ success: false, error: 'Script load error' }); // Don't reject
            };
            document.body.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    resolve({ success: false, error: 'Request timeout' }); // Don't reject
                }
            }, 10000);
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Expose functions to window (if needed by other modules)
if (typeof window !== 'undefined') {
    window.getDeviceInfo = getDeviceInfo;
    window.getUserLocation = getUserLocation;
    window.getIPLocation = getIPLocation;
    window.sendTrackingData = sendTrackingData;
    window.trackQuizProgress = trackQuizProgress;
}

