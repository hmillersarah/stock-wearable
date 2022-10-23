import realtime_alert_threads
import aws_controller
import time
from multiprocessing import set_start_method, freeze_support



if __name__ == '__main__': 
    set_start_method('fork', force=True)
    realtime_alert_threads.init_all_threads(aws_controller.get_stocks("test_user")["Items"], aws_controller.get_device_id("test_user"))

    # freeze_support()
    try:
        while 1:
            time.sleep(.1)
    except KeyboardInterrupt:
        for process in realtime_alert_threads.running:
            if realtime_alert_threads.running[process] != None:
                realtime_alert_threads.running[process].terminate()