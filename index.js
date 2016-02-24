var express = require('express');
var unique = require('unique-wallpaper')({});
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/gen/:id(\\d+)', function (req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(unique.start(req.params.id).writeXML( true /* pretty */ ));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
