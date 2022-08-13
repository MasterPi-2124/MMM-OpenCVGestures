from datetime import datetime
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
import RPi.GPIO as GPIO    # Import Raspberry Pi GPIO library

GPIO.setwarnings(False) 
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT, initial=GPIO.LOW)

print("MODULE_HELLO", flush=True, end='')

def buildModel():
    img_size = (224, 224)
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=img_size+(3,), alpha=0.75)
    x = base_model.get_layer('block_12_project').output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    output = Dense(7, activation='softmax', kernel_initializer='he_normal')(x)
    model = Model(inputs=base_model.input, outputs=output)
    return model

def predict(img):
    img_size = (224, 224)
    classes = ['1','L','NOGESTURE','PAPER','ROCK','SCISSOR','U']
    img = cv2.resize(img, img_size)
    img = img/255.0
    img = img.reshape(1,224,224,3)
    y = model.predict(img)
    return classes[np.argmax(y[0])]

if __name__ == "__main__":
    delayTime = int(sys.argv[1])
    gpio = int(sys.argv[2])
    pir = MotionSensor(gpio)
    working_directory = os.path.dirname(os.path.abspath(__file__))
    f = open('{}/log.txt'.format(working_directory), "a")
    f.write("Logging for session {}\n----------------------------\n".format(datetime.now().strftime("%d/%m/%Y %H:%M:%S")))

    m1_start = perf_counter()
    model = buildModel()
    model.load_weights('{}/result.h5'.format(working_directory))
    m1_stop = perf_counter()
    f.write("[OP]: Module loaded in {} second.\n".format(m1_stop - m1_start))
    print("MODULE_LOADED", flush=True, end='')

    x = 0
    while True:
        pir.wait_for_motion()
        t1_start = perf_counter()
        vid = cv2.VideoCapture(0)
        f.write("[OP]: Motion detected.\n")
        print("MOTION_DETECTED", flush=True, end='')

        sleep(delayTime)

        print("PICTURE_CAPTURED", flush=True, end='')
        d1_start = perf_counter()
        ret, frame = vid.read()
        cv2.imwrite('{}/savedImage.png'.format(working_directory), frame)
        vid.release()

        res = predict(frame)
        sleep(2)

        if GPIO.input(17) == GPIO.LOW:
            print("LED_ON", flush=True, end='')
            GPIO.output(17, GPIO.HIGH) # Turn on
        elif GPIO.input(17) == GPIO.HIGH:
            print("LED_OFF", flush=True, end='')
            GPIO.output(17, GPIO.LOW) # Turn off
        sleep(1)

        d1_stop = perf_counter()
        f.write("[OP]: Process result: {}\n".format(res))

        f.write("[OP]: Module processed in {} second.\n".format(d1_stop - d1_start))
        print("PROCESS_OK_{}".format(res), flush=True, end='')
        sleep(1)

        pir.wait_for_no_motion()
        t1_stop = perf_counter()
        f.write("[OP]: End of ONE gesture processing. Take {} second.\n\n".format(t1_stop - t1_start))
        print("MOTION_NOT_DETECTED", flush=True, end='')
