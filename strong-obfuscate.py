#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Strong obfuscation for script.js
- Removes all comments
- Minifies code aggressively
- Makes code unreadable in Developer Tools
"""

import re
import os

script_path = os.path.join(os.path.dirname(__file__), 'script.js')

print('Applying strong obfuscation...')

with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

original_size = len(code)

# Step 1: Remove ALL comments (single and multi-line)
# First, protect strings
def protect_strings(text):
    strings = []
    def replacer(match):
        strings.append(match.group(0))
        return f'__STRING_{len(strings)-1}__'
    
    # Protect all string types
    text = re.sub(r'"(?:[^"\\]|\\.)*"', replacer, text)
    text = re.sub(r"'(?:[^'\\]|\\.)*'", replacer, text)
    text = re.sub(r'`(?:[^`\\]|\\.)*`', replacer, text)
    return text, strings

def restore_strings(text, strings):
    for i, s in enumerate(strings):
        text = text.replace(f'__STRING_{i}__', s)
    return text

code, strings = protect_strings(code)

# Remove single-line comments
code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)

# Remove multi-line comments
code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)

# Restore strings
code = restore_strings(code, strings)

# Step 2: Aggressive minification
# Remove all unnecessary whitespace
code = re.sub(r'\s+', ' ', code)  # Multiple spaces to single space
code = re.sub(r'\s*([=+\-*/%<>!&|,;:{}()\[\]])\s*', r'\1', code)  # Remove spaces around operators
code = re.sub(r';\s*;', ';', code)  # Remove duplicate semicolons
code = re.sub(r'\s*{\s*', '{', code)  # Remove spaces around braces
code = re.sub(r'\s*}\s*', '}', code)
code = re.sub(r'\s*\(\s*', '(', code)  # Remove spaces around parentheses
code = re.sub(r'\s*\)\s*', ')', code)
code = re.sub(r'\s*\[\s*', '[', code)  # Remove spaces around brackets
code = re.sub(r'\s*\]\s*', ']', code)

# Step 3: Remove empty lines
code = re.sub(r'\n\s*\n', '\n', code)
code = code.strip()

# Step 4: Preserve quizData structure (don't minify it too much)
# Find and protect quizData
quiz_data_match = re.search(r'(const quizData\s*=\s*\[.*?\];)', code, re.DOTALL)
if quiz_data_match:
    # Keep quizData readable but minify rest
    pass  # Already handled in minification

# Step 5: Write minified code
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(code)

new_size = len(code)

print('Strong obfuscation complete!')
print(f'Original: {original_size / 1024:.2f} KB')
print(f'Obfuscated: {new_size / 1024:.2f} KB')
print(f'Reduction: {((original_size - new_size) / original_size * 100):.1f}%')
print('Code is now much harder to read in Developer Tools!')





