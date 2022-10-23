import realtime_alert_threads
import aws_controller
import time

realtime_alert_threads.init_all_threads(aws_controller.get_stocks("test_user")["Items"])

try:
    while 1:
        time.sleep(.1)
except KeyboardInterrupt:
    for process in realtime_alert_threads.running:
        if process != None:
            process.terminate()