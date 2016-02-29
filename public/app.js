$(function(){
  var activeSet = [];

  pickRandoms(3);

  function pickRandoms(n){
    activeSet = [];
    $( ".sample" ).each(function( index , e ) {
      var element = $(e);
      if ( index < n ){
        element.show();
        var seed = Math.floor(Math.random() * 4028);
        element.data("seed",seed);
        element.find("button").text("vote "+seed).removeAttr('disabled');
        element.find("img").attr("src","/gen/"+seed);
        activeSet.push(seed);
      }else{
        element.hide();
      }
    });
  }

  $( "body" ).on( "click", "img", function(event) {
    var target = $(event.target);
    window.open(target.attr('src'), 'name'); 
  });

  $( "body" ).on( "click", "button.more", function(event) {
    pickRandoms(3);
  });

  $( "body" ).on( "click", "button.vote", function(event) {
    var target = $(event.target);
    var sample = target.closest(".sample");
    var best = sample.data("seed");
    var n = activeSet.indexOf(best);
    activeSet.splice( n , 1 );
    var others = activeSet;
    $.post( "vote?best="+best+"&bad1="+activeSet[0]+"&bad2="+activeSet[1]+"&pos="+n, function( data ) {
      // ignore
      console.log(data);
    });
    pickRandoms();
  });


  $( "body" ).on( "click", "button.best", function(event) {
    $.get( "best" ,function(data){
      console.log(data);
      $( ".sample" ).each(function( index , e ) {
        var element = $(e);
        if ( data.length > 0 ){
          var i = data.splice(0,1)[0]; // pop from front
          var seed = i.best
          element.data("seed",seed);
          element.find("button").text( i.c+" votes ["+seed+"]" ).attr('disabled','disabled');
          element.find("img").attr("src","/gen/"+seed);
          element.show();
          activeSet.push(seed);
        }else{
          element.hide();
        }
      });
    });
  });

});
