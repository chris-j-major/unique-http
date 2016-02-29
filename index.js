var express = require('express');
var pg = require('pg');
var unique = require('unique-wallpaper')({});
var app = express();

var wallpaperVersion = require('./node_modules/unique-wallpaper/package.json').version;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/gen/:id(\\d+)', function (req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(unique.start(req.params.id).writeXML( false /* pretty */ ));
});

app.get('/details/:id(\\d+)', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send(unique.start(req.params.id).describe());
});

var DEFAULT_DB = "postgres://localhost:5432/results";

app.post('/vote', function (request, response) {
  pg.connect(process.env.DATABASE_URL||DEFAULT_DB, function(err, client, done) {
    if ( err )
     { console.error(err); return response.send("Error " + err); }
    var best = request.query.best;
    var bad1 = request.query.bad1;
    var bad2 = request.query.bad2;
    var ip = getClientIp(request);
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

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

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
});

app.get('/best', function (request, response) {
  pg.connect(process.env.DATABASE_URL||DEFAULT_DB, function(err, client, done) {
    if ( err )
     { console.error(err); return response.send("Error " + err); }
    client.query('SELECT best, count(*) AS c FROM results WHERE version=$1 GROUP BY best ORDER BY c DESC LIMIT 20',[wallpaperVersion], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         response.send( result.rows );
       }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'), " using wallpaper version ", wallpaperVersion);
});
