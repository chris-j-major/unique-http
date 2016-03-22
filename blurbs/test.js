var randomSeed = require('random-seed');
var blurbs = require('./index');
var Unique = require('unique-wallpaper');

var unique = new Unique({
  width:800,
  height:600,
  swatch:false // debug only
});

var i = 0;
function gen(){
  i++;
  var r = new randomSeed(i);
  console.log("\n\n== "+i+" ==\n");
  var image = unique.create( i );
  console.log( blurbs.toString( r.random , image ) );
  console.log( image.terms );
}
setInterval(gen,2000);
