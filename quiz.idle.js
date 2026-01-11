"use strict";

// ============================================
// IDLE ANIMATION MODULE
// ============================================
// Shows animated titles when user is idle for 1 minute 30 seconds

let idleTimer = null;
let idleAnimationActive = false;
const IDLE_TIMEOUT = 90000; // 90 seconds (1 minute 30 seconds)

// Collect all headings for animation - Great architects' powerful quotes with their images and names
const idleArchitects = [
    {
        quote: 'Ճարտարապետությունը սկսվում է այնտեղ, որտեղ ավարտվում է ինժեներությունը',
        name: 'Վալտեր Գրոպիուս',
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/WalterGropius-1919.jpg'
    },
    {
        quote: 'Ճարտարապետությունը արվեստ է, որը կազմակերպում է տարածությունը',
        name: 'Լե Կորբյուզիե',
        image: 'https://api.interior.ru/media/images/ARHITEKTURA/NAME/Le_Corbusier_9_12/obl_le-corbusier2.jpg'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի պարզ, բայց ոչ պարզունակ',
        name: 'Լյուդվիգ Միս վան դեր Ռոե',
        image: 'https://losko.ru/wp-content/uploads/2018/04/Mies-Van-Der-Rohe-02-1660x1333.jpg'
    },
    {
        quote: 'Ճարտարապետությունը ձև է, ոչ թե ֆունկցիա',
        name: 'Լուիս Սալիվան',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCzf2wMRKm9UDG69jTemMmf2WIhWJ2tSPZ8A&s'
    },
    {
        quote: 'Ճարտարապետությունը պետք է արտահայտի ժամանակը, ոչ թե հետևի նրան',
        name: 'Ֆրենկ Լլոյդ Ռայթ',
        image: 'https://avatars.mds.yandex.net/get-kinopoisk-image/1777765/f7f28303-4740-45d4-b64f-5f713f4329ad/220x330'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի մարդու համար, ոչ թե մարդը ճարտարապետության համար',
        name: 'Ալվար Աալտո',
        image: 'https://architime.ru/pictures/aaltoalvar/big_portret.gif'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի բնական, ոչ թե արհեստական',
        name: 'Անտոնիո Գաուդի',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Antoni_Gaudi_1878.jpg'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի հավերժական, ոչ թե ժամանակավոր',
        name: 'Օսկար Նիմեյեր',
        image: 'https://www.architectmagazine.com/wp-content/uploads/sites/5/2012/299875760-oscar-20niemeyer-tcm20-1712627.jpg?w=394'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի գեղեցիկ, բայց նաև գործնական',
        name: 'Նորման Ֆոստեր',
        image: 'https://www.architime.ru/pictures/norman_foster/portrel_big.gif'
    },
    {
        quote: 'Ճարտարապետությունը պետք է լինի նորարարական, բայց նաև հարգալից',
        name: 'Զահա Հադիդ',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Zaha_Hadid_in_Heydar_Aliyev_Cultural_center_in_Baku_nov_2013.jpg'
    }
];

// Track user activity
function resetIdleTimer() {
    if (idleAnimationActive) {
        stopIdleAnimation();
    }
    
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        startIdleAnimation();
    }, IDLE_TIMEOUT);
}

