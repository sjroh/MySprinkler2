#### debuging START
import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BCM)
pin  = 17
delay = 2
GPIO.cleanup()
GPIO.setwarnings(False)
GPIO.setup(pin, GPIO.OUT)
print ("SETUP GPIO")
GPIO.output(pin, GPIO.HIGH)
print ("SETUP GPIO HIGH")
time.sleep(delay)

GPIO.output(pin, GPIO.LOW)
print ("SETUP GPIO LOW")
#time.sleep(delay)

print ("SETUP GPIO DELAY ENDS")
GPIO.cleanup()

#### debuging ENDS
