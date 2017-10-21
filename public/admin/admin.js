var question;

function readQuestion(data) {
  question = JSON.parse(data);
  $('#question').html(question.question)

  var template = $('#choices-template').html();
  var choices = Handlebars.compile(template)(question);
  $('#choices').html(choices);
}

function getQuestion() {
  $.ajax("/admin/current").done(function(data) {
    readQuestion(data);
  })
}

$(function() {
  console.log("initialize")
  getQuestion();

  Handlebars.registerHelper('ifEqual', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
})

function next() {
  $.ajax("/admin/next").done(function(data) {
    readQuestion(data);
  })
}

function prev() {
  $.ajax("/admin/prev").done(function(data) {
    readQuestion(data);
  })
}

function stats() {
  $.ajax("/admin/stats").done(function(data) {
    readQuestion(data);
  })
}

function choose(element) {
  const audio = $(element).find('audio')[0];
  audio.play();
}
