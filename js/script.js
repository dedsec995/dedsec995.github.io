
(function($) { "use strict";
		
	
	//About page
	
	$(".about-text").on('click', function () {
		$("body").addClass("about-on");
	});
	$(".about-close").on('click', function () {
		$("body").removeClass("about-on");
	});

	
	//Contact page
	
	$(".contact-text").on('click', function () {
		$("body").addClass("contact-on");
	});
	$(".contact-close").on('click', function () {
		$("body").removeClass("contact-on");
	});

	
	//status portfolio page
	
	$(".status").on('click', function () {
		$("body").addClass("status-on");
	});
	$(".status-close").on('click', function () {
		$("body").removeClass("status-on");
	});

	
	//workexperience portfolio page
	
	$(".work_ex").on('click', function () {
		$("body").addClass("workexperience-on");
	});
	$(".workexperience-close").on('click', function () {
		$("body").removeClass("workexperience-on");
	});

	
	//projects portfolio page
	
	$(".projects").on('click', function () {
		$("body").addClass("projects-on");
	});
	$(".projects-close").on('click', function () {
		$("body").removeClass("projects-on");
	});

	
})(jQuery);