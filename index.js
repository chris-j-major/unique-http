var express = require('express');
var pg = require('pg');
var unique = require('unique-wallpaper')({});
var app = express();

var wallpaperVersion = require('./node_modules/unique-wallpaper/package.json').version;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/gen/:id(\\d+)', function (req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(unique.start(req.params.id).writeXML( true /* pretty */ ));
});

var DEFAULT_DB = "postgres://localhost:5432/results";

app.post('/vote', function (request, response) {
  pg.connect(process.env.DATABASE_URL||DEFAULT_DB, function(err, client, done) {
    if ( err )
     { console.error(err); return response.send("Error " + err); }
    var best = request.query.best;
    var bad1 = request.query.bad1;
    var bad2 = request.query.bad2;
    var ip = request.connection.remoteAddress;
    var pos = request.query.pos;
    client.query('INSERT INTO results(best,bad1,bad2,ip,version,position) VALUES ($1,$2,$3,$4,$5,$6)', [best,bad1,bad2,ip,wallpaperVersion,pos] , function(err) {
      done();
      if (err){
        console.error(err);
        response.send("Error " + err);
      }else{
        response.send("OK");
      }
    });
  });
});


app.get('/data', function (request, response) {
  pg.connect(process.env.DATABASE_URL||DEFAULT_DB, function(err, client, done) {
    if ( err )
     { console.error(err); return response.send("Error " + err); }
    client.query('SELECT * FROM results', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         var str = "best,bad,bad,ip,timestamp\n";
         for ( var rowid in result.rows ){
           var r = result.rows[rowid];
           str+= r.best+","+r.bad1+","+r.bad2+","+r.ip+","+r.my_timestamp+","+r.version+","+r.position+"\n";
         }
         response.attachment('data.csv').send(str);
       }
    });
  });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'), "\nUsing wallpaper version ", wallpaperVersion);
});