// Start idle animation
function startIdleAnimation() {
    if (idleAnimationActive) return;
    
    idleAnimationActive = true;
    
    const overlay = document.getElementById('idle-animation-overlay');
    const titleContainer = document.getElementById('idle-title-container');
    const title1 = document.getElementById('idle-title-1');
    const title2 = document.getElementById('idle-title-2');
    const architectImage = document.getElementById('idle-architect-image');
    
    if (!overlay || !titleContainer || !title1 || !title2 || !architectImage) {
        return;
    }
    
    // Show overlay with darkening effect
    overlay.style.display = 'block';
    
    // Cycle through architects
    let currentArchitectIndex = 0;
    
    function showNextArchitect() {
        if (!idleAnimationActive) return;
        
        const architect = idleArchitects[currentArchitectIndex % idleArchitects.length];
        currentArchitectIndex++;
        
        // Background images removed - full black screen except text
        overlay.style.background = 'rgba(0, 0, 0, 1)'; // Full black screen
        overlay.style.backgroundImage = 'none';
        overlay.style.filter = 'none';
        overlay.style.transform = 'none';
        
        // Set titles - First title is the quote, second is the architect's name
        title1.textContent = architect.quote;
        title2.textContent = architect.name;
        
        // Set architect portrait image - circular, below the name
        const imageUrl = architect.image;
        
        // Reset image
        architectImage.src = '';
        architectImage.alt = architect.name;
        architectImage.style.display = 'block';
        architectImage.style.visibility = 'visible';
        architectImage.style.opacity = '0';
        architectImage.style.transform = 'scale(0.8)';
        
        // Load image - try multiple strategies with better fallbacks for Le Corbusier
        const tryLoadImage = (url, onSuccess, onError, attempt = 1) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Set timeout for each attempt (8 seconds for slower URLs like interior.ru)
            let timeout;
            
            const cleanup = () => {
                if (timeout) clearTimeout(timeout);
            };
            
            img.onload = function() {
                cleanup();
                architectImage.src = url;
                if (onSuccess) onSuccess();
            };
            
            img.onerror = function() {
                cleanup();
                // Error loading image, trying fallback
                if (attempt === 1) {
                    // Try corsproxy.io first (good for api.interior.ru)
                    tryLoadImage(`https://corsproxy.io/?${encodeURIComponent(url)}`, onSuccess, onError, 2);
                } else if (attempt === 2) {
                    // Try images.weserv.nl (good for all URLs)
                    tryLoadImage(`https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg`, onSuccess, onError, 3);
                } else if (attempt === 3) {
                    // Try api.allorigins.win
                    tryLoadImage(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, onSuccess, onError, 4);
                } else if (attempt === 4) {
                    // Last try: images.weserv.nl without output parameter
                    tryLoadImage(`https://images.weserv.nl/?url=${encodeURIComponent(url)}`, onSuccess, onError, 5);
                } else {
                    if (onError) onError();
                }
            };
            
            timeout = setTimeout(() => {
                if (!img.complete) {
                    // Image load timeout
                    img.onerror();
                }
            }, 8000); // Increased timeout for interior.ru
            
            img.src = url;
        };
        
        // Start loading with direct URL
        tryLoadImage(imageUrl);
        
        title1.style.display = 'block';
        title1.style.opacity = '0';
        title1.style.transform = 'scale(0.5) translateY(50px)';
        title1.style.filter = 'blur(10px)';
        title1.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out, filter 1s ease-in-out';
        
        if (title2.textContent) {
            title2.style.display = 'block';
            title2.style.opacity = '0';
            title2.style.transform = 'scale(0.5) translateY(50px)';
            title2.style.filter = 'blur(10px)';
            title2.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out, filter 1s ease-in-out';
        }
        
        // Animate in - use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (!idleAnimationActive) return;
                
                // Show quote first - ABSOLUTE MAXIMUM CLARITY - NO BLUR AT ALL - FOREGROUND
                title1.style.opacity = '1';
                title1.style.transform = 'scale(1) translateY(0) translateZ(100px)';
                title1.style.filter = 'none';
                title1.style.webkitFilter = 'none';
                title1.style.setProperty('filter', 'none', 'important');
                title1.style.setProperty('-webkit-filter', 'none', 'important');
                title1.style.setProperty('backdrop-filter', 'none', 'important');
                title1.style.setProperty('z-index', '999999', 'important');
                title1.style.setProperty('transform', 'scale(1) translateY(0) translateZ(100px)', 'important');
                title1.style.setProperty('will-change', 'transform, opacity', 'important');
                
                if (title2.textContent) {
                    setTimeout(() => {
                        if (!idleAnimationActive) return;
                        // Show name - ABSOLUTE MAXIMUM CLARITY - NO BLUR AT ALL - FOREGROUND
                        title2.style.opacity = '1';
                        title2.style.transform = 'scale(1) translateY(0) translateZ(100px)';
                        title2.style.filter = 'none';
                        title2.style.webkitFilter = 'none';
                        title2.style.setProperty('filter', 'none', 'important');
                        title2.style.setProperty('-webkit-filter', 'none', 'important');
                        title2.style.setProperty('backdrop-filter', 'none', 'important');
                        title2.style.setProperty('z-index', '999999', 'important');
                        title2.style.setProperty('transform', 'scale(1) translateY(0) translateZ(100px)', 'important');
                        title2.style.setProperty('will-change', 'transform, opacity', 'important');
                        
                        // Then show architect image below the name
                        setTimeout(() => {
                            if (!idleAnimationActive) return;
                            
                            if (architectImage && architectImage.src && architectImage.src !== '') {
                                architectImage.style.opacity = '1';
                                architectImage.style.transform = 'scale(1)';
                                architectImage.style.transition = 'all 1.5s ease-in-out';
                            }
                        }, 500);
                    }, 500);
                }
            }, 300);
        });
        
        // Hold for 8 seconds (longer display), then fade out slowly
        setTimeout(() => {
            if (!idleAnimationActive) return;
            
            // Fade out architect image first
            if (architectImage) {
                architectImage.style.opacity = '0';
                architectImage.style.transform = 'scale(0.8)';
            }
            
            title1.style.opacity = '0';
            title1.style.transform = 'scale(1.1) translateY(-20px)';
            title1.style.filter = 'blur(8px)';
            title1.style.transition = 'all 2s ease-in-out';
            
            if (title2.textContent) {
                title2.style.opacity = '0';
                title2.style.transform = 'scale(1.1) translateY(-20px)';
                title2.style.filter = 'blur(8px)';
                title2.style.transition = 'all 2s ease-in-out';
            }
            
            // Show next architect after fade out
            setTimeout(() => {
                if (idleAnimationActive) {
                    showNextArchitect();
                }
            }, 2000);
        }, 8000);
    }
    
    // Start animation cycle
    showNextArchitect();
}

