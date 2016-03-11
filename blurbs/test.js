var randomSeed = require('random-seed');
var blurbs = require('./index');
var unique = require('unique-wallpaper')({});

for ( var i=0;i<50;i++){
  var r = new randomSeed(i);
  console.log("\n\n== "+i+" ==\n");
  console.log( blurbs.toString( r.random , unique.start(i) ) );
}
