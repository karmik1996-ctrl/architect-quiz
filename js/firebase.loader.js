"use strict";

/**
 * Firebase SDK Loader
 * Dynamically loads Firebase SDK scripts and ensures they're ready before initialization
 */

const FIREBASE_SDK_VERSION = '8.10.1';
const FIREBASE_SCRIPTS = [
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore-compat.js`
];

/**
 * Load a script dynamically
 * @param {string} src - Script source URL
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script already loaded
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            // Script already exists, check if it's loaded
            if (existingScript.getAttribute('data-loaded') === 'true') {
                resolve();
                return;
            }
            // Wait for existing script to load
            existingScript.addEventListener('load', () => {
                existingScript.setAttribute('data-loaded', 'true');
                resolve();
            });
            existingScript.addEventListener('error', reject);
            return;
        }
        
        // Create new script element
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Load synchronously to maintain order
        script.setAttribute('data-firebase-sdk', 'true');
        
        script.onload = () => {
            script.setAttribute('data-loaded', 'true');
            console.log(`✅ Loaded: ${src}`);
            resolve();
        };
        
        script.onerror = () => {
            console.error(`❌ Failed to load: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        
        // Append to head or body
        const target = document.head || document.body;
        target.appendChild(script);
    });
}

/**
 * Load all Firebase SDK scripts in order
 * @returns {Promise<void>}
 */
async function loadFirebaseSDK() {
    try {
        console.log('🔄 Loading Firebase SDK scripts...');
        
        // Load scripts sequentially (important for dependencies)
        for (const scriptSrc of FIREBASE_SCRIPTS) {
            await loadScript(scriptSrc);
        }
        
        // Wait a bit for scripts to execute and create global object
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify Firebase SDK is available
        if (typeof firebase !== 'undefined' || (typeof window !== 'undefined' && window.firebase)) {
            console.log('✅ Firebase SDK loaded successfully');
            return true;
        } else {
            console.warn('⚠️ Firebase SDK scripts loaded but global object not found');
            // Try waiting a bit more
            await new Promise(resolve => setTimeout(resolve, 500));
            if (typeof firebase !== 'undefined' || (typeof window !== 'undefined' && window.firebase)) {
                console.log('✅ Firebase SDK loaded after delay');
                return true;
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading Firebase SDK:', error);
        return false;
    }
}

/**
 * Check if Firebase SDK is already loaded (from static script tags)
 * @returns {boolean}
 */
function isFirebaseSDKAlreadyLoaded() {
    // Check if scripts are already in DOM
    const existingScripts = document.querySelectorAll('script[src*="firebasejs"]');
    if (existingScripts.length >= 3) {
        // Scripts exist, check if firebase object is available
        if (typeof firebase !== 'undefined' || (typeof window !== 'undefined' && window.firebase)) {
            return true;
        }
    }
    return false;
}

// Auto-load Firebase SDK if not already loaded
if (typeof window !== 'undefined') {
    // Check if already loaded
    if (isFirebaseSDKAlreadyLoaded()) {
        console.log('✅ Firebase SDK already loaded from static scripts');
    } else {
        // Load dynamically
        loadFirebaseSDK().then(loaded => {
            if (loaded) {
                // Dispatch event that Firebase SDK is ready
                window.dispatchEvent(new Event('firebaseSDKLoaded'));
            } else {
                console.error('❌ Firebase SDK failed to load');
            }
        });
    }
    
    // Expose loader function
    window.loadFirebaseSDK = loadFirebaseSDK;
    window.isFirebaseSDKAlreadyLoaded = isFirebaseSDKAlreadyLoaded;
}



