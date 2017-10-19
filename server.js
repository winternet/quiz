var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var WebSocket = require('ws')
var game = require('./game')

var app = express()

var answers = new Map()
var blacklist = new Map()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))
app.use('/mustache', express.static(__dirname + '/node_modules/mustache/'))

const wss = new WebSocket.Server( {port:8999} );

wss.on('connection', function(ws) {
  // send the question
  ws.send(JSON.stringify(game.question()))

  ws.on('message', function(msg) {
    const answer = JSON.parse(msg);
    console.log("received: %s", (JSON.stringify(answer)));

    // if id already exists - push back
    if(answers.has(answer.id)) {
      var choices = answers.get(answer.id);
      choices.push(answer.choice);
    } else {
      answers.set(answer.id, [answer.choice])
    }
    console.log( (answers))
  })
})

var broadcast = function() {
  wss.clients.forEach(function(client) {
    if(client !== wss && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(game.question()));
    }
  })
}

app.get('/admin/next', function(req, res) {
  const n = game.next()
  res.end("OK -\n" + JSON.stringify(n))
  broadcast()
})

app.get('/admin/prev', function(req, res) {
  const p = game.prev()
  res.end("OK -\n" + JSON.stringify(p))
  broadcast()
})

var server = app.listen(8080, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('quit listening at http://%s:%s', host, port);
});
