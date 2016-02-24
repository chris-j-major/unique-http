$(function(){
  pickRandoms();

  function pickRandoms(){
    $( ".sample" ).each(function( index , e ) {
      var element = $(e);
      var seed = Math.floor(Math.random() * 4028);
      element.data("seed",seed);
      element.find("button").text("vote "+seed);
      element.find("img").attr("src","/gen/"+seed);
    });
  }

  $( "body" ).on( "click", "button", function() {
    pickRandoms();
  });

});
