import paho.mqtt.client as mqtt

MQTT_SERVER = "ec2-54-224-178-151.compute-1.amazonaws.com"
MQTT_PORT   = 1883
DEVICE_ID   = 123456

import paho.mqtt.client as mqtt

prev_message = ""
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

        global prev_message
        if message != prev_message:
            if message == "disconnected":
                print(f"Device {DEVICE_ID} is disconnected")
                prev_message = "disconnected"
            elif message == "requesting":
                print("App is requesting device connection")
                prev_message = "requesting"
            elif message == "connected":
                print(f"Device {DEVICE_ID} is connected")
                prev_message = "connected"
            elif message == "disconnecting":
                print(f"Device {DEVICE_ID} is disconnecting")
                prev_message = "disconnecting"


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_SERVER, MQTT_PORT, 60)

# Non-blocking call
client.loop_start()

while True:
    request = input("Enter 0 to disconnect, 1 to request device connection, 2 to send up update, 3 to send down update: ")
    if request == "0":
        client.publish(f"{DEVICE_ID}/connect", "disconnecting")
    elif request == "1":
        client.publish(f"{DEVICE_ID}/connect", "requesting")
    elif request == "2":
        client.publish(f"{DEVICE_ID}/update", "MSFT,Up,242,240")
    elif request == "3":
        client.publish(f"{DEVICE_ID}/update", "MSFT,Down,242,244")
    else:
        print("Unknown command, try again")


