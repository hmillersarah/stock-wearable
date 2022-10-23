import multiprocessing
import yfinance as yf
import time

import paho.mqtt.client as mqtt

MQTT_SERVER = "ec2-54-224-178-151.compute-1.amazonaws.com"
MQTT_PORT   = 1883
DEVICE_ID   = 123456

running = {}
running_info = {}

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe(f"{DEVICE_ID}/connect")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    # This topic is the only one subscribed to but just in case (should be unneeded)
    if msg.topic == f"{DEVICE_ID}/connect":

        message = str(msg.payload.decode("utf-8"))
        if message == "disconnected":
            print(f"Device {DEVICE_ID} is disconnected")
        elif message == "requesting":
            print("App is requesting device connection")
        elif message == "connected":
            print(f"Device {DEVICE_ID} is connected")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_SERVER, MQTT_PORT, 60)

def track_stock(deviceid, stock, min_percent_change, interval, alert_int):
    print("started thread")
    while(1):
        yf_stock = yf.Ticker(stock)
        response_body = yf_stock.history(period=interval)
        prev_val = response_body['Close'].iloc[0]
        curr_val = response_body['Close'].iloc[len(response_body['Close'])]
        percent_change = (curr_val - prev_val)/prev_val
        print("stock", stock, "percent change", percent_change)
        if percent_change >= min_percent_change:
            client.publish(f"{DEVICE_ID}/update", f"{stock},Up,{prev_val},{curr_val}")
        elif percent_change >= -1 * min_percent_change:
            client.publish(f"{DEVICE_ID}/update", f"{stock},Down,{prev_val},{curr_val}")
        time.sleep(alert_int)

def start_thread(userid, deviceid, stock, min_percent_change, interval, alert_int):
    new_process = multiprocessing.Process(
        target=track_stock, 
        args=(deviceid, stock, min_percent_change, interval, alert_int)
    )
    running[(userid, stock)] = new_process
    running_info[(userid, stock)] = {
        "min_percent_change" : min_percent_change,
        "interval" : interval,
        "alert_int" : alert_int
    }    
    print("starting thread for user", userid, "stock", stock)
    new_process.start()

def terminate_thread(userid, stock):
    thread = running.pop((userid, stock), None)
    running_info.pop((userid, stock), None)
    if thread != None:
        thread.terminate()

def update_thread(userid, stock, **kwargs):
    thread = running.pop((userid, stock), None)
    if thread != None:
        thread.terminate()
    if "newFreq" in kwargs:
        running_info[(userid, stock)]["interval"] = kwargs["newFreq"]
    if "newPercentChange" in kwargs:
        running_info[(userid, stock)]["min_percent_change"] = kwargs["newPercentChange"]
    if "newAlert" in kwargs:
        running_info[(userid, stock)]["alert_int"] = kwargs["newAlert"]
    new_process = multiprocessing.Process(
        target=track_stock, 
        args=(
            stock, 
            running_info[(userid, stock)]["min_percent_change"], 
            running_info[(userid, stock)]["interval"])
    )
    running[(userid, stock)] = new_process
    new_process.start()
    
def init_all_threads(all_stocks):
    for row in all_stocks:
        start_thread(
            row['userID']['S'],
            row['stockName']['S'],
            row['percentChange']['S'],
            row['frequency']['S'],
            row['alertInterval']['S']
        )