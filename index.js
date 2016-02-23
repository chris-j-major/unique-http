var express = require('express');
var unique = require('unique-wallpaper')({});
var app = express();

app.set('port', (process.env.PORT || 5000));

var id = 0;
app.get('/', function (req, res) {
  id ++;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(unique.start(id).writeXML( true /* pretty */ ));
});

app.get('/:id', function (req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(unique.start(req.params.id).writeXML( true /* pretty */ ));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
