from time import perf_counter
import sys

from gpiozero import MotionSensor
import RPi.GPIO as GPIO    # Import Raspberry Pi GPIO library
from time import sleep     # Import the sleep function from the time module
GPIO.setwarnings(False) 
GPIO.setmode(GPIO.BOARD)
GPIO.setup(17, GPIO.OUT, initial=GPIO.LOW)   # Set pin 17 to be an output pin and set initial value to low (off)

if __name__ == "__main__":
    pir = MotionSensor(int(sys.argv[1]))
    print("MODULE_LOADED")
    while True:
        pir.wait_for_motion()
        t1_start = perf_counter()
        print("MOTION_DETECTED\n", flush=True, end='')
        print(".........\n", flush=True, end='')

        if GPIO.input(17) == GPIO.LOW:
                print("Light on")
                GPIO.output(17, GPIO.HIGH) # Turn on
        else:
                print("Light off")
                GPIO.output(17, GPIO.LOW) # Turn off

        pir.wait_for_no_motion()
        t1_stop = perf_counter()
        print("Processed done. takes ", t1_stop - t1_start)
        print("MOTION_NOT_DETECTED")