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
from gpiozero import MotionSensor

def build_model():
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
    print("MODULE_HELLO", flush=True, end='')
    working_directory = os.path.dirname(os.path.abspath(__file__))
    model_link = '{}/result.h5'.format(working_directory)
    model = build_model()
    model.load_weights(model_link)
    f = open("log.txt", "w")
    pir = MotionSensor(27)
    print("MODULE_LOADED", flush=True, end='')
    while True:
        pir.wait_for_motion()
        t1_start = perf_counter()
        vid = cv2.VideoCapture(0)
        print("MOTION_DETECTED", flush=True, end='')
        sleep(3)
        print("PICTURE_CAPTURED", flush=True, end='')
        ret, frame = vid.read()
        cv2.imwrite('{}/savedImage.png'.format(working_directory), frame)
        vid.release()
        res = predict(frame)
        print("PROCESS_OK_{}".format(res), flush=True, end='')
        t1_stop = perf_counter()
        # print("Processed done. takes ", t1_stop - t1_start)
        pir.wait_for_no_motion()
        print("MOTION_NOT_DETECTED", flush=True, end='')
