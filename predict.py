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

def my_IoU(y_true, y_pred):
    y_pred = K.argmax(y_pred)
    y_pred = K.cast(y_pred, 'float32')
    y_pred = K.flatten(y_pred)
    y_true = K.flatten(y_true)
    intersection = K.sum(y_true * y_pred)
    IoU = (intersection+0.0000001) / (K.sum(y_true) + K.sum(y_pred) - intersection + 0.001)
    return IoU

def segment(model_segment,img_input):
    img_input.astype('float32')
    img_input = cv2.resize(img_input, (256, 256))
    img_input = img_input / 255.0 * 2 - 1
    x = np.zeros((1,) + (256, 256) + (3,))
    x[0] = img_input
    pred = model_segment.predict(x)

    pred = pred[0]
    pred1 = pred[:, :, 1]
    pred1 = np.where(pred1 > 0.3, 255, 0)
    pred1 = np.uint8(pred1)
    pred1 = cv2.medianBlur(pred1, 3)
    img = cv2.imread(image_path)
    origin_height, origin_width = img.shape[0], img.shape[1]
    pred1 = cv2.resize(pred1, (origin_width, origin_height), cv2.INTER_NEAREST)
    contours, hierarchy = cv2.findContours(pred1, 1, 2)
    #contours = max(contours, key=cv2.contourArea)
    x1_final, y1_final, x2_final, y2_final = origin_width, origin_height, 0, 0
    check = 0
    if len(contours) != 0:
        contours = max(contours, key=cv2.contourArea)
        pred1 = np.zeros_like(pred1)
        cv2.drawContours(pred1, [contours], 0, 255, -1)
        x, y, w, h = cv2.boundingRect(contours)
        check = 1
        if x < x1_final:
                x1_final = x
        if y < y1_final:
                y1_final = y
        if x+w > x2_final:
                x2_final = x+w
        if y+h > y2_final:
                y2_final = y+h
    result = cv2.bitwise_and(img, img, mask=pred1)
    if check == 1:
       result = result[max(0, y1_final - int(0.1 * (y2_final - y1_final))):min(origin_height, y2_final + int(
            0.1 * (y2_final - y1_final))), max(0, x1_final - int(0.1 * (x2_final - x1_final))):min(origin_width,
                                                                                                   x2_final + int(
                                                                                                      0.1 * (x2_final - x1_final)))]
    result = cv2.resize(result, (256, 256))

    # cv2.imwrite('segment.png', result)
    return result



def build_classify_model():
    img_size = (224, 224)
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=img_size+(3,), alpha=0.75)
    x = base_model.get_layer('block_12_project').output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    output = Dense(3, activation='softmax', kernel_initializer='he_normal')(x)
    model = Model(inputs=base_model.input, outputs=output)
    return model

def predict(img):
    img = segment(model_segment, frame)
    classes = ['PAPER','LIKE','NOGESTURES']
    img = cv2.resize(img, (224, 224))
    img = img/255.0
    img = img.reshape(1,224,224,3)
    
    #print(img.shape)
    y = model_classify.predict(img)
    print(classes[np.argmax(y[0])])
    return


if __name__ == "__main__":
    working_directory = os.path.dirname(os.path.abspath(__file__))
    img_path = '{}/savedImage.png'.format(working_directory)
    img_seg = '{}/segment.png'.format(working_directory)
    model_link = '{}/class_model.h5'.format(working_directory)
    model_classify = build_classify_model()
    model_classify.load_weights(model_link)
    model_segment = load_model('seg_model.h5', custom_objects={'my_IoU': my_IoU})

    delayTime = int(sys.argv[1])
    gpio = int(sys.argv[2])
    pir = MotionSensor(gpio)

    f = open('{}/log.txt'.format(working_directory), "a")
    f.write("Logging for session {}\n----------------------------\n".format(datetime.now().strftime("%d/%m/%Y %H:%M:%S")))

    m1_start = perf_counter()
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

        if res == "PAPER" and GPIO.input(17) == GPIO.LOW:
            print("LED_ON", flush=True, end='')
            GPIO.output(17, GPIO.HIGH) # Turn on
        elif res == "LIKE" and GPIO.input(17) == GPIO.HIGH:
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
