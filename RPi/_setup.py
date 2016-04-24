# -*- coding: utf-8 -*-
#!/usr/bin/python

########## imports START
import datetime
import time

import _drive
import imp
########## imports FINISH

########## global variables START
DRIVE = None
DONE = False
########## global variables FINISH

DRIVE = _drive
DRIVE.main()
DONE = True

gw = imp.load_source('getWeathers', '/home/pi/Workspace/getWeathers.py')
gw.update()
print("[SSS][SETUP] Weather forecasts updated")

def getDone():
    return DONE
