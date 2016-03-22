var Words = require('elegant-words');
var fs = require('fs');
var jsonlint = require("jsonlint");

var words = new Words();

var jsontext = fs.readFileSync("./blurbs/blurbs.json");
var json = jsonlint.parse(jsontext.toString());
words.loadJSONModel( json );

var namestext = fs.readFileSync("./blurbs/names.txt");
var names = parseKeyValueText( namestext.toString() );
words.loadJSONModel( names );

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
words.extendModel( 'FILTER' , function(){
  return image.terms["filter"];
});
words.extendModel( 'CONCEPT' , function(){
  return image.terms["concept"];
});
words.extendModel( 'SPLIT' , function(){
  return image.terms["split"];
});
words.extendModel( 'SHAPE-COLOUR' , function(){
  return image.terms["shape-color"];
});

module.exports = {
  toString:function(r,i){
    image = i;
    return words.generate({ random:r }).toString();
  }
}

function parseKeyValueText(data){
  var lines = data.replace(/[^- A-Za-z0-9+,.]/,"").split("\n");
  var re = new RegExp("^ ([A-Z]+) (.+)");
  var retval = {};
  lines.map(function(line){
    var m = re.exec(line);
    if ( m ){
      var key = m[1];
      var value = m[2].toLowerCase();
      if ( !retval[key] ){
        retval[key] = [];
      }
      retval[key].push( value );
    }
  });
  return retval;
}
