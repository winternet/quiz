var question;
var MODE = {
  ANSWERING:{ value:0, name:'answering'},
  STATS:    { value:1, name:'statistics'},
}

var statsIndex = 0
var mode = MODE.ANSWERING

function renderQuestion(data) {
  question = JSON.parse(data);
  $('#question').html(question.question)

  var template = $('#choices-template').html();
  var choices = Handlebars.compile(template)(question);
  $('#choices').html(choices);
}

function getQuestion() {
  $.ajax("/admin/current").done(function(data) {
    renderQuestion(data);
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
  if(mode == MODE.ANSWERING) {
    $.ajax("/admin/next").done(function(data) {
      renderQuestion(data);
    })
  } else if(mode == MODE.STATS) {
    //TODO do not increase if lasat question
    statsIndex++
    stats();
  }
}

function prev() {
  if(mode == MODE.ANSWERING) {
    $.ajax("/admin/prev").done(function(data) {
      renderQuestion(data);
    })
  } else if(mode == MODE.STATS) {
    if(statsIndex > 0) {
      statsIndex--
    }
    stats();
  }
}

function stats() {
  mode = MODE.STATS
  $.ajax("/admin/stats/"+statsIndex).done(function(data) {
    stat = JSON.parse(data);
    $('#question').html(stat.question.question)
    renderStats(data)
  })
}

function answering() {
  $('#stats').hide();
  $('#answering').show();
  mode = MODE.ANSWERING
}

function renderStats(data) {
  $('#answering').hide();
  $('#stats').show();

  const json = JSON.parse(data);
  var ctx = $("#chart").get(0).getContext('2d');
  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(json.histogram),
      datasets: [{
        label: 'Ergebnisse',
        data: Object.values(json.histogram),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{
          ticks: {
            fontSize:18,
            fontStyle:'bold'
          }
        }],
        yAxes: [{
          display: false,
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
}

function choose(element) {
  choice = $(element).find('.choice_label').html()
  choice = $.trim(choice)

  $.post('/answer', {
    id: question.id,
    choice: choice,
    client: 'ADMIN'
  }).done(function() {
    alert('done')
  });
  // play sound
  const audio = $(element).find('audio')[0];
  audio.play();
}
