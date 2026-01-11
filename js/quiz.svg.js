"use strict";

// ============================================
// SVG ANIMATION MODULE
// ============================================

// Draw face outline using SVG path - realistic continuous line art style
function drawFaceOutline(svgElement) {
    // Clear previous paths
    svgElement.innerHTML = '';
    
    // Add style definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
        .face-outline {
            fill: none;
            stroke: #ffffff;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
            animation: drawFace 4s ease-in-out forwards;
        }
        @keyframes drawFace {
            to {
                stroke-dashoffset: 0;
            }
        }
    `;
    defs.appendChild(style);
    svgElement.appendChild(defs);
    
    // Create realistic face outline path (continuous line art style)
    const centerX = 125;
    const centerY = 125;
    const faceWidth = 90;
    const faceHeight = 130;
    
    // Realistic face outline - continuous line starting from top of head
    const facePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const faceOutline = `M ${centerX} ${centerY - faceHeight/2}
                         Q ${centerX - faceWidth/3} ${centerY - faceHeight/2.5} ${centerX - faceWidth/2.2} ${centerY - faceHeight/4}
                         Q ${centerX - faceWidth/2} ${centerY - faceHeight/6} ${centerX - faceWidth/2.5} ${centerY}
                         Q ${centerX - faceWidth/2.2} ${centerY + faceHeight/4} ${centerX - faceWidth/2.5} ${centerY + faceHeight/2.5}
                         Q ${centerX - faceWidth/4} ${centerY + faceHeight/2} ${centerX} ${centerY + faceHeight/2.2}
                         Q ${centerX + faceWidth/4} ${centerY + faceHeight/2} ${centerX + faceWidth/2.5} ${centerY + faceHeight/2.5}
                         Q ${centerX + faceWidth/2.2} ${centerY + faceHeight/4} ${centerX + faceWidth/2.5} ${centerY}
                         Q ${centerX + faceWidth/2} ${centerY - faceHeight/6} ${centerX + faceWidth/2.2} ${centerY - faceHeight/4}
                         Q ${centerX + faceWidth/3} ${centerY - faceHeight/2.5} ${centerX} ${centerY - faceHeight/2}
                         Z`;
    
    facePath.setAttribute('d', faceOutline);
    facePath.setAttribute('class', 'face-outline');
    svgElement.appendChild(facePath);
    
    // Left eyebrow
    const leftEyebrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const eyebrowLeft = `M ${centerX - 35} ${centerY - 35}
                         Q ${centerX - 25} ${centerY - 38} ${centerX - 15} ${centerY - 35}`;
    leftEyebrow.setAttribute('d', eyebrowLeft);
    leftEyebrow.setAttribute('class', 'face-outline');
    svgElement.appendChild(leftEyebrow);
    
    // Right eyebrow
    const rightEyebrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const eyebrowRight = `M ${centerX + 15} ${centerY - 35}
                          Q ${centerX + 25} ${centerY - 38} ${centerX + 35} ${centerY - 35}`;
    rightEyebrow.setAttribute('d', eyebrowRight);
    rightEyebrow.setAttribute('class', 'face-outline');
    svgElement.appendChild(rightEyebrow);
    
    // Left eye (more realistic almond shape)
    const leftEye = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const eyeLeft = `M ${centerX - 30} ${centerY - 20}
                     Q ${centerX - 25} ${centerY - 25} ${centerX - 20} ${centerY - 20}
                     Q ${centerX - 25} ${centerY - 15} ${centerX - 30} ${centerY - 20}`;
    leftEye.setAttribute('d', eyeLeft);
    leftEye.setAttribute('class', 'face-outline');
    svgElement.appendChild(leftEye);
    
    // Right eye (more realistic almond shape)
    const rightEye = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const eyeRight = `M ${centerX + 20} ${centerY - 20}
                      Q ${centerX + 25} ${centerY - 25} ${centerX + 30} ${centerY - 20}
                      Q ${centerX + 25} ${centerY - 15} ${centerX + 20} ${centerY - 20}`;
    rightEye.setAttribute('d', eyeRight);
    rightEye.setAttribute('class', 'face-outline');
    svgElement.appendChild(rightEye);
    
    // Nose (more realistic with bridge and nostrils)
    const nosePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const nose = `M ${centerX} ${centerY - 15}
                  L ${centerX} ${centerY + 5}
                  Q ${centerX - 5} ${centerY + 15} ${centerX - 8} ${centerY + 20}
                  M ${centerX} ${centerY + 5}
                  Q ${centerX + 5} ${centerY + 15} ${centerX + 8} ${centerY + 20}`;
    nosePath.setAttribute('d', nose);
    nosePath.setAttribute('class', 'face-outline');
    svgElement.appendChild(nosePath);
    
    // Mouth (more realistic with upper and lower lip)
    const mouthPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mouth = `M ${centerX - 18} ${centerY + 35}
                   Q ${centerX - 10} ${centerY + 38} ${centerX} ${centerY + 38}
                   Q ${centerX + 10} ${centerY + 38} ${centerX + 18} ${centerY + 35}
                   M ${centerX - 18} ${centerY + 35}
                   Q ${centerX} ${centerY + 42} ${centerX + 18} ${centerY + 35}`;
    mouthPath.setAttribute('d', mouth);
    mouthPath.setAttribute('class', 'face-outline');
    svgElement.appendChild(mouthPath);
    
    // Jawline definition
    const jawline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const jaw = `M ${centerX - faceWidth/2.5} ${centerY + faceHeight/2.5}
                 Q ${centerX - faceWidth/4} ${centerY + faceHeight/2.2} ${centerX} ${centerY + faceHeight/2.2}
                 Q ${centerX + faceWidth/4} ${centerY + faceHeight/2.2} ${centerX + faceWidth/2.5} ${centerY + faceHeight/2.5}`;
    jawline.setAttribute('d', jaw);
    jawline.setAttribute('class', 'face-outline');
    svgElement.appendChild(jawline);
    
    // Neck and shoulders
    const neckPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const neck = `M ${centerX - faceWidth/3} ${centerY + faceHeight/2.2}
                  L ${centerX - 25} ${centerY + faceHeight/1.5}
                  L ${centerX - 40} ${centerY + faceHeight/1.3}
                  M ${centerX + faceWidth/3} ${centerY + faceHeight/2.2}
                  L ${centerX + 25} ${centerY + faceHeight/1.5}
                  L ${centerX + 40} ${centerY + faceHeight/1.3}
                  M ${centerX - 40} ${centerY + faceHeight/1.3}
                  Q ${centerX} ${centerY + faceHeight/1.2} ${centerX + 40} ${centerY + faceHeight/1.3}`;
    neckPath.setAttribute('d', neck);
    neckPath.setAttribute('class', 'face-outline');
    svgElement.appendChild(neckPath);
}

// Expose function to window (if needed)
if (typeof window !== 'undefined') {
    window.drawFaceOutline = drawFaceOutline;
}


