$(function() {
	//custom animations to use
	//in the transitions
	var animations		= ['right','left','top','bottom','rightFade','leftFade','topFade','bottomFade'];
	var total_anim		= animations.length;
	//just change this to one of your choice
	var easeType		= 'swing';
	//the speed of each transition
	var animSpeed		= 450;
	//caching
	var $hs_container	= $('#hs_container');
	var $hs_areas		= $hs_container.find('.hs_area');
	
	//first preload all images
	$hs_images          = $hs_container.find('img');
	var total_images    = $hs_images.length;
	var cnt             = 0;
	$hs_images.each(function(){
		var $this = $(this);
		$('<img/>').load(function(){
			++cnt;
			if(cnt == total_images){
				$hs_areas.each(function(){
					var $area 		= $(this);
					//when the mouse enters the area we animate the current
					//image (random animation from array animations),
					//so that the next one gets visible.
					//"over" is a flag indicating if we can animate 
					//an area or not (we don't want 2 animations 
					//at the same time for each area)
					$area.data('over',true).bind('mouseenter',function(){
						if($area.data('over')){
							$area.data('over',false);
							//how many images in this area?
							var total		= $area.children().length;
							//visible image
							var $current 	= $area.find('img:visible');
							//index of visible image
							var idx_current = $current.index();
							//the next image that's going to be displayed.
							//either the next one, or the first one if the current is the last
							var $next		= (idx_current == total-1) ? $area.children(':first') : $current.next();
							//show next one (not yet visible)
							$next.show();
							//get a random animation
							var anim		= animations[Math.floor(Math.random()*total_anim)];
							switch(anim){
								//current slides out from the right
								case 'right':
									$current.animate({
										'left':$current.width()+'px'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'left'		: '0px'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the left
								case 'left':
									$current.animate({
										'left':-$current.width()+'px'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'left'		: '0px'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the top	
								case 'top':
									$current.animate({
										'top':-$current.height()+'px'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'top'		: '0px'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the bottom	
								case 'bottom':
									$current.animate({
										'top':$current.height()+'px'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'top'		: '0px'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the right	and fades out
								case 'rightFade':
									$current.animate({
										'left':$current.width()+'px',
										'opacity':'0'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'left'		: '0px',
											'opacity'	: '1'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the left and fades out	
								case 'leftFade':
									$current.animate({
										'left':-$current.width()+'px','opacity':'0'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'left'		: '0px',
											'opacity'	: '1'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the top and fades out	
								case 'topFade':
									$current.animate({
										'top':-$current.height()+'px',
										'opacity':'0'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'top'		: '0px',
											'opacity'	: '1'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
								//current slides out from the bottom and fades out	
								case 'bottomFade':
									$current.animate({
										'top':$current.height()+'px',
										'opacity':'0'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'top'		: '0px',
											'opacity'	: '1'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;		
								default:
									$current.animate({
										'left':-$current.width()+'px'
									},
									animSpeed,
									easeType,
									function(){
										$current.hide().css({
											'z-index'	: '1',
											'left'		: '0px'
										});
										$next.css('z-index','1000');
										$area.data('over',true);
									});
									break;
							}	
						}
					});
				});
				
				//when clicking the hs_container all areas get slided
				//(just for fun...you would probably want to enter the site
				//or something similar)
				$hs_container.bind('click',function(){
					$hs_areas.trigger('mouseenter');
				});
			}
		}).attr('src',$this.attr('src'));
	});
});