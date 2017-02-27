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

var chuck = require('chuck-norris-api');


var sessionId = '99999999999-1'
var apiai = require('apiai');
var myAppAi = apiai("3ca80e39c4084a43a9c934025219c081");


// Imports the Google Cloud client library
const Speech = require('@google-cloud/speech');

// Your Google Cloud Platform project ID
const projectId = 'myapiai-159818';

// Instantiates a client
const speechClient = Speech({
  projectId: projectId
});

var weather = require('openweather-apis');
weather.setLang('it');
weather.setUnits('metric');
weather.setAPPID('b76dfef9065842dab1454f9c5c92e340');


var config = {ApiserverAddress : 'http://localhost:3000',email:"claudio.digiovanni@gmail.com"}




const bot = new TeleBot(botToken);
var parse = "Markdown"


bot.on(['/start'], msg => {

  console.log("start...")
  bot.sendMessage(msg.from.id, "Benvenuto!");
  bot.sendPhoto(msg.from.id,"steve.png")
  
})

//********************************************** */
// On Text
bot.on(['text'], msg => {

    

    console.log('........')
    if (msg.text.startsWith("\/start")){
        console.log('....captured')
        return
    }
    bot.sendAction(msg.from.id,'typing' )

    var apiRequest = myAppAi.textRequest(msg.text, {
        sessionId : sessionId
    });

    apiRequest.on('response', function(response) {
        console.log(response);
        bot.sendMessage(msg.from.id, response.result.fulfillment.speech);
    });

    apiRequest.on('error', function(error) {
        console.log(error);
    });

    apiRequest.end();

})


bot.on(['voice'], msg => {

    bot.sendAction(msg.from.id,'typing' )
    bot.getFile(msg.voice.file_id)
    .then(function(item){
        console.log(item)
        return new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(msg.voice.file_id + ".oga");
            var request = https.get("https://api.telegram.org/file/bot" + botToken + "/" + item.file_path, function(response) {
                response.pipe(file);
                return resolve("...");      
            })
        })
    }).then(function(item){
            var convertCmd = "/Applications/opus-tools-0.1.9-macos/opusdec --rate 16000 " +  msg.voice.file_id + ".oga " + msg.voice.file_id + ".wav"
            return new Promise(function(resolve, reject) {
                require('child_process').exec(convertCmd, (err, stdout, stderr) => {
                    if (err){
                        console.log(err)
                        return reject("reject")
                    }
                    return resolve("...");            
                })
            })
    }).then(function(item){
            // The audio file's encoding and sample rate
            const options = {
                encoding: 'LINEAR16',
                sampleRate: 16000,
                languageCode: 'it-IT'
            };
            // Detects speech in the audio file
            console.log("going to speech recognition........")
            return speechClient.recognize(msg.voice.file_id + ".wav", options)
    }).then((results) => {
            console.log(results)
            const transcription = results[0];
            console.log(`Transcription: ${transcription}`);
            //bot.sendMessage(msg.from.id, "ecco:" + transcription);
            var apiRequest = myAppAi.textRequest(transcription, {
                sessionId : sessionId
            });

            apiRequest.on('response', function(response) {
                console.log(response);
                bot.sendMessage(msg.from.id, response.result.fulfillment.speech);
            });

            apiRequest.on('error', function(error) {
                console.log(error);
            });

            apiRequest.end();

    }).catch((error) => {
                console.log(error)
    });
})

  

bot.connect();

//     /Applications/opus-tools-0.1.9-macos/opusdec --rate 16000 file_4.oga fileok.wav
//     /Applications/sox-14.4.2/play fileok.wav 

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


// Get method route
app.get('/test', function (req, res) {
    res.json({"data":"ok"})
})

// POST method route
app.post('/webhook', function (req, res) {
    console.log("***************************WEBHOOK*********************************")
    console.log(JSON.stringify(req.body.result))
    if (req.body.result.action == 'weather'){
        var myresp = ""
        weather.setCity(req.body.result.parameters['geo-city']);
        weather.getAllWeather(function(error,smart){
            myresp = "*Condizioni meteo di " + req.body.result.parameters['geo-city'] + ": " + smart.weather[0].description + "* \n"
            myresp += "Temperatura:" + JSON.stringify(smart.main.temp) + "\n"
            myresp += "Pressione:" + JSON.stringify(smart.main.pressure) + "\n"
            myresp += "Umidità:" + JSON.stringify(smart.main.humidity) + "\n"
            myresp += "Minima:" + JSON.stringify(smart.main.temp_min) + "\n"
            myresp += "Massima:" + JSON.stringify(smart.main.temp_max) + "\n"
            res.json({
                "speech": myresp,
                "displayText": myresp,
                "data": {aaa:'xxxx'},
                "source": "server"
            })
        })
    }
    else if (req.body.result.action == 'book'){
            var date = req.body.result.parameters['date']
            var time = req.body.result.parameters['time']
            var court = req.body.result.parameters['campo']
            createBooking(date,time,config.email,court).then(function(message){ 
                res.json({
                    "speech": message,
                    "displayText": message,
                    "data": {aaa:'xxxx'},
                    "source": "book"
                })
            }).catch((error) => {
                console.log(error)
            }); 
    }
    else if (req.body.result.action == 'impegni'){
            var date = new Date(); date.setHours(0); date.setMinutes(0); date.setSeconds(0);date.setMilliseconds(0)
            findMyBookings(date,time,config.email).then(function(message){ 
                res.json({
                    "speech": message,
                    "displayText": message,
                    "data": {aaa:'xxxx'},
                    "source": "impegni"
                })
            }).catch((error) => {
                console.log(error)
            }); 
    }
     else if (req.body.result.action == 'chuck'){
            chuck.getRandom().then(function (data) {
                console.log(data.value.joke);
                res.json({
                    "speech": data.value.joke,
                    "displayText": data.value.joke,
                    "data": {aaa:'xxxx'},
                    "source": "chuck"
                })
            });
    }
})

