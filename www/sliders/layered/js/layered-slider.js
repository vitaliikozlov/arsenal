			(function($) {
				$.fn.parallaxSlider = function(options) {
					var opts = $.extend({}, $.fn.parallaxSlider.defaults, options);
					return this.each(function() {
						var $container 	= $(this),
						o 				= $.meta ? $.extend({}, opts, $container.data()) : opts;
						
						//the main slider
						var $slider		= $('.lslider',$container),
						//the elements in the slider
						$elems			= $slider.children(),
						//total number of elements
						total_elems		= $elems.length,
						//the navigation buttons
						$next		= $('.lnext',$container),
						$prev		= $('.lprev',$container),
						//the bg images
						$bg1		= $('.bg1',$container),
						$bg2		= $('.bg2',$container),
						$bg3		= $('.bg3',$container),
						//current image
						current			= 0,
						//the thumbs container
						$thumbnails = $('.thumbnails',$container),
						//the thumbs
						$thumbs			= $thumbnails.children(),
						//the interval for the autoplay mode
						slideshow,
						//the loading image
						$loading	= $('.lloading',$container),
						$slider_wrapper = $('.lslider_wrapper',$container);
							
						//first preload all the images
						var loaded		= 0,
						$images		= $slider_wrapper.find('img');
							
						$images.each(function(){
							var $img	= $(this);
							$('<img/>').load(function(){
								++loaded;
								if(loaded	== total_elems*2){
									$loading.hide();
									$slider_wrapper.show();
										
									//one images width (assuming all images have the same sizes)
									var one_image_w		= $slider.find('img:first').width();
							
									/*
									need to set width of the slider,
									of each one of its elements, and of the
									navigation buttons
									 */
									setWidths($slider,
									$elems,
									total_elems,
									$bg1,
									$bg2,
									$bg3,
									one_image_w,
									$next,
									$prev);
							
									/*
										set the width of the thumbs
										and spread them evenly
									 */
									$thumbnails.css({
										'width'			: one_image_w + 'px',
										'margin-left' 	: -one_image_w/2 + 'px'
									});
									var spaces	= one_image_w/(total_elems+1);
									$thumbs.each(function(i){
										var $this 	= $(this);
										var left	= spaces*(i+1) - $this.width()/2;
										$this.css('left',left+'px');
											
										if(o.thumbRotation){
											var angle 	= Math.floor(Math.random()*41)-20;
											//$this.css({
											//	'-moz-transform'	: 'rotate('+ angle +'deg)',
											//	'-webkit-transform'	: 'rotate('+ angle +'deg)',
											//	'transform'			: 'rotate('+ angle +'deg)'
											//});
										}
										//hovering the thumbs animates them up and down
										$this.bind('mouseenter',function(){
											$(this).stop().animate({top:'-10px'},100);
										}).bind('mouseleave',function(){
											$(this).stop().animate({top:'0px'},100);
										});
									});
										
									//make the first thumb be selected
									highlight($thumbs.eq(0));
										
									//slide when clicking the navigation buttons
									$next.bind('click',function(){
										++current;
										if(current >= total_elems)
											if(o.circular)
												current = 0;
										else{
											--current;
											return false;
										}
										highlight($thumbs.eq(current));
										slide(current,
										$slider,
										$bg3,
										$bg2,
										$bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
									$prev.bind('click',function(){
										--current;
										if(current < 0)
											if(o.circular)
												current = total_elems - 1;
										else{
											++current;
											return false;
										}
										highlight($thumbs.eq(current));
										slide(current,
										$slider,
										$bg3,
										$bg2,
										$bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
							
									/*
									clicking a thumb will slide to the respective image
									 */
									$thumbs.bind('click',function(){
										var $thumb	= $(this);
										highlight($thumb);
										//if autoplay interrupt when user clicks
										if(o.auto)
											clearInterval(slideshow);
										current 	= $thumb.index();
										slide(current,
										$slider,
										$bg3,
										$bg2,
										$bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
							
									/*
									activate the autoplay mode if
									that option was specified
									 */
									if(o.auto != 0){
										o.circular	= true;
										slideshow	= setInterval(function(){
											$next.trigger('click');
										},o.auto);
									}
							
									/*
									when resizing the window,
									we need to recalculate the widths of the
									slider elements, based on the new windows width.
									we need to slide again to the current one,
									since the left of the slider is no longer correct
									 */
									$(window).resize(function(){
										w_w	= $(window).width();
										setWidths($slider,$elems,total_elems,$bg1,$bg2,$bg3,one_image_w,$next,$prev);
										slide(current,
										$slider,
										$bg3,
										$bg2,
										$bg1,
										1,
										o.easing,
										o.easingBg);
									});

								}
							}).error(function(){
								alert('here')
							}).attr('src',$img.attr('src'));
						});
							
					});
				};
				
				//the current windows width
				var w_w				= $(window).width();
				
				var slide			= function(current,
				$slider,
				$bg3,
				$bg2,
				$bg1,
				speed,
				easing,
				easingBg){
					var slide_to	= parseInt(-w_w * current);
					$slider.stop().animate({
						left	: slide_to + 'px'
					},speed, easing);
					$bg3.stop().animate({
						left	: slide_to/2 + 'px'
					},speed, easingBg);
					$bg2.stop().animate({
						left	: slide_to/4 + 'px'
					},speed, easingBg);
					$bg1.stop().animate({
						left	: slide_to/8 + 'px'
					},speed, easingBg);
				}
				
				var highlight		= function($elem){
					$elem.siblings().removeClass('selected');
					$elem.addClass('selected');
				}
				
				var setWidths		= function($slider,
				$elems,
				total_elems,
				$bg1,
				$bg2,
				$bg3,
				one_image_w,
				$next,
				$prev){
					/*
					the width of the slider is the windows width
					times the total number of elements in the slider
					 */
					var slider_w	= w_w * total_elems;
					$slider.width(slider_w + 'px');
					//each element will have a width = windows width
					$elems.width(w_w + 'px');
					/*
					we also set the width of each bg image div.
					The value is the same calculated for the slider
					 */
					$bg1.width(slider_w + 'px');
					$bg2.width(slider_w + 'px');
					$bg3.width(slider_w + 'px');
					
					/*
					both the right and left of the
					navigation next and previous buttons will be:
					windowWidth/2 - imgWidth/2 + some margin (not to touch the image borders)
					 */
					var position_nav	= w_w/2 - one_image_w/2 + 3;
					$next.css('right', position_nav - 51 + 'px');
					$prev.css('left', position_nav - 11 + 'px');
				}
				
				$.fn.parallaxSlider.defaults = {
					auto			: 2500,	//how many seconds to periodically slide the content. (2500 = 2.5 seconds)
											//If set to 0 then autoplay is turned off.
					speed			: 1000,//speed of each slide animation
					easing			: 'jswing',//easing effect for the slide animation
					easingBg		: 'jswing',//easing effect for the background animation
					circular		: true,//circular slider
					thumbRotation	: true//the thumbs will be randomly rotated
				};
				//easeInOutExpo,easeInBack
			})(jQuery);
