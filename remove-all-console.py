#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove ALL console statements including console.error
"""

import re
import os

script_path = os.path.join(os.path.dirname(__file__), 'script.js')

print('Removing ALL console statements...')

with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

original_size = len(code)

# Remove ALL console statements (log, warn, debug, error, info, etc.)
code = re.sub(r'console\.(log|warn|debug|error|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml)\s*\([^)]*\);?\s*', '', code, flags=re.MULTILINE)

# Remove multi-line console statements
code = re.sub(r'console\.(log|warn|debug|error|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml)\s*\([^)]*\)\s*;?\s*', '', code, flags=re.DOTALL)

# Write back
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(code)

new_size = len(code)

print('All console statements removed!')
print(f'Original: {original_size / 1024:.2f} KB')
print(f'New: {new_size / 1024:.2f} KB')
print(f'Removed: {(original_size - new_size) / 1024:.2f} KB')






