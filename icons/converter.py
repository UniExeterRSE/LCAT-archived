#!/usr/bin/env python3

import os
directory = 'vulnerabilities/'
output = '../client/src/icons/vulnerabilities/'

for filename in os.listdir(directory):
    f = os.path.join(directory, filename)
    # checking if it is a file
    if os.path.isfile(f):
        fn, ext = os.path.splitext(filename)
        print(fn)
        cmd = f'svgr \'{f}\' > \'{output}{fn}.jsx\''
        os.system(cmd)
