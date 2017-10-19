var fs = require('fs')
var filename = 'game.json'

var hasStarted = false;
var step = 0
var game = undefined

fs.readFile( __dirname + '/' + filename, 'utf8', function(err, data) {
  if(err) {
    return console.log("ERROR - " + err);
  }
  game = JSON.parse(data);
  //TODO trim choices
  //game.questions.map(function(question) {
  //  question.choices.map(function(choice) {
  //    choice = choice.trim()
  //    return choice
  //  })
  //})
  console.log("READ - " + JSON.stringify(game));
});

exports.question = function() {
  console.log(game.questions);
  var q = game.questions[step];
  return q;
}

exports.next = function() {
  if(step >= game.questions.length-1) {
    // outro?
    return exports.question();
  }
  ++step
  return exports.question()
}

exports.prev = function() {
  if(step <= 0) {
    // intro?
    return exports.question();
  }
  --step
  return exports.question()
}
