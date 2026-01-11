// Production Build Script - Removes debug code and minifies
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
const outputPath = path.join(__dirname, 'script.production.js');

console.log('🔒 Creating production build...');

let code = fs.readFileSync(scriptPath, 'utf8');

// Remove all console.log, console.warn, console.debug (keep console.error for critical errors)
code = code.replace(/console\.(log|warn|debug)\s*\([^)]*\);?\s*/g, '');

// Remove multi-line console statements
code = code.replace(/console\.(log|warn|debug)\s*\([^)]*\)\s*;?\s*/gs, '');

// Remove debug comments
code = code.replace(/\/\/\s*(DEBUG|TEST|TODO|FIXME|HACK|XXX|NOTE|WARNING).*$/gm, '');
code = code.replace(/\/\*\s*(DEBUG|TEST|TODO|FIXME|HACK|XXX|NOTE|WARNING)[^*]*\*\//gs, '');

// Remove test functions (functions that contain 'test' in name and are only for testing)
code = code.replace(/function\s+\w*[Tt]est\w*\s*\([^)]*\)\s*\{[^}]*\}/g, '');
code = code.replace(/const\s+\w*[Tt]est\w*\s*=\s*function[^}]*\}/g, '');
code = code.replace(/const\s+\w*[Tt]est\w*\s*=\s*\([^)]*\)\s*=>[^}]*\}/g, '');

// Remove idle-test and debug-page references
code = code.replace(/idle-test|debug-page/gi, '');

// Remove empty lines (more than 2 consecutive)
code = code.replace(/\n{3,}/g, '\n\n');

// Remove trailing whitespace
code = code.replace(/[ \t]+$/gm, '');

// Write production file
fs.writeFileSync(outputPath, code, 'utf8');

console.log('✅ Production build created: script.production.js');
console.log(`📊 Original size: ${(fs.statSync(scriptPath).size / 1024).toFixed(2)} KB`);
console.log(`📊 Production size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
console.log(`📉 Size reduction: ${((1 - fs.statSync(outputPath).size / fs.statSync(scriptPath).size) * 100).toFixed(1)}%`);


