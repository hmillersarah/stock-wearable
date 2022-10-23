#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include "rgb_lcd.h"
#include "pitches.h"

// Debug flag for Serial printouts
#define DEBUG true

// WiFi SSID and Password
const char* ssid = "BZhu iPhone";
const char* password = "georgiatech";

// EC2 instance with MQTT broker
const char* mqtt_server = "ec2-54-224-178-151.compute-1.amazonaws.com";

// Variables to parse out MQTT message and manage WiFi Connection
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;
void setup_wifi();

// Device ID, each device needs to be unique to have independent messaging via MQTT
const String DEVICE_ID = "123456";

// Hierarchical State Diagram State Names
enum State {
  DISCONNECTED,
  CONNECTED
};

enum ConnectedSubstate {
  IDLE,
  UP,
  DOWN
};

static State state = DISCONNECTED;
static ConnectedSubstate connectedSubstate = IDLE;

// Global variables for update message parsing
static String stockName = "";
static String upDown = "";
static String prevValue = "";
static String currValue = "";

// RGB LCD Object
rgb_lcd lcd;

// Buzzer Setup
#define BUZZER_PIN  15 // ESP32 pin GIOP15 connected to piezo buzzer
int up_melody[] = {
  NOTE_C4, NOTE_E4, NOTE_G4, NOTE_C5, NOTE_E5, NOTE_G5, NOTE_C6
};
double up_noteDurations[] = {
  4, 4, 4, 4, 4, 4, 2
};
int down_melody[] = {
  NOTE_G4, NOTE_G4, NOTE_G4, NOTE_DS4, NOTE_F4, NOTE_F4, NOTE_F4, NOTE_D4,
};
double down_noteDurations[] = {
  6, 6, 6, 1.5, 6, 6, 6, 1.5
};

void setup() {
  // Initialization
  #if DEBUG
  Serial.begin(115200);
  #endif
  lcd.begin(16, 2);

  // default settings
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

/*
  @brief: Sets up WiFi with provided SSID and pwd
*/
void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  #if DEBUG
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  #endif

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    #if DEBUG
    Serial.print(".");
    #endif
  }

  #if DEBUG
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  #endif
}

/*
  @brief: Callback function to handle MQTT message reception
*/
void callback(char* topic, byte* message, unsigned int length) {
  #if DEBUG
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  #endif

  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    #if DEBUG
    Serial.print((char)message[i]);
    #endif
    messageTemp += (char)message[i]; // builds messageTemp one character at a time
  }

  #if DEBUG
  Serial.println();
  #endif

  String convertedTopic = String(topic);

  // Disconnect device can occur anytime
  if ((convertedTopic == DEVICE_ID + "/connect") && (messageTemp == "disconnecting")) {
    state = DISCONNECTED;
    connectedSubstate = IDLE;
  }

  // State transition during app connection request
  if ((state == DISCONNECTED) && (convertedTopic == DEVICE_ID + "/connect") && (messageTemp == "requesting")) {
    state = CONNECTED;
    connectedSubstate = IDLE;
  }

  // Handle up and down stock updates
  if ((state == CONNECTED) && (convertedTopic == DEVICE_ID + "/update")) {
    // Parse out message, delimiting by comma
    int counter = 0;
    String subMessage = "";

    for (int i = 0; i < length; i++) {
      // Handle delimiter
      if ((char)message[i] == ',') {
        if (counter == 0) stockName = subMessage;
        else if (counter == 1) upDown = subMessage;
        else if (counter == 2) currValue = subMessage;

        // Handle trackers
        subMessage = "";
        counter++;
      }
      else {
        subMessage += (char)message[i]; // builds subMessage one character at a time
      }
    }

    prevValue = subMessage;

    #if DEBUG
    Serial.println("Received update with values: ");
    Serial.println("  Stock Name: " + stockName);
    Serial.println("  Direction: " + upDown);
    Serial.println("  Previous Value: " + prevValue);
    Serial.println("  Current Value: " + currValue);
    #endif



    if (upDown == "Up") {
      connectedSubstate = UP;
    } else if (upDown == "Down") {
      connectedSubstate = DOWN;
    }
  }


}

/*
  @brief: Handler to connect/reconnect if MQTT connection is not made
*/
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    #if DEBUG
    Serial.print("Attempting MQTT connection...");
    #endif

    // Attempt to connect
    if (client.connect("ESP32Client")) {
      #if DEBUG
      Serial.println("connected");
      #endif
      
      // Subscribe; string to char array conversion
      String string1 = DEVICE_ID + "/connect";
      String string2 = DEVICE_ID + "/update";
      unsigned int length1 = string1.length();
      unsigned int length2 = string2.length();
      char topic1[length1];
      char topic2[length2];
      string1.toCharArray(topic1, length1 * 8);
      string2.toCharArray(topic2, length2 * 8);


      client.subscribe(topic1);
      client.subscribe(topic2);
    } else {
      #if DEBUG
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      #endif
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    state = DISCONNECTED;
    connectedSubstate = IDLE;
    reconnect();
  }
  client.loop();

  // State machine
  if (state == DISCONNECTED) {
    lcd.setCursor(0, 0);
    lcd.print("Disconnected");
    lcd.setRGB(0x52, 0xB2, 0xBF);
  }
  else if (state == CONNECTED) {
    if (connectedSubstate == IDLE) {
      lcd.setCursor(0, 0);
      lcd.print("Connected    ");
      lcd.setRGB(255, 255, 255);
    }
    else if (connectedSubstate == UP) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(stockName + ": up");
      lcd.setCursor(0, 1);
      lcd.print(prevValue + "->" + currValue);
      lcd.setRGB(0, 255, 0);

      // Buzz
      for (int thisNote = 0; thisNote < 7; thisNote++) {
        int noteDuration = 1000 / up_noteDurations[thisNote];
        tone(BUZZER_PIN, up_melody[thisNote], noteDuration);

        int pauseBetweenNotes = noteDuration * 1.30;
        delay(pauseBetweenNotes);
        noTone(BUZZER_PIN);
      }

      delay(2000);

      // Transition substate out
      connectedSubstate = IDLE;
      lcd.clear();
    }
    else if (connectedSubstate == DOWN) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(stockName + ": down");
      lcd.setCursor(0, 1);
      lcd.print(prevValue + "->" + currValue);
      lcd.setRGB(255, 0, 0);

      
      // Buzz
      for (int thisNote = 0; thisNote < 8; thisNote++) {
        int noteDuration = 1000 / down_noteDurations[thisNote];
        tone(BUZZER_PIN, down_melody[thisNote], noteDuration);

        int pauseBetweenNotes = noteDuration * 1.30;
        delay(pauseBetweenNotes);
        noTone(BUZZER_PIN);
      }

      delay(2000);

      // Transition substate out
      connectedSubstate = IDLE;
      lcd.clear();
    }
  }
  
}