// Stop idle animation
function stopIdleAnimation() {
    if (!idleAnimationActive) return;
    
    idleAnimationActive = false;
    
    const overlay = document.getElementById('idle-animation-overlay');
    const title1 = document.getElementById('idle-title-1');
    const title2 = document.getElementById('idle-title-2');
    
    if (overlay) {
        overlay.style.background = 'rgba(0, 0, 0, 1)'; // Full black screen
        overlay.style.backgroundImage = 'none';
        overlay.style.filter = 'none'; // Reset blur when stopping animation
        overlay.style.transform = 'none'; // Reset scale when stopping animation
        setTimeout(() => {
            overlay.style.display = 'none';
            if (title1) {
                title1.style.opacity = '0';
                title1.style.transform = 'scale(0.5)';
                title1.style.filter = 'blur(10px)';
            }
            if (title2) {
                title2.style.opacity = '0';
                title2.style.transform = 'scale(0.5)';
                title2.style.filter = 'blur(10px)';
            }
        }, 500);
    }
    
    resetIdleTimer();
}

// Initialize idle detection
function initIdleDetection() {
    // Reset timer on any user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
    
    events.forEach(event => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
        window.addEventListener(event, resetIdleTimer, { passive: true });
    });
    
    // Start the timer
    resetIdleTimer();
}

// Expose functions to window (if needed by other modules)
if (typeof window !== 'undefined') {
    window.resetIdleTimer = resetIdleTimer;
    window.startIdleAnimation = startIdleAnimation;
    window.stopIdleAnimation = stopIdleAnimation;
    window.initIdleDetection = initIdleDetection;
}

