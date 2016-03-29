var frameWidth = 800;
var frameHeight = 600;
var screenWidth =1024;
var screenHeight = 2048;
var framePos = (screenWidth - frameWidth) * 0.5;

function Frame( cls ){
  var frame = this;
  this.id = cls;
  this.onLoad = null;
  this.elem = $("<div>").addClass("frame").addClass(cls);
  this.image = $("<div>").addClass("image");
  this.blurb = $("<div>").addClass("blurb");
  this.blurbspan = $("<span>");
  this.blurb.append(this.blurbspan);
  this.elem.append( this.image ).append( this.blurb );
  this.image.append($("<img>").load(function(){
    if ( frame.onLoad ){
      frame.onLoad();
    }
    frame.onLoad = null;
  }));
  this.elem.hide(); // start hidden
}
Frame.prototype.load = function(seed , f ){
  var frame = this;
  var $img = this.image.find("img");
  $img.attr("src","/gen/"+seed+"?width="+frameWidth);
  this.blurbspan.load("/blurb/"+seed);
  this.onLoad = f;
}
Frame.prototype.prepare = function(){
  autoSizeFont( this.blurb, this.blurbspan );
}
Frame.prototype.setSize = function(){
  this.elem.css("width",frameWidth+"px")
    .css("height",frameHeight+"px")
    .css("top",((screenHeight-frameHeight)*0.5)+"px");
  autoSizeFont( this.blurb, this.blurbspan );
}

var epsilon = 2;

function autoSizeFont( $container , $target , fontSize ){
  fontSize = (fontSize || parseInt($target.css('font-size')) || 32);
  var targetHeight = $container.height();
  if ( targetHeight < 5 ) return; // skip if sizing is already tiny
  $target.css('font-size', fontSize);
  if ( $target.text().length < 1 ) return; // skip if we have no text
  autoSizeFactor( 0.5 );
  autoSizeFactor( 0.8 );
  autoSizeFactor( 0.95 );
  function autoSizeFactor( less  ){
    var more = 1/less;
    var countdown = 30;
    var delta = targetHeight - $target.height();
    while( delta > epsilon ){ /* increace */
      fontSize *= more;
      $target.css('font-size', fontSize);
      delta = targetHeight - $target.height();
      if ( countdown-- < 0 ) return;
    }
    while ( delta < -epsilon ){ /* decreace */
      fontSize *= less;
      $target.css('font-size', fontSize);
      delta = targetHeight - $target.height();
      if ( countdown-- < 0 ) return;
    }
  }
}

var active = null;
var inactive = null;
var timeout = null;

function slideFrames(){
  var t = inactive;
  inactive = active;
  active = t;

  active.elem.css({"left":screenWidth}).show().animate({
    "left":framePos
  },500);
  inactive.elem.animate({
    "left":"-"+screenWidth
  },500,function(){
    inactive.elem.hide(); // ready for next incomming
  });
  setTimeout(function(){
    active.prepare(); // mainly does the sizing, but needs to wait untill after we're visible
  },0);
  timeout = setTimeout( loadNew , 30000 )
}

function loadNew(){
  if ( ! timeout ){
    clearTimeout(timeout);
    timeout = null;
  }
  inactive.load( getNextImage() , slideFrames );
}

$(document).click( loadNew );

var toLoadList = [];
function fetchMore(){
  var list = [];
  $.get( "best" ,function(data){
    if ( data ){
      list = data.map(function(n){return n.best});
    }
    $.get( "recent" ,function(data){
      if ( data ){
        list = list.concat(data.map(function(n){return n.best}));
      }
      shuffle(list) ;
      toLoadList = toLoadList.concat( list );
    });
  });
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function getNextImage(){
  var next = 0;
  if ( toLoadList.length > 0 ){
    next = toLoadList.splice(0,1)[0];
  }
  if ( toLoadList.length < 3 ){
    fetchMore();
  }
  return next;
}

// construct two frames (to allow sliding)
var frame1 = new Frame("frame1");
var frame2 = new Frame("frame2");
active = frame1;
inactive = frame2;

fetchMore();
$(function(){

  var count = 2;
  function ready(){
    count --;
    if ( count == 0 ){
      $("body").append( frame1.elem ).append( frame2.elem );
      slideFrames();
    }
  }

  setTimeout(function(){
    $.get( "best" ,function(data){
      var list = data.map(function(n){return n.best});
      toLoadList = list;
      frame1.load(getNextImage(),ready);
      frame2.load(getNextImage(),ready);
    });
  },100)

  $w = $( window );
  $w.resize(updateSize);
  $w.ready(updateSize);

  function updateSize() {
    screenWidth = $w.width();
    screenHeight = $w.height();
    if ( (screenWidth > 7016) && (screenHeight > 4961) ){
      frameWidth = 7016;
      frameHeight = 4961;
      $("body").addClass("large").removeClass("small").removeClass("med");
    }else if ( screenWidth > 2048 && screenHeight > 1448 ){
      frameWidth = 2048;
      frameHeight = 1448;
      $("body").addClass("med").removeClass("small").removeClass("large");
    }else if ( screenWidth > 1024 && screenHeight > 724 ){
      frameWidth = 1024;
      frameHeight = 724;
      $("body").addClass("med").removeClass("small").removeClass("large");
    }else{
      frameWidth = 512;
      frameHeight = 362;
      $("body").addClass("small").removeClass("med").removeClass("large");
    }

    framePos = (screenWidth - frameWidth) * 0.5;
    frame1.setSize();
    frame2.setSize();

    // set the active and inactive elements directly
    active.elem.css("left",framePos);
    inactive.elem.css("left",screenWidth);
  }
  updateSize();
});
