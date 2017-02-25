var apiai = require('apiai');
var fs = require("fs");

var http = require('http');
var https = require('https');
var fs = require('fs');
var Q = require('q')
/*var config = require('./config.js')*/
var moment = require('moment')
var winston = require('winston');
var request = require('request');
var _ = require('lodash');
var api_ai = apiai("3ca80e39c4084a43a9c934025219c081");
const TeleBot = require('telebot');
var botToken = '365487370:AAEMiG9DrChu8R5rZar31jiLrFZCZZsqQmc'



var msgId 
var sessionId = '99999999999'
var apiai = require('apiai');
var myAppAi = apiai("3ca80e39c4084a43a9c934025219c081");

const bot = new TeleBot(botToken);


bot.on(['/start'], msg => {

  console.log("start...")
  return bot.sendMessage(msg.from.id, "Benvenuto!");
  
})

//********************************************** */
// On Text
bot.on(['text'], msg => {

    msgId = msg.from.id

    console.log('........')
    if (msg.text.startsWith("\/start")){
        console.log('....captured')
        return
    }
    bot.sendAction(msgId,'typing' )

    var apiRequest = myAppAi.textRequest(msg.text, {
        sessionId : sessionId
    });

    apiRequest.on('response', function(response) {
        console.log(response);
        bot.sendMessage(msgId, response.result.fulfillment.speech);
    });

    apiRequest.on('error', function(error) {
        console.log(error);
    });

    apiRequest.end();

})


/*
return new Promise(function(resolve, reject) {
        var location = firstEntityValue(entities, "location")
        if (location) {
          context.forecast = 'sunny in ' + location; // we should call a weather API here
          delete context.missingLocation;
        } else {
          context.missingLocation = true;
          delete context.forecast;
        }
        return resolve(context);
      });


*/


bot.on(['voice'], msg => {

    console.log(msg.voice.file_id)

    bot.getFile(msg.voice.file_id).then(function(item){
        console.log(item)
        var file = fs.createWriteStream(msg.voice.file_id + ".oga");
        var request = https.get("https://api.telegram.org/file/bot" + botToken + "/" + item.file_path, function(response) {
             response.pipe(file);
             var convertCmd = "/Applications/opus-tools-0.1.9-macos/opusdec --rate 16000 " +  msg.voice.file_id + ".oga " + msg.voice.file_id + ".wav"
             require('child_process').exec(convertCmd, (err, stdout, stderr) => {
                    if (err)
                        console.log(err)
                    // Detects speech in the audio file
                    speechClient.recognize(msg.voice.file_id + ".wav", options)
                    .then((results) => {
                        console.log(results)
                        const transcription = results[0];
                        console.log(`Transcription: ${transcription}`);
                        //bot.sendMessage(msg.from.id, "ecco:" + transcription);
                        var apiRequest = myAppAi.textRequest(transcription, {
                            sessionId : sessionId
                        });

                        apiRequest.on('response', function(response) {
                            console.log(response);
                            bot.sendMessage(msgId, response.result.fulfillment.speech);
                        });

                        apiRequest.on('error', function(error) {
                            console.log(error);
                        });

                        apiRequest.end();
  
                    });
             });
        })



  })
  
  

})




bot.connect();


// Imports the Google Cloud client library
const Speech = require('@google-cloud/speech');

// Your Google Cloud Platform project ID
const projectId = 'mybookingwithwatson';

// Instantiates a client
const speechClient = Speech({
  projectId: projectId
});

// The name of the audio file to transcribe
const fileName = './fileok.wav';

// The audio file's encoding and sample rate
const options = {
   encoding: 'LINEAR16',
  sampleRate: 16000,
  languageCode: 'it-IT'
};




  //     /Applications/opus-tools-0.1.9-macos/opusdec --rate 16000 file_4.oga fileok.wav
  //     /Applications/sox-14.4.2/play fileok.wav 




/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

var express = require('express');
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');

var _ = require('lodash');




var app = express();

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));



process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
  
}); 




app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key,X-Device-Token');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// POST method route
app.post('/webhook', function (req, res) {
    console.log(JSON.stringify(req.body.result))
  //res.send('POST request to the homepage...')

res.json({
"speech": "Barack Hussein Obama II is the 44th and current President of the United States.",
"displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
"data": {aaa:'xxxx'},
"source": "DuckDuckGo"
})


})

// Error Handler
app.use(function(err, req, res, next) {
	console.log('*************************Error Handler********************')
	console.log(err.stack)
  	res.status(err.status || 500);
    res.json({error: err.message})
 });
  

//init.initDB();

// Start the server
app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});



