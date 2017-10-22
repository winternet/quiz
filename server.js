var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var WebSocket = require('ws')
var game = require('./game')

var app = express()

var answers = new Map()
var answerPerClient = new Map()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))
app.use('/mustache', express.static(__dirname + '/node_modules/mustache/'))
app.use('/handlebars', express.static(__dirname + '/node_modules/handlebars/'))

const wss = new WebSocket.Server( {port:8999} );

wss.on('connection', function(ws) {
  // send the question initially if game started
  if(game.question() != null)
    ws.send(JSON.stringify(game.question()))

  ws.on('message', function(msg) {
    const answer = JSON.parse(msg);
    console.log("received: %s", (JSON.stringify(answer)));

    handleAnswer(answer);
  })
})

function broadcast() {
  wss.clients.forEach(function(client) {
    if(client !== wss && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(game.question()));
    }
  })
}

function needsLogin(req, res, next) {
  const auth = { login: 'admin', password: 'secret' }
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  if(!login || !password || login !== auth.login || password !== auth.password) {
    res.set('WWW-Authenticate', 'Basic realm="nope"')
    res.status(401).send('Forbidden');
  } else {
    next();
  }
}

app.all('/admin/*', needsLogin, function(req, res, next) {
  //if(!isLoggedIn(req,res)) {
  //  res.send("foooo");
  //}
  //--- pass control to next handler
  next()
})

app.get('/admin/next', function(req, res) {
  const n = game.next()
  res.json(n)
  broadcast()
})

app.get('/admin/prev', function(req, res) {
  const p = game.prev()
  res.json(p)
  broadcast()
})

app.get('/admin/current', function(req, res) {
  const p = game.question()
  res.json(p)
})

app.post('/answer', function(req, res) {
  handleAnswer(req.body);
})

app.get('/admin/stats/:index', function(req, res) {
  const index = req.params.index
  question = game.index(index)

  //--- assert each choice is at least once in the list
  var merged = question.choices;
  if( answers.get(question.id) != null )
    merged = merged.concat(answers.get(question.id))

  var histogram = merged
    .reduce(function(accumulator,value) {
      accumulator[value] = (value in accumulator ? accumulator[value] + 1 : 1); 
      return accumulator
    }, {});
  Object.keys(histogram).map(function(k) { return --histogram[k] })
  //---

  res.json({
    question: question,
    histogram: histogram
  })
})

function handleAnswer(answer) {
  // validate
  if(answer.id !== game.question().id) {
    console.log("received invalid answer %s for question %s", answer, game.question());
    return
  }

  // special handling if client is set
  if(Object.keys(answer).includes('client') ) {
    var answerMap
    if(answerPerClient.has(answer.client)) {
      answerMap = answerPerClient.get(answer.client)
    } else {
      answerMap = new Map()
      answerPerClient.set(answer.client, answerMap);
    }
    answerMap.set(answer.id, answer.choice)
    console.log(answerMap)
  }

  // if id already exists - push back
  if(answers.has(answer.id)) {
    var choices = answers.get(answer.id);
    choices.push(answer.choice);
  } else {
    answers.set(answer.id, [answer.choice])
  }
  console.log((answers))
}

var server = app.listen(8080, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('quit listening at http://%s:%s', host, port);
});
