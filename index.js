var express = require('express');
var unique = require('unique-wallpaper')({});
var app = express();

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
