#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove console statements from admin-panel.html
"""

import re
import os

admin_path = os.path.join(os.path.dirname(__file__), 'admin-panel.html')

print('Removing console statements from admin-panel.html...')

with open(admin_path, 'r', encoding='utf-8') as f:
    code = f.read()

original_size = len(code)

# Remove ALL console statements
code = re.sub(r'console\.(log|warn|debug|error|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml)\s*\([^)]*\);?\s*', '', code, flags=re.MULTILINE)

# Remove multi-line console statements
code = re.sub(r'console\.(log|warn|debug|error|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml)\s*\([^)]*\)\s*;?\s*', '', code, flags=re.DOTALL)

# Write back
with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(code)

new_size = len(code)

print('Console statements removed!')
print(f'Original: {original_size / 1024:.2f} KB')
print(f'New: {new_size / 1024:.2f} KB')
print(f'Removed: {(original_size - new_size) / 1024:.2f} KB')




