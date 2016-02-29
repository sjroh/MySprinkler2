#!/usr/bin/python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

pinList = [2, 3]

for i in pinList:
    GPIO.setup(i, GPIO.OUT)
    GPIO.output(i, GPIO.HIGH)

SleepTimeL = 0.2

try:
    while True:
        for i in pinList:
            GPIO.output(i, GPIO.HIGH)
            time.sleep(SleepTimeL)
            GPIO.output(i, GPIO.LOW)

        pinList.reverse()

        for i in pinList:
            GPIO.output(i, GPIO.HIGH)
            time.sleep(SleepTimeL)
            GPIO.output(i, GPIO.LOW)

        pinList.reverse()

except KeyboardInterrupt:
    print "  Quit"

    GPIO.cleanup()
