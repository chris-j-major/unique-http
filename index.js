var express = require('express');
var pg = require('pg');
var svg2png = require('svg2png');
var CacheControl = require("express-cache-control")
var Unique = require('unique-wallpaper');
var unique = new Unique({
  width:800,
  height:600,
  swatch:false // debug only
});

var randomSeed = require('random-seed');
var blurbs = require('./blurbs');
var app = express();

var cache = new CacheControl().middleware;

var wallpaperVersionName = require('./node_modules/unique-wallpaper/package.json').version;
var wallpaperVersion = Unique.versionIdent;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/gen/:id(\\d+)',  cache("hours", 24), function (req, res) {
  res.setHeader('Content-Type', 'image/png');
  var image = unique.create( parseInt(req.params.id) );
  var buffer = new Buffer( image.toXML( false ) , "utf-8")
  //res.send( image.toXML( false ) );
  svg2png(buffer , { width: 800, height: 600 })
    .then(function(buffer){ res.send(buffer) })
    .catch(function(e){res.status(500).send(e)});
});

app.get('/details/:id(\\d+)',  cache("hours", 24), function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  var image = unique.create( parseInt(req.params.id) );
  res.send( image.toDescription() +"\n\n"+JSON.stringify(image.terms,2,4) );
});

app.get('/blurb/:id(\\d+)',  cache("hours", 24) , function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  var r = new randomSeed(req.params.id);
  var image = unique.create( parseInt(req.params.id) );
  var b = blurbs.toString( r.random , image );
  res.send( b );
});

var DEFAULT_DB = "postgres://localhost:5432/results";

app.post('/vote',  cache("seconds", 0), function (request, response) {
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

app.get('/data',  cache("seconds", 0), function (request, response) {
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

app.get('/best',  cache("seconds", 30), function (request, response) {
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

app.get('/recent',  cache("seconds", 30), function (request, response) {
  pg.connect(process.env.DATABASE_URL||DEFAULT_DB, function(err, client, done) {
    if ( err )
     { console.error(err); return response.send("Error " + err); }
    client.query('SELECT best FROM results WHERE version=$1 ORDER BY my_timestamp DESC LIMIT 20',[wallpaperVersion], function(err, result) {
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
  console.log('Node app is running on port', app.get('port'), " using wallpaper version ", wallpaperVersion," from "+wallpaperVersionName);
});
