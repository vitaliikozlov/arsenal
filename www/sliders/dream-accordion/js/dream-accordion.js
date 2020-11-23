

	
(function($) {

	$.accordionSlider = function (wrapper, settings) {
		
		
		
	
		
	var componentInited = false;
	
	var isOfline = false;
	if(window.location.href.substr(0,4)=='file'){
		isOfline=true;
	}	
	//console.log(window.location.href.substr(0,4), isOfline);	
	
	var sliderWrapper = $(wrapper);

	var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase());
	var is_safari = ($.browser.safari && /chrome/.test(navigator.userAgent.toLowerCase()) ) ? false : true;
	var isIEbelow9 = false;
	var isIE=false;
	if ($.browser.msie) {
	    isIE = true;
	} 
	if ($.browser.msie  && parseInt($.browser.version, 10) < 9) {
	    isIEbelow9 = true;
		//console.log(isIEbelow9);
	} 
	
	var _customContentArr=[];//fade all custom content on intro, not before
	
	var useGlobalDelay = settings.useGlobalDelay;
	
	var orientation = 'horizontal';

	var sliderHolder = sliderWrapper.find('.sliderHolder');
	var sliderCointainer = sliderWrapper.find('.sliderCointainer');
	
	var mediaPreloader=sliderWrapper.find('.mediaPreloader');
	
	var slideshowOn=settings.slideshowOn;
	var slideshowTimeout = settings.slideshowDelay;
	var slideshowTimeoutID; 
	var counter=-1;
	
	var videoDisablesAllNavigation=true;
	var navigationActive = true;
	var useKeyboardNavigation=true;
	var useControls=settings.useControls;
	
	var controls_play_url='sliders/dream-accordion/data/icons/controls_play.gif';
	var controls_pause_url='sliders/dream-accordion/data/icons/controls_pause.gif';
	var playBtnUrl='sliders/dream-accordion/data/icons/play2.png';
	
	if(useControls){
		var controls = sliderWrapper.find('.controls');
		controls.css('opacity', 0.7);
		
		controls.bind('mouseenter', function(){
			$(this).stop().animate({'opacity': 1},  {duration: 500, easing: "easeOutSine"});	
			return false;	
		});
		
		controls.bind('mouseleave', function(){
			$(this).stop().animate({'opacity': 0.7},  {duration: 500, easing: "easeOutSine"});
			return false;	
		});
		
		var controls_prev = sliderWrapper.find('.controls_prev');
		var controls_toggle = sliderWrapper.find('.controls_toggle');
		var controls_next = sliderWrapper.find('.controls_next');
		
		controls_prev.css('cursor', 'pointer');
		controls_toggle.css('cursor', 'pointer');
		controls_next.css('cursor', 'pointer');
		
		controls_prev.bind('click', clickControls);
		controls_toggle.bind('click', clickControls);
		controls_next.bind('click', clickControls);
		
		var controlsToggleSrc=controls_toggle.find('img');
		if(slideshowOn) controlsToggleSrc.attr('src', controls_pause_url);
	}else{
		sliderWrapper.find('.controls').remove();
	}
	
	var openOnRollover = settings.openOnRollover;
	
	var captionStartTimeoutID; 

	var windowResizeInterval = 500;
	
	var unSelectableCaptions=true;//prevent captions mouse select
	
	var captionOpenDelay=120;
	var captionToggleSpeed=500;
	var captionMoveValue = 100;
	
	var slideArr = $(sliderHolder.find('div[class=slideDiv]'));
	var playlistLength = slideArr.length;
	//console.log(playlistLength);
	var openSlideNum=settings.openSlideNum;
	if(openSlideNum > playlistLength-1) playlistLength = playlistLength-1;
	var visibleItems = settings.visibleItems;
	var totalItems = playlistLength;
	if(visibleItems > totalItems) visibleItems = totalItems;
	var allSlidesVisible = false;
	if(visibleItems == totalItems) allSlidesVisible =true;
	
	var useScroll = settings.useScroll;
	var keepSelection = true;
	if(!keepSelection && visibleItems == totalItems) useScroll = false;
	
	var randomPlay = settings.randomPlay;
	if(randomPlay){
		//shuffle array to make it random, dont use random class
		shuffleArray(slideArr);
	}
	
	//autoplay for ithing
	var videoAutoplay=false;
	
	var titleArr =[];
	
	var imageCount=0;
	
	var transitionTime = settings.transitionTime;
	var transitionEase = settings.transitionEase;
	
	var hideTitleOnOpen=true;
	
	var closeVideoBtn;
	var closeVideoBtnOffOpacity = 0.6;
	var closeText;
	
	var componentWidth =sliderWrapper.width();
	var componentHeight =sliderWrapper.height();
	
	//create holders for video iframes
	var ytHolderDiv = $("<div></div>");
	ytHolderDiv.css('position', 'relative');
	ytHolderDiv.css('width', componentWidth + 'px');
	ytHolderDiv.css('height', componentHeight + 'px');
	ytHolderDiv.css('left', 0);
	ytHolderDiv.css('top', 0);
	ytHolderDiv.css('opacity', 0);
	ytHolderDiv.css('zIndex', -10);
	sliderWrapper.prepend(ytHolderDiv);
	
	var vimeoHolderDiv = $("<div></div>");
	vimeoHolderDiv.css('position', 'absolute');
	vimeoHolderDiv.css('width', componentWidth + 'px');
	vimeoHolderDiv.css('height', componentHeight + 'px');
	vimeoHolderDiv.css('left', 0+'px');
	vimeoHolderDiv.css('top', 0+'px');
	vimeoHolderDiv.css('display', 'none');
	vimeoHolderDiv.css('zIndex', -11);
	sliderWrapper.prepend(vimeoHolderDiv);
	
	var ytInited =  false;
	var vimeoInited =  false;
	var vimeoVideoIframe;
	var youtubeVideoIframe;
	var ytStarted=false;
	//
	var ytPlayer;
	var ytFrameId;
	var ytAutoplay=false;
	var ytPlayerState = '';
	//
	var videoIsOn=false;
	var isVimeo =false;//vimeo or yt
	var includeVideoInSlideshow = settings.includeVideoInSlideshow;
	var ytStartIntervalID; 
	var ytStartInterval = 100; 
	var openYoutubeOnBuffering = true;
	
	var componentHit=false;
	
	//scroll vars
	var _scroll = sliderWrapper.find('.scroll');
	var dragger = sliderWrapper.find('.scrollBar');
	var track = sliderWrapper.find('.scrollTrack');
	var scrollOrientation='horizontal';
	var scrollTrackSize =track.width();
	var draggerSize = dragger.width(); 
	if(!useScroll){
		_scroll.remove();
	}else{
		//_scroll.css('opacity', 0);
		dragger.css('cursor', 'pointer');
		track.css('cursor', 'pointer');
		
		var draggerPositionClicked = 0;
		var draggerInitalPosition = 0;
		var draggingOn=false;
		var draggerPosition=0;
		var scrollContentSize;
		var newContentPosition=0;	
		var contentPosition=0;
		var scrollerEase = 1;
		var draggerOverColor = settings.scrollDraggerOverColor;
		var draggerColor = dragger.css('background');
		var useMouseWheel=false;
		var scrollContentIntervalID = null;
		var scrollContentInterval = 50;
		var draggerMouseDownIntervalID = null;
		var draggerMouseDownInterval = 300;//IMPORTANT OPTIMIZATION!  the slower the interval (aka the higher the value), the less the openSlide function will get called when dragging scroll drager. Also, value shouldnt be too high, because it could still be jerky because of too rare function calls. This was made to optimize dragging on mouse dragger down which was being called to often.
		var draggerMouseClickValue = 0;
		var scrollHit = false;//mouse over track/dragger
		var contentFactorMoveValue = 0;
		
	}
			
	var grayscaleCounter=0;				
	initAll(grayscaleCounter);
	
	function initAll(i){
		
		var img;
		var imgCustomSize;
		
		
		var fontMeasure = sliderWrapper.find('.fontMeasure');
		
		// title
		var k;
		var title;
		var titleLen;
		var titleHtml;
		var titleDiv;
		var titleWidth;
		var titleHeight;
		var titleBgColor; 
		var titleTextColor;
		var titleX;
		var titleY;
		var titleClassData;
		var titleAlignment;
		var titleRotation;
		var lefttitlePadding;
		var righttitlePadding;
		var toptitlePadding;
		var bottomtitlePadding; 
		var finaltitleWidth;
		var finaltitleHeight;
		
		
		//captions
		var j;
		var captionLen;
		var captionArr;
		var caption;
		var captionInner;
		var captionHtml;
		var captionDiv;
		var captionMaskerDiv;
		var captionWidth;
		var captionHeight;
		var captionBgColor; 
		var captionTextColor;
		var captionX;
		var captionY;
		var captionClassData;
		var leftCaptionPadding;
		var rightCaptionPadding;
		var topCaptionPadding;
		var bottomCaptionPadding; 
		var finalCaptionWidth;
		var finalCaptionHeight;
		
		//custom content
		var customContent;
		var customContentArr;
		
		var div;
		var z=0;
		var zlen;
		
		var videoIFrame;
		var videoIFrameDiv;
		var videoIFrameSrc;
		var videoIFramePath;
		
		
		//for(i; i <playlistLength; i++){
			
			div = $(slideArr[i]);
			img = div.find('img[class=stack_img]');
			//console.log(i, img);
			
			imgCustomSize = parseInt(div.attr('data-width'), 10);
			//console.log(imgCustomSize);
			
			//div.css('opacity', 0);
			div.attr('id', i);
			div.data('customSize', imgCustomSize);
			//console.log(i, ' , ', imgCustomSize);
			
			if(orientation == 'horizontal'){
				div.css('width', imgCustomSize + 'px');
				div.css('height', componentHeight + 'px');
			}else{
				div.css('width', componentWidth + 'px');
				div.css('height', imgCustomSize + 'px');
			}
			//console.log(div.css('width'), div.css('height'));
			
			div[0].opened=false;
			
			
			if(openOnRollover){
				div.bind('mouseleave', outCategoryItem);
				div.bind('mouseenter', overCategoryItem);
			}else{
				div.bind('click', openSlideOnClick);
			}
			
			if(!isOfline && !isIEbelow9 && img.length>0){
				
				var img_src = img.attr('src');
				//console.log(img_src.substr(0,3));
				
				if(img_src.substr(0,3) == '../'){//local image (search for ../)	
					
					var imgCopy = img.clone().appendTo(div);
					imgCopy.addClass('stack_img');
					imgCopy.attr('src',grayscale(imgCopy[0]));
					div.data('imgCopy', imgCopy);
					
					grayscaleCounter++;
					if(grayscaleCounter<playlistLength){
						initAll(grayscaleCounter);
					}else{
						fontMeasure.remove();
						preventSelect(titleArr);
						setupDone();
					} 
					
				}else{
					
					//http://www.maxnov.com/getimagedata/
					$.getImageData({
					  url: img_src,
					  success: function(image){
						// Do something with the now local version of the image
						//console.log(image.width, image.height);
						
						var imgCopy = $(image).clone().appendTo(div);
						imgCopy.addClass('stack_img');
						imgCopy.attr('src',grayscale(imgCopy[0]));
						div.data('imgCopy', imgCopy);
						
						grayscaleCounter++;
						if(grayscaleCounter<playlistLength){
							initAll(grayscaleCounter);
						}else{
							fontMeasure.remove();
							preventSelect(titleArr);
							setupDone();
						} 
						
					  },
					  error: function(xhr, text_status){
						  //console.log('xhr, text_status : ', xhr, text_status);
						// Handle your error here
					  }
					});
				}
				/*div.bind('mouseenter', function(){
					if($(this).data('imgCopy')) $(this).data('imgCopy').stop().animate({'opacity': 0},  {duration: 1000});	
					return false;	
				});
				
				div.bind('mouseleave', function(){
					if($(this).data('imgCopy')) $(this).data('imgCopy').stop().animate({'opacity': 1},  {duration: 1000});
					return false;	
				});*/
			}else{
				grayscaleCounter++;
				if(grayscaleCounter<playlistLength){
					initAll(grayscaleCounter);
				}else{
					fontMeasure.remove();
					preventSelect(titleArr);
					setupDone();
				} 
			}
			
			
			
			
			//title
			k=0;
			title = div.find('p[data-title=title]');
			//console.log(titleLen);
			titleLen= title.size();
			if(titleLen > 1) titleLen = 1;//only 1 title allowed
			//console.log(i, titleLen);
			
			if(titleLen == 0) titleArr.push('');
			
			for(k; k < titleLen;k++){
			
				titleHtml = title.html();
				titleBgColor = title.attr('data-background-color');
				titleTextColor = title.attr('data-color');
				//console.log(titleBgColor, titleTextColor);
				
				titleClassData = title.attr('class').split(',');
				titleRotation = parseInt(titleClassData[0], 10);
				titleAlignment = titleClassData[1].toLowerCase();
				titleX = parseInt(titleClassData[2], 10);
				titleY = parseInt(titleClassData[3], 10);
					
				titleDiv = $("<div />").html(titleHtml).addClass('title').appendTo(fontMeasure);
				
				titleWidth = titleDiv.width() + 1;
				titleHeight = titleDiv.height() + 1;
				
				lefttitlePadding =parseInt($(titleDiv).css('paddingLeft'),10);
				righttitlePadding =parseInt($(titleDiv).css('paddingRight'),10);
				toptitlePadding =parseInt($(titleDiv).css('paddingTop'),10);
				bottomtitlePadding =parseInt($(titleDiv).css('paddingBottom'),10); 
				//console.log(lefttitlePadding,righttitlePadding, toptitlePadding , bottomtitlePadding);
				
				finaltitleWidth =  titleWidth + lefttitlePadding + righttitlePadding;
				finaltitleHeight = titleHeight + toptitlePadding + bottomtitlePadding;
				//console.log(titleWidth, titleHeight, finaltitleWidth, finaltitleHeight);
				
				/*titleDiv.css('width', titleWidth + 'px');
				titleDiv.css('height', titleHeight + 'px' );
				*/
				titleDiv.css('color', titleTextColor);
				
				if(!isIEbelow9){
					titleDiv.css('backgroundColor', titleBgColor);
				}else{//ie below 9
					var ct = setArgb(titleBgColor);
					titleDiv.css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr='+ct+',endColorstr='+ct+');');
				}
				/*
				if(orientation == 'horizontal'){
					if(titleRotation == '-90'){
						titleDiv.transform({rotate: -90+'deg'});
					}else{//90
						titleDiv.transform({rotate: 90+'deg'});
					}
				
					if(titleAlignment=='tl'){
						//align from top left
						if(!isIEbelow9){
							titleDiv.css('left', - finaltitleWidth / 2 + finaltitleHeight / 2 + titleX + 'px');
							titleDiv.css('top', finaltitleWidth / 2 -  finaltitleHeight / 2 + titleY + 'px');
						}else{
							titleDiv.css('left', titleX + 'px');
							titleDiv.css('top', titleY + 'px');
						}
					}else{//bl
						//align from bottom left
						if(!isIEbelow9){
							titleDiv.css('left', - finaltitleWidth / 2 + finaltitleHeight / 2 + titleX + 'px');
							titleDiv.css('top', componentHeight - finaltitleWidth / 2 - finaltitleHeight / 2 - titleY + 'px');
						}else{
							titleDiv.css('left', titleX + 'px');
							titleDiv.css('top', componentHeight - finaltitleWidth - titleY + 'px');
						}
					}
				
				}else{
					titleDiv.css('left', titleX + 'px');
					titleDiv.css('top', titleY + 'px');	
				}
				*/

				titleDiv.appendTo(div);
				titleArr.push(titleDiv);
				
			}
			
			div.find('p[data-title=title]').remove();
			
			//caption
			
			j=0;
			caption=div.find('p[data-title=caption]');
			captionLen = caption.size();
			//console.log(captionLen);
			captionArr = [];
			
			for(j; j < captionLen;j++){
				
				captionInner=$(caption[j]);
			
				captionHtml = captionInner.html();
				captionBgColor = captionInner.attr('data-background-color');
				captionTextColor = captionInner.attr('data-color');
				//console.log(captionBgColor,captionTextColor);
				captionClassData = captionInner.attr('class').split(',');
				captionX = parseInt(captionClassData[0], 10);
				captionY = parseInt(captionClassData[1], 10);
					
				captionDiv = $("<div />").html(captionHtml).addClass('caption').appendTo(fontMeasure);
				
				captionWidth = captionDiv.width() + 1;
				captionHeight = captionDiv.height() + 1;
				
				captionDiv.css('position', 'absolute');
				captionDiv.css('width', captionWidth + 'px');
				captionDiv.css('height', captionHeight + 'px' );
				
				captionDiv.css('color', captionTextColor);
				if(!isIEbelow9){
					captionDiv.css('backgroundColor', captionBgColor);
				}else{
					var ct = setArgb(captionBgColor);
					captionDiv.css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr='+ct+',endColorstr='+ct+');');
				}	

				//masker
				leftCaptionPadding =parseInt($(captionDiv).css('paddingLeft'),10);
				rightCaptionPadding =parseInt($(captionDiv).css('paddingRight'),10);
				topCaptionPadding =parseInt($(captionDiv).css('paddingTop'),10);
				bottomCaptionPadding =parseInt($(captionDiv).css('paddingBottom'),10); 
				
				finalCaptionWidth =  captionWidth + leftCaptionPadding + rightCaptionPadding;
				finalCaptionHeight = captionHeight + topCaptionPadding + bottomCaptionPadding;
				
				captionMaskerDiv	 = $("<div />").addClass("captionHolder");
				captionMaskerDiv.finalWidth = finalCaptionWidth;//remember final width
				//console.log(finalCaptionWidth);
			
				captionMaskerDiv.css('width', 0);//
				captionMaskerDiv.css('height', finalCaptionHeight + 'px' );
				
				captionMaskerDiv.origLeft=captionX;
				captionMaskerDiv.css('left', captionX+captionMoveValue + 'px');
				captionMaskerDiv.css('top', captionY + 'px');
				if(captionBgColor!=undefined)captionMaskerDiv.css('background', captionBgColor);
				
				
				captionMaskerDiv.appendTo(div);
				captionDiv.appendTo(captionMaskerDiv);
				
				captionArr.push(captionMaskerDiv);
			
			}
			
			if(captionLen > 0){
				div.data('captions',captionArr);//remember captions
				preventSelect(captionArr);
			}
			div.find('p[data-title=caption]').remove();
			
			
			
			if(div.attr('data-link') != undefined && !isEmpty(div.attr('data-link'))){
				
				if(div.attr('data-content') == 'youtube'){
					div.data('link', div.attr('data-link'));
					div.data('action', 'youtube');
					createPlayBtn(div);
					div.css('cursor', 'pointer');
				}
				else if(div.attr('data-content') == 'vimeo'){
					div.data('link', div.attr('data-link')); 
					div.data('action', 'vimeo');
					createPlayBtn(div);
					div.css('cursor', 'pointer');
				}else{
					div.data('link', div.attr('data-link')); 
					if(div.attr('data-target') != undefined) div.data('linkTarget',div.attr('data-target'));
					div.data('action', 'link');
					div.css('cursor', 'pointer');
				}
			}
		//}
		
		
		//clean
		/*fontMeasure.remove();
		preventSelect(titleArr);
		
		setupDone();*/
	
	}

	function setupDone() {					
		
		var size = orientation == 'horizontal' ? componentWidth : componentHeight;
		scrollContentSize = parseInt((totalItems * (size / visibleItems)), 10);///unopened size
		//console.log('scrollContentSize = ', scrollContentSize);
		
		
		
		//SCROLL
		if(useScroll){
			
			dragger.bind('mouseover', function(){
				if(!navigationActive) return;
				
				scrollHit = true;
				dragger.css("background-color", draggerOverColor);
				
				return false;
			});
			
			dragger.bind('mouseout', function(){ 
				if(!navigationActive) return;
				
				scrollHit = false;
				if(!draggingOn && counter!=-1) positionDraggerOnSegment(counter);
				if(!draggingOn) dragger.css("background-color", draggerColor); 
				
				return false;
			});
			
			track.bind('mouseover', function(){
				if(!navigationActive) return;
				scrollHit = true;
				return false;
			});
			
			track.bind('mouseout', function(){ 
				if(!navigationActive) return;
				scrollHit = false;
				return false;
			});
			
			dragger.bind('mousedown touchstart MozTouchDown', function(e) {
				
				if (!e) var e = window.event;
				if(e.cancelBubble) e.cancelBubble = true;
				else if (e.stopPropagation) e.stopPropagation();
				
				if(!navigationActive) return;
				//console.log('dragger mousedown');
				
				draggingOn=true;
				
				draggerPositionClicked = scrollOrientation == 'horizontal' ? e.pageX : e.pageY; 
				//console.log('draggerPositionClicked = ', draggerPositionClicked);
				draggerInitalPosition = scrollOrientation == 'horizontal' ? parseInt( dragger.css("left") , 10) : parseInt( dragger.css("top") , 10); 
				//console.log('draggerInitalPosition = ', draggerInitalPosition);
				
				$(document).bind('mousemove', scrollerDown);//just for changing dragger position
				
				if(draggerMouseDownIntervalID) clearInterval(draggerMouseDownIntervalID);
				draggerMouseDownIntervalID = setInterval(scrollerDown2, draggerMouseDownInterval);//just for changing slides
				
				$(document).bind('mouseup touchend MozTouchUp', documentUp);
				
				if(!allSlidesVisible && counter > -1){//update content only if visible items < total items
					if(scrollContentIntervalID) clearInterval(scrollContentIntervalID);
					scrollContentIntervalID = setInterval(updateContentViaScroll, scrollContentInterval);
				}
				
				return false;
			});
			
			track.bind('mousedown touchstart MozTouchDown', function(e) {
				
				if (!e) var e = window.event;
				if(e.cancelBubble) e.cancelBubble = true;
				else if (e.stopPropagation) e.stopPropagation();
				
				if(!navigationActive) return;
				
				var offset = track.offset();
				if(scrollOrientation == 'horizontal'){
					draggerPosition = e.pageX - offset.left;
				}else{
					draggerPosition = e.pageY - offset.top;
				}	
				
				if(draggerPosition<0) draggerPosition=0;
				//else if(draggerPosition>(scrollTrackSize-draggerSize)) draggerPosition=(scrollTrackSize-draggerSize);
				
				updateSlidesViaTrack();
				if(!allSlidesVisible  && counter > -1) updateContentViaScroll();//update content only if visible items < total items
				
				return false;
			});
			
			track.bind('mouseup touchend MozTouchUp', function(e) {
				
				if (!e) var e = window.event;
				if(e.cancelBubble) e.cancelBubble = true;
				else if (e.stopPropagation) e.stopPropagation();
				
				if(!navigationActive) return;
				//console.log('........track mouseup');
				
				$(document).unbind('mouseup touchend MozTouchUp', documentUp);
				$(document).unbind('mousemove', scrollerDown);
				if(draggerMouseDownIntervalID) clearInterval(draggerMouseDownIntervalID);
				if(scrollContentIntervalID) clearInterval(scrollContentIntervalID);
				
				dragger.css("background-color", draggerColor);
				draggingOn=false;
				if(counter!=-1) positionDraggerOnSegment(counter);
				
				return false;
			});
	
		}
		
		
		
		
		
		
		if(useKeyboardNavigation){
			$(document).keyup(function (e) {
				
				if (!e) var e = window.event;
				if(e.cancelBubble) e.cancelBubble = true;
				else if (e.stopPropagation) e.stopPropagation();
				
				if(!navigationActive) return;
				  //console.log(event.keyCode);
				  if (e.keyCode == 37) {
					  previousSlide(true);
				  } 
				  else if (e.keyCode == 39) {
					  nextSlide(true);
				  }
			});
		
		}
		
		
		
		componentInited=true;
		
		distributeSpace();
		
		if(!openOnRollover){
			sliderWrapper.bind('mouseenter', overSlider);
			sliderWrapper.bind('mouseleave', outSlider);	
		}
	
		if(openSlideNum != -1) counter = openSlideNum;
	
		if(slideshowOn){
			if(counter==-1) counter = 0;//if left from openSlideNum and slideshow on, set it to zero 
			openSlide(counter, true);
			positionDraggerOnSegment(counter);
			if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
		}else{
			if(counter!=-1) openSlide(counter, true);
		}

		//if(mediaPreloader) mediaPreloader.hide('slow');


		sliderCointainer.stop().animate({'opacity': 1},  {duration: 500, easing: "easeOutSine"});

		if(useControls) controls.animate({opacity: 1 }, {duration: 500, easing: "easeOutSine"});
		if(useScroll){
			_scroll.animate({opacity: 1 }, {duration: 500, easing: "easeOutSine"});
		}
		
		
						
	}
	
	//SCROLL
	function documentUp(e){
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		 if(!navigationActive) return;
		// console.log('document mouseup');
		
		 $(document).unbind('mouseup touchend MozTouchUp', documentUp);
		 $(document).unbind('mousemove', scrollerDown);
		 if(draggerMouseDownIntervalID) clearInterval(draggerMouseDownIntervalID);
		 if(scrollContentIntervalID) clearInterval(scrollContentIntervalID);
		 
		 dragger.css("background-color", draggerColor);
		 draggingOn=false;
		 if(counter!=-1) positionDraggerOnSegment(counter);
		  
		 return false;
	};	
	
	function scrollerDown2(){
		
		if(!navigationActive) return;
		//console.log('scrollerDown2');
		updateSlidesViaDrag();
	}
	
	function scrollerDown(e){
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		if(!navigationActive) return;
		//console.log('scrollerDown...........');
		
		draggerMouseClickValue = scrollOrientation == 'horizontal' ? e.pageX : e.pageY; 
		var dif = draggerMouseClickValue - draggerPositionClicked;
		draggerPosition = (draggerInitalPosition+dif);
		
		if(draggerPosition<0) draggerPosition=0;
		else if(draggerPosition>(scrollTrackSize-draggerSize)) draggerPosition=(scrollTrackSize-draggerSize);
		
		if(scrollOrientation == 'horizontal'){
			dragger.css("left", draggerPosition+"px");
		}else{
			dragger.css("top", draggerPosition+"px");
		}
		
	}
	
	function updateSlidesViaTrack(){
		if(!navigationActive) return;
		//console.log('updateSlidesViaTrack')
		
		var segment = Math.floor((draggerPosition * totalItems)/ (scrollTrackSize));
		//console.log('segment = ', segment);
		
		if(!keepSelection && counter==-1){
			
			var size = orientation == 'horizontal' ? componentWidth : componentHeight;
			contentFactorMoveValue = size / visibleItems;
			
			var perc =  Math.floor((draggerPosition/(scrollTrackSize-draggerSize)*(totalItems - visibleItems)));
			//console.log(- contentFactorMoveValue * perc);
			
			var prop = {};
			var animProp = orientation == 'horizontal' ? 'left' : 'top';
			
			prop[animProp] = - contentFactorMoveValue * perc + 'px';
			sliderHolder.stop().animate(prop,  {duration: 350, easing: 'easeOutSine'});
		
			//
			positionDraggerOnSegment(segment);
		
			return;	
		};
		
		var item = $(slideArr[segment]);
		//console.log(item[0].opened);
		if(item[0].opened) return;//prevent openSlide call while mouse down on dragger and no segment change
		
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(videoIsOn){
			if(isVimeo){
				forceVimeoEnd();
			}else{
				forceYoutubeEnd();
			}
		}
		
		hidePreviousSlideData(counter);
		counter = segment;
		openSlide(counter);
		if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
	}
	
	/*
	scroll size may be different than number of segments/tracks length so we need separate calculation for scroll drag and slide sort
	*/
	function updateSlidesViaDrag(){
		if(!navigationActive) return;
		//console.log('updateSlidesViaDrag');
		
		//scroll working while no item opened
		if(!keepSelection && counter==-1){
			
			var size = orientation == 'horizontal' ? componentWidth : componentHeight;
			contentFactorMoveValue = size / visibleItems;
			
			var perc =  Math.floor((draggerPosition/(scrollTrackSize-draggerSize)*(totalItems - visibleItems)));
			//console.log(- contentFactorMoveValue * perc);
			
			var prop = {};
			var animProp = orientation == 'horizontal' ? 'left' : 'top';
			
			prop[animProp] = - contentFactorMoveValue * perc + 'px';
			sliderHolder.stop().animate(prop,  {duration: 350, easing: 'easeOutSine'});
		
			return;	
		};
		
		var dif = draggerMouseClickValue - draggerPositionClicked;
		var dp = (draggerInitalPosition+dif);
		
		var segment = Math.floor((dp * totalItems)/ (scrollTrackSize - draggerSize));
		if(segment < 0) segment=0;
		else if(segment > totalItems-1) segment = totalItems-1;
		//console.log('segment = ', segment);
		
		var item = $(slideArr[segment]);
		//console.log(item[0].opened);
		if(item[0].opened) return;//prevent openSlide call while mouse down on dragger and no segment change
		
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(videoIsOn){
			if(isVimeo){
				forceVimeoEnd();
			}else{
				forceYoutubeEnd();
			}
		}
		
		hidePreviousSlideData(counter);
		counter = segment;
		openSlide(counter);
		if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
	}
	
	//drag content only on segments change
	function updateContentViaScroll(navOff){
		if(!navOff){
			if(!navigationActive) return;
		}
		
		//console.log('updateContentViaScroll');
		
		var perc;
		
		var t = visibleItems;
		var t1 = Math.ceil(t / 2);
		var t2 = t - t1;
		var q = totalItems - visibleItems;
		
		if(counter < t1){//still zero
			perc = 0;
		}
		if(counter >= t1){//start count
			perc = counter - t2;
		}
		if(perc > q) {//upper limit
			perc = q;
		}
		
		
		var prop = {};
		var animProp = orientation == 'horizontal' ? 'left' : 'top';
		
		prop[animProp] = - contentFactorMoveValue * perc + 'px';
		//console.log('prop ',  prop, contentFactorMoveValue);
		sliderHolder.stop().animate(prop,  {duration: 350, easing: 'easeOutSine'});
	}
	
	function updateContentViaScroll2(){
		if(!navigationActive) return;
		
		//console.log('updateContentViaScroll2');
		
		var perc;
		
		var t = visibleItems;
		var t1 = Math.ceil(t / 2);
		var t2 = t - t1;
		var q = totalItems - visibleItems;
		
		if(counter < t1){//still zero
			perc = 0;
		}
		if(counter >= t1){//start count
			perc = counter - t2;
		}
		if(perc > q) {//upper limit
			perc = q;
		}
		
		var prop = {};
		var animProp = orientation == 'horizontal' ? 'left' : 'top';
		
		var size = orientation == 'horizontal' ? componentWidth : componentHeight;
		contentFactorMoveValue = size / visibleItems;
		
		prop[animProp] = - contentFactorMoveValue * perc + 'px';
		sliderHolder.stop().animate(prop,  {duration: 350, easing: 'easeOutSine'});
	}
	
	function positionDraggerOnSegment(id){
		if(!navigationActive) return;
			
		var slidePart = scrollTrackSize / totalItems;
		draggerPosition = slidePart * id;
		
		if(draggerPosition<0) draggerPosition=0;
		else if(draggerPosition>(scrollTrackSize-draggerSize)) draggerPosition=(scrollTrackSize-draggerSize);
		
		var prop = {};
		var animProp = scrollOrientation == 'horizontal' ? 'left' : 'top';
		prop[animProp] = draggerPosition + 'px';
		
		dragger.stop().animate(prop,  {duration: 350, easing: "easeOutQuint"});
		
	}
	
	/*
	if(useMouseWheel){
		sliderWrapper.mousewheel(function(event, delta) {
			draggerPosition-=delta*10;
			updateSlidesViaScroll();
			return false;
		});
	}*/
	
	//************** END SCROLL
	
	function createPlayBtn(div) {//play btn for video slide
		
		var playBtn = $(new Image());
		playBtn.css('position', 'absolute');
		playBtn.css('display', 'block');
		div.append(playBtn);
		div.data('playBtn', playBtn);
		
		playBtn.load(function() {
			
			playBtn.css('width', this.width + 'px');
			playBtn.css('height', this.height + 'px');
			//console.log(this.width, this.height);
			
			if(orientation == 'horizontal'){
				playBtn.css('left', parseInt(div.data('customSize'),10) / 2 - this.width / 2 + 'px');
				playBtn.css('top', componentHeight / 2 - this.height / 2 + 'px');
			}else{
				playBtn.css('left', componentWidth / 2 - this.width / 2 + 'px');
				playBtn.css('top', parseInt(div.data('customSize'),10) / 2 - this.height / 2 + 'px');
			}
			
		}).attr('src', playBtnUrl);
	}
	
	//*****************
	
	/*function hideScroll(){
		_scroll.stop().animate({'opacity': 0},  {duration: 500, easing: "easeOutSine", complete: function(){
			_scroll.css('display', 'none');	
		}});
	}
	function showScroll(){
		_scroll.css('display', 'block');	
		_scroll.stop().animate({'opacity': 1},  {duration: 500, easing: "easeOutSine"});
	}*/
	
	
	 function openSlideOnClick(e) {
		overCategoryItem(e);
	 }
	
	 function overCategoryItem(e) {
		if(!componentInited) return;
		
		componentHit = true;
		
		if(slideshowOn) pauseSlideshow();
		
		if(videoIsOn) return;
		 
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('id');
		
		//check action for after_click_open 
		if($(slideArr[id]).data('action') != undefined){
			checkSlideAction(id);
		}
		
		positionDraggerOnSegment(id);
	 
	    if(currentTarget.opened) return;
	 	//console.log('overCategoryItem', id);
	 
		hidePreviousSlideData(counter);
		counter=id;
		openSlide(counter, true);
		
		return false;
	
	}
	
	 function checkSlideAction(id) {
		 var type = $(slideArr[id]).data('action');
		 var currentTarget = $(slideArr[id]);
		 if(type == 'link'){
			currentTarget.bind('click', navigateToUrl);
		 }else if(type == 'youtube'){
			currentTarget.bind('click', toggleYoutube);
		 }else if(type == 'vimeo'){
			currentTarget.bind('click', toggleVimeo);
		 }
	 }
	
	 function outCategoryItem(e) {
		if(!componentInited) return; 
		 
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('id');
		
		//console.log('outCategoryItem', id);
		if(!videoIsOn){
			if(slideshowOn){
				resumeSlideshow();
			}else{
				if(!keepSelection){
					hidePreviousSlideData(id);
					distributeSpace('tween');
				}
			}
		}
		
		componentHit = false;
		return false;
	}
	
	function hidePreviousSlideData(id) {//hide vertical title and captions
		if(id == -1) return;
		
		//check action for after_click_open 
		if($(slideArr[id]).data('action') != undefined){
			var type = $(slideArr[id]).data('action');
			var currentTarget = $(slideArr[id]);
			if(type == 'link'){
				currentTarget.unbind('click', navigateToUrl);
			}else if(type == 'youtube'){
				currentTarget.unbind('click', toggleYoutube);
			}else if(type == 'vimeo'){
				currentTarget.unbind('click', toggleVimeo);
			}
		}
		
		if($(slideArr[id]).data('imgCopy')) $(slideArr[id]).data('imgCopy').stop().animate({'opacity': 1},  {duration: 1000});
	
		if(hideTitleOnOpen){
			var title=$(titleArr[id]);
			if(title){
				title.css('display', 'block');
				title.stop().animate({'opacity': 1},  {duration: 500, easing: "easeOutQuart"});
			}
		}
		
		removeCaptions(id);
	}
	
	function openSlide(j, updateContent) {
		//console.log('openSlide ', j, componentInited);
		if(!componentInited) return;
		
		if($(slideArr[j]).data('imgCopy')) $(slideArr[j]).data('imgCopy').stop().animate({'opacity': 0},  {duration: 1000});	
			
		var item;
		var itemToMove = $(slideArr[j]);
		var i = 0;
		var newX;
		var id;
		var size = orientation == 'horizontal' ? componentWidth : componentHeight;
		var cs = parseInt(itemToMove.data('customSize'), 10);
		//console.log(cs);
		contentFactorMoveValue =( size - cs) / (visibleItems - 1);
		scrollContentSize = parseInt((cs + (contentFactorMoveValue * (totalItems-1))), 10);
		
		var z = 0;
		var p = 0;
		var activeX = 0;
		
		var prop = {};
		var animProp = orientation == 'horizontal' ? 'left' : 'top';
		
		for(i; i< playlistLength; i++) {
				
			item = $(slideArr[i]);
			id = item.attr('id');
			
			if(i < j){//before
				
				newX = p * contentFactorMoveValue;
				//console.log('before ', i, ' ', newX);
				prop[animProp] = newX + 'px';
				
				item.stop().animate(prop,  {duration: transitionTime, easing: transitionEase});
				
				p++;
				
				if(item.attr('id') != j){
					item[0].opened = false;
				}else{
					item[0].opened = true;
				}
				
			}
			else if(i == j)	{//active
				
				activeX = j * contentFactorMoveValue;
				//console.log('active ', i, ' ', newX);
				prop[animProp] = activeX + 'px';
				
				item.stop().animate(prop,  {duration: transitionTime, easing: transitionEase});
				
				if(item.attr('id') != j){
					item[0].opened = false;
				}else{
					item[0].opened = true;
				}
				
			}
			else if(i > j)	{//after
				
				newX = activeX + parseInt(itemToMove.data('customSize'), 10) + z * contentFactorMoveValue;
				//console.log('after ', i, ' ', newX);
				prop[animProp] = newX + 'px';
				
				item.stop().animate(prop,  {duration: transitionTime, easing: transitionEase});
				
				z++;
				
				if(item.attr('id') != j){
					item[0].opened = false;
				}else{
					item[0].opened = true;
				}
				
			}
			
		}
		
		if(!allSlidesVisible && updateContent) updateContentViaScroll(true);
		
		if(hideTitleOnOpen){
			var title=$(titleArr[j]);
			title.stop().animate({'opacity': 0},  {duration: 500, easing: "easeOutQuart", complete: function(){
				if(title) title.css('display', 'none');
			}});
		}
		
		if(captionStartTimeoutID) clearTimeout(captionStartTimeoutID);
		captionStartTimeoutID = setTimeout(function(){checkCaptions(j)},transitionTime-250);
	}
		
	function distributeSpace(tween) {
		
		var item;
		var i = 0;
		var newX;
		
		//on rollout if selection is false, calculate again spacing factor and align wole container as well
		if(openOnRollover && !keepSelection){
			var size = orientation == 'horizontal' ? componentWidth : componentHeight;
			scrollContentSize = parseInt((totalItems * (size / visibleItems)), 10);///unopened size
			//console.log('scrollContentSize = ', scrollContentSize);
			
			if(!allSlidesVisible) updateContentViaScroll2();
		}
		
		var factor = scrollContentSize / totalItems;
		
		var prop = {};
		var animProp = orientation == 'horizontal' ? 'left' : 'top';
		
		for(i; i< playlistLength; i++) {
			item = $(slideArr[i]);
			newX= i * factor;
			prop[animProp] = newX + 'px';
			
			item.stop().animate(prop,  {duration: tween ? transitionTime : 0, easing: transitionEase});
			item[0].opened = false;
		}
		
		counter=-1;//reset
	}
	
	
	function removeCaptions(id){
		//console.log('removeCaptions');
			
		if(captionStartTimeoutID) clearTimeout(captionStartTimeoutID);	
			
		if(!slideArr[id]) return;	
		if( $(slideArr[id]).data('captions') == undefined) return;	
			
		var i = 0;
		var captionArr = $(slideArr[id]).data('captions');
		var len =captionArr.length;
		var caption;
		var xmove;
		
		for(i; i < len;i++){
			
			caption=captionArr[i];
			
			xmove=caption.origLeft+captionMoveValue  + 'px';
				
			$(caption).stop().animate({width: 0, left: xmove}, {
				duration: captionToggleSpeed, 
				easing: "easeOutQuint"
			});
			
		}
		
	}
	
	function checkCaptions(id){
		//console.log('checkCaptions');
		
		if(captionStartTimeoutID) clearTimeout(captionStartTimeoutID);
		
		if(!slideArr[id]) return;	
		if( $(slideArr[id]).data('captions') != undefined){
			
			var i = 0;
			var captionArr = $(slideArr[id]).data('captions');
			var len =captionArr.length;
			//console.log(len);
			var caption;
			var cfw;
			var cof;
			
			for(i; i < len;i++){
				
				caption=captionArr[i];
				
				if(i != len-1){
					
					cfw=caption.finalWidth + 'px';
					cof = caption.origLeft+ 'px';
					
					$(caption).delay(captionOpenDelay * i).animate({width: cfw, left: cof}, {
						duration: captionToggleSpeed, 
						easing: "easeOutQuint"
					});
				
				}else if(i == len -1){
					
					cfw=caption.finalWidth + 'px';
					cof = caption.origLeft+ 'px';
					
					$(caption).delay(captionOpenDelay * i).animate({width: cfw, left: cof }, {
					duration: captionToggleSpeed, 
					easing: "easeOutQuint",
					complete: function(){
						
						if(slideshowOn) checkSlideshow();
						
					}});
					
				}
				
			}
			
		}else{
			
			if(slideshowOn) checkSlideshow();
			
		}
		
	}



	function openVimeo(link){
		if(!componentInited) return;
		
		videoIsOn=true;
		isVimeo=true;
	
		createCloseVideoBtn();
		
		vimeoHolderDiv.css('opacity', 0);
		vimeoHolderDiv.css('display', 'block');
		
		ytHolderDiv.css('zIndex', -10);
		vimeoHolderDiv.css('zIndex', 11);
		
		if(!vimeoInited){
		
			var videoIFramePath = link;
			var vimeoApi = '?api=1';
			var autoplay = '&autoplay=1';
			var videoIFrameSrc = 'http://player.vimeo.com/video/' + videoIFramePath + vimeoApi;
			//var videoIFrameSrc = 'http://player.vimeo.com/video/' + videoIFramePath + vimeoApi + '&player_id=player1';
			
			vimeoVideoIframe = $('<iframe />', {
				frameborder: 0,
				src: videoIFrameSrc,
				width: 100 + '%',
				height: 100 + '%'
			});
			
			vimeoHolderDiv.append(vimeoVideoIframe);
			
			vimeoPlayer = Froogaloop(vimeoVideoIframe[0]);
			vimeoPlayer.addEvent('ready', onVimeoReady);
		
			vimeoInited = true;
		
		}else{
			
			var videoIFramePath = link;
			var vimeoApi = '?api=1';
			var videoIFrameSrc = 'http://player.vimeo.com/video/' + videoIFramePath + vimeoApi;
			vimeoVideoIframe.attr('src', videoIFrameSrc);
	
		}
		
		 //if safari, fade in here
		 if(is_safari && !is_chrome){
			//console.log('is_safari = ', + is_safari);
			vimeoHolderDiv.css('opacity', 1);
			sliderHolder.css('opacity', 0);
		}
		
		//sliderWrapper.append(closeVideoBtn);//above video
		//sliderWrapper.append(closeText);//above video
		vimeoHolderDiv.append(closeVideoBtn);//above video
		vimeoHolderDiv.append(closeText);//above video
		
		if(videoDisablesAllNavigation) hideNavigation();
		
	}
	
	function toggleVimeo(e){
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		//var id = $(currentTarget).attr('id');
		
		if(videoDisablesAllNavigation) hideNavigation();
		
		
		var link = $(slideArr[counter]).data('link'); 
		openVimeo(link);
		
		//console.log('openVimeo, ', link);
		
		return false;
		
	}
	
	function createCloseVideoBtn(){
		
		//close btn
		
		var closeTextUrl = 'sliders/dream-accordion/data/icons/close.png';
		var closeTextWidth=45;
		var closeTextHeight=35;
		
		var closeBtnX;
		if(isVimeo){
			closeBtnX = componentWidth - 110;
		}else{
			closeBtnX = componentWidth - 55;
		}
		var closeBtnY = 10;
			
		closeVideoBtn = $("<div></div>");
		closeVideoBtn.css('position', 'absolute');
		closeVideoBtn.css('width', closeTextWidth + 'px');
		closeVideoBtn.css('height', closeTextHeight + 'px');
		closeVideoBtn.css('left', closeBtnX + 'px');
		closeVideoBtn.css('top', closeBtnY + 'px');
		if(isVimeo){
			closeVideoBtn.attr('class', 'closeVimeoNormal');
		}else{
			closeVideoBtn.attr('class', 'closeYTNormal');
			
			closeVideoBtn.bind('click', clickCloseYTPlayer);
			
		}
		//closeVideoBtn.css('opacity', 0);
		
		
		closeText = $(new Image());
		closeText.css('position', 'absolute');
		closeText.css('width', closeTextWidth + 'px');
		closeText.css('height', closeTextHeight + 'px');
		closeText.css('left', closeBtnX + 'px');
		closeText.css('top', closeBtnY + 'px');
		closeText.css('display', 'block');
		//closeText.css('opacity', 0);
		closeText.css('cursor', 'pointer');
		
		closeText.load(function() {
		}).attr('src', closeTextUrl);
		
		
		closeText.bind('mouseover', overCloseVideoPlayer);
		closeText.bind('mouseout', outCloseVideoPlayer);
		if(isVimeo){
			closeText.bind('click', clickCloseVimeoPlayer);
		}else{
			closeText.bind('click', clickCloseYTPlayer);
		}
		
	}
	
	function onVimeoFinish(data){
		//console.log('onVimeoFinish');
		//if slideshow on && video in slideshow, close player and slide
		
		if(slideshowOn){
			clickCloseVimeoPlayer();
		}
		
	}
	
	 function onVimeoReady(playerID){
		//console.log('onVimeoReady');
		
		vimeoPlayer.addEvent('finish', onVimeoFinish);
		
		//var colorVal = Math.floor(Math.random() * 16777215).toString(16);
		//vimeoPlayer.setColor(colorVal);
		//console.log(vimeoPlayer.getColor());
		
		//show video
		vimeoHolderDiv.animate({opacity: 1 }, {
			duration: 1000, 
			easing: "easeOutSine"
		});
		
		//hide slider
		sliderHolder.animate({opacity: 0 }, {
			duration: 1000, 
			easing: "easeOutSine",
			complete: function(){
				sliderHolder.hide();
				
				//show close btn
				closeVideoBtn.css('opacity', closeVideoBtnOffOpacity);
				closeText.css('opacity', 1);
				
		}});
			
		if(videoAutoplay) vimeoPlayer.api('play');
	}
	
	
	
	function overSlider(e){//show close btn
		//console.log('overSlider');
		componentHit=true;
		if(slideshowOn) pauseSlideshow();
		if(!videoIsOn) return; 
		
		if(isVimeo){
			closeVideoBtn.css('opacity', closeVideoBtnOffOpacity);
		}else{
			closeVideoBtn.css('opacity', 1);
		}
		closeText.css('opacity', 1);
		return false;
	}
	
	function outSlider(e){//hide close btn
		//console.log('outSlider');
		componentHit=false;
		if(!videoIsOn){
			if(slideshowOn){
				resumeSlideshow();
			}
			return; 
		}
		return false;
	}
	
	/*function overSlider2(e){//show close btn
		//console.log('overSlider2');
		componentHit=true;
		if(useScroll) _scroll.animate({opacity: 1 }, {duration: 500,easing: "easeOutSine"});
		return false;
	}
	
	function outSlider2(e){//hide close btn
		//console.log('outSlider2');
		componentHit=false;
		if(useScroll) _scroll.animate({opacity: 0 }, {duration: 500,easing: "easeOutSine"});
		return false;
	}*/
	
	function overCloseVideoPlayer(e){
		if(isVimeo){
			closeVideoBtn.attr('class', 'closeVimeoOver');
		}else{
			closeVideoBtn.attr('class', 'closeYTOver');
		}
		closeVideoBtn.css('opacity', 1);
		return false;
	}
	
	function outCloseVideoPlayer(e){
		if(isVimeo){
			closeVideoBtn.attr('class', 'closeVimeoNormal');
		}else{
			closeVideoBtn.attr('class', 'closeYTNormal');
		}
		closeVideoBtn.css('opacity', closeVideoBtnOffOpacity);
		return false;
	}
	
	function clickCloseVimeoPlayer(){
		
		//clean
		//vimeoPlayer.removeEvent('ready', onVimeoReady);
		//vimeoPlayer.removeEvent('finish', onVimeoFinish);
		
		var offTime = 500;
		
		if(closeText){
			closeText.css('cursor', 'default');
			closeText.unbind('click', clickCloseVimeoPlayer);
			closeText.unbind('mouseover', overCloseVideoPlayer);
			closeText.unbind('mouseout', outCloseVideoPlayer);
		}
		
		//hide close btn
		if(closeVideoBtn) closeVideoBtn.css('opacity', 0);
		if(closeText) closeText.css('opacity', 0);
		
		//hide video
		vimeoHolderDiv.animate({opacity: 0 }, {
			duration: offTime, 
			easing: "easeOutSine"
		});
		
		//show slider
		sliderHolder.css('display', 'block');
		
		sliderHolder.animate({opacity: 1 }, {
			duration: offTime, 
			easing: "easeOutSine",
			complete: function(){
				
				//remove video
				vimeoPlayer.api('unload');
				vimeoVideoIframe.attr('src', '');
				
				vimeoHolderDiv.css('display', 'none');
				
				ytHolderDiv.css('zIndex', -10);
				vimeoHolderDiv.css('zIndex', -11);
				
				if(closeVideoBtn){
					closeVideoBtn.remove();
					closeVideoBtn=null;
				}
				if(closeText){
					closeText.remove();
					closeText=null;
				}
				
				videoIsOn=false;
				
				//check mouse hit component
				if(!componentHit){
					
					if(slideshowOn){
						counter++;
						if(counter>playlistLength - 1) counter=0;//loop
						openSlide(counter, true);
						positionDraggerOnSegment(counter);
						if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
					}else{
						if(!keepSelection && openOnRollover){
							distributeSpace('tween');
						}
					}
					
				}
				
				if(videoDisablesAllNavigation) showNavigation();
				checkControls();
		}});
		
		return false;
		
	}
	
	function checkControls(){
		if(useControls){
			if(slideshowOn){
				controlsToggleSrc.attr('src', controls_pause_url);
			}else{
				controlsToggleSrc.attr('src', controls_play_url);
			}
		}
	}
	
	function forceVimeoEnd(){
		
		if(closeText){
			closeText.css('cursor', 'default');
			closeText.unbind('click', clickCloseVimeoPlayer);
			closeText.unbind('mouseover', overCloseVideoPlayer);
			closeText.unbind('mouseout', outCloseVideoPlayer);
		}
		
		//hide close btn
		if(closeVideoBtn) closeVideoBtn.css('opacity', 0);
		if(closeText) closeText.css('opacity', 0);
		
		//hide video
		vimeoHolderDiv.css('opacity', 0);
		
		//show slider
		sliderHolder.css('display', 'block');
		
		sliderHolder.css('opacity', 1);
		
		//remove video
		vimeoPlayer.api('unload');
		vimeoVideoIframe.attr('src', '');
		
		vimeoHolderDiv.css('display', 'none');
		
		ytHolderDiv.css('zIndex', -10);
		vimeoHolderDiv.css('zIndex', -11);
		
		if(closeVideoBtn){
			closeVideoBtn.remove();
			closeVideoBtn=null;
		}
		if(closeText){
			closeText.remove();
			closeText=null;
		}
		
		videoIsOn=false;
		
		if(videoDisablesAllNavigation) showNavigation();
		checkControls();
		
	}
	
	//***********
	
	
	function onPlayerReady(event) {
		if(ytPlayer && ytAutoplay) ytPlayer.playVideo();
		//console.log('onPlayerReady');
	}
	
	function onPlayerStateChange(event) {
		if(event.data == 1){
			ytPlayerState = 1;
		}
		if(event.data == 0){
			if(slideshowOn){
				clickCloseYTPlayer();
			}
		}
	}
	
	function onPlayerError(event) {}
	
	window.onYouTubePlayerAPIReady = function() {
		ytPlayer = new YT.Player(ytFrameId, {
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange,
				'onError': onPlayerError
			}
		});
	}
		
	function YoutubePlayerStop(){
		if(ytPlayer) {
			ytPlayer.stopVideo();
		}
	}
		
	function YoutubePlayer (frameId, ap, id){
		ytFrameId = frameId;	
		ytAutoplay = ap;
		ytPlayerState = '';
		if(!ytPlayer){	
			var tag = document.createElement('script');
			 tag.src = "http://www.youtube.com/player_api";
			 var firstScriptTag = document.getElementsByTagName('script')[0];
			 //console.log(tag,  firstScriptTag, firstScriptTag.parentNode);
			 firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}else{
			if(ytAutoplay){
				ytPlayer.loadVideoById(id);
			}else{
				ytPlayer.cueVideoById(id);
			}
		}
	};

	//******
	
	
	
	
	function toggleYoutube(e){
		if(!componentInited) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		//var id = $(currentTarget).attr('id');
		
		if(videoDisablesAllNavigation) hideNavigation();
		
		var link = $(slideArr[counter]).data('link'); 
		openYoutube(link);
		
		return false;
		
	}
		
	function openYoutube(link){	
		//console.log('openYoutube ', link);
		
		videoIsOn=true;
		isVimeo=false;
		ytStarted = false;
		
		var videoid = $(slideArr[counter]).data('link'); 
			
		createCloseVideoBtn();
		
		ytHolderDiv.append(closeVideoBtn);
		ytHolderDiv.append(closeText);
		
		
		if(!isOfline){
			
			if(!ytInited){
				var youtubeApi = '?enablejsapi=1';
				var zindexfix='&amp;wmode=transparent';
				var videoIFrameSrc = 'http://www.youtube.com/embed/' + videoid + youtubeApi + zindexfix;
				
				var frameid= 'ytplayer';
				
				youtubeVideoIframe = $('<iframe />', {
					frameborder: 0,
					src: videoIFrameSrc,
					width: 100 + '%',
					height: 100 + '%',
					id: frameid
				});
				
				 ytHolderDiv.append(youtubeVideoIframe);
				 YoutubePlayer(frameid,videoAutoplay, videoid);
				 ytInited =true;	
				 
			}else{
				 YoutubePlayer(frameid,videoAutoplay, videoid);
			}
			
			if(ytStartIntervalID) clearInterval(ytStartIntervalID);
			if(!openYoutubeOnBuffering){
				 if(is_safari && !is_chrome){
					 showYTVideo();
				 }else if(!is_safari && is_chrome){
					 showYTVideo();
				 }else{
					 ytStartIntervalID = setInterval(checkYtStarted, ytStartInterval);
				 }
			}else{
				showYTVideo();
			}
			
		}else if(isOfline){
			
			var iframe = '<iframe id="yt_player1" class="youtube-player" type="text/html" width="100%" height="100%" src="http://www.youtube.com/embed/'+videoid+'?wmode=transparent" frameborder="0"></iframe>';
			
			ytHolderDiv.append(iframe);
			showYTVideo();
		}
		
		if(videoDisablesAllNavigation) hideNavigation();
	}
	
	function checkYtStarted(){
		if(ytPlayerState == 1){
			if(ytStartIntervalID) clearInterval(ytStartIntervalID);
			showYTVideo();
		}
	}
	
	function showYTVideo(){
		if(ytStartIntervalID) clearInterval(ytStartIntervalID);
		//console.log('showYTVideo');
		
		if(ytStarted) return;
		
		ytHolderDiv.css('opacity', 1);
		
		ytHolderDiv.css('zIndex', 11);
		vimeoHolderDiv.css('zIndex', -10);
		
		sliderHolder.animate({opacity: 0 }, {
			duration: 500, 
			easing: "easeOutSine",
			complete: function(){
				sliderHolder.hide();
				
				//show close btn
				closeVideoBtn.css('opacity', closeVideoBtnOffOpacity);
				closeText.css('opacity', 1);
				
		}});
		
		ytStarted = true;
		
	}
	
	function clickCloseYTPlayer(){
		//console.log('clickCloseYTPlayer')
		
		if(ytStartIntervalID) clearInterval(ytStartIntervalID);
		
		var offTime = 500;
		
		//clean
		if(closeText){
			closeText.css('cursor', 'default');
			closeText.unbind('click', clickCloseYTPlayer);
			closeText.unbind('mouseover', overCloseVideoPlayer);
			closeText.unbind('mouseout', outCloseVideoPlayer);
		}
		
		if(isOfline){
			ytHolderDiv.empty();
		}else{
			YoutubePlayerStop();	
		}
		
		//show slider
		sliderHolder.css('display', 'block');
		
		sliderHolder.animate({opacity: 1 }, {
			duration: offTime, 
			easing: "easeOutSine",
			complete: function(){
				
				ytHolderDiv.css('opacity', 0);
				
				ytHolderDiv.css('zIndex', -11);
				vimeoHolderDiv.css('zIndex', -10);
				
				if(closeVideoBtn){
					closeVideoBtn.remove();
					closeVideoBtn=null;
				}
				if(closeText){
					closeText.remove();
					closeText=null;
				}
				
				videoIsOn=false;
				
				//check mouse hit component
				if(!componentHit){
					
					if(slideshowOn){
						hidePreviousSlideData(counter);
						counter++;
						if(counter>playlistLength - 1) counter=0;//loop
						openSlide(counter, true);
						positionDraggerOnSegment(counter);
						if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
					}else{
						if(!keepSelection && openOnRollover){
							distributeSpace('tween');
						}
					}
					
				}
				
				if(videoDisablesAllNavigation) showNavigation();
				checkControls();
				
		}});
		
		return false;
		
	}
	
	function forceYoutubeEnd(){
		
		if(ytStartIntervalID) clearInterval(ytStartIntervalID);
		
		//clean
		if(closeText){
			closeText.css('cursor', 'default');
			closeText.unbind('click', clickCloseYTPlayer);
			closeText.unbind('mouseover', overCloseVideoPlayer);
			closeText.unbind('mouseout', outCloseVideoPlayer);
		}
		
		if(isOfline){
			ytHolderDiv.empty();
		}else{
			YoutubePlayerStop();	
		}
		
		//show slider
		sliderHolder.css('display', 'block');
		
		sliderHolder.css('opacity', 1);
		
		ytHolderDiv.css('opacity', 0);
		
		ytHolderDiv.css('zIndex', -11);
		vimeoHolderDiv.css('zIndex', -10);
		
		if(closeVideoBtn){
			closeVideoBtn.remove();
			closeVideoBtn=null;
		}
		if(closeText){
			closeText.remove();
			closeText=null;
		}
		
		videoIsOn=false;
		
		if(videoDisablesAllNavigation) showNavigation();
		checkControls();
		
	}
	
	
	
	
	//*********** CONTROLS
	
	function hideNavigation(){
		navigationActive=false;
		if(useControls){
			controls.animate({opacity: 0 }, {duration: 500, easing: "easeOutSine", complete: function(){
				controls.css('display', 'none');
			}});
		}
		if(useScroll){
			_scroll.animate({opacity: 0 }, {duration: 500, easing: "easeOutSine", complete: function(){
				_scroll.css('display', 'none');
			}});
		}
	}
	
	function showNavigation(){
		if(useControls){
			controls.css('display', 'block');	
			controls.animate({opacity: 1 }, {duration: 500, easing: "easeOutSine"});
		} 
		if(useScroll){
			_scroll.css('display', 'block');
			_scroll.animate({opacity: 1 }, {duration: 500, easing: "easeOutSine"});
		}
		navigationActive=true;
	}
	
	
	function clickControls(e){
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		if(!componentInited || !navigationActive) return;
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('class');
		
		if(id == 'controls_prev'){
			previousSlide(true);
		}
		else if(id == 'controls_toggle'){
			if(slideshowOn){
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				slideshowOn=false;
				if(useControls)controlsToggleSrc.attr('src', controls_play_url);
			}else{
				slideshowOn=true;
				if(useControls)controlsToggleSrc.attr('src', controls_pause_url);
				if(!videoIsOn){
					if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
					slideshowTimeoutID = setTimeout(nextSlide, getSlideshowDelay());
				}
			}
		}
		else if(id == 'controls_next'){
			nextSlide(true);
		}
		
	}
	
	
	
	
	
	function checkSlideshow(){
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(includeVideoInSlideshow && $(slideArr[counter]).data('action') == 'vimeo'){
			//open video
			var link = $(slideArr[counter]).data('link'); 
			openVimeo(link);
			
		}else if(includeVideoInSlideshow && $(slideArr[counter]).data('action') == 'youtube'){
			
			//open video
			var link =$(slideArr[counter]).data('link'); 
			openYoutube(link);
			
		}else{
			if(slideshowOn && !componentHit){
				slideshowTimeoutID = setTimeout(nextSlide, getSlideshowDelay());
			}
		}
	}
	
	//find new delay for slide
	function getSlideshowDelay(){
		var nextDelay;
		var reserve= 3000;
		if(useGlobalDelay){
			//console.log('useGlobalDelay');
			nextDelay = slideshowTimeout > 0 ? slideshowTimeout : reserve;
		}else{
			var slide = $(slideArr[counter]);
			if(slide.attr('data-delay') != undefined){
				nextDelay = slide.attr('data-delay');
				//console.log('nextDelay = ', nextDelay);
			}else{
				nextDelay = slideshowTimeout > 0 ? slideshowTimeout : reserve;
			}
		}
		return nextDelay;
	}
	
	function pauseSlideshow(){
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(useControls)controlsToggleSrc.attr('src', controls_play_url);
	}
	
	function resumeSlideshow(){
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		slideshowTimeoutID = setTimeout(nextSlide, getSlideshowDelay());
		if(useControls)controlsToggleSrc.attr('src', controls_pause_url);
	}
	
	function nextSlide(forceVideoEnd){
		//console.log("nextSlide");
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(forceVideoEnd && videoIsOn){
			if(isVimeo){
				forceVimeoEnd();
			}else{
				forceYoutubeEnd();
			}
		}
		
		hidePreviousSlideData(counter);
		counter++;
		if(counter>playlistLength - 1) counter=0;//loop
		openSlide(counter, true);
		positionDraggerOnSegment(counter);
		if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
		
	}
	
	function previousSlide(forceVideoEnd){
		//console.log("nextSlide");
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(forceVideoEnd && videoIsOn){
			if(isVimeo){
				forceVimeoEnd();
			}else{
				forceYoutubeEnd();
			}
		}
		
		hidePreviousSlideData(counter);
		counter--;
		if(counter<0) counter=playlistLength - 1;//loop
		openSlide(counter, true);
		positionDraggerOnSegment(counter);
		if(!openOnRollover && $(slideArr[counter]).data('action') != undefined) checkSlideAction(counter);
		
	}
	

	// ********** navigation  ********************* //


	function toggleScroll(on){
		var time=500;
		var ease='easeOutSine';
		if(on){
			dragger.css('opacity', 0);
			track.css('opacity', 0);
			dragger.css('display', 'block');
			track.css('display', 'block');
			_scroll.stop().animate({opacity: 1}, {duration: time, easing: ease});
		}else{
			_scroll.stop().animate({opacity: 0}, {duration: time, easing: ease, complete: function(){
				_scroll.css('display', 'none');
			}});
		}
	}
	
	function toggleControls(on){
		var time=500;
		var ease='easeOutSine';
		if(on){
			controls.css('opacity', 0);
			controls.css('display', 'block');
			controls.stop().animate({opacity: 1}, {duration: time, easing: ease});
		}else{
			controls.stop().animate({opacity: 0}, {duration: time, easing: ease, complete: function(){
				controls.css('display', 'none');
			}});
		}
	}






	// ********** HELPER FUNCTIONS ********************* //

	function navigateToUrl(e){
			if(!componentInited) return;
			
			if (!e) var e = window.event;
			if(e.cancelBubble) e.cancelBubble = true;
			else if (e.stopPropagation) e.stopPropagation();
			
			var currentTarget = e.currentTarget;
			var id = $(currentTarget).attr('id');
			var link = $(slideArr[id]).data('link');
			//console.log('link = ', link);
			if(!link) return;
			
			var target=$(slideArr[id]).data('linkTarget');
			if(!target) target="_blank";
			//console.log(target);
			
			if(target=='_parent'){
				window.location=link;
			}else if(target=='_blank'){
				var newWindow=window.open(link, target);
				if (window.focus) {newWindow.focus();}
			}
			return false;
		}
	
	function isEmpty(str) {
	    return str.replace(/^\s+|\s+$/g, '').length == 0;
	}
	
	// Grayscale w canvas method
	function grayscale(imgObj){        
	
		var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext('2d');
        
        var imgW = imgObj.width;
        var imgH = imgObj.height;
        canvas.width = imgW;
        canvas.height = imgH;
        
        canvasContext.drawImage(imgObj, 0, 0);
        var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
        
        for(var y = 0; y < imgPixels.height; y++){
            for(var x = 0; x < imgPixels.width; x++){
                var i = (y * 4) * imgPixels.width + x * 4;
                var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg; 
                imgPixels.data[i + 1] = avg; 
                imgPixels.data[i + 2] = avg;
            }
        }
        
        canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        return canvas.toDataURL();
    }
	
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
	
	function setArgb(val) {
      var valArr = val.split("(")[1].split(")")[0].split(","),
          red = toHex(valArr[0]),
          green = toHex(valArr[1]),
          blue = toHex(valArr[2]),
          alpha = toHex(valArr[3]*255);
		  return "#" + alpha + red + green + blue;
    };
	
    function toHex(val) {
      val = parseInt(val);
      val = Math.max(0,val);
      val = Math.min(val,255);
      val = Math.round(val);
      return "0123456789ABCDEF".charAt((val-val%16)/16) + "0123456789ABCDEF".charAt(val%16);
    };
	
	//returns a random value between min and max
	function randomMinMax(min, max){
		return Math.random() * (max - min) + min;
	}
	
	function shuffleArray(arr) {
		var i = 0;
		var len = arr.length;
		var temp;
		var randomNum;
		for (i; i < len; i++) {
			 temp = arr[i];
			 // generate a random number between (inclusive) 0 and the length of the array to shuffle
			 randomNum = Math.round(Math.random() * (len-1));
			 // the switch
			 arr[i] = arr[randomNum];
			 arr[randomNum] = temp;
		}
	}
	
	}
	
})(jQuery);



