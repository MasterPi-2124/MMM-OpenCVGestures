import os
import cv2
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import Model
from tensorflow.keras.layers import *
from tensorflow.keras.losses import CategoricalCrossentropy
from tensorflow.keras.preprocessing.image import load_img
from tensorflow.keras.models import load_model
from time import sleep
from time import perf_counter
import sys
from gpiozero import MotionSensor

if __name__ == "__main__":
    print("MODULE_HELLO\n", flush=True, end='')

    working_directory = os.path.dirname(os.path.abspath(__file__))

    f = open('{}/log.txt'.format(working_directory), "w")
    pir = MotionSensor(27)
    print("MODULE_LOADED\n", flush=True, end='')
    while True:
        pir.wait_for_motion()
        print("MOTION_DETECTED\n", flush=True, end='')
        sleep(3)
        print("PROCESS_OK_L\n", flush=True, end='')
        # print("Processed done. takes ", t1_stop - t1_start)
        pir.wait_for_no_motion()
        print("MOTION_NOT_DETECTED\n", flush=True, end='')
