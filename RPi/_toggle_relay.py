# -*- coding: utf-8 -*-
#!/usr/bin/python

# this python code should run every hour

##########     imports BEGIN
import sys
import RPi.GPIO as GPIO
import time
##########     imports END

def run(pin, delay):
    pin = pin + 1
    # initialize
    GPIO.setmode(GPIO.BCM)
    #pinList = [2, 3, 4, 5, 6, 7, 8, 9, 10] # might not need
    #for i in pinList:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.HIGH)
    
    GPIO.output(pin, GPIO.LOW)
    time.sleep(delay)
    GPIO.cleanup()

#print sys.argv
run(int(sys.argv[1]), int(sys.argv[2]))
