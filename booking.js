var bookingRequest = 'booking/request'
var bookingResponse = 'booking/response'
var availabilityRequest = 'availability/request'
var availabilityResponse = 'availability/response'


const options = {
  keepalive: 60,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  reschedulePings: true,
  protocolId: 'MQTT',
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  queueQoSZero: true,
  }
  
const mqtt = require('mqtt')
const client = mqtt.connect('tcp://localhost:1883', options); //port?
client.on('connect', function() { // When connected
    console.log('connected')

    // subscribe to a topic
    client.subscribe(bookingRequest,{qos:1} ,function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });

    });
/* 
      // publish a message to a topic
        // Instead of my message goes the request data
         client.publish(bookingResponse, 'my message', function() {
            console.log("Message is published");
            client.end(); // Close the connection when published
        });  */
});