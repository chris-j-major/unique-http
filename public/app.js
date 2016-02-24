$(function(){
  var activeSet = [];

  pickRandoms();

  function pickRandoms(){
    activeSet = [];
    $( ".sample" ).each(function( index , e ) {
      var element = $(e);
      var seed = Math.floor(Math.random() * 4028);
      element.data("seed",seed);
      element.find("button").text("vote "+seed);
      element.find("img").attr("src","/gen/"+seed);
      activeSet.push(seed);
    });
  }

  $( "body" ).on( "click", "button", function(event) {
    var target = $(event.target);
    var sample = target.closest(".sample");
    if ( sample ){
      var best = sample.data("seed");
      var n = activeSet.indexOf(best);
      activeSet.splice( n , 1 );
      var others = activeSet;
      $.post( "vote?best="+best+"&bad1="+activeSet[0]+"&bad2="+activeSet[1], function( data ) {
        // ignore
        console.log(data);
      });
      pickRandoms();
    }else{
      // reload button
      pickRandoms();
    }
  });

});
