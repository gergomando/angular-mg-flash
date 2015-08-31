$(document).ready(function(){
    $('select.styled').customSelect();

    $('.animated').appear(function(){
      var element = $(this);
      var animation = element.data('animation');
      var animationDelay = element.data('delay');
      if (animationDelay) {
        setTimeout(function(){
          element.addClass( animation + " visible" );
          element.removeClass('hiding');
          if (element.hasClass('counter')) {
            element.find('.value').countTo();
          }
        }, animationDelay);
      }else {
        element.addClass( animation + " visible" );
        element.removeClass('hiding');
        if (element.hasClass('counter')) {
          element.find('.value').countTo();
        }
      }    
    },{accY: -150});

    setCoverITextVertical();

// Set site header cover text vertical dimension
    function setCoverITextVertical(){
      var headerImg = $('#site-header img').height();      
      var headerImgMargin = $('#site-header img').css('margin-top');  
      var headerCoverText = $('#site-header .lead-centered-vertical').height();
      var headerCoverTextPosition = (headerImg/2 - headerCoverText/2) + parseInt(headerImgMargin); 

      $('#site-header .lead-centered-vertical').css('top',  headerCoverTextPosition + "px");
    }
    
    $( window ).resize(function() {
      setCoverITextVertical();
    });
// end of set site header cover text height 




});


