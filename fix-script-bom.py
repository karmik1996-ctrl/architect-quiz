#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove BOM from script.js if present
"""

import os

script_path = os.path.join(os.path.dirname(__file__), 'script.js')

print('Checking script.js for BOM...')

with open(script_path, 'rb') as f:
    content = f.read()

# Check for BOM
if content.startswith(b'\xef\xbb\xbf'):
    print('BOM found, removing...')
    content = content[3:]
    with open(script_path, 'wb') as f:
        f.write(content)
    print('BOM removed!')
else:
    print('No BOM found, file is OK')



