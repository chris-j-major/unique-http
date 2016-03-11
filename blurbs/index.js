var Words = require('elegant-words');

var words = new Words();
words.loadJSONModel( require("./blurbs.json") );

var image = null;

words.extendModel( 'COLOUR' , function(){
  return image.keySearch("colour");
});


module.exports = {
  toString:function(r,i){
    image = i;
    return words.generate({ random:r }).toString();
  }
}
