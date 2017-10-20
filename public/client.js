var ws;
var question;
var choice;
var options;

$(function() {
  console.log('trying to get options...')
  $.ajax({})
  console.log('trying to establish websocket connection...')
  //TODO this will not work remote
  ws = new WebSocket('ws://localhost:8999');
  //ws = new WebSocket('ws://192.168.0.114:8999')
  ws.onopen = function() {
    console.log('successfully established websocket connection')
  }
  ws.onmessage = function(msg) {
    question = JSON.parse(msg.data);
    renderQuestion(question);
  }
});

var renderQuestion = function(q) {
  if( questionAlreadyAnswered(q) ) {
    showWait(q)
    return;
  }

  showQuestions(q)
  $('#question').html(q.question)
  var template = $('#choices-template').html();
  var choices = Mustache.to_html(template, q);
  $('#choices').html(choices);
}

var colorize = function(element) {
  $('label.element-animation1').removeClass('btn-info')
  $(element).addClass('btn-info')
  choice = $(element).find('.choice_label').html()
  choice = $.trim(choice)
}

var answer = function(element) {
  if(choice == null) {
    alert('Bitte wählen Sie eine Antwort aus, indem Sie auf Sie klicken')
    return;
  }

  if(question == null) {
    console.log("Something went wrong, no current question but answer was clicked")
    //TODO: handle error
    return 
  }

  //--- return object
  var answer = {
    id: question.id,
    choice: choice
  }

  try {
    ws.send(JSON.stringify(answer))
    showWait(question)
    choice = undefined;
    question = undefined;
  } catch(err) { 
    alert('Es ist ein Fehler aufgetreten, bitte erneut abstimmen')
    renderQuestion() 
  }
}

var showQuestions = function(question) {
  $('#questions').show()
  $('#wait').hide()
  $('.progress').css('visibility', 'visible')
  //clean cookies to enable step back
  Object.keys(Cookies.get()).forEach(function(k) {Cookies.remove(k)})
  countdown(showWait.bind(null, question), options)
}

var showWait = function(question) {
  $('#questions').hide()
  $('#wait').show()
  $('.progress').css('visibility', 'hidden')
  Cookies.set('quiz-'+question.id, 'true');
}

questionAlreadyAnswered = function(question) {
  return Cookies.get("quiz-"+question.id) != null;
}

countdown = function(callback, options) {
  options = {}
  options.countdown = 8;
  var bar = $('#progress-bar'), time = 0, max = options.countdown,
  int = setInterval(function() {
      bar.width(100-Math.floor(100 * time++ / max) + '%')
      if (time - 1 == max) {
          clearInterval(int);
          // 600ms - width animation time
          callback && setTimeout(callback, 600);
      }
  }, 1000);
}
