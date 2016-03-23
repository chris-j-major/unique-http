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

var banList = ["macaroni and cheese","icky green","dark"];

words.extendModel( 'COLOUR' , function(){
  var c = removeTerms(image.terms["color"],banList);
  if ( !c || c.length == 0){
    c = removeTerms(image.terms['set-color'],banList);
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
words.extendModel( 'MASK' , function(){
  return image.terms["mask"];
});
words.extendModel( 'OVERLAY' , function(){
  return image.terms["overlay"];
});
words.extendModel( 'SHAPE-COLOUR' , function(){
  return image.terms["shape-color"];
});
words.extendModel( 'TILES' , function(){
  return image.terms["tiles"];
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

function removeTerms( orig , remove ){
  for ( var id in remove ){
    var term = remove[id];
    var index = orig.indexOf(term);
    if ( index > 0 ){
      orig.splice(index,1); // remove
    }
  }
  return orig;
}