// Error Handler
app.use(function(err, req, res, next) {
	console.log('*************************Error Handler********************')
	console.log(err.stack)
  	res.status(err.status || 500);
    res.json({error: err.message})
 });
  

// Start the server
app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


//****************************BOOKINGS******************* */

var courtsName = {1: "verde", 2: "rosso", 3: "blu", 4: "nero"}
//var courtsIndex = {1: "verde", 2: "rosso", 3: "blu", 4: "nero"}
function createBooking(date,time,userEmail,court){

  var defer = Q.defer()
  
  var slot1 = getSlotFromHour(time)
  var form1 = {'date': date, 'ranges': [slot1,slot1 + 1, slot1 +2],'gameT':0,'courtsNumber':4,'circolo':'56be660ae49818d0034c9edf'}

  request.post({url: config.ApiserverAddress + '/botApi/v1/checkBeforeCreateBooking', form: form1}, function(err,httpResponse,body){ 
    
        
        if (err || JSON.parse(body).status == 400 ){
            checkForFirstFreeSlot(date,time,userEmail).then(function(results){
                var newTime = ""
                _.forEach(results, function(value, key) {
                  if (value.state == 'fulfilled'){
                    newTime += " - " + getHourMinuteFromSlot(value.value)
                  }
                });
                defer.resolve("Ops! *Nessun campo disponibile* per quell'ora. Se vuoi i seguenti orari *risultano ancora disponibili* :  " + newTime)   
                })
        } else{
          var okCourt = JSON.parse(body).data[0]
          var messageToAppend = ""
          console.log('Elenco campi....')
          console.log('valore court....' + court)
          console.log(JSON.parse(body).data)
          console.log(court  && JSON.parse(body).data.indexOf(parseInt(court)) != -1)
          //Ho scelto il nome di un campo ed è disponibile...
          if (court && JSON.parse(body).data.indexOf(parseInt(court)) != -1){
            okCourt = court
          }
          //Ho scelto il nome di un campo ma non è disponibile...
          else if (court != null && court != '' && court != okCourt)
            messageToAppend = ". Scusa se ho prenotato il campo "  + courtsName[okCourt]  + " ma quello che avevi scelto non è disponibile!"
          
          var obj = {circolo : '56be660ae49818d0034c9edf', ranges : [slot1,slot1 + 1, slot1 +2], email: userEmail, gameType :  0, payed : false, 
          court: okCourt, date :  date}
          request.post({url: config.ApiserverAddress + '/botApi/v1/createBooking', form: {'book':obj}}, function(err,httpResponse,body){ 
            console.log('body.....');console.log(body)
            if (err || JSON.parse(body).error){
              defer.resolve("Ops!!! Problemi durante la prenotazione.....")
            }
            else
              defer.resolve("Fatto! Giochi nel campo: " + courtsName[okCourt] + messageToAppend)
          })
        }
    })
    return defer.promise
}

function findMyBookings(date,time,userEmail){

  var defer = Q.defer()
  var form1 = {'date': date, 'userEmail': userEmail}

  request.post({url: config.ApiserverAddress + '/botApi/v1/findMyBookings', form: form1}, function(err,httpResponse,body){ 
    
        
        var ret = "*Ecco i tuoi impegni* \n"
        var data =JSON.parse(body)
        _.each(data.data,function(item){
          ret += moment(item.startHour).format('DD/MM/YY HH:mm') + " - " + moment(item.endHour).format('HH:mm') + "\n"
        })
        if (data.data.length == 0) ret = "*Non hai nessun impegno.* Si batte la fiacca eh!"
        defer.resolve(ret)
        
    })
    return defer.promise
}
//****************************UTILITY********************* */


function checkForFirstFreeSlot(date,time,userEmail){
  
  var promises = []
  var slot1 = getSlotFromHour(time)
  var form1 = {'date': date, 'ranges': [slot1,slot1 + 1, slot1 +2],'gameT':0,'courtsNumber':4,'circolo':'56be660ae49818d0034c9edf'}
  
  
  _.times(10,function(){
      var deferx = Q.defer()
     
      form1.ranges[0] = slot1
      form1.ranges[1] = slot1 + 1
      form1.ranges[2] = slot1 + 2
      
      request.post({url: config.ApiserverAddress + '/botApi/v1/checkBeforeCreateBooking', form: form1}, function(err,httpResponse,body){ 
       
        if (err || JSON.parse(body).status == 400 ){
          deferx.reject('err')
        } 
        else{
          deferx.resolve(JSON.parse(body).slot1)
        }
      })
      promises.push(deferx.promise)
      slot1++

  })
    return Q.allSettled(promises)
  
}


function getSlotFromHour(time){

        var splittedTime = time.split(':')
        var hour = splittedTime[0]
        var minute = splittedTime[1]
        if (minute != '00')
            return ((hour * 2)  + 2)
        return ((hour * 2) + 1)
}
function getHourMinuteFromSlot(r){
      var ret = "";
      try{
        
        r  = parseInt(r) - 0.5
        
        if (parseInt(r) % 2 === 0 ){
          ret+=(parseInt(r) / 2)
          ret+=".00"
        }
        else{
            ret+=(parseInt(r / 2))
            ret+=".30"
        } 
       
      }
      catch(err){
        
      }
      
        
      return ret;
    }



