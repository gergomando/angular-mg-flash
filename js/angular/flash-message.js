angular.module('flashMessage', []).
factory('notify', ['$window', function(win) {
   return function(head,body) {
        
        if (body) {
        	template = 	'<div class="flashMessage light-green-bg"><h4>' + head + '</h4>' + 
	        				'<p>' + body + '</p>'+
	        			'</div>';
        } 
        else {
    		template =	'<div class="flashMessage light-green-bg"><h4>' + head + '</h4></div>';
        }

        $('body').append(template);
		$(".flashMessage").fadeIn(1000).delay(2200);
		$(".flashMessage").fadeOut(1000, function(){
		  $(this).remove();
		});
   };
 }]);

