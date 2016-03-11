var Words = require('elegant-words');

var words = new Words();
words.loadJSONModel( require("./blurbs.json") );

module.exports = {
  toString:function(r,xml){
    return words.generate({ random:r }).toString();
  }
}
