import paho.mqtt.client as mqtt

MQTT_SERVER = "ec2-54-224-178-151.compute-1.amazonaws.com"
MQTT_PORT   = 1883
DEVICE_ID   = 123456

import paho.mqtt.client as mqtt

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

# Non-blocking call
client.loop_start()

while True:
    request = input("Enter 1 to request device connection, or 2 to send up update, 3 to send down update: ")
    if request == "1":
        client.publish(f"{DEVICE_ID}/connect", "requesting")
    elif request == "2":
        client.publish(f"{DEVICE_ID}/update", "MSFT,Up,242,240")
    elif request == "3":
        client.publish(f"{DEVICE_ID}/update", "MSFT,Down,242,244")
    else:
        print("Unknown command, try again")


