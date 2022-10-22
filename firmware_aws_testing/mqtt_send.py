import paho.mqtt.client as mqtt
import threading
import time

MQTT_SERVER = "ec2-54-224-178-151.compute-1.amazonaws.com"
MQTT_PORT   = 1883
MQTT_TOPIC  = 'test'

def mqtt_thread():
    # The callback for when the client receives a CONNACK response from the server.
    def on_connect(client, userdata, flags, rc):
        print("Connected with result code "+str(rc))

        # Subscribing in on_connect() means that if we lose the connection and
        # reconnect then subscriptions will be renewed.
        client.subscribe(MQTT_TOPIC)

    # The callback for when a PUBLISH message is received from the server.
    def on_message(client, userdata, msg):
        print(str(msg.payload.decode("utf-8")))

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_SERVER, MQTT_PORT, 60)
    client.loop_start()

    while True:
        client.publish("test","Did you receive this?")
        time.sleep(3)# sleep for 5 seconds before next call

thread = threading.Thread(target=mqtt_thread)
thread.start()