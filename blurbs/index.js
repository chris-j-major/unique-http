var Words = require('elegant-words');
var fs = require('fs');
var jsonlint = require("jsonlint");

var words = new Words();

var jsontext = fs.readFileSync("./blurbs/blurbs.json");
var json = jsonlint.parse(jsontext.toString());
words.loadJSONModel( json );

var image = null;

words.extendModel( 'COLOUR' , function(){
  var c = image.terms["color"];
  if ( !c || c.length == 0){
    c = image.terms['set-color'];
  }
  return c;
});
words.extendModel( 'POINTSET' , function(){
  return image.terms["pointset"];
});
words.extendModel( 'SHAPE' , function(){
  return image.terms["shape"];
});
words.extendModel( 'LINE' , function(){
  return image.terms["line"];
});
words.extendModel( 'SPACIAL' , function(){
  return image.terms["spacial"];
});

module.exports = {
  toString:function(r,i){
    image = i;
    return words.generate({ random:r }).toString();
  }
}
