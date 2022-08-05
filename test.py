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
        t1_start = perf_counter()
        print("MOTION_DETECTED\n", flush=True, end='')
        print(".........\n", flush=True, end='')
        pir.wait_for_no_motion()
        t1_stop = perf_counter()
        print("Processed done. takes ", t1_stop - t1_start)
        print("MOTION_NOT_DETECTED\n", flush=True, end='')
