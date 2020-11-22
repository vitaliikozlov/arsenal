/* dCodes Framework */
(function($) {

	$.autoSlide = function (wrapper, settings, audioSettings) {


	$("a[data-rel^='prettyPhoto']").prettyPhoto({theme:'pp_default',
												social_tools: false,
												show_title: false,
												deeplinking: true, 
												callback: function(){checkSlideshow()}/* Called when prettyPhoto is closed */});

	var _body = $('body');
	var _window = $(window);
	var _doc = $(document);
	
	var isMobile = jQuery.browser.mobile;
	var isIE = detectIE();
	//alert(isIE);
	function detectIE(){
	  return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
	}
	var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase());
	//console.log(is_chrome);
	var is_safari = ($.browser.safari && /chrome/.test(navigator.userAgent.toLowerCase()) ) ? false : true;
	//console.log(is_safari);
	//safari - false, true
	//chrome - true, false
	if(is_chrome && !is_safari){//if is chrome, threat same as ie
		isIE=true;
	}
	
	var useMusic=settings.useMusic;
	var _type=settings.type;
	var orientation=settings.orientation;
	var componentWrapper = $(wrapper);
	var componentContent = componentWrapper.find('.componentContent');
	var componentScrollWrapper= componentWrapper.find('.componentScrollWrapper');
	if(_type == 'timer'){
		if(orientation == 'horizontal'){
			componentContent.css('height',100+'%');
		}else{
			componentContent.css('width',100+'%');
		}	  
	}else if(_type == 'scroll'){
		var scrollPaneApi;
		if(orientation == 'horizontal'){
			componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-50+'px');//scroll settings!
			componentScrollWrapper.css('width',100+'%');
			scrollPaneApi = componentScrollWrapper.jScrollPane().data().jsp;//after componentScrollWrapper size set
			componentContent.css('height',100+'%');
			componentContent.bind('mousewheel', horizontalMouseWheel);
		}else{
			componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-40+'px');//scroll settings!
			componentScrollWrapper.css('width',parseInt(componentWrapper.css('width'),10)+'px');//scroll settings!
			scrollPaneApi = componentScrollWrapper.jScrollPane().data().jsp;
		}
		componentScrollWrapper.bind('jsp-initialised',function(event, isScrollable){
			//console.log('Handle jsp-initialised', this,'isScrollable=', isScrollable);
		});
	}else if(_type == 'thumbs'){
		
		var controls_playlist_toggle=componentWrapper.find('.controls_playlist_toggle');
		var controlsToggleSrc=controls_playlist_toggle.children('img');
		controls_playlist_toggle.css('cursor', 'pointer');
		controls_playlist_toggle.css('display', 'block');
		controls_playlist_toggle.bind('click', function(){
			if(categoryTransition || !categoryIntroHappened) return false;
			togglePlaylist();
			return false;
		});
		
		var slideshowTimeoutID;
		var slideshowTimeout=settings.slideshowDelay*1000;
		var _firstThumbInited=false;
		var _activeItem=0;
		var alignThumbsFromLeft = settings.alignThumbsFromLeft;
		var _thumbSize=settings.thumbSize;
		//console.log('_thumbSize = ', _thumbSize);
		var _closePlaylistOnVideoSelect=false;
		var _autoOpenPlaylist=settings.autoOpenPlaylist;
		var _playlistOpened=false;
		var _finalThumbHeight;
		var _thumbInnerContainerSize;//for scroll math
		var _thumbScrollIntervalID;
		var _thumbHolderArr=[];
		var _thumbInnerContainerStartBuffer;
		var _animateMediaSizeOnPlaylistClose = true;
		var _playlistOutside= true;
		var _thumbsScrollValue=Math.abs(settings.thumbsScrollValue);
		var _thumbSpacing=settings.thumbSpacing;
		
		var thumbHolder=componentWrapper.find('.thumbHolder');
		
		thumbHolder.bind('mousewheel', function(event, delta, deltaX, deltaY){
			if(categoryTransition || !categoryIntroHappened) return false;
			var d = delta > 0 ? 1 : -1, value;//normalize
			if(orientation =='horizontal'){
				if(_thumbInnerContainerSize < getComponentSize('w')-thumbBackwardSize-thumbForwardSize) return;//if centered
				value = parseInt(thumbInnerContainer.css('left'),10);
				value+=_thumbsScrollValue*d;
				if(value > 0){
					value=0;	
				}else if(value < getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
					value=getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
				}
				thumbInnerContainer.css('left', value+'px');
			}else{
				if(_thumbInnerContainerSize < getComponentSize('h')-thumbBackwardSize-thumbForwardSize) return;
			    value = parseInt(thumbInnerContainer.css('top'),10);
				value+=_thumbsScrollValue*d;
				if(value > 0){
					value=0;	
				}else if(value < getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
					value=getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
				}
				thumbInnerContainer.css('top', value+'px');
		 	}
			return false;
		});
		
		var thumbContainer=componentWrapper.find('.thumbContainer');
		var thumbBackward =componentWrapper.find('.thumbBackward');
		var thumbForward = componentWrapper.find('.thumbForward');
		thumbBackward.css('cursor','pointer');
		thumbForward.css('cursor','pointer');
		thumbBackward.css('display','none');
		thumbForward.css('display','none');
	
		var componentScrollWrapperTop= parseInt(componentScrollWrapper.css('top'), 10);//needs in vertical orientation as well for top position of thumbHolder
		var thumbInnerContainer = componentWrapper.find('.thumbInnerContainer');
		if(orientation == 'horizontal'){
			thumbInnerContainer.css('left', 0+'px');
			_thumbInnerContainerStartBuffer = parseInt(thumbInnerContainer.css('top'), 10);
			var thumbContainerOrigLeft= parseInt(thumbContainer.css('left'), 10);//when no thumb arrows move thumbs to 0, and restore
			thumbBackwardSize = parseInt(thumbBackward.css('width'),10);
			thumbForwardSize = parseInt(thumbForward.css('width'),10);
			thumbContainer.css('width', getComponentSize('w')-thumbBackwardSize-thumbForwardSize+'px');
		}else{
			thumbInnerContainer.css('top', 0+'px');
			_thumbInnerContainerStartBuffer = parseInt(thumbInnerContainer.css('left'), 10);
			var componentScrollWrapperLeft= parseInt(componentScrollWrapper.css('left'), 10);
			var thumbContainerOrigTop= parseInt(thumbContainer.css('top'), 10);//when no thumb arrows move thumbs to 0, and restore
			thumbBackwardSize = parseInt(thumbBackward.css('height'),10);
			thumbForwardSize = parseInt(thumbForward.css('height'),10);
			thumbContainer.css('height', getComponentSize('h')-thumbBackwardSize-thumbForwardSize+'px');
		}
		var playlistSize= _thumbInnerContainerStartBuffer + _thumbSize + _thumbInnerContainerStartBuffer;
		//console.log('playlistSize = ', playlistSize); 
		
		var _thumbForwardSrc=thumbForward.children('img');
		var _thumbBackwardSrc=thumbBackward.children('img');
		
		thumbForward.bind('mouseover', function(){
			_thumbForwardSrc.attr('src', orientation == 'horizontal' ? 'data/icons/thumb_forward_on.png' : 'data/icons/thumb_forward_v_on.png');
			return false;
		});
		thumbBackward.bind('mouseover', function(){
			_thumbBackwardSrc.attr('src', orientation == 'horizontal' ? 'data/icons/thumb_backward_on.png' : 'data/icons/thumb_backward_v_on.png');
			return false;
		});
		thumbForward.bind('mouseout', function(){
			_thumbForwardSrc.attr('src', orientation == 'horizontal' ? 'data/icons/thumb_forward.png' : 'data/icons/thumb_forward_v.png');
			return false;
		});
		thumbBackward.bind('mouseout', function(){
			_thumbBackwardSrc.attr('src', orientation == 'horizontal' ? 'data/icons/thumb_backward.png' : 'data/icons/thumb_backward_v.png');
			return false;
		});
		
		thumbBackward.bind('mousedown touchstart MozTouchDown', function(){
			if(categoryTransition || !categoryIntroHappened) return false;
			if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
			_thumbScrollIntervalID = setInterval(function() { scrollThumbsBack(); }, 100);
			return false;
		});
		thumbBackward.bind('mouseup touchend MozTouchUp', function(){
			if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
			return false;
		});
		thumbForward.bind('mousedown touchstart MozTouchDown', function(){
			if(categoryTransition || !categoryIntroHappened) return false;
			if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
			_thumbScrollIntervalID = setInterval(function() { scrollThumbsForward(); }, 100);
			return false;
		});
		thumbForward.bind('mouseup touchend MozTouchUp', function(){
			if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
			return false;
		});
		
		if(_autoOpenPlaylist){
			togglePlaylist();
		}else{
			if(orientation == 'horizontal'){
				controls_playlist_toggle.css('bottom',0+'px');
		    }else{
				controls_playlist_toggle.css('right',0+'px');
		    }
			controlsToggleSrc.attr('src', 'data/icons/playlist_open.png');
		}
		setComponents();
	}
	
	//************** THUMBS
	
	function createThumb(thumb) {
		var div, img, url = 'data/icons/active_item.png', t_w = thumb.width, t_h = thumb.height, m = sectionCounter == playlistLength - 1 ? 0 : _thumbSpacing;
		//console.log('createThumb ', t_w, t_h);
		
		div = $('<div/>');
		_thumbHolderArr[sectionCounter] = div;
		div.attr('data-id', sectionCounter);
		div.bind('click', function(e){
			if(categoryTransition || !categoryIntroHappened) return false;
			//console.log('clickPlaylistItem');
			if (!e) var e = _window.event;
			if(e.cancelBubble) e.cancelBubble = true;
			else if (e.stopPropagation) e.stopPropagation();
			
			var currentTarget = $(e.currentTarget);
			var id = currentTarget.attr('data-id');
			//console.log(id);
			if(id == _activeItem) return;//active item
			
			enableActiveItem();
			_activeItem = id;
			disableActiveItem();
			
			positionMedia();
			
			if(_closePlaylistOnVideoSelect) {
				togglePlaylist();
			}
			return false;
		});
		div.bind('mouseover', function(e){
			if(categoryTransition || !categoryIntroHappened) return false;
			if (!e) var e = _window.event;
			if(e.cancelBubble) e.cancelBubble = true;
			else if (e.stopPropagation) e.stopPropagation();
			
			var currentTarget = $(e.currentTarget);
			var id = currentTarget.attr('data-id');
		
			return false;	
		});
		div.bind('mouseout', function(e){
			if(categoryTransition || !categoryIntroHappened) return false;
			//console.log('_outPlaylistItem');
			if (!e) var e = _window.event;
			if(e.cancelBubble) e.cancelBubble = true;
			else if (e.stopPropagation) e.stopPropagation();
			
			var currentTarget = $(e.currentTarget);
			var id = currentTarget.attr('data-id');
			if(id == _activeItem) return;//active item
			
			return false;	
		});
		if(orientation == 'horizontal'){
			div.css({
			   position: 'relative',
			   width: t_w + 'px',
			   height: t_h+'px',
			   top : 0+'px',
			   left : 0+'px',
			   'float': 'left',
			   marginRight: m +'px',
			   cursor: 'pointer',
			   opacity: 0,
			   overflow: 'hidden'
			});
		}else{
			div.css({
			   position: 'relative',
			   width: t_w + 'px',
			   height: t_h+'px',
			   top : 0+'px',
			   left : 0+'px',
			   clear: 'both',
			   marginBottom: m +'px',
			   cursor: 'pointer',
			   opacity: 0,
			   overflow: 'hidden'
			});
		}
		//load active item img
		img = $(new Image());
		img.css({
			position: 'absolute',
			zIndex:555,
			display: 'none'
		}).load(function() {
			//console.log(this.width,this.height);
			$(this).css({
				width: this.width,
				height: this.height,
				left: 50+'%',
				top: 50+'%',
				marginLeft: -this.width/2+'px',
				marginTop: -this.height/2+'px'
			})
		}).error(function(e) {
			console.log("error " + e);
		}).attr('src', url);
		
		div.data('active_icon',img).append(thumb);
		div.append(img);
		thumbInnerContainer.append(div);
		div.stop().animate({ 'opacity': 1},  {duration: 500, easing: 'easeOutSine'});
		
		if(orientation == 'horizontal'){
			_thumbInnerContainerSize+=parseInt(div.outerWidth('true'),10);
		}else{
			_thumbInnerContainerSize+=parseInt(div.outerHeight('true'),10);
		}
		
		thumbInnerContainer.css('width', _thumbInnerContainerSize+'px');
		checkThumbPosition();
		
		if(!_firstThumbInited){
			disableActiveItem();
			_firstThumbInited=true;
		}
	}
	
	function nextSlide(){
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		enableActiveItem();
		if(!opositeDirection){
			_activeItem++;
			if(_activeItem >playlistLength-1)_activeItem = 0;//loop
		}else{
			_activeItem--;
			if(_activeItem <0)_activeItem = playlistLength-1;
		}
		disableActiveItem();
		positionMedia();	
	}
	
	function positionMedia(){
		var s, value;
		if(orientation == 'horizontal'){
			if(getHolderSize('w') > getComponentSize('w')){
				s = getPartSize('w');
				value = - s + getComponentSize('w')/2;
				if(value > 0){
					value=0;
				}else if(value< - getHolderSize('w') + getComponentSize('w')){
					value= - getHolderSize('w') + getComponentSize('w');
				}
			}else{//less than component size, center them
				value = parseInt(getComponentSize('w')/2 - getHolderSize('w')/2,10); 
			}
			componentContent.stop().animate({ 'left': value+'px'},  {duration: 500, easing: 'easeOutQuart', complete: positionMediaEnd});
		}else{
			if(getHolderSize('h') > getComponentSize('h')){
				s = getPartSize('h');
				value = - s + getComponentSize('h')/2;
				if(value > 0){
					value=0;
				}else if(value< - getHolderSize('h') + getComponentSize('h')){
					value= - getHolderSize('h') + getComponentSize('h');
				}
			}else{//less than component size, center them
				value = parseInt(getComponentSize('h')/2 - getHolderSize('h')/2,10); 
			}
			componentContent.stop().animate({ 'top': value+'px'},  {duration: 500, easing: 'easeOutQuart', complete: positionMediaEnd});
		}
	}
	
	function positionMediaEnd(){
		if(slideshowRunning){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			slideshowTimeoutID = setTimeout(nextSlide, slideshowTimeout);  
		}	
	}
	
	function checkThumbPosition() {
		if(orientation == 'horizontal'){
			if(_thumbInnerContainerSize > getComponentSize('w')-thumbBackwardSize-thumbForwardSize){
				thumbBackward.css('display','block');
				thumbForward.css('display','block');
				thumbContainer.css('left', thumbContainerOrigLeft +'px');//restore
				var value = parseInt(thumbInnerContainer.css('left'),10);
				if(value < getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
					if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
					value=getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
				}else if(value > 0){
					value=0;
				}
				thumbInnerContainer.css('left', value+'px');
			}else{
				thumbBackward.css('display','none');
				thumbForward.css('display','none');
				thumbInnerContainer.css('left', 0 +'px');
				
				if(alignThumbsFromLeft){
					thumbContainer.css('left', 0 +'px');
				}else{//center thumbs
					thumbInnerContainer.css('left', getComponentSize('w')/2 - _thumbInnerContainerSize/2- thumbBackwardSize +'px');
				}	
			}
		}else{
			if(_thumbInnerContainerSize > getComponentSize('h')-thumbBackwardSize-thumbForwardSize){
				thumbBackward.css('display','block');
				thumbForward.css('display','block');
				thumbContainer.css('top', thumbContainerOrigTop +'px');//restore
				var value = parseInt(thumbInnerContainer.css('top'),10);
				if(value < getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
					if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
					value=getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
				}else if(value > 0){
					value=0;
				}
				thumbInnerContainer.css('top', value+'px');
			}else{
				thumbBackward.css('display','none');
				thumbForward.css('display','none');
				thumbInnerContainer.css('top', 0 +'px');
				
				if(alignThumbsFromLeft){
					thumbContainer.css('top', 0 +'px');
				}else{//center thumbs
					thumbInnerContainer.css('top', getComponentSize('h')/2 - _thumbInnerContainerSize/2- thumbBackwardSize +'px');
				}	
			}
		}
	}
	
	function enableActiveItem() {
		//console.log('enableActiveItem');
		if(_thumbHolderArr[_activeItem]){
			var _item = $(_thumbHolderArr[_activeItem]);
			if(_item){
				_item.css('cursor', 'pointer');
				_item.data('active_icon').css('display','none');
			}
		}
	}
	
	function disableActiveItem() {
		//console.log('disableActiveItem');
		if(_thumbHolderArr[_activeItem]){
			var _item = $(_thumbHolderArr[_activeItem]);
			if(_item){
				_item.css('cursor', 'default');
				_item.data('active_icon').css('display','block');
			}
		}
	}
	
	function setComponents() {
		if(orientation == 'horizontal'){
			if(_playlistOpened){
				componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop-playlistSize+'px');
			}else{
				componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop+'px');
			}
			componentScrollWrapper.css('width',100+'%');
			componentContent.css('height',100+'%');
			thumbHolder.css('top', componentScrollWrapperTop + getComponentSize('h')+'px');
		}else{
			if(_playlistOpened){
				componentScrollWrapper.css('width',parseInt(componentWrapper.css('width'),10)-componentScrollWrapperLeft-playlistSize+'px');
			}else{
				componentScrollWrapper.css('width',parseInt(componentWrapper.css('width'),10)-componentScrollWrapperLeft+'px');
			}
			componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop+'px');
			componentContent.css('width',100+'%');
			thumbHolder.css('height', getComponentSize('h')+'px');
			thumbHolder.css('top', componentScrollWrapperTop+'px');
			thumbHolder.css('left', componentScrollWrapperLeft + getComponentSize('w')+'px');
		}
	}
	
	function toggleThumbBg(on) {
		//console.log('_toggleThumbBg');
		var value;
		if(orientation == 'horizontal'){
			value=_thumbInnerContainerStartBuffer + _thumbSize + _thumbInnerContainerStartBuffer;
			if(on){
				thumbHolder.stop().animate({ 'height': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbBackward.stop().animate({ 'height': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbForward.stop().animate({ 'height': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
			}else{
				thumbHolder.stop().animate({ 'height': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbBackward.stop().animate({ 'height': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbForward.stop().animate({ 'height': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
			}
		}else{
			value=_thumbInnerContainerStartBuffer + _thumbSize + _thumbInnerContainerStartBuffer;
			if(on){
				thumbHolder.stop().animate({ 'width': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbBackward.stop().animate({ 'width': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbForward.stop().animate({ 'width': value+'px'},  {duration: 500, easing: 'easeOutQuart'});
			}else{
				thumbHolder.stop().animate({ 'width': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbBackward.stop().animate({ 'width': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				thumbForward.stop().animate({ 'width': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
			}
		}
	}
	
	function togglePlaylist() {
		if(_playlistOpened){
			toggleThumbBg();
			_playlistOpened=false;
			controlsToggleSrc.attr('src', 'data/icons/playlist_open.png');
			if(_animateMediaSizeOnPlaylistClose){
				if(orientation=='horizontal'){
					componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop+'px');
					controls_playlist_toggle.stop().animate({ 'bottom': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}else{
					//mediaWrapper.stop().animate({ 'width': getComponentSize('w')+'px'},  {duration: 500, easing: 'easeOutQuart'});
					controls_playlist_toggle.stop().animate({ 'right': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}
			}
		} else{
			toggleThumbBg(true);
			_playlistOpened=true;
			controlsToggleSrc.attr('src', 'data/icons/playlist_close.png');
			if(_animateMediaSizeOnPlaylistClose){
				var pval;
				if(orientation=='horizontal'){
					if(_playlistOutside){
						pval = getComponentSize('h') - playlistSize;
					}else{
						pval = getComponentSize('h') - finalThumbHeight - 2 * parseInt(thumbInnerContainer.css('top'),10);
					}
					componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop-playlistSize+'px');
					controls_playlist_toggle.stop().animate({ 'bottom': playlistSize+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}else{
					if(_playlistOutside){
						pval = getComponentSize('w') - playlistSize;
					}else{
						pval = getComponentSize('w') - thumbWidth - 2 * parseInt(thumbInnerContainer.css('left'),10);
					}
					//mediaWrapper.stop().animate({ 'width': pval+'px'},  {duration: 500, easing: 'easeOutQuart'});
					controls_playlist_toggle.stop().animate({ 'right': playlistSize+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}
			}
		}
		doneResizing();
	}
	
	function togglePlaylist2(state) {
		if(!state){
			toggleThumbBg();
			_playlistOpened=false;
			controlsToggleSrc.attr('src', 'data/icons/playlist_open.png');
			if(_animateMediaSizeOnPlaylistClose){
				if(orientation=='horizontal'){
					componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop+'px');
					controls_playlist_toggle.stop().animate({ 'bottom': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}else{
					//mediaWrapper.stop().animate({ 'width': getComponentSize('w')+'px'},  {duration: 500, easing: 'easeOutQuart'});
					controls_playlist_toggle.stop().animate({ 'right': 0+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}
			}
		}else{
			toggleThumbBg(true);
			_playlistOpened=true;
			controlsToggleSrc.attr('src', 'data/icons/playlist_close.png');
			if(_animateMediaSizeOnPlaylistClose){
				var pval;
				if(orientation=='horizontal'){
					if(_playlistOutside){
						pval = getComponentSize('h') - playlistSize;
					}else{
						pval = getComponentSize('h') - finalThumbHeight - 2 * parseInt(thumbInnerContainer.css('top'),10);
					}
					componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-componentScrollWrapperTop-playlistSize+'px');
					controls_playlist_toggle.stop().animate({ 'bottom': playlistSize+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}else{
					if(_playlistOutside){
						pval = getComponentSize('w') - playlistSize;
					}else{
						pval = getComponentSize('w') - thumbWidth - 2 * parseInt(thumbInnerContainer.css('left'),10);
					}
					//mediaWrapper.stop().animate({ 'width': pval+'px'},  {duration: 500, easing: 'easeOutQuart'});
					controls_playlist_toggle.stop().animate({ 'right': playlistSize+'px'},  {duration: 500, easing: 'easeOutQuart'});
				}
			}
		}
		doneResizing();
	}
	
	function scrollThumbsBack() {
		var value;
		if(orientation == 'horizontal'){
			value = parseInt(thumbInnerContainer.css('left'),10);
			value+=_thumbsScrollValue;
			if(value > 0){
				if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
				value=0;	
			}
			thumbInnerContainer.css('left', value+'px');
		}else{
			value = parseInt(thumbInnerContainer.css('top'),10);
			value+=_thumbsScrollValue;
			if(value > 0){
				if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
				value=0;	
			}
			thumbInnerContainer.css('top', value+'px');
		}
	}
	
	function scrollThumbsForward() {
		var value;
		if(orientation == 'horizontal'){
			value = parseInt(thumbInnerContainer.css('left'),10);
			value-=_thumbsScrollValue;
			if(value < getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
				if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
				value=getComponentSize('w')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
			}
			thumbInnerContainer.css('left', value+'px');
		}else{
			value = parseInt(thumbInnerContainer.css('top'),10);
			value-=_thumbsScrollValue;
			if(value < getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize){
				if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
				value=getComponentSize('h')- _thumbInnerContainerSize - thumbForwardSize - thumbBackwardSize;	
			}
			thumbInnerContainer.css('top', value+'px');
		}
	}
			
	//**************		
			
			
			
			
			
			
			
			
	
	var componentPlaylist = componentWrapper.find('.componentPlaylist');
	if(componentWrapper.find('.componentHeader').length>0) var componentHeader = componentWrapper.find('.componentHeader');
	var headerHeight = componentHeader ? parseInt(componentHeader.css('height'),10) : 0;
	
	var autoPlay=isMobile ? false : settings.autoPlay;
	var showTitleOnRollover=isMobile ? false : settings.showTitleOnRollover;
	var showDetailOnRollover=isMobile ? false : settings.showDetailOnRollover;
	
	var initalPlaylist=settings.activePlaylist;
	var currentPlaylistID;
	
	var componentFixedSize=settings.componentFixedSize;
	var verticalMarginSpace = settings.verticalMarginSpace;
	var horizontalMarginSpace = settings.horizontalMarginSpace;
	  
	var autoSlideInterval = settings.autoSlideInterval;//for autoslide (ff, safari, opera)
 	var IEautoSlideInterval = settings.IEautoSlideInterval;

	var manualIncrement = settings.manualIncrement;//increment in manual slide (ff, safari, opera)
	var IEmanualIncrement = settings.IEmanualIncrement;
	
	var slideShowInterval = isIE ? IEautoSlideInterval : autoSlideInterval;
	var increment = isIE ? IEmanualIncrement : manualIncrement
	
	var autoSlideIncrement = 1;//position increment
	var autoSlideIntervalID;
	var position = 0;//divs left position
	var windowResizeTimeoutID;
	var windowResizeTimeout = 500;//execute resize after time finish
	var sectionCounter = 0;
	var loadCounter = 0;//load counter for section with multiple sub_sections
	var fadeInSubSectionDelay = 350;//fade per sub_section delay
	var fadeInSpeed = 1000;//fade image speed
	var fadeInEase = 'slow';//fade image ease
	
	var timerThumbInterval=200;//wait for thumb and image load 
	var timerThumbIntervalID;
	var thumbRequest = false;
	var thumbLoaded = false;
	var thumbImageLoaded = false;
	var curr_thumb_url;
	var curr_sub_sectionDivArr;
	var curr_sectionDiv;
	
	var sectionArr = [];//section divs
	var spareSectionArr=[];//more loaded than fit into restrain push here, than later append as needed
	var playlistArr=[];//playlist data
	
	var slideshowRunning = false;//slideshow on / off
	var categoryIntroHappened = false;
	var componentInited = false;
	var allLoaded = false;//all coulumns loaded
	var opositeDirection = false;
	var loadingOn = false;//for set autoslide after we resume slideshow with pause/play
	var preloadingOn = false;//dont append to sectionArr, just to spareSectionArr
	var manualSlide = false;//controls_forward / controls_backward buttons
	var manualForward = false;//manual btn slide
	var manualBackward = false;
	var categoryTransition = false; //transition between category
	var forcedBackwardDirection = false; 
	var forcedForwardDirection = false; 
	var playlistLength;
	var menuArrData=[];//for menu disabling
	 
	 
	//old engine 
	var restrainSizeFactor = orientation == 'horizontal' ? 2 : 2.5;//load max 2x window width for performance
	var restrainSizeTimeout = 1000;
	var restrainSizeTimeoutID;
	
	var restrainSizeManualTimeout = 100;//faster speed for manual check 
	var restrainSizeManualTimeoutID;
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	//controls
	var component_controls = componentWrapper.find('.component_controls');
	var controls_backward = component_controls.find('.controls_backward');
	var controls_pausePlay = component_controls.find('.controls_pausePlay');
	var controls_forward = component_controls.find('.controls_forward');
	var controls_direction = component_controls.find('.controls_direction');
	var controls_music = component_controls.find('.controls_music');
	var controls_fullscreen = component_controls.find('.controls_fullscreen');
	
	controls_backward.css('cursor','pointer');
	controls_pausePlay.css('cursor','pointer');
	controls_forward.css('cursor','pointer');
	controls_direction.css('cursor','pointer');
	controls_music.css('cursor','pointer');
	controls_fullscreen.css('cursor','pointer');
	
	controls_backward.bind('mousedown touchstart MozTouchDown', function(){
		if(categoryTransition || !categoryIntroHappened) return false;
		
		if(_type == 'timer'){
			if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
			if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
			if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
				 
			manualSlide = true;
			manualBackward = true;
			 
			if(!opositeDirection){//remember orientation
				opositeDirection = true;
				forcedBackwardDirection = true;	 
			}
			autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
			restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
		}else if(_type == 'thumbs'){
			enableActiveItem();
			_activeItem--;
			if(_activeItem <0 )_activeItem = 0;
			disableActiveItem();
			positionMedia();
		}
		return false;
	});
	
	controls_forward.bind('mousedown touchstart MozTouchDown', function(){
		   if(categoryTransition || !categoryIntroHappened) return false;
			 
		   if(_type == 'timer'){
			   if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
			   if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
			   if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
			 
			   manualForward = true;
			   manualSlide = true;
					 
			   if(opositeDirection){//remember orientation
					opositeDirection = false;
					forcedForwardDirection = true;	 
			   }	 
			   autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
			   restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
		   }else if(_type == 'thumbs'){
				enableActiveItem();
				_activeItem++;
				if(_activeItem >playlistLength-1)_activeItem = playlistLength-1;
				disableActiveItem();
				positionMedia();	
		   } 
		   return false;
	});
	
    $(".componentContent").swipe( {
					//Generic swipe handler for all directions
					swipe:function(event, direction, distance, duration, fingerCount) {
						if(direction=='right')
							{
								if(categoryTransition || !categoryIntroHappened) return false;
								
								if(_type == 'timer'){
								if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
								if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
								if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
								
								manualForward = true;
								manualSlide = true;
								
								if(opositeDirection){//remember orientation
								opositeDirection = false;
								forcedForwardDirection = true;	 
								}	 
								autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
								restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
								}else if(_type == 'thumbs'){
								enableActiveItem();
								_activeItem++;
								if(_activeItem >playlistLength-1)_activeItem = playlistLength-1;
								disableActiveItem();
								positionMedia();	
								} 
								return false;
							}
							if(direction=='left')
							{
								if(categoryTransition || !categoryIntroHappened) return false;
		
									if(_type == 'timer'){
										if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
										if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
										if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
											 
										manualSlide = true;
										manualBackward = true;
										 
										if(!opositeDirection){//remember orientation
											opositeDirection = true;
											forcedBackwardDirection = true;	 
										}
										autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
										restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
									}else if(_type == 'thumbs'){
										enableActiveItem();
										_activeItem--;
										if(_activeItem <0 )_activeItem = 0;
										disableActiveItem();
										positionMedia();
									}
									return false;
							}	
					},
					//Default is 75px, set to 0 for demo so any distance triggers swipe
					threshold:0
				});
				
	 _doc.bind('mouseup touchend MozTouchUp', function(){
		  if(categoryTransition || !categoryIntroHappened) return false;
		  
		  if(_type == 'timer'){
			 if(manualBackward){
				    if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
					if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
					if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
					
					manualSlide = false; 
					manualBackward = false;
					 
					if(forcedBackwardDirection){//restore orientation
						opositeDirection = false;
						forcedBackwardDirection = false;	
					}
					if(slideshowRunning) {
						if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
						autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);	
					}
					if(!loadingOn && !preloadingOn) restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);
					
			  }else if(manualForward){
				    if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
					if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
					if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
					
					manualSlide = false; 
					manualForward = false;
					 
					if(forcedForwardDirection){//restore orientation
						opositeDirection = true;
						forcedForwardDirection = false;	 
					}
					if(slideshowRunning) {
						if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
						autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);	
					}
					if(!loadingOn && !preloadingOn) restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);
			  }
		  }else if(_type == 'thumbs'){
		  }
		  return false;
	});

	function toggleSlideshow(){
		 if(_type == 'timer'){
			if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
			if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
			if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
		   
			if(slideshowRunning){
				controls_pausePlay.attr('src', 'data/icons/play.png');
			}else{
				if(categoryIntroHappened){
					autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);	
					if(!loadingOn && !preloadingOn) restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);
				}
				controls_pausePlay.attr('src', 'data/icons/pause.png');
			}
			slideshowRunning = !slideshowRunning;
			
		}else if(_type == 'thumbs'){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			
			if(slideshowRunning){
				controls_pausePlay.attr('src', 'data/icons/play.png');
			}else{
				if(categoryIntroHappened){
					slideshowTimeoutID = setTimeout(nextSlide, slideshowTimeout);  
				}
				controls_pausePlay.attr('src', 'data/icons/pause.png');
			}
			slideshowRunning = !slideshowRunning;
		}
	}
	
	function toggleSlideshow2(state){
		if(state){
			if(_type == 'timer'){
				if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
				if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
				if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
				
				if(categoryIntroHappened){
					autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);	
					if(!loadingOn && !preloadingOn) restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);
				}
				controls_pausePlay.attr('src', 'data/icons/pause.png');
				slideshowRunning = true;
				
			}else if(_type == 'thumbs'){
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				if(categoryIntroHappened){
					slideshowTimeoutID = setTimeout(nextSlide, slideshowTimeout);  
				}
				controls_pausePlay.attr('src', 'data/icons/pause.png');
				slideshowRunning = true;
			}
		}else{
			if(_type == 'timer'){
				if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
				if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
				if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
			   
				if(slideshowRunning){
					controls_pausePlay.attr('src', 'data/icons/play.png');
				}
				slideshowRunning = false;
				
			}else if(_type == 'thumbs'){
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				
				if(slideshowRunning){
					controls_pausePlay.attr('src', 'data/icons/play.png');
				}
				slideshowRunning = false;
			}
		}
	}
	
	controls_pausePlay.bind('click',function(){
		if(categoryTransition) return false;
	    toggleSlideshow();
		return false;
	});
	
	controls_direction.bind('click',function(){
		 if(categoryTransition || !categoryIntroHappened) return false;
		 opositeDirection = !opositeDirection;
		 if(!opositeDirection){
			 controls_direction.attr('src', 'data/icons/dir_forward.png');
		 }else{
			controls_direction.attr('src', 'data/icons/dir_backward.png'); 
		 }
		 return false;
	});
	
	var fullscreenPossible = false;
	if(checkFullScreenSupport()){
		fullscreenPossible = true;
		
		controls_fullscreen.bind('click',function(){
			 if(categoryTransition || !categoryIntroHappened) return false;
			 toggleFullscreen();
			 return false;
		});
	}else{
		//remove fullscreen button
		componentWrapper.find('.controls_fullscreen').remove();
	}
	
	
	//menu
	var menuOpened=false;
	var lastActiveMenuItem;
	var menuTimeoutID;
	var menuTimeout = 1000;//hide menu after time
	var menuFadeSpeed=300;
	var menuFadeEase='easeOutQuint';
	var componentMenu = componentWrapper.find('.componentMenu');
	var currentCategory = componentWrapper.find('.currentCategory');
	var subMenu = componentWrapper.find('.subMenu');
	var menu_obj;
	subMenu.find('li').each(function(){
		//console.log($(this).text());
		menu_obj={};
		menu_obj.name=$(this).find('a').text();
		menu_obj.menuItem=$(this);
		menuArrData.push(menu_obj);
	});
	//console.log(menuArrData, menuArrData.length);
	preventSelect(componentWrapper.find('.subMenu li a'));	
	if(!isMobile){
		currentCategory.bind('mouseenter',function(){
			if(menuTimeoutID) clearTimeout(menuTimeoutID);
			subMenu.css('display','block');
			menuOpened=true;
			return false;
		});
		currentCategory.bind('mouseleave',function(){
			if(menuTimeoutID) clearTimeout(menuTimeoutID);
			menuTimeoutID = setTimeout(hideMenu, menuTimeout);
			return false;
		});
		subMenu.bind('mouseenter',function(){
			if(menuTimeoutID) clearTimeout(menuTimeoutID);
			return false;
		});
		subMenu.bind('mouseleave',function(){
			if(menuTimeoutID) clearTimeout(menuTimeoutID);
			menuTimeoutID = setTimeout(hideMenu, menuTimeout);
			return false;
		});
	}else{
		currentCategory.bind('click touchstart',function(){
			if(!menuOpened){
				subMenu.css('display','block');
				menuOpened=true;
			}else{
				subMenu.css('display','none');
				menuOpened=false;
			}
			return false;
		});
	}
	
	var menuPlus=componentWrapper.find('.menuPlus').css('cursor','pointer').bind('click touchstart',function(){
		if(!menuOpened){
			subMenu.css('display','block');
			menuOpened=true;
		}else{
			subMenu.css('display','none');
			menuOpened=false;
		}
		return false;
	});
	
	function hideMenu(){
		if(menuTimeoutID) clearTimeout(menuTimeoutID);
		subMenu.css('display','none');
		menuOpened=false;
	}
	
	componentWrapper.find('.subMenu li').hover(function() {
        if(!($(this).hasClass('selected'))) {
			$(this).addClass("hover");
		} 
    }, function() {    
        if(!($(this).hasClass('selectedMenuItem'))){
			$(this).removeClass("hover");
		}   
    });
	
	componentWrapper.find('.subMenu li').bind('click',function(){
		var current = $(this);
		if(categoryTransition || current.hasClass('selectedMenuItem')) return false;
		categoryTransition = true;
		if(lastActiveMenuItem){
			lastActiveMenuItem.removeClass("selectedMenuItem hover");
		}
		current.addClass('selectedMenuItem');
		lastActiveMenuItem = current;
		var value = current.text();
		currentCategory.html(value);

		currentPlaylistID=current.index();
		//console.log('currentPlaylistID = ', currentPlaylistID);

		initCategory();  
		
		if(isMobile)hideMenu();
		
		return false;
	});

	
	
	
	
	
	
	
	//*******
	if(!useMusic){
		component_controls.find('.controls_music').remove();
		initCategory();
	}else{
		var musicPlaylist = componentWrapper.find('.musicPlaylist');
		var audioAutoPlay=audioSettings.autoPlay;
		var loopingOn=audioSettings.loopingOn;
		var randomPlay=audioSettings.randomPlay;
		var defaultVolume=audioSettings.defaultVolume;
		if(defaultVolume<0) defaultVolume=0;
		else if(defaultVolume>1) defaultVolume=1;
		var activeAudioPlaylist = audioSettings.activePlaylist;
		
		var autoPlayAfterFirst=true;
		var sm2_sound_id='sound_id';
		var sm_curentSound;
		var audioInited=false;
		var audioPath;	
		var audioPlaying=false;
		var audioUrlArr=[];//playlist url
		var _audioPlaylistLength;
		
		var playlistManager = new apPlaylistManager();
		playlistManager.init(loopingOn, randomPlay);
		
		controls_music.bind('mousedown touchstart MozTouchDown', function(){
			if(!audioInited) return false;
			togglePlayControl();
			return false;
		});
		
		initAudio();	
	} 
	
	
	
				
	 
	function initCategory(){
		  if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
		  if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
		  if(autoSlideIntervalID)  clearInterval(autoSlideIntervalID);
		  if(timerThumbIntervalID) clearInterval(timerThumbIntervalID);
		  if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		  if(_thumbScrollIntervalID) clearInterval(_thumbScrollIntervalID);
		  componentContent.empty();
		  
		  //reset all
		  sectionArr = [];
		  spareSectionArr = [];
		  playlistArr=[];
		  getCategoryData();
		  
		  if(_type == 'thumbs'){
			  _thumbInnerContainerSize = 0;//reset
			  _activeItem=0;
			  _firstThumbInited=false;
			  _thumbHolderArr=[];
			  thumbBackward.css('display','none');
			  thumbForward.css('display','none');
			  thumbInnerContainer.empty();
			  if(orientation == 'horizontal'){//scroll on beginning
				  thumbInnerContainer.css('left', 0+'px');
				  componentContent.css('left', 0+'px');
			  }else{
				  thumbInnerContainer.css('top', 0+'px');
				  componentContent.css('top', 0+'px');
			  }
		  }
			  
		  componentContent.css('opacity', 1);
		  if(orientation == 'horizontal'){
			componentContent.css('width',0+'px');
		  }else{
			componentContent.css('height',0+'px');
		  }
		  
		  position = 0;
			
		  slideshowRunning = false;
		  categoryIntroHappened = false;
		  allLoaded = false;
		  manualSlide = false;
		  loadingOn = false;
		  manualForward = false;
		  manualBackward = false;
		  opositeDirection = false;
		  forcedBackwardDirection = false; 
		  forcedForwardDirection = false;
		  
		  if(_type == 'timer'){
			  sectionCounter = playlistLength - 1;//load last section first
			  preloadingOn = true;
		  }else if(_type == 'scroll'){
			 sectionCounter = 0;
		  }else if(_type == 'thumbs'){
			 sectionCounter = 0;
		  }
		  categoryTransition = false;
		  loadSection();
	}
	 
	function getCategoryData(){
		 //console.log('getCategoryData');
		 var playlist;
		 if(initalPlaylist){
			 playlist = componentPlaylist.find("div[id="+initalPlaylist+"]"); 
			 currentPlaylistID=playlist.index();
			 //console.log('currentPlaylistID = ', currentPlaylistID);
			 initalPlaylist=null;
		 }else{
			 playlist = componentPlaylist.children("div").eq(currentPlaylistID); 
		 }
		 //console.log(playlist);
		 if(!playlist){
			alert('Failed to select GALLERY playlist!');
			return;	 
		 }
		 //set active menu item
		 var menu_obj=menuArrData[currentPlaylistID];
		 //set active menu text
		 currentCategory.html(menu_obj.name);
		 //disable menu item
		 menu_obj.menuItem.addClass('selectedMenuItem hover');
		 lastActiveMenuItem = menu_obj.menuItem;
		 
		 
		 var sections = [], sub_sections=[], i = 0, j, sublen, section, sub_section, obj, sub_arr=[];
		 playlist.children("ul[class='section']").each(function(){
			 sections.push($(this));
		 });
		 playlistLength = sections.length;
		 //console.log('playlistLength = ', playlistLength);
		 for(i; i < playlistLength; i++){
			 section=$(sections[i]);
			 j=0, sub_sections=[];
			 section.children("li[class='sub_section']").each(function(){
				 sub_sections.push($(this));
			 });
			 sub_arr=[];
			 sublen = sub_sections.length;
			 //console.log('sublen = ', sublen);
			 for(j; j < sublen; j++){
				 sub_section = $(sub_sections[j]);
				 //console.log(sub_section);
				 obj = {};
				 sub_arr.push(obj);
				 obj.path = sub_section.attr('data-path');//required
				 //others optional
				 if(sub_section.attr('data-title') != undefined && !isEmpty(sub_section.attr('data-title'))){
					//console.log(i, j, sub_section.attr('data-title'));
					obj.title = sub_section.attr('data-title');
				 }
				 if(sub_section.attr('data-link') != undefined && !isEmpty(sub_section.attr('data-link'))){
					obj.link = sub_section.attr('data-link');
					//target only if link
					 if(sub_section.attr('data-target') != undefined && !isEmpty(sub_section.attr('data-target'))){
						obj.target = sub_section.attr('data-target');
					 }else{
						obj.target = '_blank';
					 }
				 }
				  if(sub_section.find('.pp_content').length>0){//pretty photo content
					//console.log(i, j, sub_section.find('.pp_content'));
					obj.pp_content = sub_section.find('.pp_content');
				 }
			 }
			 playlistArr.push(sub_arr);
		 }
	}
	
	function isEmpty(str) {
	    return str.replace(/^\s+|\s+$/g, '').length == 0;
	}
	
	function createImageData(sub_sectionDiv){
		
		//check title
		if(sub_sectionDiv.data('title') != undefined){
			var titleDiv = $("<div/>");
			componentWrapper.append(titleDiv);//append first to component to get size 
			titleDiv.html(sub_sectionDiv.data('title'));	
			titleDiv.css({
				opacity:showTitleOnRollover ? 0 : 1
			}).addClass('image_title');
			titleDiv.css('marginLeft', -parseInt(titleDiv.outerWidth(true)/2,10));
			//console.log(titleDiv.width());
			sub_sectionDiv.append(titleDiv);
			
			if(showTitleOnRollover){
				sub_sectionDiv.data('title-obj', titleDiv);
				sub_sectionDiv.bind('mouseenter', function(){
					//console.log('showTitleOnRollover');
					$(this).data('title-obj').css('opacity',1);
					return false;
				});	
				sub_sectionDiv.bind('mouseleave', function(){
					$(this).data('title-obj').css('opacity',0);
					return false;
				});
			}
		}
		
		//create holder for both detail icons
		if(sub_sectionDiv.data('link') != undefined || sub_sectionDiv.data('pp_content') != undefined){
			var dataDiv = $("<div/>");
			dataDiv.css({
				opacity:showDetailOnRollover ? 0 : 1
			}).addClass('image_data');
			sub_sectionDiv.append(dataDiv);
			
			if(showDetailOnRollover){
				sub_sectionDiv.data('details-obj', dataDiv);
				sub_sectionDiv.bind('mouseenter', function(){
					//console.log('showDetailOnRollover');
					$(this).data('details-obj').css('opacity',1);
					return false;
				});	
				sub_sectionDiv.bind('mouseleave', function(){
					$(this).data('details-obj').css('opacity',0);
					return false;
				});
			}
		}
		
		//check link
		if(sub_sectionDiv.data('link') != undefined){
			//console.log(sub_sectionDiv.data('link'));
			var url = 'data/icons/link.png';
			
			var linkDiv = $("<div/>");
			linkDiv.css({
				cursor: 'pointer'
			}).addClass('image_link').bind('click', function(){
				var _link = sub_sectionDiv.data('link');
				var _target = sub_sectionDiv.data('target');
				if(_target=='_parent'){
					window.location=_link;
				}else if(_target=='_blank'){
					var newWindow=window.open(_link, _target);
					if (window.focus) {newWindow.focus();}
				}
			});
			
			var img = $(new Image());
			img.css('display', 'block');
			img.load(function() {
				$(this).css('width', this.width);
				$(this).css('height', this.height);
				//console.log(var width, var height);
				linkDiv.append(img);
				dataDiv.append(linkDiv);
			}).attr('src', url);
			img.error(function(e) {
				//console.log("error " + e);
			});
		}
		
		//check pp content
		if(sub_sectionDiv.data('pp_content') != undefined){
			var detailDiv = $("<div/>");
			detailDiv.css({
				cursor: 'pointer'
			}).addClass('image_detail');
			detailDiv.append(sub_sectionDiv.data('pp_content'));
			
			//attach click to detect pp open
			sub_sectionDiv.data('pp_content').bind('click', function(){
				if(_type == 'timer'){
					if(slideshowRunning) {
						if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
					}
				}else if(_type == 'thumbs'){
					if(slideshowRunning) {
						if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
					}
				}
				detailActivated();
				return false;
			});
			
			dataDiv.append(detailDiv);
		}
	 }
	 
	function checkSlideshow(){//called after detail close
		//console.log('checkSlideshow');
		detailClosed();
	    if(_type == 'timer'){
			if(slideshowRunning) {
				if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
				autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);		
			}
		}else if(_type == 'thumbs'){
			if(slideshowRunning) {
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				slideshowTimeoutID = setTimeout(nextSlide, slideshowTimeout);  	
			}
		}	
	}
	
	function loadSection(){
		//console.log('loadSection');
		if(categoryTransition) return;
		loadingOn = true;
		
		var section=playlistArr[sectionCounter], len = section.length, obj,i = 0,loadCounter = 0,img,loadedImg,url,sub_sectionDiv,sub_sectionDivArr=[],imgId, m;
		
		var sectionDiv = $("<div/>");
		sectionDiv.id = sectionCounter;
		sectionDiv.data('sub_divs_count', len);
		if(orientation == 'horizontal'){
			m = sectionCounter == playlistLength-1 ? 0 : verticalMarginSpace;//no margin on last
		}else{
			m = sectionCounter == playlistLength-1 ? 0 : horizontalMarginSpace;//no margin on last
		}
		if(_type == 'timer'){
		}else if(_type == 'scroll'){
		}else if(_type == 'thumbs'){
			thumbImageLoaded = false;//reset
			thumbLoaded = false;
			thumbRequest = false;
		}
		//console.log(sectionCounter, m);
		if(orientation == 'horizontal'){
			sectionDiv.css({
				position:'relative',
				top:0+'px',
				left:0+'px',
				'float': 'left',
				overflow: 'hidden',
				marginRight: m
			});		
		}else{
			sectionDiv.css({
				position:'relative',
				top:0+'px',
				left:0+'px',
				overflow: 'hidden',
				marginBottom: m
			});
		}
		
		if(_type == 'timer'){
			 if(!preloadingOn){
				if(!opositeDirection){
					componentContent.append(sectionDiv);
					sectionArr.push(sectionDiv);
				}else{
					componentContent.prepend(sectionDiv);
					sectionArr.unshift(sectionDiv);
				}
			} 
		}else if(_type == 'scroll'){
			componentContent.append(sectionDiv);
			sectionArr.push(sectionDiv);
		}else if(_type == 'thumbs'){
			componentContent.append(sectionDiv);
			sectionArr.push(sectionDiv);
		} 
		spareSectionArr[sectionCounter] = sectionDiv;//findToLoad needs spareSectionArr
		
		for(i; i < len; i++){
			obj = section[i];
			
			sub_sectionDiv = $("<div/>");
			sub_sectionDiv.id = i;
			if(obj.title) sub_sectionDiv.data('title', obj.title);
			if(obj.link) sub_sectionDiv.data('link', obj.link);
			if(obj.target) sub_sectionDiv.data('target', obj.target);
			if(obj.pp_content) sub_sectionDiv.data('pp_content', obj.pp_content);
			sectionDiv.append(sub_sectionDiv);
			sub_sectionDivArr.push(sub_sectionDiv);
			
			if(orientation == 'horizontal'){
				sub_sectionDiv.css({
					position:'relative',
					overflow: 'hidden',
					opacity: 0
				});
				if(len > 1){
					if(i != len-1){//no margin on last
						//console.log(i, obj.path);
						sub_sectionDiv.css('marginBottom', horizontalMarginSpace);
					}
				} 
		    }else{
				sub_sectionDiv.css({
					position:'relative',
					overflow: 'hidden',
					opacity: 0,
					'float': 'left'
				});
				if(len > 1){
					if(i != len-1){//no margin on last
						sub_sectionDiv.css('marginRight', verticalMarginSpace);
					}
				}
		    }
	
			img = $(new Image());
			img.attr('id', i);
			img.css('display', 'block');
			sub_sectionDiv.append(img);
			sub_sectionDiv.data('img', img);
			
			url = obj.path+"?rand=" + (Math.random() * 99999999);
			//console.log(url);
			
			//load thumb on first image
			if(_type == 'thumbs' && !thumbRequest){
				thumbRequest=true;
				
				var thumb_src = '../'+obj.path;//one level up becaused of url: 'php/image_resize.php'
				var thumb_dst = thumb_src.substr(0, thumb_src.lastIndexOf('/')+1);//thumb folder path
				var thumb_ext = thumb_src.substr(thumb_src.lastIndexOf('/')+1);//thumb name.extension
				var remap = thumb_dst.replace('images', 'thumbs');//switch folder path
				curr_thumb_url = remap+thumb_ext+"?rand=" + (Math.random() * 99999999);//get thumb url with cachebust
				//console.log(curr_thumb_url);
				var thumb_side = orientation == 'horizontal' ? 'h' : 'w';//opposite
				var thumb_quality = settings.thumbQuality;
				var thumb_data = "src=" + thumb_src + "&dst=" + remap + "&side=" + thumb_side + "&size=" + _thumbSize + "&quality=" + thumb_quality;
				//console.log(thumb_data);
				
				jQuery.ajax({
					url: 'php/image_resize.php',
					data: thumb_data,
					success: function() {
						thumbLoaded = true;
						//console.log('thumbLoaded = ', thumbLoaded);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						//console.log(XMLHttpRequest, textStatus, errorThrown);
					}
				});
				
				if(timerThumbIntervalID) clearInterval(timerThumbIntervalID);
				timerThumbIntervalID = setInterval(waitThumbReady, timerThumbInterval);
			}
			
			img.load(function() {
			
				loadedImg = $(this);
				imgId = loadedImg.attr('id');
				
				loadedImg.attr('width',  this.width+'px');
				loadedImg.attr('height', this.height+'px');
				
				sub_sectionDivArr[imgId].css('width', this.width+'px');
				sub_sectionDivArr[imgId].css('height', this.height+'px');
				
				loadCounter++;
					
				if(loadCounter == len){//last image 
					if(_type == 'thumbs'){
						curr_sub_sectionDivArr = sub_sectionDivArr;
						curr_sectionDiv = sectionDiv;
						//console.log('thumbImageLoaded');
						thumbImageLoaded=true;
					}else{
					   sectionLoaded(sub_sectionDivArr, sectionDiv);	
					}
				}
			}).error(function(e) {
				//console.log("error " + e);
			}).attr('src', url);
		}
	}
	
	function waitThumbReady(){
		//console.log('waitThumbReady ', curr_thumb_url);
		if(thumbImageLoaded && thumbLoaded){
			if(timerThumbIntervalID) clearInterval(timerThumbIntervalID);
			
			var url = curr_thumb_url.substr(3);
			//console.log(url);
			var img = $(new Image());
			img.css('display', 'block');
			img.load(function() {
				//console.log(this);
				createThumb(this);
				sectionLoaded(curr_sub_sectionDivArr, curr_sectionDiv);

			}).error(function(e) {
				//console.log("error " + e.message);
			}).attr('src', url);
		}
	}
	
	function sectionLoaded(sub_sectionDivArr, sectionDiv) {
		//console.log('sectionLoaded ', sectionDiv.id);
		if(categoryTransition) return false; 	
			  
		var len = sub_sectionDivArr.length,sub_sectionDiv,divWidth,divHeight,img;
		
		if(orientation == 'horizontal'){

			if(len == 1){//single media in section
			
				var averageWidth=0, ir;
			
				sub_sectionDiv = $(sub_sectionDivArr[0]);
				
				divWidth = sub_sectionDiv.width();
				divHeight = sub_sectionDiv.height();
				ir = divWidth/divHeight;
				averageWidth = Math.ceil(getComponentSize('h') * ir);
				
				sub_sectionDiv.css('width',averageWidth+'px');
				sub_sectionDiv.css('height',getComponentSize('h')+'px');
				
				img = sub_sectionDiv.data('img');
				img.css('width',averageWidth+'px');
				img.css('height',getComponentSize('h')+'px');
				
				sectionDiv.css('width',averageWidth+'px');
				
				createImageData(sub_sectionDiv);
				
				if(!preloadingOn){
					if(opositeDirection){
						repositionAllAfter('w', averageWidth + verticalMarginSpace - position);
						position = - averageWidth - verticalMarginSpace + position;
					}
					sub_sectionDiv.stop().animate({opacity: 1}, fadeInSpeed );
					
				}else{
					sub_sectionDiv.css('opacity', 1);
				}
				
			}else if(len > 1){//more than 1 media in section
			
				var i = 0, maxHeight = 0, averageWidth=0, ir, deduct=0;
				
				for(i; i < len; i++){//get max width of all items in a section
					sub_sectionDiv = $(sub_sectionDivArr[i]);
					maxHeight += (sub_sectionDiv.outerHeight());
					averageWidth += sub_sectionDiv.width();
				}
				averageWidth = averageWidth/len;///first calculation
				averageWidth = Math.ceil((((getComponentSize('h')-((len-1)*horizontalMarginSpace))*averageWidth))/maxHeight);///recalculate to current component size
				
				i = 0;//reset for new loop
				for(i; i < len; i++){//change proportionally (and by same amount) dimensions of each item
				
					sub_sectionDiv = $(sub_sectionDivArr[i]);
					
					divWidth = sub_sectionDiv.width();
					divHeight = sub_sectionDiv.height();
					ir = divHeight/divWidth;
					
					deduct+=averageWidth*ir;
					if(i==len-1){//on last item check if overall size and deduct/add 
						if(deduct>getComponentSize('h')-((len-1)*horizontalMarginSpace)){
							sub_sectionDiv.css('height',(averageWidth*ir)-(deduct-getComponentSize('h')+((len-1)*horizontalMarginSpace))-0.1+'px');
						}else if(deduct<getComponentSize('h')){
							sub_sectionDiv.css('height',(averageWidth*ir)+(getComponentSize('h')-((len-1)*horizontalMarginSpace)-deduct)-0.1+'px');
						}else{
							sub_sectionDiv.css('height',(averageWidth*ir)+'px');
						}
					}else{
						sub_sectionDiv.css('height',(averageWidth*ir)+'px');
					}
					
					img = sub_sectionDiv.data('img');
					img.css('width',averageWidth+'px');
					img.css('height',sub_sectionDiv.height()+'px');
					
					sub_sectionDiv.css('width',averageWidth+'px');
					
					createImageData(sub_sectionDiv);
					
					if(!preloadingOn){
						sub_sectionDiv.delay(fadeInSubSectionDelay * i).stop().animate({opacity: 1}, fadeInSpeed );
					}else{
						sub_sectionDiv.css('opacity', 1);
					}
				}
				sectionDiv.css('width',averageWidth+'px');
				
				if(!preloadingOn && opositeDirection){
					repositionAllAfter('w', averageWidth + verticalMarginSpace - position);
					position = - averageWidth - verticalMarginSpace + position;
				}
			}
			if(!preloadingOn){	
				setHolderSize('w');		
			}
			
			//init slide once the window width gets populated
			if(!categoryIntroHappened && getHolderSize('w') > getComponentSize('w') ){
				categoryIntroHappened = true;
				
				if(_type == 'timer'){
				    if(autoPlay && !slideshowRunning){
						if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
						autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
						slideshowRunning = true;
						controls_pausePlay.attr('src', 'data/icons/pause.png');
					}else{
						controls_pausePlay.attr('src', 'data/icons/play.png');
					}
				}else if(_type == 'scroll'){
						componentScrollWrapper.jScrollPane({
							horizontalDragMinWidth: 60,
							horizontalDragMaxWidth: 70
						});
						scrollPaneApi.scrollToX(0);
				}else if(_type == 'thumbs'){
					if(autoPlay && !slideshowRunning){
						slideshowRunning = true;
						controls_pausePlay.attr('src', 'data/icons/pause.png');
					}else{
						controls_pausePlay.attr('src', 'data/icons/play.png');
					}
				}
				if(!componentInited){
					componentInited=true;
					
					component_controls.css('opacity',0);
					component_controls.css('display','block');
					component_controls.stop().animate({opacity: 1}, 500);
					componentMenu.css('display','block');
					
					autoSlideReady();
				}
			}

		}else{//VERTICAL
		
			if(len == 1){//single media in section
			
				var averageHeight=0, ir;
			
				sub_sectionDiv = $(sub_sectionDivArr[0]);
				
				divWidth = sub_sectionDiv.width();
				divHeight = sub_sectionDiv.height();
				ir = divHeight/divWidth;
				averageHeight = Math.ceil(getComponentSize('w') * ir);
				
				sub_sectionDiv.css('width',getComponentSize('w')+'px');
				sub_sectionDiv.css('height',averageHeight+'px');
				
				img = sub_sectionDiv.data('img');
				img.css('width',getComponentSize('w')+'px');
				img.css('height',averageHeight+'px');
				
				sectionDiv.css('height',averageHeight+'px');
				
				createImageData(sub_sectionDiv);
				
				if(!preloadingOn){
					if(opositeDirection){
						repositionAllAfter('h', averageHeight + horizontalMarginSpace - position);
						position = - averageHeight - horizontalMarginSpace + position;
					}
					sub_sectionDiv.stop().animate({opacity: 1}, fadeInSpeed );
					
				}else{
					sub_sectionDiv.css('opacity', 1);
				}
				
			}else if(len > 1){//more than 1 media in section
			
				var i = 0, maxWidth = 0, averageHeight=0, ir, deduct=0;
				
				for(i; i < len; i++){//get max width of all items in a section
					sub_sectionDiv = $(sub_sectionDivArr[i]);
					maxWidth += (sub_sectionDiv.outerWidth());
					averageHeight += sub_sectionDiv.height();
				}
				averageHeight = averageHeight/len;///first calculation
				//console.log('maxWidth = ', maxWidth);
				averageHeight = Math.ceil((((getComponentSize('w')-((len-1)*verticalMarginSpace))*averageHeight))/maxWidth);///recalculate to current component size
				//console.log('averageHeight = ', averageHeight);
				
				i = 0;//reset for new loop
				for(i; i < len; i++){//change proportionally (and by same amount) dimensions of each item
				
					sub_sectionDiv = $(sub_sectionDivArr[i]);
					
					divWidth = sub_sectionDiv.width();
					divHeight = sub_sectionDiv.height();
					ir = divWidth/divHeight;
					
					deduct+=averageHeight*ir;
					if(i==len-1){//on last item check if overall size and deduct/add 
						if(deduct>getComponentSize('w')-((len-1)*verticalMarginSpace)){
							//console.log('deduct ', deduct-getComponentSize('w')+((len-1)*verticalMarginSpace));
							sub_sectionDiv.css('width',(averageHeight*ir)-(deduct-getComponentSize('w')+((len-1)*verticalMarginSpace))-0.1+'px');
						}else if(deduct<getComponentSize('w')){
							//console.log('add ', getComponentSize('w')-deduct);
							sub_sectionDiv.css('width',(averageHeight*ir)+(getComponentSize('w')-((len-1)*verticalMarginSpace)-deduct)-0.1+'px');
						}else{
							sub_sectionDiv.css('width',(averageHeight*ir)+'px');
						}
					}else{
						sub_sectionDiv.css('width',(averageHeight*ir)+'px');
					}
					
					img = sub_sectionDiv.data('img');
					img.css('width',sub_sectionDiv.width()+'px');
					img.css('height',averageHeight+'px');
					
					sub_sectionDiv.css('height',(averageHeight)+'px');
					//console.log(i, sub_sectionDiv.css('width'), sub_sectionDiv.css('height'));
					
					createImageData(sub_sectionDiv);
					
					if(!preloadingOn){
						sub_sectionDiv.delay(fadeInSubSectionDelay * i).stop().animate({opacity: 1}, fadeInSpeed );
					}else{
						sub_sectionDiv.css('opacity', 1);
					}
				}
				sectionDiv.css('height',averageHeight+'px');
				
				if(!preloadingOn && opositeDirection){
					repositionAllAfter('h', averageHeight + horizontalMarginSpace - position);
					position = - averageHeight - horizontalMarginSpace + position;
				}
			}
			if(!preloadingOn){	
				setHolderSize('h');		
			}
			
			//init slide once the window height gets populated
			if(!categoryIntroHappened && getHolderSize('h') > getComponentSize('h')){
				categoryIntroHappened = true;
				//console.log('categoryIntroHappened');
				
				if(_type == 'timer'){
				    if(autoPlay && !slideshowRunning){
						if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
						autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);
						slideshowRunning = true;
						controls_pausePlay.attr('src', 'data/icons/pause.png');
					}else{
						controls_pausePlay.attr('src', 'data/icons/play.png');
					}
				}else if(_type == 'scroll'){
						componentScrollWrapper.jScrollPane({
							verticalDragMinHeight: 60,
							verticalDragMaxHeight: 70
						});
						scrollPaneApi.scrollToY(0);
				}else if(_type == 'thumbs'){
					if(autoPlay && !slideshowRunning){
						slideshowRunning = true;
						controls_pausePlay.attr('src', 'data/icons/pause.png');
					}else{
						controls_pausePlay.attr('src', 'data/icons/play.png');
					}
				}
				if(!componentInited){
					componentInited=true;
					
					component_controls.css('opacity',0);
					component_controls.css('display','block');
					component_controls.stop().animate({opacity: 1}, 500);
					componentMenu.css('display','block');
					
					autoSlideReady();
				}
			}
		}
		
		//console.log('\n');
		if(!allLoaded) checkLoaded();
		loadingOn = false;
		preloadingOn = false;
		
		if(_type == 'timer'){
			checkSize();
		}else if(_type == 'scroll'){
			if(!allLoaded){
				findToLoad();
			}
		}else if(_type == 'thumbs'){
			if(!allLoaded){
				findToLoad();
			}
		}
	 }
	 
	 function checkSize(){
		 //console.log('checkSize');
		 if(restrainSizeTimeoutID) clearTimeout(restrainSizeTimeoutID);
		 if(restrainSizeManualTimeoutID) clearTimeout(restrainSizeManualTimeoutID);
		 preloadingOn = false;//reset
		 
		 if(orientation == 'horizontal'){
		 
			 var minWidth = getComponentSize('w') * restrainSizeFactor;
			 
			 if(getHolderSize('w') < minWidth){
				if(!allLoaded){
					findToLoad();
				}else{
					
					var div,id,w;
					
					if(!opositeDirection){
					
						div = sectionArr[sectionArr.length - 1];//find last div
						var preserveLeft = parseInt(div.css('left'),10);
						id = div.id + 1;//next one
						if(id > spareSectionArr.length - 1) id = 0;//loop
						div = spareSectionArr[id];
						if(div){
							div.css('left', preserveLeft+'px');
							div.css('display', 'block');
							componentContent.append(div);
							sectionArr.push(div);//on the end
							setHolderSize('w');
							//doneResizing();//resize newly added div
						}
					}else{
					
						div = sectionArr[0];//find first div
						id = div.id - 1;//next one
						if(id < 0) id = spareSectionArr.length - 1;//loop
						div = spareSectionArr[id];
						w = parseInt(div.css('width'),10);
						if(div){
							div.css('display', 'block');
							
							componentContent.prepend(div);
							sectionArr.unshift(div);//on the beginning
							
							repositionAllAfter('w',w + verticalMarginSpace - position);
							position = - w - verticalMarginSpace + position;
							
							setHolderSize('w');
							//doneResizing();//resize newly added div
						}
					}
					if(!manualSlide){
						restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);  
					}else{
						restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
					}
				}
			 }else{
				if(!allLoaded){//columns not needed in moving orientation, preload for reserve
					findToLoad(true);
				}else{
					if(!manualSlide){
						restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);  
					}else{
						restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
					}
				}
			 } 
		 
		 }else{//VERTICAL
			 
			 var minHeight = getComponentSize('h') * restrainSizeFactor;
			 
			 if(getHolderSize('h') < minHeight){
				 if(!allLoaded){
					findToLoad();
				}else{
					
					var div,id,h;
					
					if(!opositeDirection){
					
						div = sectionArr[sectionArr.length - 1];//find last div
						var preserveTop = parseInt(div.css('top'),10);
						id = div.id + 1;//next one
						if(id > spareSectionArr.length - 1) id = 0;//loop
						div = spareSectionArr[id];
						if(div){
							div.css('top', preserveTop+'px');
							div.css('display', 'block');
							componentContent.append(div);
							sectionArr.push(div);//on the end
							setHolderSize('h');
							//doneResizing();//resize newly added div
						}
					}else{
					
						div = sectionArr[0];//find first div
						id = div.id - 1;//next one
						if(id < 0) id = spareSectionArr.length - 1;//loop
						div = spareSectionArr[id];
						h = parseInt(div.css('height'),10);
						if(div){
							div.css('display', 'block');
							
							componentContent.prepend(div);
							sectionArr.unshift(div);//on the beginning
							
							repositionAllAfter('h',h + horizontalMarginSpace - position);
							position = - h - horizontalMarginSpace + position;
							
							setHolderSize('h');
							//doneResizing();//resize newly added div
						}
					}
					if(!manualSlide){
						restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);  
					}else{
						restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
					}
				}
			 }else{
				
				if(!allLoaded){//columns not needed in moving orientation, preload for reserve
					findToLoad(true);
				}else{
					if(!manualSlide){
						restrainSizeTimeoutID = setTimeout(checkSize, restrainSizeTimeout);  
					}else{
						restrainSizeManualTimeoutID = setTimeout(checkSize, restrainSizeManualTimeout);
					}
				}
			 } 
		 }
	 }
	
	 function findToLoad(preload) {
		 var _confirm = true;
		 if(!opositeDirection){
			 //finds section to load starting from the beginning
			 var i = 0;
			 for(i; i < playlistLength; i++){
				 if(spareSectionArr[i] == undefined || spareSectionArr[i] == null){
					_confirm = false;//not loaded found
					sectionCounter = i;
					if(preload) preloadingOn=true;
					loadSection();
					break; 
				 }
			 }
		 }else{
			//finds section to preload starting from the end
			var i = playlistLength - 1;
			 for(i; i > -1; i--){
				 if(i != sectionCounter){//if not currently loading
					 if(spareSectionArr[i] == undefined || spareSectionArr[i] == null){
						 _confirm = false;//not loaded found
						 sectionCounter = i;
						 if(preload) preloadingOn=true;
						 loadSection();
						 break; 
					 }
				 }
			 }
		 }
		 if(_confirm){
			 allLoaded = true;
			 //console.log("allLoaded = " + allLoaded);
		 }
	 }
	 
	 //check if all loaded 
	 function checkLoaded() {
		 var i = 0, _confirm = true;
		 for(i; i < playlistLength; i++){
			 if(spareSectionArr[i] == undefined || spareSectionArr[i] == null){
				 _confirm = false;//not loaded found
				 break; 
			 }
		 }
		 if(_confirm){
			 allLoaded = true;
			 //console.log("allLoaded = " + allLoaded);
		 }
	 }
	 
	//right moving orientation when div gets appended to the left
	function repositionAllAfter(type, pos){
		//console.log('repositionAllAfter');
		var i = 0,div;
		for(i; i < playlistLength; i++){
			div = $(sectionArr[i]);
			if(type=='w'){
				div.css('left', -pos+'px');
			}else{
				div.css('top', -pos+'px');
			}
		}
	}
	
	//left moving orientation when div gets removed from the left
	function repositionAllBefore(type, pos){
		//console.log('repositionAllBefore');
		var i = 0,len = sectionArr.length,div;
		for(i; i < len; i++){
			div = $(sectionArr[i]);
			if(type=='w'){
				div.css('left', pos+'px');
			}else{
				div.css('top', pos+'px');
			}
		}
	}
	
	function getPartSize(type){
		//console.log('getPartSize ', _activeItem);
		var i = 0,div,size = 0;
		for(i; i < _activeItem; i++){
			div = $(sectionArr[i]);
			if(type=='w'){
				size += div.width() + verticalMarginSpace;
			}else{
				size += div.height() + horizontalMarginSpace;
			}
		}
		div = $(sectionArr[_activeItem]);//+ half of the last image
		if(type=='w'){
			size += div.width()/2;
		}else{
			size += div.height()/2;
		}
		return size;
	};
	
	//the width of all divs in componentContent
	function getHolderSize(type){
		var i = 0,len = sectionArr.length, div,size = 0;
		for(i; i < len; i++){
			div = $(sectionArr[i]);
			if(type=='w'){
				size += div.outerWidth(true);
			}else{
				size += div.outerHeight(true);
			}
		}
		//console.log('size = ', size);
		return size;
	};
	
	function getHolderSizeMinusLast(type) {//called from check size
		var i = 0,len = sectionArr.length - 1,div,size = 0;
		for(i; i < len; i++){
			div = $(sectionArr[i]);
			if(type=='w'){
				size += div.outerWidth(true);
			}else{
				size += div.outerHeight(true);
			}
		}
		return size;
	};
	
	function setHolderSize(type) {
		var size;
		if(type=='w'){
			size = getHolderSize('w')+1;
			componentContent.css('width', size+'px');
		}else{
			size = getHolderSize('h')+1;
			componentContent.css('height', size+'px');
		}
		if(_type == 'scroll' && scrollPaneApi && categoryIntroHappened) {
			scrollPaneApi.reinitialise();
		}
	}
	
	function doneResizing(){
		if(categoryTransition || !sectionArr) return false;
		//console.log("doneResizing");
		if(_type == 'scroll'){
			if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
			if(orientation == 'horizontal'){
				componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-50+'px');//scroll settings!
				componentScrollWrapper.css('width',100+'%');
				componentContent.css('height',100+'%');
			}else{
				componentScrollWrapper.css('height',parseInt(componentWrapper.css('height'),10)-40+'px');//scroll settings!
				componentScrollWrapper.css('width',parseInt(componentWrapper.css('width'),10)+'px');//scroll settings!
			}
		}else if(_type == 'thumbs'){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			if(_playlistOutside) setComponents();
			if(orientation == 'horizontal'){
				thumbContainer.css('width', getComponentSize('w')-thumbBackwardSize-thumbForwardSize+'px');
			}else{
				thumbContainer.css('height', getComponentSize('h')-thumbBackwardSize-thumbForwardSize+'px');
			}
			checkThumbPosition();
		}
		var i = 0,len = sectionArr.length,subDivsLen,sub_sectionDiv,sectionDiv, divWidth,divHeight,ratio,w,h, img;
		
		if(orientation == 'horizontal'){

			for(i; i < len; i++){
			
				sectionDiv = $(sectionArr[i]);
				subDivsLen = parseInt(sectionDiv.data('sub_divs_count'),10);
				//console.log("subDivsLen = " + subDivsLen);
					
				if(subDivsLen == 1){//single media in section
					sub_sectionDiv = $(sectionDiv.children()[0]);
					
					divWidth = Math.ceil(sub_sectionDiv.width());
					divHeight = Math.ceil(sub_sectionDiv.height());
					
					ratio = divWidth / divHeight;
					w = Math.ceil(getComponentSize('h') * ratio);
					
					sub_sectionDiv.css('height',getComponentSize('h')+'px');
					sub_sectionDiv.css('width',w+'px');
					
					img = sub_sectionDiv.data('img');
					img.css('width',w+'px');
					img.css('height',getComponentSize('h')+'px');
				
					sectionDiv.css('width',w+'px');
					
				}else if(subDivsLen > 1){//more than 1 media in section
				
					var j = 0,maxHeight = 0,maxWidth = 0;
					
					for(j; j < subDivsLen; j++){//get max size of all items in a section
						sub_sectionDiv = $(sectionDiv.children()[j]);
						//console.log("img = " + img);
						maxHeight += Math.ceil(sub_sectionDiv.height());
						//console.log("maxHeight = " + maxHeight);
					}
					//console.log("maxHeightAll = " + maxHeight, "getComponentSize('h') = " + getComponentSize('h'));
					ratio = (getComponentSize('h') - ((subDivsLen - 1) * horizontalMarginSpace)) / maxHeight;
				
					j = 0;//reset for new loop
					for(j; j < subDivsLen; j++){//change proportionally (and by same amount) dimensions of each item
						sub_sectionDiv = $(sectionDiv.children()[j]);
						
						divWidth = Math.ceil(sub_sectionDiv.width()) * ratio;
						divHeight = Math.ceil(sub_sectionDiv.height()) * ratio;
						
						sub_sectionDiv.css('width',divWidth+'px');
						sub_sectionDiv.css('height',divHeight+'px');
						
						img = sub_sectionDiv.data('img');
						img.css('width',divWidth+'px');
						img.css('height',divHeight+'px');
					
						if(divWidth > maxWidth) maxWidth = divWidth;
					}
					//console.log("maxWidth = " + maxWidth);
					sectionDiv.css('width',maxWidth+'px');
				}
				setHolderSize('w');
			}
	
		}else{//VERTICAL
			
			for(i; i < len; i++){
			
				sectionDiv = $(sectionArr[i]);
				subDivsLen = parseInt(sectionDiv.data('sub_divs_count'),10);
					
				if(subDivsLen == 1){//single media in section
					sub_sectionDiv = $(sectionDiv.children()[0]);
					
					divWidth = Math.ceil(sub_sectionDiv.width());
					divHeight = Math.ceil(sub_sectionDiv.height());
					
					ratio = divHeight / divWidth;
					h = Math.ceil(getComponentSize('w') * ratio);
					
					sub_sectionDiv.css('width',getComponentSize('w')+'px');
					sub_sectionDiv.css('height',h+'px');
					
					img = sub_sectionDiv.data('img');
					img.css('height',h+'px');
					img.css('width',getComponentSize('w')+'px');
				
					sectionDiv.css('height',h+'px');
					
				}else if(subDivsLen > 1){//more than 1 media in section
					
					var j = 0, maxWidth = 0/*the sum of all divs width*/,averageHeight=0, ir, deduct=0;
					
					for(j; j < subDivsLen; j++){//get max width of all items in a section
						sub_sectionDiv = $(sectionDiv.children()[j]);
						maxWidth += (sub_sectionDiv.outerWidth());
						averageHeight += sub_sectionDiv.height();
					}
					averageHeight = averageHeight/subDivsLen;///first calculation
					//console.log('maxWidth = ', maxWidth);
					averageHeight = (((getComponentSize('w')-((subDivsLen-1)*verticalMarginSpace))*averageHeight))/maxWidth;///recalculate to current component size
					//console.log('averageHeight = ', averageHeight);
					
					j = 0;//reset for new loop
					for(j; j < subDivsLen; j++){//change proportionally (and by same amount) dimensions of each item
						sub_sectionDiv = $(sectionDiv.children()[j]);
						
						divWidth = sub_sectionDiv.width();
						divHeight = sub_sectionDiv.height();
						ir = divWidth/divHeight;
						
						deduct+=averageHeight*ir;
						if(j==subDivsLen-1){//on last item check if overall size and deduct/add 
							if(deduct>getComponentSize('w')-((subDivsLen-1)*verticalMarginSpace)){
								//console.log('deduct ', deduct-getComponentSize('w')+((len-1)*verticalMarginSpace));
								sub_sectionDiv.css('width',(averageHeight*ir)-(deduct-getComponentSize('w')+((subDivsLen-1)*verticalMarginSpace))-0.1+'px');
							}else if(deduct<getComponentSize('w')){
								//console.log('add ', getComponentSize('w')-deduct);
								sub_sectionDiv.css('width',(averageHeight*ir)+(getComponentSize('w')-((subDivsLen-1)*verticalMarginSpace)-deduct)-0.1+'px');
							}else{
								sub_sectionDiv.css('width',(averageHeight*ir)+'px');
							}
						}else{
							sub_sectionDiv.css('width',(averageHeight*ir)+'px');
						}
						
						img = sub_sectionDiv.data('img');
						img.css('width',sub_sectionDiv.width()+'px');
						img.css('height',averageHeight+'px');
						
						sub_sectionDiv.css('height',(averageHeight)+'px');
						//console.log(i, sub_sectionDiv.css('width'), sub_sectionDiv.css('height'));
						
						createImageData(sub_sectionDiv);
						
						if(!preloadingOn){
							sub_sectionDiv.delay(fadeInSubSectionDelay * i).stop().animate({opacity: 1}, fadeInSpeed );
						}else{
							sub_sectionDiv.css('opacity', 1);
						}
					}
					sectionDiv.css('height',averageHeight+'px');
				}
				setHolderSize('h');
			}
		}
		
		if(_type == 'timer'){
			if(slideshowRunning) {
				if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
				autoSlideIntervalID = setInterval(autoSlide, slideShowInterval);		
			}
		}else if(_type == 'thumbs'){
			positionMedia();	
			if(slideshowRunning) {
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				slideshowTimeoutID = setTimeout(nextSlide, slideshowTimeout);  	
			}
		}
	};

	function autoSlide(){
		var divLeft,divTop, divWidth,divHeight,i = 0,len = sectionArr.length,div;
		
		if(!opositeDirection){
			if(!manualSlide){
				position-=autoSlideIncrement;
			}else{
				if(manualForward){
					position-=increment;
				}else if(manualBackward){
					position+=increment;
				}
			}
		}else{
			if(!manualSlide){
				position+=autoSlideIncrement;
			}else{
				if(manualForward){
					position-=increment;
				}else if(manualBackward){
					position+=increment;
				}
			}
		}
		
		if(orientation == 'horizontal'){
			for(i; i < len; i++){
				div = $(sectionArr[i]);
				if(div){
					div.css('left', position+'px');
					
					if(!opositeDirection){	
						if(i == 0){//track first div
							divLeft = parseInt(div.css('left'),10);
							divWidth = parseInt(div.css('width'),10);
							
							if(Math.abs(divLeft) > divWidth){
								div.detach();//remove first div
								div.css('display', 'none');
								sectionArr.shift();
								
								var out = Math.abs(divLeft) - (divWidth + verticalMarginSpace);
								repositionAllBefore('w', - out);
								position = - out;
								
								setHolderSize('w');
							}
						}
					}else{
						if(i == len - 1){//track last div
							divLeft = parseInt(div.css('left'),10);
							if(divLeft + getHolderSizeMinusLast('w') > getComponentSize('w') ){
								div.detach();//remove last div
								div.css('display', 'none');
								sectionArr.pop();
								
								setHolderSize('w');
							}
						}
					}
				}
			}
		}else{//VERTICAl
			for(i; i < len; i++){
				div = $(sectionArr[i]);
				if(div){
					div.css('top', position+'px');
					
					if(!opositeDirection){	
						if(i == 0){//track first div
							divTop = parseInt(div.css('top'),10);
							divHeight = parseInt(div.css('height'),10);
							
							if(Math.abs(divTop) > divHeight){
								div.detach();//remove first div
								div.css('display', 'none');
								sectionArr.shift();
								
								var out = Math.abs(divTop) - (divHeight + horizontalMarginSpace);
								repositionAllBefore('h', - out);
								position = - out;
								
								setHolderSize('h');
							}
						}
					}else{
						if(i == len - 1){//track last div
							divTop = parseInt(div.css('top'),10);
							if(divTop + getHolderSizeMinusLast('h') > getComponentSize('h') ){
								div.detach();//remove last div
								div.css('display', 'none');
								sectionArr.pop();
								
								setHolderSize('h');
							}
						}
					}
				}
			}
		}
	}
	
	function horizontalMouseWheel(event, delta, deltaX, deltaY){
		if(!componentInited || !scrollPaneApi || !categoryIntroHappened) return;
		var d = delta > 0 ? -1 : 1;//normalize
		if(scrollPaneApi) scrollPaneApi.scrollByX(d * 200);
		return false;
	}
	
	function getComponentSize(type){
		if(_type == 'timer'){
			if(type == "w"){//width
				return componentWrapper.width();
			}else{//height
				return componentWrapper.height()-headerHeight;
			} 
		}else if(_type == 'scroll'){
			if(type == "w"){//width
				return componentScrollWrapper.width()-40;//scroll settings!
			}else{//height
				return componentScrollWrapper.height()-30;//scroll settings!
			}
		}else if(_type == 'thumbs'){
			if(type == "w"){//width
				return componentScrollWrapper.width();
			}else{//height
				return componentScrollWrapper.height();
			}
		}
	}
	
	if(!componentFixedSize){
		_window.resize(function() {
			if(autoSlideIntervalID) clearInterval(autoSlideIntervalID);
			if(windowResizeTimeoutID) clearTimeout(windowResizeTimeoutID);
			windowResizeTimeoutID = setTimeout(doneResizing, windowResizeTimeout);
		});
	}
	
	//**************** fullscreen
	
	/*if(useRealFullscreen && fullscreenPossible){//firefox doesnt detect esc from fullscreen
		_doc.keyup(function(e) {
			console.log(e.keyCode);
			if (e.keyCode == 27) { //esc key
		  		setFullscreenIcon();
				resizeComponent();	
			}  
		});
	}*/
	
	function setFullscreenIcon(){
		 if ((document.fullScreenElement && document.fullScreenElement !== null) ||   
			  (!document.mozFullScreen && !document.webkitIsFullScreen)) { 
			    controls_fullscreen.attr('src', 'data/icons/fullscreen_enter.png'); 
		  }else{
			   controls_fullscreen.attr('src', 'data/icons/fullscreen_exit.png'); 
		  }
	}
	
	function fullScreenStatus(){
		return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
	}
	
	if(fullscreenPossible){
		_doc.on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function(){
			//console.log('fullScreenStatus()');
			setFullscreenIcon();
			doneResizing();	
		});
	}
	
	function toggleFullscreen(){
			
		//!!
		//http://stackoverflow.com/questions/8427413/webkitrequestfullscreen-fails-when-passing-element-allow-keyboard-input-in-safar
		//https://github.com/martinaglv/jQuery-FullScreen/blob/master/fullscreen/jquery.fullscreen.js#L82
				
		if(fullscreenPossible){
	   
		  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
			  (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
			if (document.documentElement.requestFullScreen) {
			  document.documentElement.requestFullScreen();
			} else if (document.documentElement.mozRequestFullScreen) {
			  document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullScreen) {
			  //document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			  document.documentElement.webkitRequestFullScreen();
			}else{
				//console.log('no fullscreen');
			}
		  } else {
			if (document.cancelFullScreen) {
			  document.cancelFullScreen();
			} else if (document.mozCancelFullScreen) {
			  document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
			  document.webkitCancelFullScreen();
			}
		  }
		}
	}
	
	function checkFullScreenSupport() {
	   var support=false;
		if (document.documentElement.requestFullScreen) {
		  support=true;
		} else if (document.documentElement.mozRequestFullScreen) {
		   support=true;
		} else if (document.documentElement.webkitRequestFullScreen) {
		   support=true;
		}
		return support;
	  
	}
	
	//************
	
	function preventSelect(arr){
		$(arr).each(function() {           
		$(this).attr('unselectable', 'on')
			   .css({
				   '-moz-user-select':'none',
				   '-webkit-user-select':'none',
				   'user-select':'none'
			   })
			   .each(function() {
				   this.onselectstart = function() { return false; };
			   });
		});
	}	
	
	
	
	
	
	
	// ******************************** MUSIC PLAYER **************** //
		
	function findAudio(){
		//console.log('findMedia');
		cleanAudio();
		sm_createSound();
	}
		
	function cleanAudio(){
		//console.log('cleanAudio');
		if(sm_curentSound){
			soundManager.destroySound(sm2_sound_id);
			sm_curentSound=null;
		}
		audioInited=false;
		audioPlaying=false;//reset
	}
	
	function _onLoading(){}
	function _onPlaying(){}
	function _onSuspend(){}
	
	function _onFinish(){
		enableActiveItem();
		playlistManager.advanceHandler(1, true);
		checkCounter();	
	}
	
	function _onLoad(state){
		if(!state) {
			//console.log('MP3 file could not be loaded! :', audioPath);	
		}
	}
	
	function sm_createSound(){
		sm_curentSound = soundManager.createSound({
			  id: sm2_sound_id,
			  url: [
			   audioPath+'.ogg',
			   audioPath+'.mp3'
			  ],
			  autoLoad: true,
			  autoPlay: audioAutoPlay,
			  volume: defaultVolume*100,
			  whileloading: _onLoading,
			  whileplaying: _onPlaying,
			  onfinish: _onFinish,
			  onload: _onLoad
		});
		 
	    if(audioAutoPlay){
			audioPlaying=true;
			controls_music.attr('src', 'data/icons/music_on.png');	
		}else{
			audioPlaying=false;
			controls_music.attr('src', 'data/icons/music_off.png');
		}
		if(autoPlayAfterFirst) audioAutoPlay=true;
		audioInited=true;
	}
	
	function getAudioPlaylist(id){
		cleanAudio();
		audioUrlArr=[];//playlist url
		
		var playlist;
		if(id == undefined){
			playlist = musicPlaylist.find("div[id="+activeAudioPlaylist+"]");
		}else{
			playlist = musicPlaylist.find("div[id="+id+"]");
		}
		if(!playlist){
			alert('Failed to select AUDIO playlist!');
			return;	 
		 }
		
		playlist.find('ul').children("li[class='audio_playlistItem']").each(function(){
			audioUrlArr.push($(this).attr('data-path'));
		});
		_audioPlaylistLength=audioUrlArr.length;
		//console.log(audioUrlArr);
		playlistManager.setPlaylistItems(_audioPlaylistLength);
		playlistManager.setCounter(0);
		checkCounter();
	}
	
	function togglePlayControl(){
		if(!audioPlaying){
			soundManager.play(sm2_sound_id);
			controls_music.attr('src', 'data/icons/music_on.png');
			audioPlaying=true;
		}else{
			soundManager.pause(sm2_sound_id);
			audioPlaying=false;
			controls_music.attr('src', 'data/icons/music_off.png');
		}
	}
	
	function togglePlayControl2(state){
		if(state){
			soundManager.play(sm2_sound_id);
			controls_music.attr('src', 'data/icons/music_on.png');
			audioPlaying=true;
		}else{
			soundManager.pause(sm2_sound_id);
			audioPlaying=false;
			controls_music.attr('src', 'data/icons/music_off.png');
		}
	}
	
	function checkCounter(){
		//console.log('checkCounter');
		if(playlistManager.getLastInOrder()){
			//console.log('getLastInOrder');
		}else{
			var c = playlistManager.getCounter();
			//console.log('counter = ', c);
			audioPath = audioUrlArr[c];
			//console.log(audioPath);
			findAudio();	
		}
	}
	
	function initAudio(){
		//console.log('initAudio');
		soundManager.onready(function(){
			//console.log('soundManager.onready');
			//get audio playlist
			getAudioPlaylist();
			//init gallery
			initCategory();
		});
		
		soundManager.ontimeout(function(status){
			//console.log('soundManager.ontimeout');
		    //Hrmm, SM2 could not start. Flash blocker involved? Show an error, etc.?
			alert('SM2 failed to start. Flash missing, blocked or security error? Status: '+ status.error.type);
		});
		
		/*
		//http://www.schillmania.com/projects/soundmanager2/doc/
		
		
		Returns a boolean indicating whether soundManager has attempted to and succeeded in initialising. This function will return false if called before initialisation has occurred, and is useful when you want to create or play a sound without knowing SM2's current state.
        var isSupported = soundManager.ok();
	
	
		onready(callback:function, [scope])
		Queues an event callback/handler for successful initialization and "ready to use" state of SoundManager 2. An optional scope parameter can be specified; if none, the callback is scoped to the window. If onready() is called after successful initialization, the callback will be executed immediately. The onready() queue is processed before soundManager.onload().
		soundManager.onready(function() {
		  alert('Yay, SM2 loaded OK!');	
		});
		
		
		ontimeout(callback:function, [scope])
		Queues an event callback/handler for SM2 init failure, processed at (or immediately, if added after) SM2 initialization has failed, just before soundManager.onerror() is called. An optional scope parameter can be specified; if none, the callback is scoped to the window.
		Additionally, a status object containing success and error->type parameters is passed as an argument to your callback.
		soundManager.ontimeout(function(status) {
		  alert('SM2 failed to start. Flash missing, blocked or security error?');
		  alert('The status is ' + status.success + ', the error type is ' + status.error.type);
		});


		 Creates a sound with an arbitrary number of optional arguments. Returns a SMSound object instance. Requires id and url at a minimum.
		soundManager.createSound({
		 id: sm2_sound_id, // required
		 url: '/audio/mysoundfile.mp3', // required
		 // optional sound parameters here, see Sound Properties for full list
		 volume: 50,
		 autoPlay: true,
		 whileloading: soundIsLoadingFunction
		});
		
		
		Returns an SMSound object specified by ID, or null if a sound with that ID is not found.
        var mySMSound = soundManager.getSoundById(sm2_sound_id);
		
		
		Stops, unloads and destroys a sound specified by ID.
		soundManager.destroySound(sm2_sound_id);
		
		
		Mutes the sound specified by ID and returns that sound object. If no ID specified, all sounds will be muted and null is returned. Affects muted property (boolean.)
		soundManager.mute(sm2_sound_id);
		
		
		Unmutes the sound specified by ID. If no ID specified, all sounds will be unmuted. Affects muted property (boolean.) Returns the related sound object.
    	soundManager.unmute(sm2_sound_id);
		
		
		Mutes/unmutes the sound specified by ID. Returns the related sound object.
    	soundManager.toggleMute(sm2_sound_id);
		
		
		//Creates a sound with the specified ID and URL (simple two-parameter method.)
		soundManager.createSound(sm2_sound_id,'/audio/mysoundfile.mp3');
		
		
		Starts loading the sound specified by ID, with options if specified. Returns the related sound object.
     	soundManager.load(sm2_sound_id);
        soundManager.load(sm2_sound_id,{volume:50,onfinish:playNextSound});
		
		
		soundManager.play(sm2_sound_id);
		Note that the second parameter, options object, is not required and can take almost any argument from the object literal format (eg. volume.) It is convenient when you wish to override the sound defaults for a single instance.
		Example: soundManager.play(sm2_sound_id,{volume:50,onfinish:playNextSound});
		
		
		soundManager.pause(sm2_sound_id);
		Pauses the sound specified by ID. Does not toggle. Affects paused property (boolean.) Returns the given sound object.


		Pauses/resumes play on the sound specified by ID. Returns the related sound object.
		soundManager.togglePause(sm2_sound_id);


		Resumes and returns the currently-paused sound specified by ID.
		soundManager.resume(sm2_sound_id);
		
		
		Stops playing the sound specified by ID. Returns the related sound object.
        soundManager.stop(sm2_sound_id);
		
		
		Stops loading the sound specified by ID, canceling any current HTTP request. Returns the related sound object.
        soundManager.unload(sm2_sound_id);
    	Note that for Flash 8, SoundManager does this by pointing the sound object to about:blank, which replaces the current one from loading.
		
		
		Seeeks to a given position within a sound, specified by miliseconds (1000 msec = 1 second) and returns the related sound object. Affects position property.
        soundManager.setPosition(sm2_sound_id,2500);
   		Can only seek within loaded sound data, as defined by the duration property.
		
		
		Sets the volume of the sound specified by ID and returns the related sound object. Accepted values: 0-100. Affects volume property.
        soundManager.setVolume(sm2_sound_id,50);
		
		
		//EVENTS
		
		Like native javascript objects, each SoundManager SMSound (sound instance) object can fire a number of onload-like events. Handlers cannot be "directly" assigned (eg. someSound.onload), but can be passed as option parameters to several sound methods.
	
		soundManager.play(sm2_sound_id,{
		  onfinish: function() {
			alert('The sound '+this.sID+' finished playing.');
		  }
		});
		
		Event handlers are scoped to the relevant sound object, so the this keyword will point to the sound object on which the event fired such that its properties can easily be accessed - eg. within an SMSound event handler, this.sID will give the sound ID.
		
		onfinish()
		Fires when a playing sound has reached its end. By this point, relevant properties like playState will have been reset to non-playing status. 
		
		
		onload(boolean:success)
		Fires on sound load. Boolean reflects successful load (true), or fail/load from cache (false).
		False value should seemingly only be for failure, but appears to be returned for load from cache as well. This strange behaviour comes from Flash. More detail may be available from the Flash 8 sound object documentation.
		Failure can occur if the Flash sandbox (security) model is preventing access, for example loading SoundManager 2 on the local file system and trying to access an MP3 on a network (or internet) URL. (Security can be configured in the Flash security panel, [see here].)
		
		
		onpause()
		Fires when a sound pauses, eg. via sound.pause().
		Example: soundManager.pause(sm2_sound_id);
	
	
		onplay()
		Fires when sound.play() is called.
	
	
		onresume()
		Fires when a sound resumes playing, eg. via sound.resume().
		Example: soundManager.resume(sm2_sound_id);
	
	
		onsuspend()
		HTML5-only event: Fires when a browser has chosen to stop downloading of an audio file.
		Per spec: "The user agent is intentionally not currently fetching media data, but does not have the entire media resource downloaded."
		One use case may be catching the behaviour where mobile Safari (iOS) will not auto-load or auto-play audio without user interaction, and using this event to show a message where the user can click/tap to start audio.
		The HTML5 stalled event may also fire in desktop cases and might behave differently across browsers and platforms, so careful testing is recommended.
	
	
		onstop()
		Fires when sound.stop() is explicitly called. For natural "sound finished" onfinish() case, see below. 
			
			
		whileloading()
		Fires at a regular interval when a sound is loading and new data has been received. The relevant, updated property is bytesLoaded.
		Example handler code: soundManager._writeDebug('sound '+this.sID+' loading, '+this.bytesLoaded+' of '+this.bytesTotal);
		Note that the duration property starts from 0 and is updated during whileloading() to reflect the duration of currently-loaded sound data (ie. when a 4:00 MP3 has loaded 50%, the duration will be reported as 2:00 in milliseconds.) However, an estimate of final duration can be calculated using bytesLoaded, bytesTotal and duration while loading. Once fully-loaded, duration will reflect the true and accurate value.
	
	
		whileplaying()
		Fires at a regular interval when a sound is playing, and a position (time) change is detected. The relevant, updated property is position.
		Example handler code: soundManager._writeDebug('sound '+this.sID+' playing, '+this.position+' of '+this.duration); 	
			
		*/
		
	}
	
	
	// ******************************** PUBLIC FUNCTIONS GALLERY **************** //

	$.autoSlide.toggleSlideshow = function(state) {
		if(!componentInited) return;
		if(_type == 'scroll') return;
		if(state == undefined){
			toggleSlideshow();
		}else{
			toggleSlideshow2(state);
		}
	}
	
	$.autoSlide.nextMedia = function() {
		if(!componentInited) return;
		if(_type != 'thumbs') return;
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		var temp = _activeItem+1;
		if(temp >playlistLength-1)temp = 0;//loop
		if(!_thumbHolderArr[temp]) return;//if not yet loaded
		
		enableActiveItem();
		_activeItem++;
		if(_activeItem >playlistLength-1)_activeItem = 0;//loop
		disableActiveItem();
		positionMedia();	
	}
	
	$.autoSlide.previousMedia = function() {
		if(!componentInited) return;
		if(_type != 'thumbs') return;
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		var temp = _activeItem-1;
		if(temp <0)temp = playlistLength-1;//loop
		if(!_thumbHolderArr[temp]) return;//if not yet loaded
		
		enableActiveItem();
		_activeItem--;
		if(_activeItem <0)_activeItem = playlistLength-1;//loop
		disableActiveItem();
		positionMedia();	
	}
	
	$.autoSlide.openMedia = function(num) {
		if(!componentInited) return;
		if(_type != 'thumbs') return;
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(num <0)num = playlistLength-1;//loop
		else if(num >playlistLength-1)num = 0;//loop
		if(!_thumbHolderArr[num]) return;//if not yet loaded
			
		enableActiveItem();
		_activeItem = num;
		disableActiveItem();
		positionMedia();	
	}
	
	$.autoSlide.toggleDirection = function() {
		if(!componentInited) return;
		opositeDirection = !opositeDirection;
		if(!opositeDirection){
			controls_direction.attr('src', 'data/icons/dir_forward.png');
		}else{
			controls_direction.attr('src', 'data/icons/dir_backward.png'); 
		}
	}
	
	$.autoSlide.togglePlaylist = function(state) {
		if(!componentInited) return;
		if(_type != 'thumbs') return;
		if(state == undefined){
			togglePlaylist();
		}else{
			togglePlaylist2(state);
		}
	}
	
	$.autoSlide.inputPlaylist = function(id) {
		if(!componentInited) return;
		
		var playlist = componentPlaylist.find("div[id="+id+"]"); 
		currentPlaylistID=playlist.index();
		var current = componentWrapper.find('.subMenu li').eq(currentPlaylistID);
		
		if(categoryTransition || current.hasClass('selectedMenuItem')) return false;
		categoryTransition = true;
		if(lastActiveMenuItem){
			lastActiveMenuItem.removeClass("selectedMenuItem hover");
		}
		current.addClass('selectedMenuItem');
		lastActiveMenuItem = current;
		var value = current.text();
		currentCategory.html(value);

		currentPlaylistID=current.index();
		//console.log('currentPlaylistID = ', currentPlaylistID);

		initCategory();  
	}


	
	// ******************************** PUBLIC FUNCTIONS MUSIC **************** //
	
	$.autoSlide.toggleAudio = function(state) {
		if(!audioInited) return;
		//console.log(state);
		if(state == undefined){
			togglePlayControl();
		}else{
			togglePlayControl2(state);
		}
	}
	
	$.autoSlide.nextAudio = function() {
		if(!audioInited || !playlistManager) return;
		playlistManager.advanceHandler(1, true);
		checkCounter();
	}
	
	$.autoSlide.previousAudio = function() {
		if(!audioInited || !playlistManager) return;
		playlistManager.advanceHandler(-1, true);
		checkCounter();
	}
	
	$.autoSlide.loadAudio = function(num) {
		if(!audioInited || !playlistManager) return;
		if(num<0)num=0;
		else if(num > _audioPlaylistLength-1)num=_audioPlaylistLength-1;
		playlistManager.processPlaylistRequest(num);
		checkCounter();
	}
	
	$.autoSlide.setAudioVolume = function(value) {
		if(!audioInited) return;
		if(value<0) value=0;
		else if(value>1) value=1;
		defaultVolume = value;
		soundManager.setVolume(sm2_sound_id,defaultVolume*100);
	}
	
	$.autoSlide.inputAudioPlaylist = function(id) {
		if(!audioInited) return;
		getAudioPlaylist(id);
	}
	
	$.autoSlide.destroyAudio = function() {
		if(!audioInited) return;
		cleanAudio();
		if(controls_music) controls_music.attr('src', 'data/icons/music_off.png');
	}
	
	
}
	
})(jQuery);





/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){jQuery.browser.mobile=/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iPad|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

