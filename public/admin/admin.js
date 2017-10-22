const client = 'WERNER'
var question;
var MODE = {
  ANSWERING:{ value:0, name:'answering'},
  STATS:    { value:1, name:'statistics'},
}

var statsIndex = 0
var mode = MODE.ANSWERING
var chart

function renderQuestion(data) {
  $('#question').css('visibility', 'visible')
  question = (data);
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
  $('#mode_stats').addClass('btn-success')
  $('#mode_answering').removeClass('btn-success')
  mode = MODE.STATS
  $.ajax("/admin/stats/"+statsIndex).done(function(data) {
    stat = (data);
    $('#question').html(stat.question.question)
    renderStats(data)
  })
}

function answering() {
  $('#mode_answering').addClass('btn-success')
  $('#mode_stats').removeClass('btn-success')
  $('#stats').hide()
  $('#answering').show()
  mode = MODE.ANSWERING
  getQuestion()
}

function renderStats(data) {
  $('#answering').hide();
  $('#stats').show();

  const json = (data);
  var ctx = $("#chart").get(0).getContext('2d');

  var footerFunc = function(tooltipItems, data) {
    if(tooltipItems.length<=0 || data.datasets.length <=0) return "";
    let label = tooltipItems[0].xLabel
    let clients = data.datasets[0].server.users[label]
    if(clients != null )
      return clients.filter((v, i, a) => a.indexOf(v) === i).join("\n")
    return ""
  }

  if(chart != null) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(json.histogram),
      datasets: [{
        server: json,
        label: 'Ergebnisse',
        data: Object.values(json.histogram),
        backgroundColor: Object.keys(json.histogram).map(label => label === json.question.correct ? 'rgba(75, 192, 192, 0.8)' : 'rgba(54, 162, 235, 0.2)'),
        borderWidth: 1
      }]
    },
    options: {
      legend: { display: false },
      tooltips: {
        mode: 'index',
        callbacks: {
          // use footer callback to display the image
          footer: footerFunc
        }
      },
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
    client: client
  });
  // play sound
  const audio = $(element).find('audio')[0];
  audio.play();
}
