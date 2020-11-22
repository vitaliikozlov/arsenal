/* dCodes Framework */

(function($) {

	function ThumbGallery(element, options) {
		
		
		
		
		var self=this;
		
		$("a[data-rel^='prettyPhoto']").prettyPhoto({theme:'pp_default',social_tools: false,show_title: false,
												deeplinking: false, 
												callback: function(){detailClosed();}/* Called when prettyPhoto is closed */});
												
		this.settings = $.extend({}, $.fn.thumbGallery.defaults, options);
		
		this.isMobile = jQuery.browser.mobile;
		//console.log(this.isMobile);
		
		this._componentInited=false;
		this._body = $('body');
		this._window = $(window);
		this._doc = $(document);
		this._windowResizeTimeout = 150;//execute resize delay
		this._windowResizeTimeoutID;
		this._thumbScrollIntervalID;
		this._thumbHolderArr=[];
		this.autoPlay=this.settings.autoPlay;
		this._thumbOrientation = this.settings.thumbOrientation;
		this.buttonSpacing = this.settings.buttonSpacing;
		
		this._thumbsScrollValue=Math.abs(this.settings.thumbsScrollValue);
		this._layoutType = this.settings.layoutType;
		this._moveType = this.settings.moveType;
		
		this.thumbTransitionOn=false;
		
		this.thumbContainerWidth;
		this.thumbContainerHeight;
		this.thumbContainerLeft;
		this.thumbContainerTop;
		this.thumbInnerContainerSize=0;
		this.containerHeightAddOn = this.settings.containerHeightAddOn;
		this.containerWidthAddOn = this.settings.containerWidthAddOn;
		
		this.horizontalSpacing = this.settings.horizontalSpacing;
		this.verticalSpacing = this.settings.verticalSpacing;
		this.gridArr=[];
		this.rows;
		this.columns;
		this.allColumns; 
		this.allRows;
		//mouse wheel
		this.columnCounter=0;
		this.rowCounter=0;
		this.lastWheelCounter=0;
		this.scrollPaneApi;
		this.scrollOffset = this.settings.scrollOffset;
		this.tempScrollOffset;
		this.innerSlideshowDelay = this.settings.innerSlideshowDelay;
		this.innerSlideshowExist=false;
		this.slideShowData=[];
		//console.log(this.innerSlideshowDelay);
		
		this.maxWidth = this.settings.maxWidth;
		this.maxHeight = this.settings.maxHeight;

		this.componentWrapper = $(element);
		
		this.thumbContainer=this.componentWrapper.find('.thumbContainer');
		this.thumbBackward = this.componentWrapper.find('.thumbBackward');
		this.thumbForward = this.componentWrapper.find('.thumbForward');
		this.thumbBackward.css('cursor','pointer');
		this.thumbForward.css('cursor','pointer');
		this.thumbBackward.css('display','none');
		this.thumbForward.css('display','none');
		this._thumbForwardSrc=this.thumbForward.children('img');
		this._thumbBackwardSrc=this.thumbBackward.children('img');
		this.thumbInnerContainer = this.componentWrapper.find('.thumbInnerContainer');
		this.componentPlaylist = this.componentWrapper.find('.componentPlaylist');
		
		if(this._moveType != 'scroll'){
		
			//buttons hover
			this.thumbForward.bind('mouseover', function(){
				self._thumbForwardSrc.attr('src', self._thumbOrientation == 'horizontal' ? 'data/icons/thumb_forward_on.png' : 'data/icons/thumb_forward_v_on.png');
				return false;
			});
			this.thumbBackward.bind('mouseover', function(){
				self._thumbBackwardSrc.attr('src', self._thumbOrientation == 'horizontal' ? 'data/icons/thumb_backward_on.png' : 'data/icons/thumb_backward_v_on.png');
				return false;
			});
			this.thumbForward.bind('mouseout', function(){
				self._thumbForwardSrc.attr('src', self._thumbOrientation == 'horizontal' ? 'data/icons/thumb_forward.png' : 'data/icons/thumb_forward_v.png');
				return false;
			});
			this.thumbBackward.bind('mouseout', function(){
				self._thumbBackwardSrc.attr('src', self._thumbOrientation == 'horizontal' ? 'data/icons/thumb_backward.png' : 'data/icons/thumb_backward_v.png');
				return false;
			});
			
			//buttons click
			if(this._layoutType == 'grid'){
				
				this.thumbBackward.bind('click touchstart MozTouchDown', function(){
					if(self.thumbTransitionOn) return;
					self.thumbTransitionOn=true;
					var value;
					if(self._thumbOrientation == 'horizontal'){
						value = parseInt(self.thumbInnerContainer.css('left'),10);
						value += self.thumbContainerWidth+self.verticalSpacing;
						if(value>0)value=0;
						
						var num = Math.ceil(self.thumbContainerWidth / (self.boxWidth+self.verticalSpacing));
						self.lastWheelCounter += num;
						
						self.thumbInnerContainer.stop().animate({ 'left': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}else{
						value = parseInt(self.thumbInnerContainer.css('top'),10);
						value += self.thumbContainerHeight+self.horizontalSpacing;
						if(value>0)value=0;
						
						var num = Math.ceil(self.thumbContainerHeight / (self.boxHeight+self.horizontalSpacing));
						self.lastWheelCounter += num;
						
						self.thumbInnerContainer.stop().animate({ 'top': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}
					return false;
				});
				this.thumbForward.bind('click touchstart MozTouchDown', function(){
					if(self.thumbTransitionOn) return;
					self.thumbTransitionOn=true;
					var value;
					if(self._thumbOrientation == 'horizontal'){
						value = parseInt(self.thumbInnerContainer.css('left'),10);
						value -= self.thumbContainerWidth+self.verticalSpacing;
						if(value < - self.thumbInnerContainerSize + self.thumbContainerWidth) value = - self.thumbInnerContainerSize + self.thumbContainerWidth;
						
						var num = Math.ceil(self.thumbContainerWidth / (self.boxWidth+self.verticalSpacing));
						self.lastWheelCounter -= num;
						
						self.thumbInnerContainer.stop().animate({ 'left': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}else{
						value = parseInt(self.thumbInnerContainer.css('top'),10);
						value -= self.thumbContainerHeight+self.horizontalSpacing;
						if(value < - self.thumbInnerContainerSize + self.thumbContainerHeight) value = - self.thumbInnerContainerSize + self.thumbContainerHeight;
						
						var num = Math.ceil(self.thumbContainerHeight / (self.boxHeight+self.horizontalSpacing));
						self.lastWheelCounter -= num;
						
						self.thumbInnerContainer.stop().animate({ 'top': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}
					return false;
				});
				
				$(".thumbContainer").swipe( {
					//Generic swipe handler for all directions
					swipe:function(event, direction, distance, duration, fingerCount) {
						if(direction=='right' || direction=='up')
						{
							if(self.thumbTransitionOn) return;
					self.thumbTransitionOn=true;
					var value;
					if(self._thumbOrientation == 'horizontal'){
						value = parseInt(self.thumbInnerContainer.css('left'),10);
						value += self.thumbContainerWidth+self.verticalSpacing;
						if(value>0)value=0;
						
						var num = Math.ceil(self.thumbContainerWidth / (self.boxWidth+self.verticalSpacing));
						self.lastWheelCounter += num;
						
						self.thumbInnerContainer.stop().animate({ 'left': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}else{
						value = parseInt(self.thumbInnerContainer.css('top'),10);
						value += self.thumbContainerHeight+self.horizontalSpacing;
						if(value>0)value=0;
						
						var num = Math.ceil(self.thumbContainerHeight / (self.boxHeight+self.horizontalSpacing));
						self.lastWheelCounter += num;
						
						self.thumbInnerContainer.stop().animate({ 'top': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}
					return false;
						}
						if(direction=='left' || direction=='down')
						{
							
					if(self.thumbTransitionOn) return;
					self.thumbTransitionOn=true;
					var value;
					if(self._thumbOrientation == 'horizontal'){
						value = parseInt(self.thumbInnerContainer.css('left'),10);
						value -= self.thumbContainerWidth+self.verticalSpacing;
						if(value < - self.thumbInnerContainerSize + self.thumbContainerWidth) value = - self.thumbInnerContainerSize + self.thumbContainerWidth;
						
						var num = Math.ceil(self.thumbContainerWidth / (self.boxWidth+self.verticalSpacing));
						self.lastWheelCounter -= num;
						
						self.thumbInnerContainer.stop().animate({ 'left': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}else{
						value = parseInt(self.thumbInnerContainer.css('top'),10);
						value -= self.thumbContainerHeight+self.horizontalSpacing;
						if(value < - self.thumbInnerContainerSize + self.thumbContainerHeight) value = - self.thumbInnerContainerSize + self.thumbContainerHeight;
						
						var num = Math.ceil(self.thumbContainerHeight / (self.boxHeight+self.horizontalSpacing));
						self.lastWheelCounter -= num;
						
						self.thumbInnerContainer.stop().animate({ 'top': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}
					return false;
				
						}	
					},
					//Default is 75px, set to 0 for demo so any distance triggers swipe
					threshold:50
				});
				
			}else{//line
				
				this.thumbBackward.bind('mousedown touchstart MozTouchDown', function(){
					if(self._thumbScrollIntervalID) clearInterval(self._thumbScrollIntervalID);
					self._thumbScrollIntervalID = setInterval(function() { self._scrollThumbsBack(); }, 100);
					return false;
				});
				this.thumbBackward.bind('mouseup touchend MozTouchUp', function(){
					if(self._thumbScrollIntervalID) clearInterval(self._thumbScrollIntervalID);
					return false;
				});
				this.thumbForward.bind('mousedown touchstart MozTouchDown', function(){
					if(self._thumbScrollIntervalID) clearInterval(self._thumbScrollIntervalID);
					self._thumbScrollIntervalID = setInterval(function() { self._scrollThumbsForward(); }, 100);
					return false;
				});
				this.thumbForward.bind('mouseup touchend MozTouchUp', function(){
					if(self._thumbScrollIntervalID) clearInterval(self._thumbScrollIntervalID);
					return false;
				});
			}
		
			this.thumbContainer.bind('mousewheel', function(event, delta, deltaX, deltaY){//mouse wheel
				if(!self._componentInited) return;
				self.thumbTransitionOn=true;
				var d = delta > 0 ? 1 : -1, value;//normalize
				//console.log(d);
				if(self._layoutType == 'grid'){
					if(self._thumbOrientation =='horizontal'){
						if(self.thumbInnerContainerSize == self.thumbContainerWidth)return;//if same size
						if(self.columnCounter != self.lastWheelCounter)self.columnCounter = self.lastWheelCounter;//restore last columnCounter if buttons were used meanwhile
						self.columnCounter += d;
						if(self.columnCounter>0)self.columnCounter=0;
						else if(self.columnCounter < - self.allColumns + self.columns) self.columnCounter = - self.allColumns + self.columns;
						self.lastWheelCounter = self.columnCounter;//remember lastWheelCounter
						value = self.columnCounter * (self.boxWidth+self.verticalSpacing);
						self.thumbInnerContainer.stop().animate({ 'left': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}else{
						if(self.thumbInnerContainerSize == self.thumbContainerHeight)return;//if same size
						if(self.columnCounter != self.lastWheelCounter)self.rowCounter = self.lastWheelCounter;//restore last rowCounter if buttons were used meanwhile
						self.rowCounter += d;
						if(self.rowCounter>0)self.rowCounter=0;
						else if(self.rowCounter < - self.allRows + self.rows) self.rowCounter = - self.allRows + self.rows;
						self.lastWheelCounter = self.rowCounter;//remember lastWheelCounter
						value = self.rowCounter * (self.boxHeight+self.horizontalSpacing);
						self.thumbInnerContainer.stop().animate({ 'top': value+'px'},  {duration: 700, easing: 'easeOutQuart', complete: function(){
							self.thumbTransitionOn=false;
						}});
					}
				}else{//line
					if(self._thumbOrientation =='horizontal'){
						if(self.thumbInnerContainerSize < self._getComponentSize('w')) return;//if centered
						value = parseInt(self.thumbInnerContainer.css('left'),10);
						value+=self._thumbsScrollValue*d;
						if(value > 0 + self._thumbBackwardSize){
							value=0 + self._thumbBackwardSize;	
						}else if(value < self._getComponentSize('w')- self.thumbInnerContainerSize - self._thumbForwardSize){
							value=self._getComponentSize('w')- self.thumbInnerContainerSize - self._thumbForwardSize;	
						}
						self.thumbInnerContainer.css('left', value+'px');
					}else{
						if(self.thumbInnerContainerSize < self._getComponentSize('h')) return;//if centered
						value = parseInt(self.thumbInnerContainer.css('top'),10);
						value+=self._thumbsScrollValue*d;
						if(value > 0 + self._thumbBackwardSize){
							value=0 + self._thumbBackwardSize;	
						}else if(value < self._getComponentSize('h')- self.thumbInnerContainerSize - self._thumbForwardSize ){
							value=self._getComponentSize('h')- self.thumbInnerContainerSize - self._thumbForwardSize;	
						}
						self.thumbInnerContainer.css('top', value+'px');
					}
				}
				return false;
			});
			
			//remove last margin, get buttons size
			if(this._thumbOrientation == 'horizontal'){
				this._thumbBackwardSize = parseInt(this.thumbBackward.css('width'),10);
				this._thumbForwardSize = parseInt(this.thumbForward.css('width'),10);
			}else{
				this._thumbBackwardSize = parseInt(this.thumbBackward.css('height'),10);
				this._thumbForwardSize = parseInt(this.thumbForward.css('height'),10);
			}
		}
		
		//resize	
		if(!this._componentFixedSize) this._window.bind('resize', function(){
			if(!self._componentInited) return false;
			if(self._windowResizeTimeoutID) clearTimeout(self._windowResizeTimeoutID);
			self._windowResizeTimeoutID = setTimeout(function() { self._doneResizing(); }, self._windowResizeTimeout);
			return false;
		});
		
		this.boxWidth;
		this.boxHeight;
		var sizeSet = false;
		
		//get playlist
		var i =0, div, innerDiv;
		this.thumbInnerContainer.children("div[class=thumbHolder]").each(function() {           
			div = $(this).attr('data-id-i', i);
			div = $(this).attr('data-id-j', 0);
			self._thumbHolderArr.push(div);
			
			if(!sizeSet){//we need size for title
				self.boxWidth=self._thumbHolderArr[0].width();
				self.boxHeight=self._thumbHolderArr[0].height();
				sizeSet=true;
			}
			
			//search for inner slides
			if(div.find("div[class='innerThumbHolder']").length>0){
				self.innerSlideshowExist=true;
				//console.log(i, self.innerSlideshowExist);
				var arr=[], j=0;
				div.find("div[class='innerThumbHolder']").each(function() { 
					 innerDiv=$(this);
					 innerDiv.attr('data-id-i', i);
					 innerDiv.attr('data-id-j', j);
				     arr.push(innerDiv); 
					 
					 //search for title
					 if(innerDiv.attr('data-title') != undefined && !self._isEmpty(innerDiv.attr('data-title'))){
						self.createTitle(innerDiv);
					 }
					 
					 //hover events
					 innerDiv.bind('mouseover', function(e){
						if(!self._componentInited) return false;
						if (!e) var e = window.event;
						if(e.cancelBubble) e.cancelBubble = true;
						else if (e.stopPropagation) e.stopPropagation();
						var currentTarget = $(e.currentTarget);
						overThumb(parseInt(currentTarget.attr('data-id-i'),10),parseInt(currentTarget.attr('data-id-j'),10));
						var caption=currentTarget.data('caption');
						if(!caption) return;
						var newy=self.boxHeight - parseInt(caption.data('finalHeight'),10) + 1;
						caption.stop().animate({top: newy+'px'}, {duration: 500, easing: 'easeOutQuint'});
						return false;	 
					 });
					 innerDiv.bind('mouseout', function(e){
						if(!self._componentInited) return false;
						if (!e) var e = window.event;
						if(e.cancelBubble) e.cancelBubble = true;
						else if (e.stopPropagation) e.stopPropagation();
						var currentTarget = $(e.currentTarget);
						outThumb(parseInt(currentTarget.attr('data-id-i'),10),parseInt(currentTarget.attr('data-id-j'),10));
						var caption=currentTarget.data('caption');
						if(!caption) return;
						caption.stop().animate({top: self.boxHeight+'px'}, {duration: 500, easing: 'easeOutQuint'});
						return false;	 	 
					 });
					 
					 //search for pretty photo
					if(innerDiv.find('.pp_content').length>0){//pretty photo content
						//attach click to detect pp open
						innerDiv.bind('click,touchstart,MozTouchDown', function(){
							detailActivated();
							return false;
						});
					}
					  
					 if(j>0){
						//hide all except first one 
						innerDiv.css({
							display: 'none',
							opacity: 0
						}); 
					 }
					 j++;
				});
				div.data({'slideArr': arr, 'position':i, 'counter': 0});//set data
				self.slideShowData[i] = self.createSlideshow(div);//save slideshows
				
			}else{
				//search for title
				if(div.attr('data-title') != undefined && !self._isEmpty(div.attr('data-title'))){
					self.createTitle(div);
				}	
				
				//hover events
				div.bind('mouseover', function(e){
					if(!self._componentInited) return false;
					if (!e) var e = window.event;
					if(e.cancelBubble) e.cancelBubble = true;
					else if (e.stopPropagation) e.stopPropagation();
					var currentTarget = $(e.currentTarget);
					overThumb(parseInt(currentTarget.attr('data-id-i'),10),parseInt(currentTarget.attr('data-id-j'),10));
					var caption=currentTarget.data('caption');
					if(!caption) return;
					var newy=self.boxHeight - parseInt(caption.data('finalHeight'),10) + 1;
					caption.stop().animate({top: newy+'px'}, {duration: 500, easing: 'easeOutQuint'});
					return false;	 
				});
			    div.bind('mouseout', function(e){
					if(!self._componentInited) return false;
					if (!e) var e = window.event;
					if(e.cancelBubble) e.cancelBubble = true;
					else if (e.stopPropagation) e.stopPropagation();
					var currentTarget = $(e.currentTarget);
					outThumb(parseInt(currentTarget.attr('data-id-i'),10),parseInt(currentTarget.attr('data-id-j'),10));
					var caption=currentTarget.data('caption');
					if(!caption) return;
					caption.stop().animate({top: self.boxHeight+'px'}, {duration: 500, easing: 'easeOutQuint'});
					return false;	 	 
				});
				
				//search for pretty photo
				if(div.find('.pp_content').length>0){//pretty photo content
					//attach click to detect pp open
					div.bind('click,touchstart,MozTouchDown', function(){
						detailActivated();
						return false;
					});
				}
				
			}
			
			i++;
			
		});
		
		//console.log(this.slideShowData.length);
		
		this._playlistLength = this._thumbHolderArr.length;

		if(this._layoutType == 'line'){
			if(this._thumbOrientation == 'horizontal'){
				this._thumbHolderArr[this._playlistLength-1].css('marginRight',0+'px');//remove last margin
				if(this._moveType != 'scroll')this.thumbInnerContainer.css('left', this._thumbBackwardSize+'px');//position thumbInnerContainer after backward button
			}else{
				this._thumbHolderArr[this._playlistLength-1].css('marginBottom',0+'px');//remove last margin
				if(this._moveType != 'scroll')this.thumbInnerContainer.css('top', this._thumbBackwardSize+'px');//position thumbInnerContainer after backward button
			}
			//get thumbInnerContainerSize
			i=0;//reset
			for(i;i<this._playlistLength;i++){
				if(this._thumbOrientation == 'horizontal'){
					this.thumbInnerContainerSize += this._thumbHolderArr[i].outerWidth(true);
				}else{
					this.thumbInnerContainerSize += this._thumbHolderArr[i].outerHeight(true);	
				}
			}
			//set thumbInnerContainerSize (only once on beginning since it doesnt change in 'line')
			if(this._thumbOrientation == 'horizontal'){
				this.thumbInnerContainerSize+=this.containerWidthAddOn;
				this.thumbInnerContainer.css('width', this.thumbInnerContainerSize+'px');
			}else{
				this.thumbInnerContainerSize+=this.containerHeightAddOn;
				this.thumbInnerContainer.css('height', this.thumbInnerContainerSize+'px');
			}
		}
		
		this.thumbInnerContainer.css('display', 'block');
		
		//init all
		this._doneResizing();
			
		this._componentInited = true;
		thumbGallerySetupDone();
		
		$('.thumb_hidden').stop().animate({ 'opacity': 1},  {duration: 1000, easing: 'easeOutSine'});//show thumbnails
		
		if(this.innerSlideshowExist && this.settings.innerSlideshowOn) this.toggleInnerslideShow(true);
		
		
	} /* ThumbGallery Constructor End */
	/* -------------------------------------ThumbGallery Prototype------------------------------------------------------*/
	ThumbGallery.prototype = {
			 
			// PUBLIC 
			
			/* INNER SLIDESHOWS */
			/* start/stop all inner slideshows */
			toggleInnerslideShow:function(on) {
				/*to do: find start and end of visible thumbs (scroll, wheel, buttons, with 1 second timeout)*/
				if(!this._componentInited || !this.innerSlideshowExist) return;
				for(var i = 0; i< this.slideShowData.length;i++){
					if(this.slideShowData[i] != undefined) {
						//console.log(i, this.slideShowData[i]);
						if(on){
							this.slideShowData[i].start();
						}else{
							this.slideShowData[i].stop();
						}
					}
				}
			}, 
			/* start/stop specific inner slideshow */
			toggleInnerslideShowNum:function(i, on) {
				if(!this._componentInited || !this.innerSlideshowExist) return;
				if(this.slideShowData[i] != undefined) {
					if(on){
						this.slideShowData[i].start();
					}else{
						this.slideShowData[i].stop();
					}
				}
			}, 
			/* THUMBHOLDERS */
			getThumbHolder:function(num) {
				if(!this._componentInited) return;
				if(this._thumbHolderArr[num] != undefined){
					return this._thumbHolderArr[num];
				}
			},
			
			//PRIVATE
				
			createTitle:function(div) {
				
				var captionHtml,captionDiv,captionHeight,leftCaptionPadding,rightCaptionPadding,topCaptionPadding,bottomCaptionPadding;  
				 
				captionHtml=div.attr('data-title');
				
				captionDiv = $("<div/>").html(captionHtml).addClass('title');
				captionDiv.appendTo(this.componentWrapper);
				
				leftCaptionPadding =parseInt(captionDiv.css('paddingLeft'),10);
				rightCaptionPadding =parseInt(captionDiv.css('paddingRight'),10);
				topCaptionPadding =parseInt(captionDiv.css('paddingTop'),10);
				bottomCaptionPadding =parseInt(captionDiv.css('paddingBottom'),10); 
				//console.log(leftCaptionPadding, rightCaptionPadding, topCaptionPadding, bottomCaptionPadding);
				
				captionDiv.css('top',this.boxHeight+'px');
				captionDiv.css('width',this.boxWidth - leftCaptionPadding - rightCaptionPadding+'px');
				
				captionHeight = captionDiv.height() + 1;
				captionDiv.data('finalHeight',topCaptionPadding+bottomCaptionPadding+captionHeight);
				
				//captionDiv.css('zIndex',5);
				
				captionDiv.appendTo(div);
				div.data('caption',captionDiv); 

			},
			
			//inner slideshows
			createSlideshow:function(div) {
				//console.log('createSlideshow');
				var self = this;
				
				function ap_slideshow(div){
					this.slideDiv = div;
					this.len = this.slideDiv.data('slideArr').length;
					this.counter=parseInt(this.slideDiv.data('counter'),10);
					this.delay;
					this.timeoutID;
					this.time=1000;
					this.ease='easeOutSine';
					this.running=false;
				};
					
				ap_slideshow.prototype = {
					
					start:function() {
						var iself=this;
						this.delay = self._randomMinMax(self.innerSlideshowDelay[0], self.innerSlideshowDelay[1]);
						//console.log(delay);
						this.delay*=1000;//in miliseconds
						//console.log(delay);
						if(this.timeoutID) clearTimeout(this.timeoutID);
						this.timeoutID = setTimeout(function(){
							iself.next();
						}, this.delay);
						this.running=true;
					},
					
					stop:function() {
						if(this.timeoutID) clearTimeout(this.timeoutID);
						this.running=false;
					},
					
					next:function() {
						var iself=this;
						if(this.timeoutID) clearTimeout(this.timeoutID);
						var currentSlide = this.slideDiv.data('slideArr')[this.counter];
						currentSlide.stop().animate({ 'opacity': 0},  {duration: this.time, easing: this.ease, complete: function(){
							$(this).css('display', 'none');
						}});
						this.counter++;
						if(this.counter > this.len - 1) this.counter=0;//loop
						this.slideDiv.data('counter', this.counter);
						var nextSlide = this.slideDiv.data('slideArr')[this.counter];
						nextSlide.css({
							opacity:0,
							display: 'block'
						}).stop().animate({ 'opacity': 1},  {duration: this.time, easing: this.ease, complete: function(){
							if(iself.running) iself.start();
						}});
						
					}
				}
				
				return new ap_slideshow(div);
			},
			
			checkScroll:function() {
				var self = this;
				if(!this.scrollPaneApi){
					this.scrollPaneApi = this.thumbContainer.jScrollPane().data().jsp;
					this.thumbContainer.bind('jsp-initialised',function(event, isScrollable){
						//console.log('Handle jsp-initialised', this,'isScrollable=', isScrollable);
						
						if(!isScrollable){
							if(this._thumbOrientation == 'vertical'){
								//self.scrollPaneApi.scrollToY(0);
							}else{
								//self.scrollPaneApi.scrollToX(0);
								$('.jspPane').css('left',0+'px');//fix, scrollToX doesnt work, wtf?
							}
						}
						
					})
					.bind('jsp-scroll-y',function(event, scrollPositionY, isAtTop, isAtBottom){
						//console.log('Handle jsp-scroll-y', this,'scrollPositionY=', scrollPositionY);
					})
					.bind('jsp-scroll-x',function(event, scrollPositionX, isAtLeft, isAtRight){
						//console.log('Handle jsp-scroll-x', this,'scrollPositionX=', scrollPositionX);
					})
					
					if(this._thumbOrientation == 'vertical'){
						this.thumbContainer.jScrollPane({
							verticalDragMinHeight: 80,
							verticalDragMaxHeight: 100
						});
					}else{
						this.thumbContainer.jScrollPane({
							horizontalDragMinWidth: 80,
							horizontalDragMaxWidth: 100
						});
						this.componentPlaylist.bind('mousewheel', function(event, delta, deltaX, deltaY) {//thumbContainer
							if(!self._componentInited || !self.scrollPaneApi) return;
							var d = delta > 0 ? -1 : 1;//normalize
							if(self.scrollPaneApi) self.scrollPaneApi.scrollByX(d * 100);
							return false;
						});
					}
				}else{
					this.scrollPaneApi.reinitialise();
				}
			},
			
			calculateGrid:function(scroll_offset) {
				this.tempScrollOffset = scroll_offset ? parseInt(scroll_offset,10) : this.scrollOffset;
				//console.log('tempScrollOffset = ', this.tempScrollOffset);
				
				var tw = this._getComponentSize('w');	
				var th = this._getComponentSize('h');
				//console.log('tw = ', tw, ' , th = ', th);
				
				var currentColumns;
				var currentRows;
				
				if(this._thumbOrientation == 'horizontal'){
					if(this._moveType == 'scroll')th -= this.tempScrollOffset;
					
					this.rows = Math.floor(th / (this.boxHeight+this.horizontalSpacing ));///start by rows, then calculate columns
					//CHECK WITHOUT LAST SPACING!!
					if(this.rows * (this.boxHeight+this.horizontalSpacing ) + this.boxHeight <= th){
						this.rows += 1;//one more row fits!
					}
					//console.log('this.rows = ', this.rows);
					
					this.columns= Math.floor(tw / (this.boxWidth+this.verticalSpacing ));///max columns that fits in layout
					this.allColumns = Math.ceil(this._playlistLength / this.rows);///actual number of columns
					//console.log('this.columns = ', this.columns, ' , this.allColumns = ', this.allColumns);
					
					if(this.allColumns < this.columns){//if all columns is less than fit columns
						currentColumns = this.allColumns;
					}else{
						currentColumns = this.columns;
					}
					//console.log('currentColumns = ', currentColumns);
					
					//create grid for all columns
					this.gridArr=this.createGrid(this.allColumns,this.rows,this.boxWidth,this.boxHeight,this.horizontalSpacing,this.verticalSpacing,0,0,false);	
					//console.log(this.gridArr);
					this.thumbInnerContainerSize = this.allColumns * this.boxWidth + (this.allColumns-1) * this.verticalSpacing;
					//console.log('this.thumbInnerContainerSize = ', this.thumbInnerContainerSize);
					
					this.thumbContainerWidth = currentColumns * this.boxWidth + (currentColumns-1) * this.verticalSpacing;
					this.thumbContainerHeight = this.rows * this.boxHeight + (this.rows-1) * this.horizontalSpacing;
					
			    }else{//leave columns
					if(this._moveType == 'scroll')tw -= this.tempScrollOffset;
					
					this.columns = Math.floor(tw / (this.boxWidth+this.verticalSpacing ));///start by columns, then calculate rows
					//CHECK WITHOUT LAST SPACING!!
					if(this.columns * (this.boxWidth+this.verticalSpacing ) + this.boxWidth <= tw){
						this.columns += 1;//one more column fits!
					}
				    //console.log('this.columns = ', this.columns);
					
					this.rows= Math.floor(th / (this.boxHeight+this.horizontalSpacing ));///max rows that fits in layout
					this.allRows = Math.ceil(this._playlistLength / this.columns);///actual number of rows
					//console.log('this.rows = ', this.rows, ' , this.allRows = ', this.allRows);
					
					if(this.allRows < this.rows){//if all columns is less than fit columns
						currentRows = this.allRows;
					}else{
						currentRows = this.rows;
					}
					//console.log('currentRows = ', currentRows);
					
					//create grid for all rows
					this.gridArr=this.createGrid(this.columns,this.allRows,this.boxWidth,this.boxHeight,this.horizontalSpacing,this.verticalSpacing,0,0,true);	
					//console.log(this.gridArr);
					this.thumbInnerContainerSize = this.allRows * this.boxHeight + (this.allRows-1) * this.horizontalSpacing;
					//console.log('this.thumbInnerContainerSize = ', this.thumbInnerContainerSize);
					
					this.thumbContainerWidth = this.columns * this.boxWidth + (this.columns-1) * this.verticalSpacing;
					this.thumbContainerHeight = currentRows * this.boxHeight + (currentRows-1) * this.horizontalSpacing;
			    }
				//console.log('this.thumbContainerWidth = ', this.thumbContainerWidth, ' , this.thumbContainerHeight =  ', this.thumbContainerHeight);
			},
			
			layoutTypeGrid:function() {
				//reposition thumbs
				var i=0, div; 
				for (i; i < this._playlistLength; i++) {
					div = $(this._thumbHolderArr[i]).css({
					   left : this.gridArr[i].x+'px',
					   top : this.gridArr[i].y+'px'
					});
				}
				
				this.thumbContainerLeft = Math.ceil(this._getComponentSize2('w')/2 - this.thumbContainerWidth / 2);
				this.thumbContainerTop = Math.ceil(this._getComponentSize2('h')/2 - this.thumbContainerHeight / 2);
				//console.log('this.thumbContainerLeft = ', this.thumbContainerLeft, ' , this.thumbContainerTop= ',this.thumbContainerTop);
				
				this.thumbContainerHeight+=this.containerHeightAddOn;
				this.thumbContainerWidth+=this.containerWidthAddOn;
				if(this._thumbOrientation == 'horizontal'){
					this.thumbInnerContainerSize+=this.containerWidthAddOn;
				}else{
					this.thumbInnerContainerSize+=this.containerHeightAddOn;
				}
				
				if(this._moveType != 'scroll'){
					
					if(this._thumbOrientation == 'horizontal'){
						
						var tw = this._getComponentSize('w');	
					
						//right restrain for rows/columns change 
						var value = parseInt(this.thumbInnerContainer.css('left'),10);
						if(value < - this.thumbInnerContainerSize + this.thumbContainerWidth){
							value = - this.thumbInnerContainerSize + this.thumbContainerWidth; 
							this.thumbInnerContainer.css('left',value+'px');
						}
					
						if(this.thumbInnerContainerSize > this.thumbContainerWidth){
							this.thumbBackward.css('display','block');
							this.thumbForward.css('display','block');
						}else{
							//center thumbs if less
							this.thumbBackward.css('display','none');
							this.thumbForward.css('display','none');
							this.thumbInnerContainer.css('left', 0 +'px');
						}
						
						//align buttons
						//tbl = thumb backward left, tfr = thumb forward right
						var tbl = this.thumbContainerLeft - this._thumbBackwardSize - this.buttonSpacing;
						if(tbl <0) tbl = 0;//restrain
						var tfr = this.thumbContainerLeft + this.thumbContainerWidth + this.buttonSpacing;
						if(tfr > this._getComponentSize2('w') - this._thumbForwardSize) tfr = this._getComponentSize2('w') - this._thumbForwardSize;//restrain
						this.thumbBackward.css('left', tbl +'px');
						this.thumbForward.css('left', tfr +'px');
						//console.log('tbl = ', tbl, ' , tfr = ', tfr);
					
					}else{//vertical
					
						var th = this._getComponentSize('h');
						
						var value = parseInt(this.thumbInnerContainer.css('top'),10);
						if(value < - this.thumbInnerContainerSize + this.thumbContainerHeight){
							value = - this.thumbInnerContainerSize + this.thumbContainerHeight; 
							this.thumbInnerContainer.css('top',value+'px');
						}
						
						if(this.thumbInnerContainerSize > this.thumbContainerHeight){
							this.thumbBackward.css('display','block');
							this.thumbForward.css('display','block');
						}else{
							this.thumbBackward.css('display','none');
							this.thumbForward.css('display','none');
							this.thumbInnerContainer.css('top', 0 +'px');
						}
						
						//align buttons
						//tbt = thumb backward top, tfb = thumb forward bottom
						var tbt = this.thumbContainerTop - this._thumbBackwardSize - this.buttonSpacing;
						if(tbt <0) tbt = 0;//restrain
						var tfb = this.thumbContainerTop + this.thumbContainerHeight + this.buttonSpacing;
						if(tfb > this._getComponentSize2('h') - this._thumbForwardSize) tfb = this._getComponentSize2('h') - this._thumbForwardSize;//restrain
						this.thumbBackward.css('top', tbt +'px');
						this.thumbForward.css('top', tfb +'px');
						
					}
					
					//align thumbContainer
					this.thumbContainer.css({
						width: this.thumbContainerWidth +'px',
						height: this.thumbContainerHeight +'px',
						left: this.thumbContainerLeft +'px',
						top: this.thumbContainerTop+ 'px'
					});
					
			    }else{//scroll
				
					if(this._thumbOrientation == 'horizontal'){
						this.thumbContainerTop -= this.tempScrollOffset / 2;
						this.thumbContainerHeight += this.tempScrollOffset;
					}else{
						this.thumbContainerLeft -= this.tempScrollOffset / 2;
						this.thumbContainerWidth += this.tempScrollOffset;
					}
					
					//align componentPlaylist
					this.componentPlaylist.css({
						width: this.thumbContainerWidth +'px',
						height: this.thumbContainerHeight +'px',
						left: this.thumbContainerLeft +'px',
						top: this.thumbContainerTop+ 'px'
					});
					
					//align thumbContainer
					this.thumbContainer.css({
						width: this.thumbContainerWidth +'px',
						height: this.thumbContainerHeight +'px'
					});
					
					if(this._thumbOrientation == 'horizontal'){
						this.thumbInnerContainer.css({
							width: this.thumbInnerContainerSize +'px',
							height: this.thumbContainerHeight +'px'
						});
					}else{
						this.thumbInnerContainer.css({
							width: this.thumbContainerWidth +'px',
							height: this.thumbInnerContainerSize +'px'
						});
					}
					//console.log(this.thumbContainerWidth, this.thumbContainerHeight, this.thumbContainerLeft, this.thumbContainerTop, this.thumbContainerTop, this.thumbInnerContainerSize);
				}
				
			},
			layoutTypeLine:function(scroll_offset) {
				/*http://stackoverflow.com/questions/9017452/jquery-resize-not-working-for-small-width*/
				
				var tw = this._getComponentSize('w');	
				var th = this._getComponentSize('h');
				
				if(this._thumbOrientation == 'horizontal'){
					
					if(this._moveType != 'scroll'){
					
						//align thumbContainer
						this.thumbContainer.css({
							width: tw+'px',
							marginLeft: -tw/2+'px'
						});
						
						//align buttons
						this.thumbContainerLeft = this.thumbContainer.offset().left;
						this.thumbBackward.css('left', this.thumbContainerLeft +'px');
						this.thumbForward.css('left', this.thumbContainerLeft + tw - this._thumbForwardSize+'px');
						
						//toggle buttons and align thumbInnerContainer
						if(this.thumbInnerContainerSize > this._getComponentSize('w')){
							this.thumbBackward.css('display','block');
							this.thumbForward.css('display','block');
							var value = parseInt(this.thumbInnerContainer.css('left'),10);
							if(value < this._getComponentSize('w')- this.thumbInnerContainerSize - this._thumbForwardSize){
								if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
								value=this._getComponentSize('w')- this.thumbInnerContainerSize - this._thumbForwardSize;	
							}else if(value > 0+this._thumbBackwardSize){
								value=0+this._thumbBackwardSize;
							}
							this.thumbInnerContainer.css('left', value+'px');
						}else{
							//center thumbs if less
							this.thumbBackward.css('display','none');
							this.thumbForward.css('display','none');
							this.thumbInnerContainer.css('left', this._getComponentSize('w') / 2 - this.thumbInnerContainerSize / 2 +'px');
						}
						
					}else{//scroll
						
						var tempOffset = this.thumbInnerContainerSize > tw ?  this.scrollOffset : 0;
						//console.log('tempOffset = ', tempOffset);
						th -= tempOffset;
						
						this.thumbContainerHeight = this.boxHeight;
						this.thumbContainerWidth = this.thumbInnerContainerSize < tw ? this.thumbInnerContainerSize : tw;
						//console.log('this.thumbContainerWidth = ', this.thumbContainerWidth, ' , this.thumbContainerHeight =  ', this.thumbContainerHeight);
					 	//console.log('this.thumbInnerContainerSize = ', this.thumbInnerContainerSize);
						
						this.thumbContainerWidth+=this.containerWidthAddOn;
						
						this.thumbContainerLeft = Math.ceil(this._getComponentSize2('w')/2 - this.thumbContainerWidth / 2);
						this.thumbContainerTop = Math.ceil(this._getComponentSize2('h')/2 - this.thumbContainerHeight / 2);
						//console.log('this.thumbContainerLeft = ', this.thumbContainerLeft, ' , this.thumbContainerTop = ', this.thumbContainerTop);
						
						this.thumbContainerTop -= tempOffset / 2;
						this.thumbContainerHeight += tempOffset;
					
						//align componentPlaylist
						this.componentPlaylist.css({
							width: this.thumbContainerWidth +'px',
							height: this.thumbContainerHeight +'px',
							left: this.thumbContainerLeft +'px',
							top: this.thumbContainerTop+ 'px'
						});
						
						//align thumbContainer
						this.thumbContainer.css({
							width: this.thumbContainerWidth +'px',
							height: this.thumbContainerHeight +'px'
						});
						
						//align thumbInnerContainer
						this.thumbInnerContainer.css({
							height: this.thumbContainerHeight +'px'
						});
					
					}
					
				}else{
					
					if(this._moveType != 'scroll'){
						
						//align thumbContainer
						this.thumbContainer.css({
							height: th+'px',
							marginTop: -th/2+'px'
						});
					
						//align buttons
						this.thumbContainerTop = this.thumbContainer.offset().top;
						this.thumbBackward.css('top', this.thumbContainerTop +'px');
						this.thumbForward.css('top', this.thumbContainerTop + th - this._thumbForwardSize+'px');
						
						//toggle buttons and align thumbInnerContainer
						if(this.thumbInnerContainerSize > this._getComponentSize('h')){
							this.thumbBackward.css('display','block');
							this.thumbForward.css('display','block');
							var value = parseInt(this.thumbInnerContainer.css('top'),10);
							if(value < this._getComponentSize('h')- this.thumbInnerContainerSize - this._thumbForwardSize){
								if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
								value=this._getComponentSize('h')- this.thumbInnerContainerSize - this._thumbForwardSize;	
							}else if(value > 0+this._thumbBackwardSize){
								value=0+this._thumbBackwardSize;
							}
							this.thumbInnerContainer.css('top', value+'px');
						}else{
							//center thumbs if less
							this.thumbBackward.css('display','none');
							this.thumbForward.css('display','none');
							this.thumbInnerContainer.css('top', this._getComponentSize('h') / 2 - this.thumbInnerContainerSize / 2 +'px');
						}
						
					}else{//scroll
					
						var tempOffset = this.thumbInnerContainerSize > th ?  this.scrollOffset : 0;
						//console.log('tempOffset = ', tempOffset);
						tw -= tempOffset;
						
						this.thumbContainerWidth = this.boxWidth;
						this.thumbContainerHeight = this.thumbInnerContainerSize < th ? this.thumbInnerContainerSize : th;
						//console.log('this.thumbContainerWidth = ', this.thumbContainerWidth, ' , this.thumbContainerHeight =  ', this.thumbContainerHeight);
					 	//console.log('this.thumbInnerContainerSize = ', this.thumbInnerContainerSize);
						
						this.thumbContainerHeight+=this.containerHeightAddOn;
						
						this.thumbContainerLeft = Math.ceil(this._getComponentSize2('w')/2 - this.thumbContainerWidth / 2);
						this.thumbContainerTop = Math.ceil(this._getComponentSize2('h')/2 - this.thumbContainerHeight / 2);
						//console.log('this.thumbContainerLeft = ', this.thumbContainerLeft, ' , this.thumbContainerTop = ', this.thumbContainerTop);
						
						this.thumbContainerLeft -= tempOffset / 2;
						this.thumbContainerWidth += tempOffset;
					
						//align componentPlaylist
						this.componentPlaylist.css({
							width: this.thumbContainerWidth +'px',
							height: this.thumbContainerHeight +'px',
							left: this.thumbContainerLeft +'px',
							top: this.thumbContainerTop+ 'px'
						});
						
						//align thumbContainer
						this.thumbContainer.css({
							width: this.thumbContainerWidth +'px',
							height: this.thumbContainerHeight +'px'
						});
						
						//align thumbInnerContainer
						this.thumbInnerContainer.css({
							width: this.thumbContainerWidth +'px'
						});
					
					}
				}
			},
			//layout type line button handlers
			_scrollThumbsBack:function () {
				var value;
				if(this._thumbOrientation == 'horizontal'){
					value = parseInt(this.thumbInnerContainer.css('left'),10);
					value+=this._thumbsScrollValue;
					if(value > 0+this._thumbBackwardSize){
						if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
						value=0+this._thumbBackwardSize;	
					}
					this.thumbInnerContainer.css('left', value+'px');
				}else{
					value = parseInt(this.thumbInnerContainer.css('top'),10);
					value+=this._thumbsScrollValue;
					if(value > 0+this._thumbBackwardSize){
						if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
						value=0+this._thumbBackwardSize;	
					}
					this.thumbInnerContainer.css('top', value+'px');
				}
			},
			_scrollThumbsForward:function () {
				var value;
				if(this._thumbOrientation == 'horizontal'){
					value = parseInt(this.thumbInnerContainer.css('left'),10);
					value-=this._thumbsScrollValue;
					if(value < this._getComponentSize('w')- this.thumbInnerContainerSize - this._thumbForwardSize){
						if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
						value=this._getComponentSize('w')- this.thumbInnerContainerSize - this._thumbForwardSize;	
					}
					this.thumbInnerContainer.css('left', value+'px');
				}else{
					value = parseInt(this.thumbInnerContainer.css('top'),10);
					value-=this._thumbsScrollValue;
					if(value < this._getComponentSize('h')- this.thumbInnerContainerSize - this._thumbForwardSize){
						if(this._thumbScrollIntervalID) clearInterval(this._thumbScrollIntervalID);
						value=this._getComponentSize('h')- this.thumbInnerContainerSize - this._thumbForwardSize;	
					}
					this.thumbInnerContainer.css('top', value+'px');
				}
			},
			_getComponentSize:function (type) {
				if(type == "w"){//width
					if(this.maxWidth > 0){
						var tw = this.componentWrapper.width() < this.maxWidth ? this.componentWrapper.width() : this.maxWidth;
					}else{
						var tw =this.componentWrapper.width();
					}
					return tw;
				}else{//height
					if(this.maxHeight > 0){
						var th = this.componentWrapper.height() < this.maxHeight ? this.componentWrapper.height() : this.maxHeight;
					}else{
						var th = this.componentWrapper.height();
					}
					return th;
				}
			},
			_getComponentSize2:function (type) {
				if(type == "w"){//width
					return this.componentWrapper.width();
				}else{//height
					return this.componentWrapper.height();
				}
			},
			
			/* HELP FUNCTIONS */
			
			//returns a random value between min and max
			_randomMinMax:function (min, max) {
				return Math.random()*(max-min)+min;
			},
			
			_stringCounter:function (i) {
				var s;
				if(i < 9){
					s = "0" + (i + 1);
				}else{
					s = i + 1;
				}
				return s;
			},
			_preventSelect:function (arr) {
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
			},
			_resizeHandler:function () {
				if(!this._componentInited) return false;
				if(this._windowResizeTimeoutID) clearTimeout(this._windowResizeTimeoutID);
				this._windowResizeTimeoutID = setTimeout(this._doneResizing, this._windowResizeTimeout);
			},
			_doneResizing:function () {
				//console.log('_doneResizing');
				if(this._layoutType == 'grid'){
					this.calculateGrid(this.scrollOffset);
					
					if(this._moveType == 'scroll'){	
						if(this._thumbOrientation == 'horizontal'){
							if(this.thumbInnerContainerSize <= this.thumbContainerWidth){
								this.calculateGrid('0');//remove scrollOffset
							}
						}else{
							if(this.thumbInnerContainerSize <= this.thumbContainerHeight){
								this.calculateGrid('0');//remove scrollOffset
							}
						}
					}
					
					this.layoutTypeGrid(this.scrollOffset);
				}else{
					this.layoutTypeLine();
				}
				if(this._moveType == 'scroll'){	
					this.checkScroll();
				}
					
			},
			_isEmpty:function (str) {
				return str.replace(/^\s+|\s+$/g, '').length == 0;
			},
			createGrid:function(columns, rows, xSpacing, ySpacing, xPadding, yPadding, xOffset, yOffset, leftToRight) {
		
				var arr = [],pointObj,row,col,num = (columns * rows);
		
				for (var i = 0; i < num; i++) {
					pointObj = {};
		
					if (leftToRight) {
						row = (i % columns);
						col = Math.floor((i / columns));
		
						pointObj.x = (row * (xSpacing + xPadding)) + xOffset;
						pointObj.y = (col * (ySpacing + yPadding)) + yOffset;
		
					} else {
						row = (i % rows);
						col = Math.floor((i / rows));
		
						pointObj.x = (col * (xSpacing +xPadding)) + xOffset;
						pointObj.y = (row * (ySpacing + yPadding)) + yOffset;
		
					}
					arr.push(pointObj);
				}
				return arr;
			}
					
	}; /* ThumbGallery.prototype end */
	
	$.fn.thumbGallery = function(options) {    	
		return this.each(function(){
			var thumbGallery = new ThumbGallery($(this), options);
			$(this).data("thumbGallery", thumbGallery);
			
			//PUBLIC METHODS
			$.fn.thumbGallery.toggleInnerslideShow = function(on) {	
				thumbGallery.toggleInnerslideShow(on);
			}
			$.fn.thumbGallery.toggleInnerslideShowNum = function(num, on) {	
				thumbGallery.toggleInnerslideShowNum(num, on);
			}
			$.fn.thumbGallery.getThumbHolder = function(num) {	
				return thumbGallery.getThumbHolder(num);
			}
			
		});
	};

	$.fn.thumbGallery.defaults = {   
	
			/*layoutType: grid/line */
			layoutType: 'line',
			/*thumbOrientation: horizontal/vertical */
			thumbOrientation: 'vertical',
			/*moveType: scroll/buttons */
			moveType: 'scroll',
			/*scrollOffset: how much to move scrollbar and scrolltrack off the content (enter 0 or above) */
			scrollOffset: 22,
			
			/* SIZE RESTRAIN */
			/*maxWidth:(enter 0 for none, or higher)  */
			maxWidth: 0,
			/*maxHeight: (enter 0 for none, or higher) */
			maxHeight: 0,
			
			/* GRID SETTINGS */
			/*verticalSpacing:  */
			verticalSpacing: 10,
			/*horizontalSpacing:  */
			horizontalSpacing: 10,
			/*buttonSpacing: button spacing from the grid itself */
			buttonSpacing: 10,
			
			/* LINE SETTINGS */
			/* thumbsScrollValue: speed of the thumb scroll on button down (number higher than 0) */
			thumbsScrollValue: 150,
			
			/*innerSlideshowDelay: slideshow delay for inner items in seconds, random value between: 'min, max', 
			enter both number the same for equal time delay like for example 2 seconds: '2,2' */
			innerSlideshowDelay:[2,4],
			/*innerSlideshowOn: autoplay inner slideshow, true/false */
			innerSlideshowOn:true
			
	}; /* default options end */

	$.fn.thumbGallery.settings = {};

})(jQuery);




/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){jQuery.browser.mobile=/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

