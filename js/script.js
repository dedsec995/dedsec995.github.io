import { loadModel } from './avatar.js';
(function ($) {
	"use strict";

	// -------------------------------Loading screen-----------------------------
	const stars = 100;

	for (let i = 0; i < stars; i++) {
		let star = document.createElement("div");
		star.className = 'stars';
		var xy = randomPosition();
		star.style.top = xy[0] + 'px';
		star.style.left = xy[1] + 'px';
		document.body.append(star);
	}

	function randomPosition() {
		var y = window.innerWidth;
		var x = window.innerHeight;
		var randomX = Math.floor(Math.random() * x);
		var randomY = Math.floor(Math.random() * y);
		return [randomX, randomY];
	}

	setTimeout(function () {
		document.querySelector('.intro').style.display = 'none';
		document.querySelector('.logo').style.display = 'none';
		document.querySelector('#scroller').style.display = 'none';
		document.querySelector('#loading-screen').style.display = 'none';
		const stars = document.querySelectorAll('.stars');
		stars.forEach(star => star.remove());
	}, 7800);

	setTimeout(function () {
		loadModel();
	}, 7000);

	// ------------------------------Loading Scr33n-----------------------

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


    // Popup
    document.addEventListener('DOMContentLoaded', function () {
		const materialPopup = document.getElementById('material-popup');
		// Show the popup
		materialPopup.classList.add('show');
		// Hide the popup after 8 seconds
		setTimeout(function () {
		  materialPopup.classList.remove('show');
		}, 13000);

		// Add event listener to "Whats Next?" card
		const whatsNextCard = document.getElementById('whats-next-card');
		whatsNextCard.addEventListener('click', function () {
		  // Close workexperience-section
		  $("body").removeClass("workexperience-on");
	  
		  // Open contact-section
		  $("body").addClass("contact-on");
		});

	  });


})(jQuery);