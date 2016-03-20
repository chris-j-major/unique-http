$(function(){
  var activeSet = [];

  pickRandoms(3);

  function pickRandoms(n){
    activeSet = [];
    $( ".sample" ).each(function( index , e ) {
      var element = $(e);
      var seed = Math.floor(Math.random() * 4028);
      if ( index < n ){
        element.slideUp(200,function(){
          element.data("seed",seed);
          var img = element.find("img");
          img.attr("src","/gen/"+seed).load(function(){
            element.find("button").removeAttr('disabled');
            element.slideDown();
          })
        });
        activeSet.push(seed);
      }else{
        element.hide();
      }
    });
  }

  $( "body" ).on( "click", "img", function(event) {
    var target = $(event.target);
    var sample = target.closest(".sample");
    var best = sample.data("seed");
    voteFor(best);
  });

  $( "body" ).on( "click", "button.vote", function(event) {
    var target = $(event.target);
    var sample = target.closest(".sample");
    var best = sample.data("seed");
    voteFor(best);
  });

  function voteFor(best){
    var n = activeSet.indexOf(best);
    activeSet.splice( n , 1 );
    var others = activeSet;
    $("button.vote").attr('disabled',"disabled");
    $.post( "vote?best="+best+"&bad1="+activeSet[0]+"&bad2="+activeSet[1]+"&pos="+n, function( data ) {
      // ignore
      pickRandoms(3);
    });
  };
});
