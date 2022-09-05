#!/usr/bin/env python3

import os

def conv(directory,output):
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f):
            fn, ext = os.path.splitext(filename)
            print(fn)
            cmd = f'svgr \'{f}\' > \'{output}{fn}.jsx\''
            os.system(cmd)

#conv('vulnerabilities/','../client/src/icons/vulnerabilities/')
conv('health/','../client/src/icons/health/')
