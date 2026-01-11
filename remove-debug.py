#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove debug code from script.js for production
Removes console.log, console.warn, console.debug statements
Removes debug comments and test functions
"""

import re
import os

script_path = os.path.join(os.path.dirname(__file__), 'script.js')

print('Removing debug code from script.js...')

with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

original_lines = len(code.split('\n'))
original_size = len(code)

# Remove console.log, console.warn, console.debug (keep console.error)
# Pattern: console.log(...); or console.warn(...); or console.debug(...);
code = re.sub(r'^\s*console\.(log|warn|debug)\s*\([^)]*\);?\s*$', '', code, flags=re.MULTILINE)

# Remove multi-line console statements
code = re.sub(r'console\.(log|warn|debug)\s*\([^)]*\)\s*;?\s*', '', code, flags=re.DOTALL)

# Remove debug comments (but keep important comments)
# Remove comments with emojis and debug keywords
code = re.sub(r'//\s*(DEBUG|TEST|TODO|FIXME|HACK|XXX|NOTE|WARNING|⚠️|🔍|✅|❌|🌙|☀️|📊|🎨|🔄|💾|📡|🔧|⏭️|🔄|👁️|📋|🎬|🌓|🔐|🗑️).*$', '', code, flags=re.MULTILINE)

# Remove empty lines (more than 2 consecutive)
code = re.sub(r'\n{3,}', '\n\n', code)

# Remove trailing whitespace
code = re.sub(r'[ \t]+$', '', code, flags=re.MULTILINE)

# Write back to file
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(code)

new_lines = len(code.split('\n'))
new_size = len(code)

print('Debug code removed!')
print(f'Original: {original_lines} lines, {original_size / 1024:.2f} KB')
print(f'New: {new_lines} lines, {new_size / 1024:.2f} KB')
print(f'Removed: {original_lines - new_lines} lines, {(original_size - new_size) / 1024:.2f} KB')

