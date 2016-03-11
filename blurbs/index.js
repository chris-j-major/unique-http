var Words = require('elegant-words');

var words = new Words();
words.loadJSONModel( require("./blurbs.json") );

var image = null;

words.extendModel( 'COLOUR' , function(){
  return image.keySearch("colour");
});
words.extendModel( 'POINTSET' , function(){
  return image.keySearch("pointset");
});
words.extendModel( 'SHAPE' , function(){
  return image.keySearch("shape");
});
words.extendModel( 'LINE' , function(){
  return image.keySearch("line");
});
words.extendModel( 'SPACIAL' , function(){
  return image.keySearch("spacial");
});

module.exports = {
  toString:function(r,i){
    image = i;
    return words.generate({ random:r }).toString();
  }
}
