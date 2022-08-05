from time import perf_counter
from gpiozero import MotionSensor

if __name__ == "__main__":
    pir = MotionSensor(int(sys.argv[1]))
    print("MODULE_LOADED")
    while True:
        pir.wait_for_motion()
        t1_start = perf_counter()
        print("MOTION_DETECTED")
        pir.wait_for_no_motion()
        t1_stop = perf_counter()
        print("Processed done. takes ", t1_stop - t1_start)
        print("MOTION_NOT_DETECTED")