var ws;
var question;
var choice;
var options;

$(function() {
  console.log('trying to get options...')
  console.log('trying to establish websocket connection...')

  //TODO this will not work remote
  ws = new WebSocket('ws://'+window.location.host+':8999');
  ws.onopen = function() {
    console.log('successfully established websocket connection')
  }
  ws.onmessage = function(msg) {
    question = JSON.parse(msg.data)
    renderQuestion(question)
  }
  console.log('trying to prohibit auto-sleep')
  // note that this is an ugly hack
  // that shouldn't be used, however
  // playing videos in the background
  // is the only solution to prohibit
  // auto-sleep
  const nosleep = new NoSleep()
  nosleep.enable()
});

function renderQuestion(q) {
  if( questionAlreadyAnswered(q) ) {
    showWait(q)
    return;
  }

  showQuestions(q)
  $('#question').html(q.question)
  var template = $('#choices-template').html();
  var choices = Handlebars.compile(template)(q);
  $('#choices').html(choices);
}

function choose(element) {
  $('label.element-animation1').removeClass('btn-info')
  $(element).addClass('btn-info')
  choice = $(element).find('.choice_label').html()
  choice = $.trim(choice)
}

function answer() {
  if(choice == null) {
    //--- no answer given
    showWait(question)
    return
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

function showQuestions(question) {
  $('#questions').show()
  $('#wait').hide()
  $('.progress').css('visibility', 'visible')
  //clean cookies to enable step back
  Object.keys(Cookies.get()).forEach(function(k) {Cookies.remove(k)})
  countdown(answer, options)
}

function showWait(question) {
  $('#questions').hide()
  $('#wait').show()
  $('.progress').css('visibility', 'hidden')
  if(question != null && question.id != null)
    Cookies.set('quiz-'+question.id, 'true');
}

function questionAlreadyAnswered(question) {
  return Cookies.get("quiz-"+question.id) != null;
}

function countdown(callback, options) {
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
