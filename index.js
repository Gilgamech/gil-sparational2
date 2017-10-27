var express = require('express');
var app = express();

fruitbotwin = 0
fruitbotloss = 0
fruitbottie = 0

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});
app.get('/port', function(request, response) {
  response.render('pages/port');
});

app.get('/fruitbot', function(request, response) {
  response.render('pages/fruitbot');
});
app.get('/fruitbotwin', function(request, response) {
  fruitbotwin++
  res.send('OK');
  //response.send(fruitbotwin);
});
app.get('/fruitbotloss', function(request, response) {
  fruitbotloss++
  response.json(fruitbotloss);
});
app.get('/fruitbottie', function(request, response) {
  fruitbottie++
  response.send('fruitbottie');
});

app.get('/Arkdata', function(request, response) {
  response.render('pages/Arkdata');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

