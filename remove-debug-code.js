// Remove debug code from script.js for production
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let code = fs.readFileSync(scriptPath, 'utf8');

console.log('🔒 Removing debug code...');

// Count original lines
const originalLines = code.split('\n').length;
const originalSize = code.length;

// Remove console.log, console.warn, console.debug (keep console.error for critical errors)
// Pattern: console.log(...); or console.warn(...); or console.debug(...);
code = code.replace(/^\s*console\.(log|warn|debug)\s*\([^)]*\);?\s*$/gm, '');

// Remove multi-line console statements
code = code.replace(/console\.(log|warn|debug)\s*\([^)]*\)\s*;?\s*/gs, '');

// Remove debug comments (but keep important comments)
code = code.replace(/\/\/\s*(DEBUG|TEST|TODO|FIXME|HACK|XXX|NOTE|WARNING|⚠️|🔍|✅|❌|🌙|☀️|📊|🎨|🔄).*$/gm, '');

// Remove test/debug functions (be careful not to remove important functions)
// Only remove if function name contains 'test' or 'debug' and is clearly a test function
code = code.replace(/\/\/\s*Test\s+function.*?\nfunction\s+\w*[Tt]est\w*\s*\([^)]*\)\s*\{[^}]*\}/gs, '');

// Remove empty lines (more than 2 consecutive)
code = code.replace(/\n{3,}/g, '\n\n');

// Remove trailing whitespace
code = code.replace(/[ \t]+$/gm, '');

// Write back to file
fs.writeFileSync(scriptPath, code, 'utf8');

const newLines = code.split('\n').length;
const newSize = code.length;

console.log('✅ Debug code removed!');
console.log(`📊 Original: ${originalLines} lines, ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`📊 New: ${newLines} lines, ${(newSize / 1024).toFixed(2)} KB`);
console.log(`📉 Removed: ${originalLines - newLines} lines, ${((originalSize - newSize) / 1024).toFixed(2)} KB`);




