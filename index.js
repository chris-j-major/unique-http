var express = require('express');
var morgan = require("morgan");
var pgp = require('pg-promise')(/*options*/);
var svg2png = require('svg2png');
var CacheControl = require("express-cache-control")
var Unique = require('unique-wallpaper');
var blurbs = require('./blurbs');
var randomSeed = require('random-seed');

const ONE_DAY = 86400000;
const DEFAULT_DB = "postgres://localhost:5432/results";

var unique = new Unique({
  width:800,
  height:600,
  swatch:false // debug only
});

var db = pgp(process.env.DATABASE_URL||DEFAULT_DB); // database instance;
var app = express();

if (app.get('env') == 'production') {
  app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 } }));
} else {
  app.use(morgan('dev'));
}

var cache = new CacheControl().middleware;

var wallpaperVersionName = require('./node_modules/unique-wallpaper/package.json').version;
var wallpaperVersion = Unique.versionIdent;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public',{ maxAge: ONE_DAY }) );

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


app.post('/vote',  cache("seconds", 0), function (request, response) {
  var best = request.query.best;
  var bad1 = request.query.bad1;
  var bad2 = request.query.bad2;
  var ip = getClientIp(request);
  var pos = request.query.pos;

  db.query('INSERT INTO results(best,bad1,bad2,ip,version,position) VALUES ($1,$2,$3,$4,$5,$6)', [best,bad1,bad2,ip,wallpaperVersion,pos])
    .then(function (data) {
      response.send("OK");
    })
    .catch(function (error) {
      console.error(err);
      response.send("Error " + err);
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
  db.query('SELECT * FROM results WHERE version=$1',[wallpaperVersion])
    .then(function (data) {
      var str = "best,bad,bad,ip,timestamp\n";
      for ( var rowid in data ){
        var r = data[rowid];
        str+= r.best+","+r.bad1+","+r.bad2+","+r.ip+","+r.my_timestamp+","+r.version+","+r.position+"\n";
      }
      response.attachment('data.csv').send(str);
    })
    .catch(function (error) {
      console.error(err);
      response.send("Error " + err);
    });
});

app.get('/best',  cache("seconds", 30), function (request, response) {
  db.query('SELECT best, count(*) AS c FROM results WHERE version=$1 GROUP BY best ORDER BY c DESC LIMIT 20',[wallpaperVersion])
    .then(function (data) {
      response.send(data);
    })
    .catch(function (error) {
      console.error(err);
      response.send("Error " + err);
    });
});

app.get('/recent',  cache("seconds", 30), function (request, response) {
  db.query('SELECT best FROM results WHERE version=$1 ORDER BY my_timestamp DESC LIMIT 20',[wallpaperVersion])
    .then(function (data) {
      response.send(data);
    })
    .catch(function (error) {
      console.error(err);
      response.send("Error " + err);
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'), " using wallpaper version ", wallpaperVersion," from "+wallpaperVersionName);
});
