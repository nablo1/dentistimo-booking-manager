const bookingRequest = 'booking/request'
const bookingResponse = 'booking/response'
const availabilityRequest = 'availability/request'
const availabilityResponse = 'availability/response'
const subscribedTopics = [bookingRequest, availabilityResponse]
const savedRequests = []


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
const client = mqtt.connect('mqtt://localhost:1883', options); 
client.on('connect', function() { // When connected
    console.log('connected')

    // subscribe to a topic
    client.subscribe(subscribedTopics,function() {
        
        client.on('message', function(topic, message, packet) {
            switch(topic) {
                case bookingRequest:
                    savedRequests.push(message) //save the request in the saved requests array
                    var recievedRequest = JSON.parse(String(message)) // parse the request that we just recieved
                    console.log(recievedRequest.timeSlot_id)
                     client.publish(availabilityRequest,  recievedRequest.timeSlot_id ,{qos:2} , function() { // now filter the time slot id of the request and publish it
                        //QoS 2 becuase the message we're sending triggers the availabaility checker to delete the time slot from the databse. so it's not safe to send dupliacte messages
                        console.log("The time slot id of the request is published");
                       // client.end(); 
                    }); 
                    break;

                      case availabilityResponse:
                        var lastRequest = JSON.parse(String(savedRequests[savedRequests.length - 1])) //get the last request of the array and parse it
                        var userid = lastRequest.userid
                        var requestid = lastRequest.requestid
                        var time = lastRequest.time

                         var recievedResponse = String(message)
                         if(recievedResponse === 'Confirmed') { //if the time slot exists in the database, we get a confirmation
                            var resString = '"userid": ' + JSON.stringify(userid) + ', "requestid": ' + JSON.stringify(requestid) + ', "time": " ' + JSON.stringify(time) + '"'
                            client.publish(bookingResponse, resString,{qos:1} , function() { // we publish the string above as a booking response to the client
                                console.log("confirmed booking response is published");
                                //client.end(); 
                            });  

                        } else { // if the time slot doesn't exist we get a rejection
                            var resString = '"userid": ' + userid + ', "requestid": ' + requestid + '"time": none'
                            client.publish(bookingResponse, resString,{qos:1} , function() { // we publish the string above as a booking response to the client
                                console.log("Rejected booking response is published");
                                //client.end(); 
                            });  

                        }   
            }
        });

    });

});