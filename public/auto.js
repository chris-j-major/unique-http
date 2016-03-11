
function Frame( cls ){
  this.elem = $("<div>").addClass("frame").addClass(cls);
  this.image = $("<div>").addClass("image");
  this.blurb = $("<div>").addClass("blurb");
  this.elem.append( this.image ).append( this.blurb );
  this.image.append($("<img>"));
}
Frame.prototype.load = function(seed , f ){
  this.image.find("img").attr("src","/gen/"+seed);
  this.blurb.load("/blurb/"+seed);
  f();
}
Frame.prototype.setSize = function(w,h){
  this.elem.css("width",w+"px");
  this.elem.css("height",h+"px");
}

var active = null;
var inactive = null;

function slideFrames(){
  inactive.elem.css("left","100%").animate({
    "left":"0%"
  },500);
  active.elem.css("left","0%").animate({
    "left":"-100%"
  },500);
  var t = inactive;
  inactive = active;
  active = t;
  setTimeout( loadNew , 5000 )
}

function loadNew(){
  inactive.load( getNextImage()  , slideFrames );
}

var toLoadList = [];
function fetchMore(){
  $.get( "best" ,function(data){
    list = data.map(function(n){return n.best});
    toLoadList = toLoadList.concat(list);
  });
}
function getNextImage(){
  var next = 0;
  if ( toLoadList.length > 0 ){
    next = toLoadList.splice(0,1)[0];
  }
  if ( toLoadList.length < 3 ){
    fetchMore();
  }
  console.log(next);
  return next;
}

fetchMore();
$(function(){
  // construct two frames (to allow sliding)
  var frame1 = new Frame("frame1");
  var frame2 = new Frame("frame2");
  active = frame1;
  inactive = frame2;

  var count = 2;
  function ready(){
    count --;
    if ( count == 0 ){
      $("body").append( frame1.elem ).append( frame2.elem );
      slideFrames();
    }
  }

  frame1.load(getNextImage(),ready);
  frame2.load(getNextImage(),ready);

  $w = $( window );
  $w.resize(updateSize);
  function updateSize() {
    var w = $w.width();
    var h = $w.height();
    console.log(w,h);
    frame1.setSize(w,h);
    frame2.setSize(w,h);
  }
  updateSize();
});
