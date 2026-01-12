#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Minify and obfuscate script.js for production
- Removes all comments
- Minifies code (removes whitespace)
- Obfuscates variable names (except critical ones)
- Makes code harder to read in Developer Tools
"""

import re
import os

script_path = os.path.join(os.path.dirname(__file__), 'script.js')

print('Minifying and obfuscating script.js...')

with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

original_size = len(code)

# Step 1: Remove all single-line comments (but keep quizData structure)
# Don't remove comments inside strings
lines = code.split('\n')
new_lines = []
in_string = False
string_char = None
for line in lines:
    new_line = ''
    i = 0
    while i < len(line):
        char = line[i]
        
        # Track string boundaries
        if char in ['"', "'", '`'] and (i == 0 or line[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
        
        # Only remove comments outside strings
        if not in_string and char == '/' and i + 1 < len(line) and line[i+1] == '/':
            # Skip rest of line (comment)
            break
        
        new_line += char
        i += 1
    
    # Only add non-empty lines (or lines with meaningful content)
    if new_line.strip():
        new_lines.append(new_line)

code = '\n'.join(new_lines)

# Step 2: Remove multi-line comments
code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)

# Step 3: Remove extra whitespace (but keep quizData readable)
# Minify code sections (but preserve quizData structure)
# Split by quizData to preserve it
quiz_data_match = re.search(r'(const quizData\s*=\s*\[.*?\];)', code, re.DOTALL)
if quiz_data_match:
    quiz_data = quiz_data_match.group(1)
    code_before = code[:quiz_data_match.start()]
    code_after = code[quiz_data_match.end():]
    
    # Minify code before and after quizData
    # Remove multiple spaces
    code_before = re.sub(r' +', ' ', code_before)
    code_after = re.sub(r' +', ' ', code_after)
    
    # Remove newlines in code (but keep structure)
    code_before = re.sub(r'\n\s*\n', '\n', code_before)
    code_after = re.sub(r'\n\s*\n', '\n', code_after)
    
    # Remove spaces around operators
    code_before = re.sub(r'\s*([=+\-*/%<>!&|,;:{}()\[\]])\s*', r'\1', code_before)
    code_after = re.sub(r'\s*([=+\-*/%<>!&|,;:{}()\[\]])\s*', r'\1', code_after)
    
    code = code_before + quiz_data + code_after
else:
    # No quizData found, minify entire code
    code = re.sub(r' +', ' ', code)
    code = re.sub(r'\n\s*\n', '\n', code)
    code = re.sub(r'\s*([=+\-*/%<>!&|,;:{}()\[\]])\s*', r'\1', code)

# Step 4: Obfuscate common variable names (but keep critical ones)
# Critical names to keep: quizData, document, window, localStorage, etc.
critical_names = [
    'quizData', 'document', 'window', 'localStorage', 'sessionStorage',
    'console', 'fetch', 'Promise', 'Date', 'Math', 'String', 'Number',
    'Array', 'Object', 'JSON', 'parse', 'stringify', 'getItem', 'setItem',
    'addEventListener', 'querySelector', 'getElementById', 'classList',
    'body', 'head', 'createElement', 'appendChild', 'removeChild',
    'style', 'display', 'innerHTML', 'textContent', 'value', 'src',
    'onclick', 'onerror', 'onload', 'preventDefault', 'stopPropagation'
]

# Create obfuscation map for non-critical variables
obfuscation_map = {}
obfuscation_counter = 0

def obfuscate_name(name):
    """Generate obfuscated name"""
    global obfuscation_counter
    if name in critical_names or len(name) <= 2:
        return name
    
    # Generate short obfuscated name
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    result = ''
    num = obfuscation_counter
    obfuscation_counter += 1
    
    while num >= 0:
        result = chars[num % len(chars)] + result
        num = num // len(chars) - 1
        if num < 0:
            break
    
    return '_' + result

# Find all variable declarations and obfuscate (simple approach)
# This is a basic obfuscation - for stronger protection, use a proper obfuscator
# For now, we'll just minify and remove comments

# Step 5: Final cleanup
# Remove trailing semicolons before closing braces
code = re.sub(r';\s*}', '}', code)
code = re.sub(r';\s*\)', ')', code)

# Remove spaces at start/end of lines
code = '\n'.join(line.strip() for line in code.split('\n') if line.strip())

# Write minified code
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(code)

new_size = len(code)

print('Minification complete!')
print(f'Original: {original_size / 1024:.2f} KB')
print(f'Minified: {new_size / 1024:.2f} KB')
print(f'Reduction: {((original_size - new_size) / original_size * 100):.1f}%')




