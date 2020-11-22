$(function () {
	var $container = $('#gallery-imgs');
	var masonry_selector = '.gallery-item:not([class*="invisible-box"])';
	var prettyPhoto_selector = '.gallery-item([class*="invisible-box"])';
	var gallery_items = $(".gallery-item");
	var sortby = 'all';
	
	$container.imagesLoaded(function(){
		$container.masonry({
			itemSelector : masonry_selector,
			columnWidth : 256,
			isAnimated: true
		});
		//gallery_items.find.attr('rel', sortby);
	});
	
	function reloadPrettyPhoto(sortby_now) {
		$(".pp_pic_holder").remove();
		$(".pp_overlay").remove();
		$(".ppt").remove();
		// edit it with your initialization
		if (sortby_now == 'all') {
			$("a[rel^='prettyPhoto']").prettyPhoto({
				social_tools: false,
			});
		} else {
			$('.gallery-item[data-tags*="' + sortby_now + '"]'+" a[rel^='prettyPhoto']").prettyPhoto({
				social_tools: false,
			});
		}
		
	}
	
	$("#gallery-sort-menu li").click(function(e) {
		e.preventDefault();
		sortby = $(this).attr('data-id');

		$("#gallery-sort-menu li").removeClass('active');
		$(this).addClass('active');
		gallery_items.removeClass('invisible-box');
		$container.masonry( 'reload' );

		if( sortby == 'all' ) {
			gallery_items.removeClass('invisible-box');
			$container.masonry( 'reload' );
			
			// Activate prettyPhoto category
			reloadPrettyPhoto(sortby);
		} else {
			gallery_items.addClass('invisible-box');			
			
			var spec_items = $('[data-tags*="' + sortby + '"]');
			spec_items.removeClass('invisible-box');			
			//spec_items.find('a').attr('rel', sortby);

			$container.masonry( 'reload' );
			
			// Activate prettyPhoto category
			reloadPrettyPhoto(sortby);
		}
	});
	
	// Activate prettyPhoto category
	reloadPrettyPhoto(sortby);	

});