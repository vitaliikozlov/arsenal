/* dCodes Framework */
(function($) {

	$.multiGallery = function (wrapper, settings) {
		
	var componentInited = false;
	
	var isMobile = jQuery.browser.mobile;
	
	var componentWrapper = $(wrapper);
	
	//show preloader
	var componentPreloader=componentWrapper.find('.componentPreloader');
	showPreloader();
	
	var thumbWrapper = componentWrapper.find('.thumbWrapper');
	var componentHolder = componentWrapper.find('.componentHolder');
	var componentPlaylist = componentWrapper.find('.componentPlaylist');
	var _thumbHolder = componentWrapper.find('.thumbHolder');
	
	var playlistIndex=settings.playlistIndex;
	
	var _body = $('body');
	var _window = $(window);
	var _doc = $(document);
	
	var _thumbClick=false;//if random play, on thumb click set counter to cliked thumb
	var fixMenu=settings.fixMenu;
	if(fixMenu){
		var fixMenuSide = settings.fixMenuSettings.side;
		var fixMenuValue = settings.fixMenuSettings.value;
	} 
	var fixThumbs=settings.fixThumbs;
	if(fixThumbs){
		var fixThumbsSide = settings.fixThumbsSettings.side;
		var fixThumbsValue = settings.fixThumbsSettings.value;
	} 
	
	var disableRightClick = settings.disableRightClick;
	
	var componentFixedSize=settings.componentFixedSize;
	
	var playlistPosition = settings.playlistPosition;
	var thumbOrientatation=settings.thumbOrientatation;
	var menuOrientatation=settings.menuOrientatation;
	var thumbBtnOffOpacity=settings.thumbBtnOffOpacity;
	var menuBtnOffOpacity=settings.menuBtnOffOpacity;
	
	var dataArr = thumbWrapper.children('div[class=playlist]');//category data
	var categoryLength = dataArr.size();
	var singleCategory = false;
	if(categoryLength==1) singleCategory = true;
	
	var categoryDataArr=[];//data per category
	var currentData;//data per category
	var maxDescriptionWidth=settings.maxDescriptionWidth;
	
	var _playlistLength;
	var playlistOpened=false;
	var autoOpenPlaylist = settings.autoOpenPlaylist;
	
	var _kenBurnsPositions = ['tl','tc','tr','ml','mc','mr','bl','bc','br'];
	var kbEndPosition;//var for resize math in ken burns window resize if transition off
	var lastComponentW;
	var kenBurnsTransitionOn=false;//allow media change while ken burns executes
	
	var _slideCaseArr = [ "top", "left", "bottom", "right" ];
	var _slideCase;
	
	var _revealCaseArr = [ "top", "left", "bottom", "right" ];
	var _revealCase;
	
	var _splitCaseArr = ['horizontalUpLeft' , 'horizontalUpRight', 'horizontalSplit', "verticalUpLeft", "verticalDownLeft", "verticalSplit"];
	var _splitCase;
	
	var _firstImageTime = 500;
	var _firstImageEase = 'easeOutSine';
	
	var _counter=-1;
	var categoryTransitionOn=false;
	
	var slideshowOn = settings.slideshowOn;
	var slideshowTimeout = settings.slideshowDelay;
	var slideshowTimeoutID; 
	var useGlobalDelay = settings.useGlobalDelay;
	var menuItemOffOpacity=isMobile ? 1 : settings.menuItemOffOpacity;
	var thumbOffOpacity=isMobile ? 1 : settings.thumbOffOpacity;
	var playlistHidden=settings.playlistHidden;
	
	var windowResizeTimeout = 100;//execute resize delay
	var windowResizeTimeoutID;
	
	var loadRequestInterval = 100;//request new load while one is performing
	var loadRequestIntervalID; 
	var _mediaLoadOn=false;
	var loadRequestPause=false;//prevent queue load for request load
	
	var transitionEase;//image transition settings
	var transitionTime;
	var transitionOn=false;//image transition on
	var lastActiveThumb = null;//thumb disabling 
	var thumbArr=[];//holds div thumbnails
	
	var linkExist=false;
	var _link;
	var _target;
	
	//create holders for loaded media
	var mediaObj = {};
	var obj;
	var mainArr;
	var categoryTitleArr=[];
	var i = 0;
	for(i; i < categoryLength; i++){
		obj = {};
		mainArr = [];
		obj.mainLoaded=false;
		obj.main=mainArr;
		mediaObj[i] = obj;
		categoryTitleArr[i] = $(dataArr[i]).attr('data-title');
	}
	//console.log(categoryTitleArr);
	
	var _allMediaLoaded=false;
	
	var _randomArr = [];
	var _randomPlay = settings.randomPlay;
	
	var navigationActive=false;
	
	var slideshowAdvancesToNextCategory = settings.slideshowAdvancesToNextCategory;
	var transitionIntroHappened = false;//first image loaded in category
	
	var makeImageClickableForUrl=false;
	
	var _transitionType;		
	var forceImageFitMode=settings.forceImageFitMode;//force fit even if image smaller
	var imageFitMode=false;
	var componentBgColor;
	
	//holders for transitions		
	var _holder1 = componentWrapper.find('.mediaHolder1');
	_holder1.attr('data-title', '_holder1');
	_holder1.css('zIndex', 0);
	
	//Enable swiping...
				_holder1.swipe( {
					//Generic swipe handler for all directions
					swipe:function(event, direction, distance, duration, fingerCount) {
						if(direction=='right')
						{
						  if(loadRequestPause) return;
			              checkPrevious();
						}
						if(direction=='left')
						{ 
						  if(loadRequestPause) return;
			              checkNext();
						}		
					},
					//Default is 75px, set to 0 for demo so any distance triggers swipe
					threshold:50
				});
	var _holder2 = componentWrapper.find('.mediaHolder2');
	_holder2.attr('data-title', '_holder2');
	_holder2.css('zIndex', 1);
	
	//Enable swiping...
				_holder2.swipe( {
					//Generic swipe handler for all directions
					swipe:function(event, direction, distance, duration, fingerCount) {
						if(direction=='right')
						{
						  if(loadRequestPause) return;
			              checkPrevious();
						}
						if(direction=='left')
						{ 
						  if(loadRequestPause) return;
			              checkNext();
						}		
					},
					//Default is 75px, set to 0 for demo so any distance triggers swipe
					threshold:50
				});
	//playlist vars
	var playlistTransitionOn=false;
	var visibleThumbs = settings.visibleThumbs;
	var maxVisibleThumbs = false;
	if(visibleThumbs == 'max') {
		maxVisibleThumbs = true;
		fixThumbs=false;
	}
	var thumbSpacing;
	var thumbWidth;
	var thumbHeight;
	var thumbBtnOffset =settings.thumbBtnOffset;
	var currentlyVisibleThumbs;
	var thumbBtnBuffer = 50 + 2 * thumbBtnOffset;
	var thumbHolderSize;
	var minVisibleThumbs=1;
	var playlistCounter=0;
	
	var stuffInited=false;
	
	//PLAYLIST CONTROLS
	var prevThumbBtn = componentWrapper.find('.prevThumbBtn');
	prevThumbBtn.css('display', 'none');
	prevThumbBtn.css('cursor', 'pointer');
	prevThumbBtn.attr('data-id', 'prevThumbBtn');
	prevThumbBtn.bind('click touchstart', togglePlaylistControls);
	
	var nextThumbBtn = componentWrapper.find('.nextThumbBtn');
	nextThumbBtn.css('display', 'none');
	nextThumbBtn.css('cursor', 'pointer');
	nextThumbBtn.attr('data-id', 'nextThumbBtn');
	nextThumbBtn.bind('click touchstart', togglePlaylistControls);
	
	//menu vars
	var menuSize=0;//defined only once
	var minVisibleMenuItems = 1;//we will hardcode this and start from there up. Displaying menu without that wouldnt be possible anyway.
	var currentlyVisibleMenuItems=0;
	var menuSpacing;
	var visibleMenuItems = settings.visibleMenuItems;
	var maxVisibleMenuItems = false;
	if(visibleMenuItems == 'max') {
		maxVisibleMenuItems = true;
		fixMenu=false;
	}
	var menuBtnOffset =settings.menuBtnOffset;
	var menuCounter = 0;
	var menuTransitionOn=false;
	var menuItemArr=[];
	var menuItemSizeArr = [];//save sizes
	var menuItemPositionArr = [];//save positions
	var _menuHolder = componentWrapper.find('.menuHolder');
	var menuWrapper = componentWrapper.find('.menuWrapper');
	var menuBtnBuffer = 50 + 2 * menuBtnOffset;
	var prevMenuBtn;
	var nextMenuBtn;
	var menuHolderSize=0;
	var maxMenuItemWidth = 0;
	var maxMenuItemHeight = 0;
	var startItem;//menu counter for left dir addition
	var lastActiveMenuItem = null;//menu disabling 
	
	//************************* SLIDESHOW CONTROLS, INFO, DESCRIPTION ***********************//
	
	if(componentWrapper.find('.slideshow_controls').length){
		var slideshow_controls = componentWrapper.find('.slideshow_controls');
		var controls_prev = componentWrapper.find('.controls_prev');
		var controls_toggle = componentWrapper.find('.controls_toggle');
		var controls_next = componentWrapper.find('.controls_next');
		
		controls_prev.css('cursor', 'pointer');
		controls_toggle.css('cursor', 'pointer');
		controls_next.css('cursor', 'pointer');
		
		controls_prev.bind('click touchstart', clickControls);
		controls_toggle.bind('click touchstart', clickControls);
		controls_next.bind('click touchstart', clickControls);
		
		controls_prev.bind('mouseover', overControls);
		controls_toggle.bind('mouseover', overControls);
		controls_next.bind('mouseover', overControls);
		
		controls_prev.bind('mouseout', outControls);
		controls_toggle.bind('mouseout', outControls);
		controls_next.bind('mouseout', outControls);
		
		var controlsPrevSrc=controls_prev.children('img');
		var controlsNextSrc=controls_next.children('img');
		var controlsToggleSrc=controls_toggle.children('img');
		
		if(slideshowOn) controlsToggleSrc.attr('src', 'data/icons/pause.png');
		
		//fade in controls
		slideshow_controls.css('opacity', 0);
		slideshow_controls.css('display', 'block');
		slideshow_controls.stop().animate({ 'opacity': 1},  {duration: 1000, easing: 'easeOutSine'});
	}
	
	
	//INFO
	var useDescription = false;
	if(componentWrapper.find('.info_holder').length>0){
		useDescription = true;
		var data_controls = componentWrapper.find('.data_controls');
		var autoOpenDescription=settings.autoOpenDescription;
		var infoOpened=false;
		var infoExist=false;
		var infoData;
		var info_toggle = componentWrapper.find('.info_toggle');
		
		info_toggle.css('cursor', 'pointer');
		
		info_toggle.bind('click touchstart', clickControls);
		info_toggle.bind('mouseover', overControls);
		info_toggle.bind('mouseout', outControls);
		
		var infoToggleSrc=info_toggle.children('img');
		
		var infoHolder = componentWrapper.find('.info_holder');
		
	}else{
		componentWrapper.find('.info_toggle').remove();
		componentWrapper.find('.info_holder').remove();
	}
	
	//LINK
	var link_toggle = componentWrapper.find('.link_toggle');
	link_toggle.css('cursor', 'pointer');
	link_toggle.bind('click touchstart', clickControls);
	link_toggle.bind('mouseover', overControls);
	link_toggle.bind('mouseout', outControls);
	var linkToggleSrc=link_toggle.children('img');
	
	//PLAYLIST TOGGLE
	if(playlistIndex == 'inside'){
		var playlist_toggle = componentWrapper.find('.playlist_toggle');
		playlist_toggle.css('cursor', 'pointer');
		playlist_toggle.bind('click touchstart', clickControls);
		playlist_toggle.bind('mouseover', overControls);
		playlist_toggle.bind('mouseout', outControls);
		var playlistToggleSrc=playlist_toggle.children('img');
		playlist_toggle.css({opacity:0, display: 'block'}).stop().animate({ 'opacity': 1},  {duration: 1000, easing: 'easeOutSine'});
	}else{
		componentWrapper.find('.playlist_toggle').remove();
	}
	
	componentPlaylist.css('zIndex',10);
	if(data_controls)data_controls.css('zIndex',11);
	if(slideshow_controls)slideshow_controls.css('zIndex',12);
	if(infoHolder)infoHolder.css('zIndex',13);
	componentPreloader.css('zIndex',14);
	
	
	
	//************* swf address
	
	var noDeeplinkSet=false;
	var categoryArr=[];
	var deepLink;
	var _addressSet=false;
	var _swfAddressInited=false;
	var swfAddressTimeout=500;
	var swfAddressTimeoutID;
	var _externalChangeEvent;
	var useDeeplink=settings.useDeeplink;
	var startUrl=settings.startUrl;
	var activeCategory;
	var currentCategory;
	var activeItem;
	var transitionFinishInterval=100;
	var transitionFinishIntervalID;
	
	//get data for deeplink
	var i = 0, j, tempArr, category, len, obj, imgs, img, src, n, n2, str_to_filter;
	for(i; i < categoryLength;i++){
		category = $(dataArr[i]);
		j = 0;
		tempArr=[];
		obj = {};
		
		str_to_filter = filterAllowedChars( category.attr('data-address'));
		obj.categoryName = str_to_filter;//get category names
		//console.log(str_to_filter);
		obj.mediaName=tempArr;
		categoryArr.push(obj);
		
		imgs = category.find('ul li');
		len = imgs.length;
		for(j; j < len;j++){//get media names
			img = $(imgs[j]);
			
			src = img.attr('data-imagePath');
			n = src.substr(src.lastIndexOf('/')+1);//find last slash
			n2 = n.substr(0, n.lastIndexOf('.'));//find last dot before extension
			str_to_filter = filterAllowedChars(n2);
			tempArr.push(str_to_filter);
			//console.log(i,j,str_to_filter);
			
			/*
			src = img.attr('data-address');
			str_to_filter = filterAllowedChars(src);
			tempArr.push(str_to_filter);
			*/
		}
	}
	
	//*********** swfaddress handling
	
	/*
	http://www.asual.com/jquery/address/docs/
				
	internalChange is called when we set value ourselves; 
	externalChange is called when the URL is changed or the browser backward or forward button is pressed. 
	
	I don't want to an AJAX request if there are no query parameters in the URL, which is why I test for an empty object.
	if($.isEmptyObject(event.parameters))
	return;
	  
	jQuery.address.strict(false);//Note that you need to disable plugin's strict option, otherwise it would add slash symbol immediately after hash symbol, like this: #/11.
	*/
	
	function filterAllowedChars(str) {
		var allowedChars = "_-";
		var n = str.length;
		var returnStr = "";
		var i = 0;
		var _char;
		var z;
		for (i; i < n; i++) {
			_char = str.charAt(i).toLowerCase(); //convert to lowercase
			if (_char == "\\") _char = "/";
			z = getCharCode(_char);			
			if ((z >= getCharCode("a") && z <= getCharCode("z")) || (z >= getCharCode("0") && z <= getCharCode("9")) || allowedChars.indexOf(_char) >= 0) {
				//only accepted characters (this will remove the spaces as well)
				returnStr += _char;
			}
		}
		return returnStr;
	}
	
	function getCharCode(s) {
		return s.charCodeAt(0);
	}
	
	if(useDeeplink){
		//console.log($.address.strict());
		//$.address.strict(false);
		//$.address.init(initAddress);
		var onstartinited=false;
		$.address.internalChange(internalChange);
		$.address.externalChange(externalChange);
	}else{
		findAddressOnStart(startUrl);
		_counter=0;
		cleanCategory();	
	}
	
	function initAddress(e) {
		e.stopPropagation();
		//console.log("init: ", e.value);
	}
	
	function transitionFinishHandler() {
		if(!transitionOn){//when module transition finishes
			if(transitionFinishIntervalID) clearInterval(transitionFinishIntervalID);
			if(swfAddressTimeoutID) clearTimeout(swfAddressTimeoutID);
			onChange(_externalChangeEvent);
		}
	}
	
	function swfAddressTimeoutHandler() {
		//timeout if user repeatedly pressing back/forward browser buttons to stop default action executing immediatelly
		if(swfAddressTimeoutID) clearTimeout(swfAddressTimeoutID);
		onChange(_externalChangeEvent);
	}
	
	function internalChange(e) {
		e.stopPropagation();
		//console.log("internalChange: ", e.value);
		onChange(e);
	}
	
	function externalChange(e) {
		e.stopPropagation();
		//console.log("externalChange: ", e.value);
		_externalChangeEvent = e;
		
		if(!transitionOn){
			if(!_swfAddressInited){
				//on the beginning onExternalChange fires first, then onInternalChange immediatelly, so skip onExternalChange call

				if(e.value == "/"){
					//console.log('strict mode off, skip /');
					
					_addressSet=true;
					$.address.history(false);//skip the "/"
					
					$.address.value(startUrl);
					if(!$.address.history()) $.address.history(true);//restore history
					
				}else if(isEmpty(e.value)){
					//console.log('strict mode on');
					
					_addressSet=true;
					$.address.history(false);//skip the ""
					
					$.address.value(startUrl);
					if(!$.address.history()) $.address.history(true);//restore history

				}else{
					//other deeplink start
					//console.log('other deeplink start');
					
					onChange(e);
				}
				
				return;
			}
			if(swfAddressTimeoutID) clearTimeout(swfAddressTimeoutID);
			swfAddressTimeoutID = setTimeout(swfAddressTimeoutHandler, swfAddressTimeout);
		}else{
			if(swfAddressTimeoutID) clearTimeout(swfAddressTimeoutID);
			//wait for transition finish
			if(transitionFinishIntervalID) clearInterval(transitionFinishIntervalID);
			if(_transitionType != 'KEN_BURNS'){
				transitionFinishIntervalID = setInterval(transitionFinishHandler, transitionFinishInterval);
			}else{
				onChange(_externalChangeEvent);
			}
		}
	}
	
	function onChange(e) {
		e.stopPropagation();
		//console.log("onChange: ", e.value);
		
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(loadRequestIntervalID) clearInterval(loadRequestIntervalID);
		
		if(!_swfAddressInited){
			_swfAddressInited = true;
		}
		
		deepLink = e.value;
		if(deepLink.charAt(0) == "/") deepLink = deepLink.substring(1)//check if first character is slash
		if(deepLink.charAt(deepLink.length - 1) == "/") deepLink = deepLink.substring(0, deepLink.length - 1)//check if last character is slash
		//console.log("onChange after trim: ", deepLink);

		if(!onstartinited){
			onstartinited=true;
			findAddressOnStart(deepLink);
		}else{
			if(!findAddress(deepLink)){
				//console.log('404');
				$.address.history(false);//skip invalid url
				return false;
			}
		}
		
		//check for category change
		if(currentCategory == undefined || currentCategory != activeCategory){
			cleanCategory();
		}
		
		//console.log('console.log(_getCounter(), activeItem); = ', getCounter(), activeItem);
		if(getCounter() != activeItem){
			_counter=activeItem;
			
			//console.log('1a.......');
			checkMedia(getCounter());

		}else{
			//console.log('2a.......');
			
			disableActiveThumb();
			callTransition();
			
		}
	}
	
	function findAddressOnStart(value){
		var i = 0;
		for(i; i < categoryLength;i++){
			if(categoryArr[i].categoryName == value){
				activeCategory = i;
				break;	
			}
		}
		activeItem=0;
	}
	
	function findAddress(value){
		//console.log('findAddress');
		
		//var currentURL = window.location.href;
		//console.log(currentURL);
		
		var arr = value.split('/');
		if(arr.length!=2) return false;
		//console.log(arr);
		var category_name=arr[0],media_name=arr[1],categoryFound=false,nameFound=false,i = 0;
		
		for(i; i < categoryLength;i++){
			if(categoryArr[i].categoryName == category_name){
				//console.log('activeCategory = ', i, ' , category_name = ', category_name);
				activeCategory = i;
				categoryFound=true;
				break;	
			}
		}
		if(!categoryFound) return false;
	
		i = 0, arr = categoryArr[activeCategory].mediaName;
		var len = arr.length;
		for(i; i < len;i++){
			if(arr[i] == media_name){
				//console.log('activeItem = ', i, ' , media_name = ', media_name);
				activeItem = i;
				nameFound=true;
				break;	
			}
		}
		
		if(!categoryFound || !nameFound){
			return false;
		}else{
			return true;	
		}
	}
	
	function findCounterByName(value){
		var found=false, i = 0, arr = categoryArr[activeCategory].mediaName, len = arr.length;
		for(i; i < len;i++){
			if(arr[i] == value){
				//console.log(i, value);
				activeItem = i;
				found=true;
				break;	
			}
		}
		if(!found){
			return false;
		}else{
			return true;	
		}
	}
	
	function findCategoryByName(value){
		var found=false, i = 0;
		for(i; i < categoryLength;i++){
			if(categoryArr[i].categoryName == value){
				//console.log(i, value);
				activeCategory = i;
				found=true;
				break;	
			}
		}
		if(!found){
			return false;
		}else{
			return true;	
		}
	}
	
	function findAddress2(i){//return media name with requested counter
		//console.log('findAddress2');
		var arr = categoryArr[activeCategory].mediaName;
		return categoryArr[activeCategory].categoryName+'/'+arr[i];
	}
	
	//************************* PLAYLIST *************************//
	
	function getThumbHolderSize(){
		var maxLeft;
		if(thumbOrientatation=='horizontal'){
			
			currentlyVisibleThumbs = Math.floor((getComponentSize('w') - thumbBtnBuffer) / (thumbWidth + thumbSpacing));
			if(!maxVisibleThumbs && currentlyVisibleThumbs > visibleThumbs) currentlyVisibleThumbs = visibleThumbs;
			else if(currentlyVisibleThumbs > _playlistLength) currentlyVisibleThumbs = _playlistLength;
			else if(currentlyVisibleThumbs < minVisibleThumbs) currentlyVisibleThumbs = minVisibleThumbs;
			//console.log('currentlyVisibleThumbs=', currentlyVisibleThumbs);
			thumbHolderSize = currentlyVisibleThumbs*thumbWidth + (currentlyVisibleThumbs-1)*thumbSpacing;
			//console.log('thumbHolderSize=', thumbHolderSize);
			_thumbHolder.css('width', thumbHolderSize+ 'px');//set new size
			
			//restrain thumbWrapper position (triggered on drag window right)
			maxLeft= -(_playlistLength*thumbWidth + (_playlistLength-1)*thumbSpacing) + thumbHolderSize;
			if(parseInt(thumbWrapper.css('left'), 10) < maxLeft){
				//console.log('maxLeft=', maxLeft);
				thumbWrapper.css('left', maxLeft+'px');
			}
			
		}else{//vertical
		
			currentlyVisibleThumbs = Math.floor((getComponentSize('h') - thumbBtnBuffer) / (thumbHeight + thumbSpacing));
			if(!maxVisibleThumbs && currentlyVisibleThumbs > visibleThumbs) currentlyVisibleThumbs = visibleThumbs;
			else if(currentlyVisibleThumbs > _playlistLength) currentlyVisibleThumbs = _playlistLength;
			else if(currentlyVisibleThumbs < minVisibleThumbs) currentlyVisibleThumbs = minVisibleThumbs;
			//console.log('currentlyVisibleThumbs=', currentlyVisibleThumbs);
			thumbHolderSize = currentlyVisibleThumbs*thumbHeight + (currentlyVisibleThumbs-1)*thumbSpacing;
			_thumbHolder.css('height', thumbHolderSize + 'px');//set new size
			
			//restrain thumbWrapper position 
			maxLeft= -(_playlistLength*thumbHeight + (_playlistLength-1)*thumbSpacing) + thumbHolderSize;
			if(parseInt(thumbWrapper.css('top'), 10) < maxLeft){
				thumbWrapper.css('top', maxLeft+'px');
			}
		}
		
		//change playlistCounter
		if(playlistCounter + currentlyVisibleThumbs>_playlistLength-1){
			playlistCounter = _playlistLength - currentlyVisibleThumbs;
		}
		//console.log('playlistCounter=', playlistCounter);
		checkPlaylistControls();
		
		//position thumb holder
		if(thumbOrientatation=='horizontal'){
			if(!fixThumbs){
				_thumbHolder.css('left', componentPlaylist.width()/2 - thumbHolderSize/2 + 'px');
				prevThumbBtn.css('left', componentPlaylist.width()/2 - thumbHolderSize/2 - prevThumbBtn.width()-thumbBtnOffset + 'px');
				nextThumbBtn.css('left', componentPlaylist.width()/2 + thumbHolderSize/2 +thumbBtnOffset + 'px');
			}else{
				if(fixThumbsSide == 'left'){
					_thumbHolder.css('left', fixThumbsValue + 'px');
					prevThumbBtn.css(fixThumbsSide, parseInt(_thumbHolder.css('left'),10) - prevThumbBtn.width()-thumbBtnOffset + 'px');
					nextThumbBtn.css(fixThumbsSide, parseInt(_thumbHolder.css('left'),10) + thumbHolderSize +thumbBtnOffset + 'px');
				}else{//right
					_thumbHolder.css('right', fixThumbsValue + 'px');
					//reverse buttons
					nextThumbBtn.css(fixThumbsSide, parseInt(_thumbHolder.css('left'),10) - prevThumbBtn.width()-thumbBtnOffset + 'px');
					prevThumbBtn.css(fixThumbsSide, parseInt(_thumbHolder.css('left'),10) + thumbHolderSize +thumbBtnOffset + 'px');
				}
			}
			prevThumbBtn.css('top', parseInt(_thumbHolder.css('top'),10)+thumbHeight/2-prevThumbBtn.height()/2 +'px');
			nextThumbBtn.css('top', parseInt(_thumbHolder.css('top'),10)+thumbHeight/2-nextThumbBtn.height()/2 +'px');
			
		}else{//vertical
			if(!fixThumbs){
				_thumbHolder.css('top', componentPlaylist.height()/2 - thumbHolderSize/2 + 'px');
				prevThumbBtn.css('top', componentPlaylist.height()/2 - thumbHolderSize/2 - prevThumbBtn.height()-thumbBtnOffset + 'px');
				nextThumbBtn.css('top', componentPlaylist.height()/2 + thumbHolderSize/2 +thumbBtnOffset + 'px');
			}else{
				if(fixThumbsSide == 'top'){
					_thumbHolder.css('top', fixThumbsValue + 'px');
					prevThumbBtn.css('top', parseInt(_thumbHolder.css('top'),10) - prevThumbBtn.height()-thumbBtnOffset + 'px');
					nextThumbBtn.css('top', parseInt(_thumbHolder.css('top'),10) + thumbHolderSize +thumbBtnOffset + 'px');
				}else{//bottom
					_thumbHolder.css('bottom', fixThumbsValue + 'px');
					//reverse buttons
					nextThumbBtn.css('bottom', parseInt(_thumbHolder.css('bottom'),10) - prevThumbBtn.height()-thumbBtnOffset + 'px');
					prevThumbBtn.css('bottom', parseInt(_thumbHolder.css('bottom'),10) + thumbHolderSize +thumbBtnOffset + 'px');
				}
			}
			prevThumbBtn.css('left', parseInt(_thumbHolder.css('left'),10)+thumbWidth/2-prevThumbBtn.width()/2 +'px');
			nextThumbBtn.css('left', parseInt(_thumbHolder.css('left'),10)+thumbWidth/2-prevThumbBtn.width()/2 +'px');
		}
	}
	
	function togglePlaylist(){
		//console.log('togglePlaylist');
		if(playlistHidden) return;
		var ease='easeOutQuint',time=500, value;
		if(playlistPosition == 'top'){
			if(playlistOpened){
				value = - componentPlaylist.height() + 'px';
			}else{
				value = 0+'px';
			}
			componentPlaylist.stop().animate({'top': value},{duration: time, easing: ease});
		}else if(playlistPosition == 'bottom'){
			if(playlistOpened){
				value = getComponentSize('h') + 'px';
			}else{
				value = getComponentSize('h') - componentPlaylist.height() + 'px';
			}
			componentPlaylist.stop().animate({'top': value},{duration: time, easing: ease});
		}else if(playlistPosition == 'left'){
			if(playlistOpened){
				value = - componentPlaylist.width() + 'px';
			}else{
				value = 0+'px';
			}
			componentPlaylist.stop().animate({'left': value},{duration: time, easing: ease});
		}else if(playlistPosition == 'right'){
			side='left';
			if(playlistOpened){
				value = getComponentSize('w') + 'px';
			}else{
				value = getComponentSize('w') - componentPlaylist.width() + 'px';
			}
			componentPlaylist.stop().animate({'left': value},{duration: time, easing: ease});
		}
		//playlist toggle btn
		if(!playlistOpened){
			playlistToggleSrc.attr('src', 'data/icons/minus.png');
			playlistOpened=true;
		}else{
			playlistToggleSrc.attr('src', 'data/icons/plus.png');
			playlistOpened=false;
		}
	}
	
	function positionPlaylistHolder(){
		//console.log('positionPlaylistHolder');
		if(playlistPosition == 'top'){
			
			if(playlistIndex=='inside'){
				if(playlistOpened){
					componentPlaylist.css('top',0+'px');
				}else{
					componentPlaylist.css('top', - componentPlaylist.height() + 'px');
				}
			}else{
				componentPlaylist.css('top',0+'px');
				componentHolder.css('top', componentPlaylist.height() + 'px');
			}
			
		}else if(playlistPosition == 'bottom'){
			
			if(playlistIndex=='inside'){
				if(playlistOpened){
					componentPlaylist.css('top', getComponentSize('h') - componentPlaylist.height() + 'px');
				}else{
					componentPlaylist.css('top', getComponentSize('h') + 'px');
				}
			}else{
				//componentPlaylist.css('top', getComponentSize('h') + 'px');
			}
			
		}else if(playlistPosition == 'left'){
			
			if(playlistIndex=='inside'){
				if(playlistOpened){
					componentPlaylist.css('left',0+'px');
				}else{
					componentPlaylist.css('left', -componentPlaylist.width() + 'px');
				}
			}else{
				componentPlaylist.css('left',0+'px');
				componentHolder.css('left', componentPlaylist.width() + 'px');
			}
			
		}else if(playlistPosition == 'right'){
			
			if(playlistIndex=='inside'){
				if(playlistOpened){
					componentPlaylist.css('left', getComponentSize('w')-componentPlaylist.width() + 'px');
				}else{
					componentPlaylist.css('left', getComponentSize('w') + 'px');
				}
			}else{
				componentPlaylist.css('left', getComponentSize('w') + 'px');//width of the playlist is already deducted in getComponentSize
			}
			
		}
	}
	
	function togglePlaylistControls(e){
		//console.log('togglePlaylistControls');
		if(!componentInited || playlistTransitionOn) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('data-id');
		
		if(id == 'prevThumbBtn'){
			if(playlistCounter == 0) return;
			playlistTransitionOn=true;
			playlistCounter -= currentlyVisibleThumbs;
		}else if(id == 'nextThumbBtn'){
			if(playlistCounter == _playlistLength - currentlyVisibleThumbs) return;
			playlistTransitionOn=true;
			playlistCounter += currentlyVisibleThumbs;
		}
		positionPlaylistThumb();
		
		return false;
	}
	
	function positionPlaylistThumb(){
		
		if(playlistCounter < 0) playlistCounter = 0;//restrain
		if(playlistCounter > _playlistLength - 1) playlistCounter = _playlistLength - 1;//restrain
		if(playlistCounter > _playlistLength - currentlyVisibleThumbs) playlistCounter = _playlistLength - currentlyVisibleThumbs;
		
		var newPos;
		if(thumbOrientatation=='horizontal'){
			newPos = playlistCounter * thumbWidth + (playlistCounter*thumbSpacing);
			//console.log(newPos);
			thumbWrapper.stop().animate({ 'left': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkPlaylistControls();
			}});
		}else{
			newPos = playlistCounter * thumbHeight + (playlistCounter*thumbSpacing);
			//console.log(newPos);
			thumbWrapper.stop().animate({ 'top': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkPlaylistControls();
			}});
		}
	}
	
	function checkPlaylistControls(){
		if(_playlistLength <= currentlyVisibleThumbs){
			prevThumbBtn.css('display', 'none');
			nextThumbBtn.css('display', 'none');
			return;
		}else{
			prevThumbBtn.css('display', 'block');
			nextThumbBtn.css('display', 'block');
		}
		
		if(playlistCounter == 0){
			prevThumbBtn.css('cursor', 'default');
			prevThumbBtn.css('opacity', thumbBtnOffOpacity);
		}else{
			prevThumbBtn.css('cursor', 'pointer');
			prevThumbBtn.css('opacity', 1);
		}
		
		if(playlistCounter + currentlyVisibleThumbs == _playlistLength){
			nextThumbBtn.css('cursor', 'default');
			nextThumbBtn.css('opacity', thumbBtnOffOpacity);
		}else{
			nextThumbBtn.css('cursor', 'pointer');
			nextThumbBtn.css('opacity', 1);
		}
		
		playlistTransitionOn=false;
	}
	
	
	//******************************* MENU ****************************//
	
	function makeMenu(){
		
		//MENU CONTROLS
		prevMenuBtn = componentWrapper.find('.prevMenuBtn');
		prevMenuBtn.css('display', 'none');
		prevMenuBtn.css('cursor', 'pointer');
		prevMenuBtn.attr('data-id', 'prevMenuBtn');
		prevMenuBtn.bind('click touchstart', toggleMenuControls);
		
		nextMenuBtn = componentWrapper.find('.nextMenuBtn');
		nextMenuBtn.css('display', 'none');
		nextMenuBtn.css('cursor', 'pointer');
		nextMenuBtn.attr('data-id', 'nextMenuBtn');
		nextMenuBtn.bind('click touchstart', toggleMenuControls);
		
		//get menu spacing
		var d = $('<div/>').addClass('menu_item').appendTo(menuWrapper);
		if(menuOrientatation=='horizontal'){
			menuSpacing = parseInt(d.css('marginRight'),10);
		}else{
			menuSpacing = parseInt(d.css('marginBottom'),10);
		}
		//console.log(menuSpacing);
		
		//build menu
		var m=0,menuItem,menuPosition=0,fontMeasure = componentWrapper.find('.fontMeasure');
		
		//find max menu item width and height during creation
		for(m;m<categoryLength;m++){
			menuItem = $('<div/>').html(categoryTitleArr[m]).addClass('menu_item').appendTo(fontMeasure);
			if(menuOrientatation=='horizontal'){
				menuItem.css('left', menuPosition + (m*menuSpacing) + 'px');
				menuItem.css('top', 0);
				menuPosition += menuItem.width();
				menuItemSizeArr.push(menuItem.outerWidth());
				menuItemPositionArr.push(parseInt(menuItem.css('left'),10));
			}else{
				menuItem.css('top', menuPosition + (m*menuSpacing) + 'px');
				menuItem.css('left', 0);
				menuPosition += menuItem.height();
				menuItemSizeArr.push(menuItem.outerHeight());
				menuItemPositionArr.push(parseInt(menuItem.css('top'),10));
			}
			menuItem.css('width', menuItem.width()+1 + 'px');
			if(maxMenuItemHeight<menuItem.height()) maxMenuItemHeight=menuItem.height();//find max height
			if(maxMenuItemWidth<menuItem.width()) maxMenuItemWidth=menuItem.width();//find max width
			menuItem.appendTo(menuWrapper);
			menuItem.attr('data-id', m);
			menuItem.bind('click touchstart', clickMenuItem);
			menuItem.bind('mouseover', overMenuItem);
			menuItem.bind('mouseout', outMenuItem);
			menuItem.css('cursor', 'pointer');
			menuItem.css('opacity', menuItemOffOpacity);
			menuItemArr.push(menuItem);
		}
		m=0;
		for(m;m<categoryLength;m++){
			menuItem = menuItemArr[m];
			//menuItem.css('width', maxMenuItemWidth + 1 + 'px');
		}
		preventSelect(menuItemArr);
		
		//only once alignment
		if(menuOrientatation=='horizontal'){
			_menuHolder.css('height', maxMenuItemHeight+'px');
			menuSize=parseInt(_menuHolder.css('height'),10);
		}else{//vertical
			_menuHolder.css('width', maxMenuItemWidth+'px');
			menuSize=parseInt(_menuHolder.css('width'),10);
		}
		fontMeasure.remove();//clean
	}
	
	function clickMenuItem(e){
		if(!componentInited) return;
		if(categoryTransitionOn) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');
	
		if(id == activeCategory) return;//active item
		categoryTransitionOn=true;
		enableActiveMenuItem();
		activeCategory = id;
		
		if(useDeeplink){
			$.address.value(findAddress2(0));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			cleanCategory();
		}

		return false;
	}
	
	function overMenuItem(e){
		if(!componentInited) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');
		
		currentTarget.css('opacity',1);

		return false;
	}
	
	function outMenuItem(e){
		if(!componentInited) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');
		if(id == activeCategory) return;//active item
		
		currentTarget.css('opacity',menuItemOffOpacity);

		return false;
	}
	
	function enableActiveMenuItem(){
		//console.log('enableActiveMenuItem');
		if(lastActiveMenuItem){ 
			lastActiveMenuItem.css('cursor', 'pointer');
			lastActiveMenuItem.css('opacity',menuItemOffOpacity);
		}
	}
	
	function disableActiveMenuItem(){
		//console.log('disableActiveMenuItem', activeCategory);
		var menuItem=menuItemArr[activeCategory];
		if(menuItem){
			menuItem.css('cursor', 'default');
			menuItem.css('opacity',1);
			lastActiveMenuItem = menuItem;
		}
	}
	
	function getCurrentMenuSize(startItem, endItem){
		var temp=0;
		for(startItem; startItem< endItem;startItem++){
			temp+=menuItemSizeArr[startItem]+menuSpacing;	
		}
		temp-=menuSpacing;//remove last menu spacing
		return temp;
	}
	
	function calculateMenuLeft(){
		//console.log('calculateMenuLeft');
		var measureSize;
		if(menuOrientatation=='horizontal'){
			measureSize=getComponentSize('w') - menuBtnBuffer;
		}else{
			measureSize=getComponentSize('h') - menuBtnBuffer;
		}
		//console.log('measureSize=', measureSize);
		//console.log('menuCounter=', menuCounter);
	
		var currentSize=0;
		var endItem=menuCounter;
		startItem=menuCounter;//count backwards
		var doLast=true;
		
		outer: while(currentSize < measureSize) {
			startItem--;
			if(!maxVisibleMenuItems && endItem-startItem > visibleMenuItems){
				 startItem = endItem-visibleMenuItems;
				 doLast = false;//no need to remove last item that broke while condition because we cut it here
				 currentSize = getCurrentMenuSize(startItem, endItem);
				 break outer;
			}
			if(startItem < 0){
				 startItem = 0;
				 doLast = false;
				 currentSize = getCurrentMenuSize(startItem, endItem);
				 //check if fit more than we have since we hit boundary (go upwards in the case)
				 
				 var doLast2=true;
				 while(currentSize < measureSize) {
					 endItem++;
					 if(!maxVisibleMenuItems && endItem > visibleMenuItems){//start item is now 0 (zero)
						 endItem = visibleMenuItems;
						 doLast2 = false;//no need to remove last item that broke while condition because we cut it here
						 currentSize = getCurrentMenuSize(0, endItem);
						 break outer;
					 }
					 if(endItem > categoryLength){
						 endItem = categoryLength;
						 doLast2 = false;
						 currentSize = getCurrentMenuSize(0, endItem);
						 break outer;
					 }
					 currentSize = getCurrentMenuSize(0, endItem);
				 }
				 if(doLast2){
					endItem--;//remove last item that broke while condition
					currentSize = getCurrentMenuSize(startItem, endItem);//recalculate
				 }
				 break outer;
			}
			currentSize = getCurrentMenuSize(startItem, endItem);
		
		}
		if(doLast){
			startItem++;//remove last item that broke while condition
			currentSize = getCurrentMenuSize(startItem, endItem);//recalculate
		}
		
		var newPos= menuItemPositionArr[startItem];
		if(menuOrientatation=='horizontal'){
			menuHolderSize = currentSize;
			_menuHolder.css('width', menuHolderSize + 'px');//set new size
			if(!fixMenu){
				_menuHolder.css('left', componentPlaylist.width()/2 - menuHolderSize/2 + 'px');
			}else{
				_menuHolder.css(fixMenuSide, fixMenuValue + 'px');
			}
			menuWrapper.stop().animate({ 'left': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}else{
			menuHolderSize = currentSize;
			_menuHolder.css('height', menuHolderSize + 'px');//set new size
			if(!fixMenu){
				_menuHolder.css('top', componentPlaylist.height()/2 - menuHolderSize/2 + 'px');
			}else{
				_menuHolder.css(fixMenuSide, fixMenuValue + 'px');
			}
			menuWrapper.stop().animate({ 'top': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}
		
		currentlyVisibleMenuItems = endItem-startItem;
		//console.log('currentlyVisibleMenuItems=', currentlyVisibleMenuItems);
		positionMenuBtns();
	}	
		
	function getMenuHolderSize(){
		//console.log('getMenuHolderSize');
		var measureSize;
		if(menuOrientatation=='horizontal'){
			measureSize=getComponentSize('w') - menuBtnBuffer;
		}else{
			measureSize=getComponentSize('h') - menuBtnBuffer;
		}
		//console.log('measureSize=', measureSize);
		//console.log('menuCounter=', menuCounter);
		//console.log('visibleMenuItems=', visibleMenuItems);
	
		var currentSize=0;
		var endItem=menuCounter;
		var doLast=true;
		
		outer: while(currentSize < measureSize) {
			endItem++;
			if(!maxVisibleMenuItems && endItem-menuCounter > visibleMenuItems){
				 endItem = menuCounter+visibleMenuItems;
				 doLast = false;//no need to remove last item that broke while condition because we cut it here
				 currentSize = getCurrentMenuSize(menuCounter, endItem);
				 break outer;
			}
			if(endItem > categoryLength){
				 endItem = categoryLength;
				 doLast = false;
				 currentSize = getCurrentMenuSize(menuCounter, endItem);
				 //console.log('currentSize=', currentSize);
				 //check if fit more than we have since we hit boundary (go downwards in the case)
				 
				 var doLast2=true;
				 while(currentSize < measureSize) {
					 menuCounter--;
					 if(!maxVisibleMenuItems && endItem-menuCounter > visibleMenuItems){
						 menuCounter = endItem-visibleMenuItems;
						 doLast2 = false;//no need to remove last item that broke while condition because we cut it here
						 currentSize = getCurrentMenuSize(menuCounter, categoryLength);
						 break outer;
					 }
					 if(menuCounter < 0){
						 menuCounter = 0;
						 doLast2 = false;
						 currentSize = getCurrentMenuSize(0, categoryLength);
						 break outer;
					 }
					 currentSize = getCurrentMenuSize(menuCounter, categoryLength);
				 }
				 if(doLast2){
					menuCounter++;//remove last item that broke while condition
					currentSize = getCurrentMenuSize(menuCounter, endItem);//recalculate
				 }
				 break outer;
			}
			currentSize = getCurrentMenuSize(menuCounter, endItem);
			//console.log('currentSize=', currentSize);
			
		}
		if(doLast){
			endItem--;//remove last item that broke while condition
			currentSize = getCurrentMenuSize(menuCounter, endItem);//recalculate
		}
		
		var newPos= menuItemPositionArr[menuCounter];
		
		currentlyVisibleMenuItems = endItem-menuCounter;
		//console.log('currentlyVisibleMenuItems=', currentlyVisibleMenuItems);	
		if(menuOrientatation=='horizontal'){
			menuHolderSize = currentSize;
			_menuHolder.css('width', menuHolderSize + 'px');//set new size
			if(!fixMenu){
				_menuHolder.css('left', componentPlaylist.width()/2 - menuHolderSize/2 + 'px');
			}else{
				_menuHolder.css(fixMenuSide, fixMenuValue + 'px');
			}
			menuWrapper.stop().animate({ 'left': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}else{
			menuHolderSize = currentSize;
			_menuHolder.css('height', menuHolderSize + 'px');//set new size
			if(!fixMenu){
				_menuHolder.css('top', componentPlaylist.height()/2 - menuHolderSize/2 + 'px');
			}else{
				_menuHolder.css(fixMenuSide, fixMenuValue + 'px');
			}
			menuWrapper.stop().animate({ 'top': -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}
		positionMenuBtns();
	}	
	
	function positionMenuBtns(){
		//console.log('positionMenuBtns');
		if(menuOrientatation=='horizontal'){
			prevMenuBtn.css('top',  parseInt(_menuHolder.css('top'),10) +maxMenuItemHeight/2-prevMenuBtn.height()/2 +'px');
			nextMenuBtn.css('top',  parseInt(_menuHolder.css('top'),10) +maxMenuItemHeight/2-prevMenuBtn.height()/2 +'px');
			if(!fixMenu){
				prevMenuBtn.css('left', componentPlaylist.width()/2 - menuHolderSize/2 - prevMenuBtn.width()-menuBtnOffset + 'px');
				nextMenuBtn.css('left', componentPlaylist.width()/2 + menuHolderSize/2 + menuBtnOffset + 'px');
			}else{
				if(fixMenuSide=='left'){
					prevMenuBtn.css(fixMenuSide, fixMenuValue - prevMenuBtn.width()-menuBtnOffset + 'px');
					nextMenuBtn.css(fixMenuSide, fixMenuValue + parseInt(_menuHolder.css('width'),10) + menuBtnOffset + 'px');
				}else{
					//reverse assignment for right
					nextMenuBtn.css(fixMenuSide, fixMenuValue - prevMenuBtn.width()-menuBtnOffset + 'px');
					prevMenuBtn.css(fixMenuSide, fixMenuValue + parseInt(_menuHolder.css('width'),10) + menuBtnOffset + 'px');
				}
			}
		}else{
			prevMenuBtn.css('left',  parseInt(_menuHolder.css('left'),10) +maxMenuItemWidth/2-prevMenuBtn.width()/2 +'px');
			nextMenuBtn.css('left',  parseInt(_menuHolder.css('left'),10) +maxMenuItemWidth/2-prevMenuBtn.width()/2 +'px');
			if(!fixMenu){
				prevMenuBtn.css('top', componentPlaylist.height()/2 - menuHolderSize/2 - prevMenuBtn.height()-menuBtnOffset + 'px');
				nextMenuBtn.css('top', componentPlaylist.height()/2 + menuHolderSize/2 + menuBtnOffset + 'px');
			}else{
				if(fixMenuSide=='top'){
					prevMenuBtn.css(fixMenuSide, fixMenuValue - prevMenuBtn.height()-menuBtnOffset + 'px');
					nextMenuBtn.css(fixMenuSide, fixMenuValue + parseInt(_menuHolder.css('height'),10) + menuBtnOffset + 'px');
				}else{
					//reverse assignment for bottom
					nextMenuBtn.css(fixMenuSide, fixMenuValue - prevMenuBtn.height()-menuBtnOffset + 'px');
					prevMenuBtn.css(fixMenuSide, fixMenuValue + parseInt(_menuHolder.css('height'),10) + menuBtnOffset + 'px');
				}
			}
		}
	}
	
	function toggleMenuControls(e){
		//console.log('toggleMenuControls');
		if(!componentInited || menuTransitionOn) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('data-id');
		
		if(id == 'prevMenuBtn'){
			if(menuCounter == 0) return;
			//console.log('prev click');
			menuTransitionOn=true;
			calculateMenuLeft();
			menuCounter=startItem;
			if(menuCounter<0) menuCounter = 0;
		}else if(id == 'nextMenuBtn'){
			if(menuCounter == categoryLength - currentlyVisibleMenuItems) return;
			//console.log('next click');
			menuTransitionOn=true;
			menuCounter += currentlyVisibleMenuItems;
			if(menuCounter>categoryLength-1) menuCounter = categoryLength-1;
			getMenuHolderSize();
		}
		return false;
	}
	
	function positionMenuItem(){
		
		if(menuCounter<0) menuCounter = 0;
		if(menuCounter>categoryLength-1) menuCounter = categoryLength-1;
		if(menuCounter > categoryLength - currentlyVisibleMenuItems) menuCounter = categoryLength - currentlyVisibleMenuItems;
		
		var newPos= menuItemPositionArr[menuCounter];
		if(!newPos) return;
		//console.log(newPos);
		if(menuOrientatation=='horizontal'){
			menuWrapper.stop().animate({ left: -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}else{
			menuWrapper.stop().animate({ top: -newPos + 'px'},  {duration: 500, easing: 'easeOutQuint', complete: function(){
				checkMenuControls();
			}});
		}
	}
	
	function checkMenuControls(){
		//console.log('checkMenuControls ', menuCounter, currentlyVisibleMenuItems);
		if(categoryLength <= currentlyVisibleMenuItems){
			prevMenuBtn.css('display', 'none');
			nextMenuBtn.css('display', 'none');
			return;
		}else{
			prevMenuBtn.css('display', 'block');
			nextMenuBtn.css('display', 'block');
		}
		
		if(menuCounter == 0){
			prevMenuBtn.css('cursor', 'default');
			prevMenuBtn.css('opacity', menuBtnOffOpacity);
		}else{
			prevMenuBtn.css('cursor', 'pointer');
			prevMenuBtn.css('opacity', 1);
		}
		
		if(menuCounter + currentlyVisibleMenuItems == categoryLength){
			nextMenuBtn.css('cursor', 'default');
			nextMenuBtn.css('opacity', menuBtnOffOpacity);
		}else{
			nextMenuBtn.css('cursor', 'pointer');
			nextMenuBtn.css('opacity', 1);
		}
		menuTransitionOn=false;
	}
	
	//******************** CHATEGORY CHANGE ************************ //
	
	function cleanCategory(){
		//console.log('cleanCategory');
		if(transitionFinishIntervalID) clearInterval(transitionFinishIntervalID);
		if(swfAddressTimeoutID) clearTimeout(swfAddressTimeoutID);
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(loadRequestIntervalID) clearInterval(loadRequestIntervalID);
		mediaUnloadedAction();
		
		if(lastActiveThumb){
			lastActiveThumb.find('a').css('cursor', 'pointer');
			lastActiveThumb.css('opacity', thumbOffOpacity);
			lastActiveThumb=null;
		} 
		enableActiveMenuItem();
		
		var i = 0, thumb;
		for(i;i<_playlistLength;i++){
			thumb = $(thumbArr[i]);
			if(thumb){
				thumb.unbind('click touchstart', clickThumb);
				thumb.unbind('mouseover', overThumb);
				thumb.unbind('mouseout', outThumb);
			}
		}
		thumbArr=[];
		
		if(thumbOrientatation=='horizontal'){
			thumbWrapper.css('left', 0+'px');
		}else{//vertical
			thumbWrapper.css('top', 0+'px');
		}
		
		if(currentData)currentData.css('display','none');
		
		_holder1.stop().empty();
		_holder2.stop().empty();
		_holder1.css({
			zIndex:0,
			opacity:1,
			background:'none',
			overflow:'visible',
			display:'none'
		
		});
		_holder2.css({
			zIndex:1,
			opacity:1,
			background:'none',
			overflow:'visible',
			display:'none'
		
		});
		componentHolder.css('background', 'none');
		
		categoryTransitionOn=false;
		
		getCategoryData();
		
		if(!stuffInited){
			positionPlaylistHolder();
			getThumbHolderSize();
			
			if(!singleCategory){
				makeMenu();
				getMenuHolderSize();
				disableActiveMenuItem();
			}
			
			if(!playlistHidden){
				componentPlaylist.css('display','block');
			}
			
			if(playlistIndex == 'inside' && autoOpenPlaylist){
				togglePlaylist();
			}
			
			stuffInited=true;
		}else{
			
			positionPlaylistHolder();
			getThumbHolderSize();
		}
		
		if(!singleCategory) getMenuHolderSize();
		
		if(!useDeeplink){
			if(noDeeplinkSet){
				_counter=0;
				
			}
			noDeeplinkSet=true;	
			checkMedia(getCounter());
		}
	}
	
	function getCategoryData(){
		//reset
		currentCategory = activeCategory; 
		
		playlistCounter=0;
		transitionIntroHappened=false;
		loadRequestPause = false;
		kenBurnsTransitionOn=false;
		categoryDataArr=[];
		lastActiveThumb=null;
		
		currentData=$(dataArr[activeCategory]);
		currentData.css('display','block');
		categoryDataArr=currentData.find('ul').children('li');
		
		thumbWidth = categoryDataArr.outerWidth();
		thumbHeight = categoryDataArr.outerHeight();
		//console.log(thumbWidth, thumbHeight);
		
		//set thumbholder size based on thumb size
		if(thumbOrientatation=='horizontal'){
			_thumbHolder.css('height',thumbHeight+'px');
			thumbSpacing = parseInt($(categoryDataArr[0]).css('marginRight'),10);
		}else{
			_thumbHolder.css('width',thumbWidth+'px');
			thumbSpacing = parseInt($(categoryDataArr[0]).css('marginBottom'),10);	
		}
		
		//console.log(thumbSpacing);
		
		//set playlist size
		var playlistSize = parseInt(currentData.attr('data-playlistSize'),10);
		//console.log(playlistSize);
		if(playlistPosition=='left' || playlistPosition=='right'){
			componentPlaylist.css('width',playlistSize+'px');
		}else{
			componentPlaylist.css('height',playlistSize+'px');
		}
		
		//console.log(categoryDataArr);
		_playlistLength=categoryDataArr.length;
		if(visibleThumbs>_playlistLength) visibleThumbs=_playlistLength;
		if(_randomPlay) makeRandomList();
		
		_transitionType = (currentData.attr('data-transitionType')).toUpperCase();
		if(_transitionType != 'SLIDE' && _transitionType != 'SPLIT' && _transitionType != 'REVEAL' && _transitionType != 'KEN_BURNS' && _transitionType != 'ALPHA' && _transitionType != 'ZOOM'){
			alert('Invalid transitionType on category number: ' + activeCategory);
			_transitionType == 'ALPHA';//reserve
		}
		
		if(_transitionType != 'KEN_BURNS'){
		
			var fitMode = currentData.attr('data-imageFitMode');
			if(fitMode != 'fit-inside' && fitMode != 'fit-outside'){
				alert("Invalid imageFitMode on category number: " + activeCategory);
				fitMode == 'fit-outside';//reserve
			}else{
				fitMode == 'fit-inside' ? imageFitMode = true : imageFitMode = false;
			}
			getSlideshowDelay();
			transitionEase = currentData.attr('data-transitionEase');
			transitionTime = parseInt(currentData.attr('data-transitionTime'), 10);
		
		}
		
		//fix, otherwise last visible thumb falls into new line because of border right
		if(thumbOrientatation=='horizontal'){
			var s = _playlistLength*thumbWidth + (_playlistLength-1)*thumbSpacing;
			thumbWrapper.css('width', s+'px');
		}
		
		componentBgColor = currentData.attr('data-bgColor');
		//console.log(_playlistLength, _transitionType, imageFitMode);
		
		getThumbPlaylist();
		
		if(activeCategory >= menuCounter && activeCategory <= menuCounter + currentlyVisibleMenuItems - 1){
			//console.log(i, activeCategory);//dont change thumb position thumb click
		}else{
			menuCounter = activeCategory;
			positionMenuItem();
		}
		disableActiveMenuItem();
	}
	
	function getThumbPlaylist(){
		//console.log('getThumbPlaylist');
		var i = 0,thumb;
		for(i; i<_playlistLength;i++){
			thumb = $(categoryDataArr[i]);
			//console.log(thumb);
			thumb.attr('data-id', i);
			thumb.css('opacity', thumbOffOpacity);
			thumb.bind('click touchstart', clickThumb);
			thumb.bind('mouseover', overThumb);
			thumb.bind('mouseout', outThumb);
			thumbArr.push(thumb);
			//console.log(i, thumb.css('marginRight'));
		}
	}
	
	function clickThumb(e){
		if(!componentInited || loadRequestPause) return false;
		if(_transitionType != 'KEN_BURNS' && transitionOn) return false;
		//console.log('clickThumb');
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');
		
		if(id == getCounter())return false;//active thumb
		_thumbClick=true;
		
		mediaUnloadedAction();
		enableActiveThumb();
		_counter=id;
		
		if(useDeeplink){
			$.address.value(findAddress2(getCounter()));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			triggerMedia();	
		} 
		
		return false;
	}
	
	function overThumb(e){
		if(!componentInited) return false;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');

		currentTarget.css('opacity',1);
		
		return false;
	}
	
	function outThumb(e){
		if(!componentInited) return false;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = $(e.currentTarget);
		var id = currentTarget.attr('data-id');
		if(id == getCounter())return false;//active thumb

		currentTarget.css('opacity',thumbOffOpacity);
		
		return false;
	}
	
	function enableActiveThumb(){
		//console.log('enableActiveThumb');
		if(lastActiveThumb){
			lastActiveThumb.find('a').css('cursor', 'pointer');
			lastActiveThumb.css('opacity', thumbOffOpacity);
		} 
	}
	
	function disableActiveThumb(){
		//console.log('disableActiveThumb');
		var thumb=thumbArr[getCounter()];
		if(thumb){
			thumb.find('a').css('cursor', 'default');
			thumb.css('opacity', 1);
			lastActiveThumb = thumb;
		}
		//position thumb playlist on active thumb
		var i = getCounter();
		if(i >= playlistCounter && i <= playlistCounter + currentlyVisibleThumbs - 1){
			//console.log(i, playlistCounter);//dont change thumb position thumb click
		}else{
			playlistCounter = i;
			positionPlaylistThumb();
		}
	}
	
	//**************** IMAGE LOADING PROCESS *************/	
	
	function loadImage(i){
		if(categoryTransitionOn) return;
		_mediaLoadOn=true;
		var img;
		var imageUrl;
		var data = $(categoryDataArr[i]);
		var imgLoaded;
		var id;
		var mainArr = mediaObj[activeCategory].main;
		
		img =$(new Image());
		img.attr('id', i);
		img.css('top', 0);
		img.css('left', 0);
		img.css('display', 'block');
		
		if( _transitionType=='SLIDE' || _transitionType=='SPLIT' || _transitionType=='REVEAL' ){
			img.css('position', 'absolute');
		}else if( _transitionType=='KEN_BURNS' || _transitionType=='ALPHA'  || _transitionType=='ZOOM' ){
			img.css('position', 'relative');
			img.css('width', 100 + '%');
			img.css('height', 100 + '%');
		}
	
		imageUrl = data.attr('data-imagePath')+"?rand=" + (Math.random() * 99999999);
		//console.log(imageUrl);
			
		img.load(function() {
			
			imgLoaded = $(this);
			id = imgLoaded.attr('id');
				
			this.origWidth = this.width;
			this.origHeight = this.height;
			
			mainArr[id] = imgLoaded;//store loaded image
			//console.log('img loaded ', i);
			_mediaLoadOn=false;
			
			if(loadRequestPause){
				loadRequestPause = false;	
				callTransition();
			}else{
				checkMedia(getCounter());
			}
			componentInited=true;
			
		}).attr('src', imageUrl);
			
		img.error(function(e) {
			//console.log('image load error: ' + e, i);
		});
	}
	
	//find next unloaded image, return url
	function getMainUrl(){
		//console.log('getMainUrl');
		var i=0;
		var found=false;
		var mainArr = mediaObj[activeCategory].main;
		
		if(_randomPlay){
			for(i; i<_playlistLength;i++){
				if(mainArr[_randomArr[i]] == undefined){
					found = true;
					loadImage(_randomArr[i]);
					break;	
				}
			}
		}else{
			for(i; i<_playlistLength;i++){
				if(mainArr[i] == undefined){
					found = true;
					loadImage(i);
					break;	
				}
			}
		}
	}
	
	function loadRequest(){
		loadRequestPause = true;
		//check if loading is in process
		if(_mediaLoadOn){
			if(loadRequestIntervalID) clearInterval(loadRequestIntervalID);
			loadRequestIntervalID = setInterval(waitCurrentLoad, loadRequestInterval);
		}else{
			loadImage(getCounter());
		}
	}
	
	function waitCurrentLoad(){
		if(!_mediaLoadOn){//wait for current load to finish
			if(loadRequestIntervalID) clearInterval(loadRequestIntervalID);
			if(mainArr[getCounter()]){//wanted media was loading, we have it now
				loadRequestPause = false;
				callTransition();
			}else{//load requested
				loadImage(getCounter());
			}
		}
	}
	
	
	//**************** TRANSITIONS *************/
	
	function callTransition(){
		//console.log('callTransition');
		switch( _transitionType){
			case 'SLIDE':
				transitionSlide();
			break;	
			case 'SPLIT':
				transitionSplit();
			break;
			case 'REVEAL':
				transitionReveal();
			break;
			case 'KEN_BURNS':
				transitionKenBurns();	
			break;
			case 'ALPHA':
				transitionAlpha();
			break;
			case 'ZOOM':
				transitionZoom();
			break;
		}
	}
	
	//**************** SLIDE *************/
	
	function transitionSlide(){
		//console.log('transitionSlide');
		 transitionOn = true;
		 
		 var mainArr = mediaObj[activeCategory].main;
		 if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var currentHolder = getEmptyHolder(true);
		 currentHolder.css('display', 'block');
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		if(componentBgColor != undefined){
			_holder1.css('background', componentBgColor);
			_holder2.css('background', componentBgColor);
		}
		checkLink([content]);	
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
			 
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('overflow', 'hidden');
		
		hidePreloader();
		
		if(transitionIntroHappened){
			
			_slideCase = getRandomNotLast( _slideCaseArr );
			//console.log(_slideCase);
			
			positionForSlideIn(currentHolder);
			currentHolder.append(content);
			var otherHolder = getOtherHolder(currentHolder);
			executeSlide( currentHolder, otherHolder );//inTarget, outTarget
		}else{
			currentHolder.css('left', 0 + 'px');
			currentHolder.css('top', 0 + 'px');
			currentHolder.css('opacity', 0);
			currentHolder.append(content);
			
			currentHolder.stop().animate({ 'opacity': 1},  {duration: _firstImageTime, easing: _firstImageEase, complete: function(){
				transitionEnd();
			}});
		}
		transitionIntroHappened = true;
		 
	 }
	 
	 function positionForSlideIn( target ) {
		switch(_slideCase){
			case "top":
				target.css('left', 0);
				target.css('top', - getComponentSize('h') + 'px');
			break;
			case "left":
				target.css('left', - getComponentSize('w') + 'px');
				target.css('top', 0);
			break;
			case "bottom":
				target.css('left', 0);
				target.css('top', getComponentSize('h') + 'px');
			break;
			case "right":
				target.css('left', getComponentSize('w') + 'px');
				target.css('top', 0);
			break;
		}
	}
	
	function executeSlide( inTarget, outTarget ) {
			
		switch(_slideCase){
			case "top":
				inTarget.stop().animate({ 'top': 0},  {duration: transitionTime, easing: transitionEase});
				outTarget.stop().animate({ 'top': getComponentSize('h')},  {duration: transitionTime, easing: transitionEase, complete: function(){
					transitionEnd(outTarget);
				}});
			break;
			
			case "bottom":
				inTarget.stop().animate({ 'top': 0},  {duration: transitionTime, easing: transitionEase});
				outTarget.stop().animate({ 'top': - getComponentSize('h')},  {duration: transitionTime, easing: transitionEase, complete: function(){
					transitionEnd(outTarget);
				}});
			break;
		
			case "left":
				inTarget.stop().animate({ 'left': 0},  {duration: transitionTime, easing: transitionEase});
				outTarget.stop().animate({ 'left': getComponentSize('w')},  {duration: transitionTime, easing: transitionEase, complete: function(){
					transitionEnd(outTarget);
				}});
			break;
			
			case "right":
				inTarget.stop().animate({ 'left': 0},  {duration: transitionTime, easing: transitionEase});
				outTarget.stop().animate({ 'left': -getComponentSize('w')},  {duration: transitionTime, easing: transitionEase, complete: function(){
					transitionEnd(outTarget);
				}});
			break;
		}
	
	}
	
	//**************** SPLIT *************/
	
	function transitionSplit(){
		 transitionOn = true;
		 
		 var mainArr = mediaObj[activeCategory].main;
		 if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		 	
		 var content2 = content.clone();
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var currentHolder = getEmptyHolder(true);
		 currentHolder.css('display', 'block');
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		checkLink([content, content2]);	
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
		
		content2.css('width', w + 'px');
		content2.css('height', h + 'px');
			 
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('left', 0 + 'px');
		currentHolder.css('top', 0 + 'px');
		currentHolder.css('overflow', 'hidden');
		
		_splitCase = getRandomNotLast( _splitCaseArr );
		//console.log(_splitCase);
		currentHolder.splitCase=_splitCase;//remember split case since we split previous image below current one
		makeSplit(content, content2, currentHolder, w, h);
		
		hidePreloader();
		
		if(transitionIntroHappened){
			var otherHolder = getOtherHolder(currentHolder);
			otherHolder.css('display', 'block');
			swapChildren(otherHolder, currentHolder);
			executeSplit( otherHolder );
		}else{
			currentHolder.css('opacity', 0);
			currentHolder.stop().animate({ 'opacity': 1},  {duration: _firstImageTime, easing: _firstImageEase, complete: function(){
				transitionEnd();
			}});
		}
		transitionIntroHappened = true;
		 
	 }
	 
	 function makeSplit(content, content2, currentHolder, w, h) {
		 
		 var split1;
		 var split2;
		 var cut;
		 
		 if(_splitCase == 'horizontalUpLeft' || _splitCase == 'horizontalUpRight' || _splitCase == 'horizontalSplit'){
			 
			split1 = $("<div/>");
			split1.attr('data-title', 'split1');
			split1.css('background', componentBgColor);
			split1.css('position', 'absolute');
			split1.css('top', 0);
			split1.css('left', 0);
			split1.css('width', getComponentSize('w') + 'px');
			split1.css('height', getComponentSize('h')/2 + 'px');
			split1.css('overflow', 'hidden');
			split1.append(content);
			currentHolder.append(split1);
			
			split2 = $("<div/>");
			split2.attr('data-title', 'split2');
			split2.css('background', componentBgColor);
			split2.css('position', 'absolute');
			split2.css('top', getComponentSize('h')/2 + 'px');
			split2.css('left', 0);
			split2.css('width', getComponentSize('w') + 'px');
			split2.css('height', getComponentSize('h')/2 + 'px');
			split2.css('overflow', 'hidden');
			split2.append(content2);
			currentHolder.append(split2);
			
			cut = (getComponentSize('h') - h) / 2;
			
			//move second image inside
			content2.css('left', getComponentSize('w')/2-w/2 + 'px');
			content2.css('top', -getComponentSize('h')/2+ cut + 'px');
			 
		}else  if(_splitCase == 'verticalUpLeft' || _splitCase == 'verticalDownLeft' || _splitCase == 'verticalSplit'){
			 
			split1 = $("<div/>");
			split1.attr('data-title', 'split1');
			split1.css('background', componentBgColor);
			split1.css('position', 'absolute');
			split1.css('top', 0);
			split1.css('left', 0);
			split1.css('width', getComponentSize('w') /2 + 'px');
			split1.css('height', getComponentSize('h') + 'px');
			split1.css('overflow', 'hidden');
			split1.append(content);
			currentHolder.append(split1);
			
			split2 = $("<div/>");
			split2.attr('data-title', 'split2');
			split2.css('background', componentBgColor);
			split2.css('position', 'absolute');
			split2.css('top', 0);
			split2.css('left', getComponentSize('w') / 2 + 'px');
			split2.css('width', getComponentSize('w') / 2 + 'px');
			split2.css('height', getComponentSize('h') + 'px');
			split2.css('overflow', 'hidden');
			split2.append(content2);
			currentHolder.append(split2);
			
			//move second image inside
			content2.css('left', - w/2 + 'px');
			content2.css('top', getComponentSize('h')/2- h/2 + 'px');
			 
		}
	 }
		
	 function executeSplit(target) {
		 
		 _splitCase = target.splitCase;//get previous split case
		 
		var split1=$(target.children('div[data-title=split1]'));
		var split2=$(target.children('div[data-title=split2]'));
		
		 if(_splitCase == 'horizontalUpLeft'){
			split1.stop().animate({ 'left': - getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'left': getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_splitCase == 'horizontalUpRight'){
			split1.stop().animate({ 'left': getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'left': - getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_splitCase == "horizontalSplit"){
			split1.stop().animate({ 'top': -getComponentSize('h')/2 + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'top': getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_splitCase == "verticalUpLeft"){
			split1.stop().animate({ 'top': - getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'top': getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}	
		else if(_splitCase == "verticalDownLeft"){
			split1.stop().animate({ 'top': getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'top': -getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}	
		else if(_splitCase == "verticalSplit"){
			split1.stop().animate({ 'left': - getComponentSize('w')/2 + 'px'},  {duration: transitionTime, easing: transitionEase});
			split2.stop().animate({ 'left': getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}	
	}
	
	//**************** REVEAL *************/
	
	function transitionReveal(){
		 transitionOn = true;
		 
		 var mainArr = mediaObj[activeCategory].main;
		 if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var currentHolder = getEmptyHolder(true);
		 currentHolder.css('display', 'block');
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		if(componentBgColor != undefined){
			_holder1.css('background', componentBgColor);
			_holder2.css('background', componentBgColor);
		}
		checkLink([content]);
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
			 
		currentHolder.css('overflow', 'hidden');
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('left', 0 + 'px');
		currentHolder.css('top', 0 + 'px');
		
		hidePreloader();
		
		if(transitionIntroHappened){
			_revealCase = getRandomNotLast( _revealCaseArr );
			var otherHolder = getOtherHolder(currentHolder);
			swapChildren(otherHolder, currentHolder);
			currentHolder.append(content);
			executeReveal( otherHolder );//inTarget, outTarget
		}else{
			currentHolder.css('opacity', 0);
			currentHolder.append(content);
			
			currentHolder.stop().animate({ 'opacity': 1},  {duration: _firstImageTime, easing: _firstImageEase, complete: function(){
				transitionEnd();
			}});
		}
		transitionIntroHappened = true;
		 
	 }
		
	 function executeReveal(target) {
		if(_revealCase == "top"){
			target.stop().animate({ 'top': - getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_revealCase == "bottom"){
			target.stop().animate({ 'top':getComponentSize('h') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_revealCase == "right"){
			target.stop().animate({ 'left': getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}
		else if(_revealCase == "left"){
			target.stop().animate({ 'left':- getComponentSize('w') + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(target);
			}});
		}	
	}
	
	//**************** ALPHA *************/
	
	function transitionAlpha(){
		 transitionOn = true;
		 
		 var mainArr = mediaObj[activeCategory].main;
		 if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()][0];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		 
		 var originalWidth = content.origWidth;
		 var originalHeight = content.origHeight;
		 
		 var currentHolder = getEmptyHolder(true);
		 currentHolder.css('display', 'block');
		 currentHolder.css('opacity', 0);
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		if(componentBgColor != undefined) componentHolder.css('background', componentBgColor);
		checkLink([content]);	
			 
		currentHolder.css('width', w + 'px');
		currentHolder.css('height', h + 'px');
		currentHolder.css('left', getComponentSize('w')/2-w/2 + 'px');
		currentHolder.css('top', getComponentSize('h')/2-h/2 + 'px');
		
		currentHolder.append(content);
		
		hidePreloader();
		
		if(transitionIntroHappened){//animate old out
			var otherHolder = getOtherHolder(currentHolder);
			otherHolder.stop().animate({ 'opacity':0},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd(otherHolder);
			}});
			//animate new in	
			currentHolder.stop().animate({ 'opacity': 1},  {duration: transitionTime, easing: transitionEase});
		}else{
			//animate new in	
			currentHolder.stop().animate({ 'opacity': 1},  {duration: transitionTime, easing: transitionEase, complete: function(){
				transitionEnd();
			}});
		}
		
		transitionIntroHappened = true;
	 }
	
	 //**************** ZOOM *************/
	 
	 function transitionZoom(){//zoom in
		 transitionOn = true;
		 
		 var mainArr = mediaObj[activeCategory].main;
		 if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		if(componentBgColor != undefined) componentHolder.css('background', componentBgColor);
		checkLink([content]);
		
		var currentHolder = getEmptyHolder(true);
		currentHolder.css('display', 'block');
		var otherHolder = getOtherHolder(currentHolder);
		swapChildren(currentHolder, otherHolder);
		
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('left', 0);
		currentHolder.css('top', 0);
		currentHolder.css('overflow', 'hidden');
		
		currentHolder.append(content);
		 
		//position randomly
		content.css('left', Math.random() * getComponentSize('w') + 'px');
		content.css('top', Math.random() * getComponentSize('h') + 'px');
		content.css('width', 0 + 'px');
		content.css('height', 0+ 'px');	
		
		hidePreloader();
		
		if(transitionIntroHappened){	
			 content.animate({ 'width': w+ 'px', 'height': h+ 'px', 'left': getComponentSize('w')/2-w/2 + 'px', 'top':getComponentSize('h')/2-h/2 + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				 transitionEnd(otherHolder);
			}});
		}else{
			 content.animate({ 'width': w+ 'px', 'height': h+ 'px', 'left': getComponentSize('w')/2-w/2 + 'px', 'top':getComponentSize('h')/2-h/2 + 'px'},  {duration: transitionTime, easing: transitionEase, complete: function(){
				 transitionEnd();
			}});
		}
		
		transitionIntroHappened=true;
	 }
	 
	 function transitionEnd(otherHolder){
		 //console.log('transitionEnd');
		 if(categoryTransitionOn) return;
		 if(otherHolder){
			 $(otherHolder).empty();
			 otherHolder.css('display', 'none'); 
		 }
		 transitionOn=false;
		
		 mediaLoadedAction();
		 _thumbClick=false;//reset
		 
		 if(slideshowOn){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			slideshowTimeoutID = setTimeout(nextMedia, getSlideshowDelay());
		}
	 }
	
		
	//*************** KEN BURNS **********/
	
	 function transitionKenBurns(){
		//console.log("transitionKenBurns");
		transitionOn=true;
		kenBurnsTransitionOn=true;
		
		var mainArr = mediaObj[activeCategory].main;
		if(mainArr[getCounter()]){
			 var content = mainArr[getCounter()][0];
		 }else{
			//console.log('wait to load');
			showPreloader();
			loadRequest();
			return;
		 }
		
		var originalWidth = content.origWidth;
		var originalHeight = content.origHeight;
		//console.log('originalWidth, originalHeight = ', originalWidth, originalHeight);
		
		var data = $(categoryDataArr[getCounter()]);
		
		var scaleRises = false;
		
		//get data
		var startScale=parseFloat(data.attr('data-startScale')); 
		if(isNaN(startScale) || startScale==0){
			startScale=1;
			//startScale=randomMinMax(0.8,1.8);
		}
		
		var endScale=parseFloat(data.attr('data-endScale')); 
		if(isNaN(endScale) || endScale==0){
			endScale=1.5;
			//endScale=randomMinMax(0.8,1.8);
		}
		
		if(startScale < endScale) scaleRises = true;
		
		var startPosition=(data.attr('data-startPosition')).toLowerCase(); 
		if(isBlank(startPosition) || !matchInArray(startPosition, _kenBurnsPositions)){
			startPosition = getRandomArrayValue(_kenBurnsPositions);
		}
		
		var endPosition=(data.attr('data-endPosition')).toLowerCase(); 
		if(isBlank(endPosition) || !matchInArray(endPosition, _kenBurnsPositions)){
			endPosition = getRandomArrayValue(_kenBurnsPositions);
			while (endPosition == startPosition){//prevent same position, but only on random select in case user wants it
				//console.log(endPosition,startPosition);
				endPosition = getRandomArrayValue(_kenBurnsPositions);
				//console.log(endPosition,startPosition);
			}
		}
		
		var duration= parseFloat(data.attr('data-duration'));
		if(isNaN(duration) || duration==0){
			//data missing, generate your own
			duration=randomMinMax(3,7);
		}
		duration *= 1000;//miliseconds
		
		//console.log('startScale, endScale, startPosition, endPosition, duration = ', startScale, endScale, startPosition, endPosition, duration);
		
		var currentHolder = getEmptyHolder(true);
		currentHolder.css('opacity', 0);
		currentHolder.css('display', 'block');
		
		currentHolder.append(content);
		
		if(componentBgColor != undefined) componentHolder.css('background', componentBgColor);
		checkLink([content]);
		
		/*
		check if content is smaller than component size!
		*/
		
		//simulate scaleX/scaleY
		currentHolder.css('width', originalWidth * startScale + 'px');
		currentHolder.css('height', originalHeight * startScale + 'px');
		
		//read size
		var currentHolderWidth = parseInt(currentHolder.css('width'), 10);
		var currentHolderHeight= parseInt(currentHolder.css('height'), 10);
		
		var enlarger = 1.35;
		
		//check start dimensions, start with width first
		var factor = 0;
		if(currentHolderWidth < getComponentSize('w')){
			factor= getComponentSize('w') / currentHolderWidth;
			if(scaleRises){
				currentHolderWidth = getComponentSize('w');
				currentHolderHeight *= factor;
			}else{
				//if scale is dropping, makes start scale larger
				currentHolderWidth = getComponentSize('w') * enlarger;
				currentHolderHeight *= (factor * enlarger);
			}
			
			//reapply size if changed
			currentHolder.css('width', currentHolderWidth + 'px');
			currentHolder.css('height', currentHolderHeight + 'px');
		}
	
		//read size again
		var currentHolderWidth = parseInt(currentHolder.css('width'), 10);
		var currentHolderHeight= parseInt(currentHolder.css('height'), 10);
		
		//check for height after (possible) width resize
		if(currentHolderHeight < getComponentSize('h')){
			factor= getComponentSize('h') / currentHolderHeight;
			if(scaleRises){
				currentHolderHeight = getComponentSize('h');
				currentHolderWidth *= factor;
			}else{
				currentHolderHeight = getComponentSize('h') * enlarger;
				currentHolderWidth *= (factor * enlarger);
			}
			
			//reapply size if changed
			currentHolder.css('width', currentHolderWidth + 'px');
			currentHolder.css('height', currentHolderHeight + 'px');
		}
		
		var startX;
		var startY;
		var endX;
		var endY;
		
		var startWidth=parseInt(currentHolder.css('width'), 10);
		var startHeight=parseInt(currentHolder.css('height'), 10);
		//console.log('originalWidth, originalHeight, startWidth, startHeight = ', originalWidth, originalHeight, startWidth, startHeight);
		
		//we wont touch start size any more so we can calculate start position
		
		switch (startPosition) {
			case "tl" :
				startX=0;
				startY=0;
				break;
			case "tc" :
				startX=getComponentSize('w')/2 - startWidth/2;
				startY=0;
				break;
			case "tr" :
				startX=getComponentSize('w') - startWidth;
				startY=0;
				break;
			case "ml" :
				startX=0;
				startY=getComponentSize('h')/2 -startHeight/2;
				break;
			case "mc" :
				startX=getComponentSize('w')/2 - startWidth/2;
				startY=getComponentSize('h')/2 -startHeight/2;
				break;
			case "mr" :
				startX=getComponentSize('w') - startWidth;
				startY=getComponentSize('h')/2 -startHeight/2;
				break;
			case "bl" :
				startX=0;
				startY=getComponentSize('h') -startHeight;
				break;
			case "bc" :
				startX=getComponentSize('w')/2 - startWidth/2;
				startY=getComponentSize('h') -startHeight;
				break;
			case "br" :
				startX=getComponentSize('w') - startWidth;
				startY=getComponentSize('h') -startHeight;
				break;
		}
		
		var finalWidth = originalWidth * endScale;
		var finalHeight = originalHeight * endScale;
		
		//console.log( finalWidth, finalHeight);
		
		//check end dimensions, go by width first
		if(finalWidth < getComponentSize('w')){
			factor= getComponentSize('w') / finalWidth;
			if(scaleRises){
				finalWidth = getComponentSize('w') * enlarger;
				finalHeight *= (factor * enlarger);
			}else{
				finalWidth = getComponentSize('w');
				finalHeight *= factor;
			}
		}
		
		//console.log(factor, finalWidth, finalHeight);
		
		//check for height after (possible) width resize
		if(finalHeight < getComponentSize('h')){
			factor= getComponentSize('h') / finalHeight;
			if(scaleRises){
				finalHeight = getComponentSize('h') * enlarger;
				finalWidth *= (factor * enlarger);
			}else{
				finalHeight = getComponentSize('h');
				finalWidth *= factor;
			}
		}
		
		//console.log('finalWidth, finalHeight = ', finalWidth, finalHeight);
		
		//get end position for tween props
		var obj = getEndPositionKenBurns(endPosition, finalWidth, finalHeight);
		endX=obj.x;
		endY=obj.y;
		
		kbEndPosition=endPosition;//remember position for resize in transition off
		
		//console.log('startX,startY,endX,endY = ', startX,startY,endX,endY);
		
		//position on start
		currentHolder.css('left', startX);
		currentHolder.css('top', startY);
		
		//find timer delay for next image
		var fadeInTime =1000;
		var deductTime = 700;
		var delay=duration-deductTime;
		
		//check for smallest time! (fade before transition ends)
			
		hidePreloader();	
			
		if(slideshowOn){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			slideshowTimeoutID = setTimeout(nextMedia, delay);
		}
		
		currentHolder.animate({'opacity': 1},  {duration: fadeInTime, easing: "easeOutSine", queue: false, complete: function(){
			var otherHolder = getOtherHolder(currentHolder);
			//console.log('other before = ', otherHolder.children().size());
			$(otherHolder).stop().empty();
			otherHolder.css('display', 'none');
			//console.log('other after = ', otherHolder.children().size());
			mediaLoadedAction();
			kenBurnsTransitionOn=false;
			_thumbClick=false;//reset
		}});//fade in fast
		
		currentHolder.animate({'left': endX + 'px', 'top': endY+ 'px', 'width': finalWidth+ 'px', 'height': finalHeight+ 'px'},  {duration: duration, easing: "linear", queue: false, complete: function(){
			if(slideshowOn){
				transitionKenBurnsEnd(currentHolder);
			}else{
				transitionOn=false;
			}
		}});
	}

	function transitionKenBurnsEnd(currentHolder){
		//console.log("transitionKenBurnsEnd");
		$(currentHolder).empty();
		currentHolder.css('display', 'none');
		var otherHolder = getOtherHolder(currentHolder);
		transitionOn=false;
	}
	
	function getEndPositionKenBurns(endPosition, finalWidth, finalHeight){
		var o = {};
		switch (endPosition) {
			case "tl" :
				o.x=0;
				o.y=0;
				break;
			case "tc" :
				o.x=getComponentSize('w')/2 - finalWidth / 2;
				o.y=0;
				break;
			case "tr" :
				o.x=getComponentSize('w') - finalWidth;
				o.y=0;
				break;
			case "ml" :
				o.x=0;
				o.y=getComponentSize('h')/2 -finalHeight/2;
				break;
			case "mc" :
				o.x=getComponentSize('w')/2 - finalWidth / 2;
				o.y=getComponentSize('h')/2 -finalHeight/2;
				break;
			case "mr" :
				o.x=getComponentSize('w') - finalWidth;
				o.y=getComponentSize('h')/2 -finalHeight/2;
				break;
			case "bl" :
				o.x=0;
				o.y=getComponentSize('h') -finalHeight;
				break;
			case "bc" :
				o.x=getComponentSize('w')/2 - finalWidth / 2;
				o.y=getComponentSize('h') -finalHeight;
				break;
			case "br" :
				o.x=getComponentSize('w') - finalWidth;
				o.y=getComponentSize('h') -finalHeight;
				break;
		}
		return o;
	}
	
	/****************** HELPER FUNCTIONS **********************/
	
	//return opposite holder from given
	function getOtherHolder(holder) {
		var s;
		var name = holder.attr('data-title');
		if(name == '_holder1'){
			s = _holder2;
		}else{
			s = _holder1;
		}
		return s;
	}
	
	//swap children index, first sent child set to higher index
	function swapChildren(holder, holder2) {
		holder.css('zIndex', 1);
		holder2.css('zIndex', 0);
	}
	
	//return holder with no children
	function getEmptyHolder(empty) {
		var s;
		var s2;
		var numChildren = _holder1.children().size();
		
		if(empty){
			if(numChildren > 0){
				s = _holder2;
				s2 = _holder1;
			}else{
				s = _holder1;
				s2 = _holder2;
			}
		}else{
			if(numChildren > 0){
				s = _holder1;
				s2 = _holder2;
			}else{
				s = _holder2;
				s2 = _holder1;
			}
		}
		
		if( _transitionType=='KEN_BURNS'){
			//put next holder above current so we dont have to fade out current one with alpha, we just fade in next (for ken burns)
			if(parseInt(s.css('zIndex'), 10) < parseInt(s2.css('zIndex'), 10)){
				s.css('zIndex', 1);
				s2.css('zIndex', 0);
			}else{
				s.css('zIndex', 0);
				s2.css('zIndex', 1);
			}
		}
		
		return s;
	}
	
	 function retrieveObjectRatio( obj, w, h, _fitScreen ) {
			
		var o ={};
		
		var _paddingX = 0;
		var _paddingY = 0;
		
		var objWidth = getComponentSize('w');
		var objHeight = getComponentSize('h');
		
		var targetWidth = w;
		var targetHeight = h;
		
		var destinationRatio = (objWidth - _paddingX) / (objHeight - _paddingY);///destination ratio of an object
		var targetRatio = targetWidth / targetHeight;///target ratio of an object

		if (targetRatio < destinationRatio) {
			
			//console.log('targetRatio < destinationRatio 1');
			
			if (!_fitScreen) {//fullscreen
				o.height = ((objWidth - _paddingX) / targetWidth) * targetHeight;
				o.width = (objWidth - _paddingX);
			} else {//fitscreen
				o.width = ((objHeight - _paddingY) / targetHeight) * targetWidth;
				o.height = (objHeight - _paddingY);
			}
		} else if (targetRatio > destinationRatio) {
			
			//console.log('targetRatio > destinationRatio 2');
			
			if (_fitScreen) {//fitscreen
				o.height = ((objWidth - _paddingX) / targetWidth) * targetHeight;
				o.width = (objWidth - _paddingX);
			} else {//fullscreen
				o.width = ((objHeight - _paddingY) / targetHeight) * targetWidth;
				o.height = (objHeight - _paddingY);
			}
		} else {//fitscreen & fullscreen
			o.width = (objWidth - _paddingX);
			o.height = (objHeight - _paddingY);
		}
		
		return o;
	}
	
	//check for blank string
	function isBlank(str) {
		var result = false;
		if(str.replace(/\s/g,"") == ""){
			result = true;
		}
		return result;
	}
	
	function getRandomNotLast( array ) {//this function is responsible for selecting from which side the next image should appear. As its name suggest, its configurated the way that it doesnt repeat the same side twice in a row.
		var index = Math.floor(Math.random() * (array.length - 1));
		var value = array.splice(index, 1)[0];
		array.push(value);
		return value;
	}
	
	function getRandomArrayValue(array) {
		var randomIndex = Math.round(Math.random()*(array.length-1));
		return array[randomIndex];
	}
	
	//returns a random value between min and max
	function randomMinMax(min, max) {
		return Math.random() * max - min + min;
	}
	
	//check equality
	function matchInArray(item, arr) {
		var i=0;
		var len=arr.length;
		var match;
		var arrItem;
		for(i;i<len;i++){
			arrItem = arr[i];
			//console.log(item, arrItem);
			if(item == arrItem){
				match = true;
				break;
			}
		}
		//console.log(match);
		return match;
	}
	
	function getSlideshowDelay(){
		var nextDelay;
		var reserve= 3000;
		if(useGlobalDelay){
			nextDelay = slideshowTimeout > 0 ? slideshowTimeout : reserve;
		}else{
			if(currentData.attr('data-transitionDelay') != undefined){
				nextDelay = parseInt(currentData.attr('data-transitionDelay'), 10);
				//console.log('nextDelay = ', nextDelay);
			}else{
				nextDelay = slideshowTimeout > 0 ? slideshowTimeout : reserve;
			}
		}
		return nextDelay;
	}
	
	if(disableRightClick){
		_doc.bind("contextmenu",function(e){
			return false;
		});
	}
	
	function makeRandomList() {//make random set of numbers
		_randomArr = randomiseIndex(_playlistLength);
		//console.log(_randomArr);
	}
	
	function randomiseIndex(num){
		var arr = [], randomArr = [], i = 0, j = 0;
		
		for (i; i < num; i++) {//first fill the ordered set of indexes
			arr[i] = i;
		}
		
		j = 0;
		for (j; j < num; j++) { //then randomize those indexes
			var randomIndex = Math.round(Math.random()*(arr.length-1));
			randomArr[j] = arr[randomIndex];
			arr.splice(randomIndex, 1);
		}
		return randomArr;
	}
	
	function getCounter() {
		//console.log('getCounter');
		var i;
		if(_randomPlay){
			if(!_thumbClick){
				i = _randomArr[_counter];
			}else{
				i = _counter;
			}
		}else{
			i = _counter;
		}
		return i;
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
	
	function showPreloader(){
		componentPreloader.css({opacity:0, display: 'block'}).stop().animate({ 'opacity':1},  {duration: 500, easing: 'easeOutSine'});
	}
	
	function hidePreloader(){
		componentPreloader.stop().animate({ 'opacity':0},  {duration: 500, easing: 'easeOutSine', complete: function(){
			componentPreloader.css('display', 'none');
		}});
	}
	
	function isEmpty(str) {
	    return str.replace(/^\s+|\s+$/g, '').length == 0;
	}
	
	/*****************  CONTROLS *******************/
	
	function overControls(e){
		if(!componentInited) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('class');
		
		if(id == 'controls_prev'){
			controlsPrevSrc.attr('src', 'data/icons/prev_on.png');
		}
		else if(id == 'controls_toggle'){
			if(slideshowOn){
				controlsToggleSrc.attr('src', 'data/icons/pause_on.png');
			}else{
				controlsToggleSrc.attr('src', 'data/icons/play_on.png');
			}
		}
		else if(id == 'controls_next'){
			controlsNextSrc.attr('src', 'data/icons/next_on.png');
		}
		else if(id == 'info_toggle'){
			infoToggleSrc.attr('src', 'data/icons/info_on.png');
		}
		else if(id == 'link_toggle'){
			linkToggleSrc.attr('src', 'data/icons/link_on.png');
		}
		else if(id == 'playlist_toggle'){
			if(!playlistOpened){
				playlistToggleSrc.attr('src', 'data/icons/plus_on.png');
			}else{
				playlistToggleSrc.attr('src', 'data/icons/minus_on.png');
			}
		}
	}
	
	function outControls(e){
		if(!componentInited) return;
		
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('class');
		
		if(id == 'controls_prev'){
			controlsPrevSrc.attr('src', 'data/icons/prev.png');
		}
		else if(id == 'controls_toggle'){
			if(slideshowOn){
				controlsToggleSrc.attr('src', 'data/icons/pause.png');
			}else{
				controlsToggleSrc.attr('src', 'data/icons/play.png');
			}
		}
		else if(id == 'controls_next'){
			controlsNextSrc.attr('src', 'data/icons/next.png');
		}
		else if(id == 'info_toggle'){
			infoToggleSrc.attr('src', 'data/icons/info.png');
		}
		else if(id == 'link_toggle'){
			linkToggleSrc.attr('src', 'data/icons/link.png');
		}
		else if(id == 'playlist_toggle'){
			if(!playlistOpened){
				playlistToggleSrc.attr('src', 'data/icons/plus.png');
			}else{
				playlistToggleSrc.attr('src', 'data/icons/minus.png');
			}
		}
	}
	
	function clickControls(e){
		if(!componentInited) return false;
		//console.log('clickControls');
		if (!e) var e = window.event;
		if(e.cancelBubble) e.cancelBubble = true;
		else if (e.stopPropagation) e.stopPropagation();
		
		var currentTarget = e.currentTarget;
		var id = $(currentTarget).attr('class');
		
		if(id == 'controls_prev'){
			if(loadRequestPause) return;
			checkPrevious();
		}
		else if(id == 'controls_toggle'){
			toggleSlideshow(true);//buttons on
		}
		else if(id == 'controls_next'){
			if(loadRequestPause) return;
			checkNext();
		}
		else if(id == 'info_toggle'){
			if(!navigationActive) return;
			toggleInfo();
		}
		else if(id == 'link_toggle'){
			if(!navigationActive) return;
			toggleUrl();
		}
		else if(id == 'playlist_toggle'){
			togglePlaylist();
		}
		return false;
	}
	
	function checkNext(){
		if(_transitionType != 'KEN_BURNS'){
			if(!transitionOn)nextMedia();
		}else{
			nextMedia();
		}	
	}
	
	function checkPrevious(){
		if(_transitionType != 'KEN_BURNS'){
			if(!transitionOn)previousMedia();
		}else{
			previousMedia();
		}
	}
	
	function checkMedia(id){
		//console.log('checkMedia');
		enableActiveThumb();
		_counter = id;
		disableActiveThumb();
		if(_transitionType != 'KEN_BURNS'){
			if(!transitionIntroHappened){
				triggerMedia();	
			}else if(!transitionOn)triggerMedia();	
		}else{
			triggerMedia(); 
		}
	}
	
	function triggerMedia(){
		//console.log('triggerMedia');
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		disableActiveThumb();
		callTransition();
	}
	
	function nextMedia(){
		//console.log('nextMedia');
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		mediaUnloadedAction();
		enableActiveThumb();
		_counter++;
		
		if(_counter>_playlistLength-1){
			_counter=0;	
			if(slideshowAdvancesToNextCategory){
				//load next category
				activeCategory++;
				if(activeCategory>categoryLength-1) activeCategory = 0;
				//console.log(menuCounter,activeCategory);
				if(menuCounter + currentlyVisibleMenuItems-1<activeCategory){
					menuCounter =activeCategory;	
				}else if(activeCategory==0){
					menuCounter =activeCategory;	
				}
				if(useDeeplink){
					$.address.value(findAddress2(getCounter()));
					if(!$.address.history()) $.address.history(true);//restore history
				}else{
					cleanCategory();
				} 
				return;
			}
		}
		
		if(useDeeplink){
			$.address.value(findAddress2(getCounter()));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			disableActiveThumb();
			callTransition();
		} 
	}
	
	function previousMedia(){
		//console.log('previousMedia');
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		mediaUnloadedAction();
		enableActiveThumb();
		_counter--;
		
		if(_counter<0){
			_counter=_playlistLength-1;	
			if(slideshowAdvancesToNextCategory){
				//load previous category
				activeCategory--;
				if(activeCategory<0) activeCategory = categoryLength-1;
				if(useDeeplink){
					$.address.value(findAddress2(getCounter()));
					if(!$.address.history()) $.address.history(true);//restore history
				}else{
					cleanCategory();
				} 
				return;
			}
		} 
		
		if(useDeeplink){
			$.address.value(findAddress2(getCounter()));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			disableActiveThumb();
			callTransition();
		} 
	}
	
	/***************** DATA *******************/
	
	function mediaLoadedAction(){
		
		//INFO
		if(useDescription){
			infoExist=false;//reset
			var data = $(categoryDataArr[getCounter()]);
			if(data.attr('data-description') != undefined){
				infoData = data.attr('data-description');
				infoExist = true;
				//console.log(infoData);
				
				infoHolder.css('width', 'auto');//reset
				infoHolder.html(infoData);
				//console.log(infoHolder.css('width'));
				if(parseInt(infoHolder.css('width'), 10)>maxDescriptionWidth){
					infoHolder.css('width', maxDescriptionWidth+'px');
				}
				
				//show info btn
				if(useDescription){
					infoToggleSrc.attr('src', 'data/icons/info.png');
					info_toggle.css('opacity', 0);
					info_toggle.css('display', 'block');
					info_toggle.stop().animate({ 'opacity': 1},  {duration: 400, easing: 'easeOutSine'});
				}
				
				if(autoOpenDescription) toggleInfo();
			}
		}
		
		//LINK
		if(linkExist){
			//show link btn
			link_toggle.css('opacity',0);
			link_toggle.css('display','block');
			link_toggle.stop().animate({ 'opacity': 1},  {duration: 400, easing: 'easeOutSine'});
		}
		navigationActive=true;
	}
	
	function checkLink(arr){
		linkExist=false;//reset
		var data = $(categoryDataArr[getCounter()]);
		if(data.attr('data-link') != undefined){
			linkExist=true;
			_link=data.attr('data-link');
			if(data.attr('data-target') != undefined) _target=data.attr('data-target');
			if(!_target) _target="_blank";
			/*if(makeImageClickableForUrl){
				for(var i in arr){
					$(arr[i]).bind('click', toggleUrl);
					$(arr[i]).css('cursor','pointer');
				}
			}*/
			//console.log(_counter,_link,_target);
		}
	}
	
	function mediaUnloadedAction(){//hide info and link btns, show preloader
		navigationActive=false;
		if(useDescription){
			info_toggle.stop().animate({ 'opacity': 0},  {duration: 400, easing: 'easeOutSine', complete: function(){
				info_toggle.css('display', 'none');
			}});
			if(infoOpened){
				infoHolder.stop().animate({ 'opacity': 0},  {duration: 400, easing: 'easeOutSine', complete: function(){
					infoHolder.css('display', 'none');
				}});
				infoOpened=false;
			}
		}
		link_toggle.stop().animate({ 'opacity': 0},  {duration: 400, easing: 'easeOutSine', complete: function(){
			link_toggle.css('display', 'none');
		}});
	}
	
	function toggleInfo(){
		if(!infoOpened){
			infoHolder.css({opacity:0, display: 'block'}).stop().animate({ 'opacity': 1},  {duration: 400, easing: 'easeOutSine'});
			infoOpened=true;
		}else{
			infoHolder.stop().animate({ 'opacity': 0},  {duration: 400, easing: 'easeOutSine', complete: function(){
				infoHolder.css('display', 'none');
			}});
			infoOpened=false;
		}
	}
	
	function toggleUrl(){
		if(!_link) return;
		if(_target=='_parent'){
			window.location.href=_link;
		}else if(_target=='_blank'){
			window.open(_link, _target);
		}
	}
	
	/***************** RESIZE *******************/
	
	function getComponentSize(side){
		//console.log('getComponentSize');
		var s;
		if(playlistPosition == 'top' || playlistPosition=='bottom'){
			if(playlistIndex != 'inside'){
				if(side == 'w'){
					s = parseInt( componentWrapper.css('width'), 10);
				}else{
					s = parseInt( componentWrapper.css('height'), 10)-componentPlaylist.height();
				}
			}else{
				if(side == 'w'){
					s = parseInt( componentWrapper.css('width'), 10);
				}else{
					s = parseInt( componentWrapper.css('height'), 10);
				}
			}
		}else if(playlistPosition == 'left' || playlistPosition=='right'){
			if(playlistIndex != 'inside'){
				if(side == 'w'){
					s = parseInt( componentWrapper.css('width'), 10)-componentPlaylist.width();
				}else{
					s = parseInt( componentWrapper.css('height'), 10);
				}
			}else{
				if(side == 'w'){
					s = parseInt( componentWrapper.css('width'), 10);
				}else{
					s = parseInt( componentWrapper.css('height'), 10);
				}
			}
		}
		return s;
	}
	
	if(!componentFixedSize){
		_window.resize(function() {
			 if(!componentInited || categoryTransitionOn) return false;
			 if(windowResizeTimeoutID) clearTimeout(windowResizeTimeoutID);
			 windowResizeTimeoutID = setTimeout(doneResizing, windowResizeTimeout);
		});
	}
	
	function doneResizing(){
		//console.log('doneResizing', transitionOn, kenBurnsTransitionOn);
		
		if(!transitionOn){
			switch( _transitionType){
				case 'SLIDE':
					resizeSlide();
				break;	
				case 'SPLIT':
					resizeSplit();
				break;
				case 'REVEAL':
					resizeReveal();
				break;
				case 'ALPHA':
					resizeAlpha();
				break;
				case 'ZOOM':
					resizeZoom();
				break;
				case 'KEN_BURNS':
					lastComponentW = getComponentSize('w');//remember before resize
					resizeKenBurns();
				break;
			}
		}else{
			//console.log('reset current image');
			
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			if(loadRequestIntervalID) clearInterval(loadRequestIntervalID);
			
			_holder1.stop().empty();
			_holder2.stop().empty();
			_holder1.css({
				zIndex:0,
				opacity:1,
				background:'none',
				overflow:'visible',
				display:'none'
			
			});
			_holder2.css({
				zIndex:1,
				opacity:1,
				background:'none',
				overflow:'visible',
				display:'none'
			
			});
			callTransition();
			
		}
		
		//align thumbs
		positionPlaylistHolder();
		getThumbHolderSize();
		
		//align menu
		if(!singleCategory) getMenuHolderSize();
	}
	
	function resizeKenBurns(){
		
		var w = getComponentSize('w');
		var h = getComponentSize('h');
		var currentHolder = getEmptyHolder(false);
		var w1 = currentHolder.width();
		var h1 = currentHolder.height();
		
		var newWidth = w/lastComponentW*w1;///get new media height on width side
		if(newWidth<getComponentSize('w')){
			newWidth=getComponentSize('w');
		}
		var ratioHeight=newWidth/w1;///get media height on width ratio
		
		currentHolder.css('width', newWidth+'px');
		currentHolder.css('height', h1*ratioHeight+'px');
		
		switch (kbEndPosition) {
			case "tl" :
				break;
			case "tc" :
				currentHolder.css('left', -newWidth/2+w/2+'px');
				break;
			case "tr" :
				currentHolder.css('left', -newWidth+w+'px');
				break;
			case "ml" :
				currentHolder.css('top', -currentHolder.height()/2+h/2+'px');
				break;
			case "mc" :
				currentHolder.css('top', -currentHolder.height()/2+h/2+'px');
				currentHolder.css('left', -newWidth/2+w/2+'px');
				break;
			case "mr" :
				currentHolder.css('top', -currentHolder.height()/2+h/2+'px');
				currentHolder.css('left', -newWidth+w+'px');
				break;
			case "bl" :
				currentHolder.css('top', -currentHolder.height()+h+'px');
				break;
			case "bc" :
				currentHolder.css('top', -currentHolder.height()+h+'px');
				currentHolder.css('left', -newWidth/2+w/2+'px');
				break;
			case "br" :
				currentHolder.css('top', -currentHolder.height()+h+'px');
				currentHolder.css('left', -newWidth+w+'px');
				break;
		}
		
		lastComponentW = w;//remember last size
	}
	
	function resizeSplit(){	
	
		 var currentHolder = getEmptyHolder(false);
		 //console.log(currentHolder.splitCase);
		 var splitCase = currentHolder.splitCase;
		 
		 var split1=$(currentHolder.children('div[data-title=split1]'));
		 var split2=$(currentHolder.children('div[data-title=split2]'));
		 var cut;
		 var content=split1.children('img');
		 var content2=split2.children('img');
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var w = originalWidth;
		 var h =originalHeight;
		
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
		
		content2.css('width', w + 'px');
		content2.css('height', h + 'px');
			 
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('left', 0 + 'px');
		currentHolder.css('top', 0 + 'px');
		 
		 if(splitCase == 'horizontalUpLeft' || splitCase == 'horizontalUpRight' || splitCase == 'horizontalSplit'){
			 
			split1.css('top', 0);
			split1.css('left', 0);
			split1.css('width', getComponentSize('w') + 'px');
			split1.css('height', getComponentSize('h')/2 + 'px');
			
			split2.css('top', getComponentSize('h')/2 + 'px');
			split2.css('left', 0);
			split2.css('width', getComponentSize('w') + 'px');
			split2.css('height', getComponentSize('h')/2 + 'px');
			
			cut = (getComponentSize('h') - h) / 2;
			
			//move second image inside
			content2.css('left', getComponentSize('w')/2-w/2 + 'px');
			content2.css('top', -getComponentSize('h')/2+ cut + 'px');
			 
		}else if(splitCase == 'verticalUpLeft' || splitCase == 'verticalDownLeft' || splitCase == 'verticalSplit'){
			 
			split1.css('top', 0);
			split1.css('left', 0);
			split1.css('width', getComponentSize('w') /2 + 'px');
			split1.css('height', getComponentSize('h') + 'px');
			
			split2.css('top', 0);
			split2.css('left', getComponentSize('w') / 2 + 'px');
			split2.css('width', getComponentSize('w') / 2 + 'px');
			split2.css('height', getComponentSize('h') + 'px');
			
			//move second image inside
			content2.css('left', - w/2 + 'px');
			content2.css('top', getComponentSize('h')/2- h/2 + 'px');
			 
		}
	}
	
	function resizeReveal(){	
	
		 var currentHolder = getEmptyHolder(false);
		 var content = currentHolder.children();
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
			 
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		
		currentHolder.css('left', 0 + 'px');
		currentHolder.css('top', 0 + 'px');
		
	}
	
	function resizeSlide(){
	
		 var currentHolder = getEmptyHolder(false);
		 var content = currentHolder.children();
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		 
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		content.css('width', w + 'px');
		content.css('height', h + 'px');
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
			 
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
	
	}
	
	function resizeZoom(){	
		
		 var currentHolder = getEmptyHolder(false);
		 var content = currentHolder.children();
		 
		 var originalWidth = content[0].origWidth;
		 var originalHeight = content[0].origHeight;
		
		 var w = originalWidth;
		 var h =originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;	
		}
		
		currentHolder.css('width', getComponentSize('w') + 'px');
		currentHolder.css('height', getComponentSize('h') + 'px');
		currentHolder.css('left', 0);
		currentHolder.css('top', 0);
		 
		content.css('width', w + 'px');
		content.css('height', h + 'px');	
		content.css('left', getComponentSize('w')/2-w/2 + 'px');
		content.css('top', getComponentSize('h')/2-h/2 + 'px');
		
	}
	
	function resizeAlpha(){
	
		 var currentHolder = getEmptyHolder(false);
		 var content = currentHolder.children()[0];
		 
		 var originalWidth = content.origWidth;
		 var originalHeight = content.origHeight;
		 
		 var w = originalWidth;
		 var h = originalHeight;
		 
		 if(forceImageFitMode || w > getComponentSize('w') || h > getComponentSize('h')){
			 var obj = retrieveObjectRatio(componentHolder, w, h, imageFitMode);
			 w = obj.width;			
			 h = obj.height;
		}
			
		currentHolder.css('width', w + 'px');
		currentHolder.css('height', h + 'px');
		currentHolder.css('left', getComponentSize('w')/2-w/2 + 'px');
		currentHolder.css('top', getComponentSize('h')/2-h/2 + 'px');
		
	}
	
	function toggleSlideshow(buttonsOn){
		if(slideshowOn){
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			slideshowOn=false;
			if(controlsToggleSrc)controlsToggleSrc.attr('src', buttonsOn ? 'data/icons/play_on.png' : 'data/icons/play.png');
		}else{
			slideshowOn=true;
			if(controlsToggleSrc)controlsToggleSrc.attr('src', buttonsOn ? 'data/icons/pause_on.png' : 'data/icons/pause.png');
			if(_transitionType != 'KEN_BURNS'){
				if(!transitionOn){//otherwise its going to be triggered from end transition
					if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
					slideshowTimeoutID = setTimeout(nextMedia, getSlideshowDelay());
				}
			}else{
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				slideshowTimeoutID = setTimeout(nextMedia, getSlideshowDelay());
			}
		}
	}
	
	function toggleSlideshow2(state){
		if(state){//start
			slideshowOn=true;
			if(controlsToggleSrc)controlsToggleSrc.attr('src', 'data/icons/pause_on.png');
			if(_transitionType != 'KEN_BURNS'){
				if(!transitionOn){//otherwise its going to be triggered from end transition
					if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
					slideshowTimeoutID = setTimeout(nextMedia, getSlideshowDelay());
				}
			}else{
				if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
				slideshowTimeoutID = setTimeout(nextMedia, getSlideshowDelay());
			}
		}else{//stop
			if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
			slideshowOn=false;
			if(controlsToggleSrc)controlsToggleSrc.attr('src', 'data/icons/play_on.png');
		}
	}
	
	// ******************************** PUBLIC FUNCTIONS **************** //
	
	$.multiGallery.toggleSlideshow = function(state) {
		if(!componentInited) return;
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		if(state == undefined){
			toggleSlideshow();
		}else{
			toggleSlideshow2(state);
		}
	}
	
	$.multiGallery.togglePlaylist = function() {
		if(!componentInited) return;
		if(playlistIndex == 'inside') togglePlaylist();
	}
	
	$.multiGallery.nextItem = function() {
		if(!componentInited || loadRequestPause) return;
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		checkNext();
	}
	
	$.multiGallery.previousItem = function() {
		if(!componentInited || loadRequestPause) return;
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		checkPrevious();
	}
	
	$.multiGallery.loadItem = function(value) {
		if(!componentInited|| loadRequestPause) return;
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(typeof(value) === 'number'){
			if(value<0)value=0;
		    else if(value>_playlistLength-1)value=_playlistLength-1;
		}else if(typeof(value) === 'string'){
			//find counter for media name
			if(!findCounterByName(value)){
				//console.log('404');
				if(useDeeplink)$.address.history(false);//skip invalid url
				return false;
			}
			value=activeItem;//convert to counter			
		}else{
			alert('Invalid value for openMedia!');
			return;	
		}
		//console.log(value,_counter);
		if(value==_counter) return;//already opened
		_thumbClick=true;
		enableActiveThumb();
		
		if(useDeeplink){
			$.address.value(findAddress2(value));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			checkMedia(value);
		}
	}
	
	$.multiGallery.loadCategory = function(value) {
		if(!componentInited) return;
		if(categoryTransitionOn)return;
		if(slideshowTimeoutID) clearTimeout(slideshowTimeoutID);
		
		if(typeof(value) === 'number'){
			if(value<0)value=0;
			else if(value>categoryLength-1)value=categoryLength-1;
		}else if(typeof(value) === 'string'){
			//find activeCategory for category name
			if(!findCategoryByName(value)){
				//console.log('404');
				if(useDeeplink)$.address.history(false);//skip invalid url
				return false;
			}
			value=activeCategory;//convert to counter			
		}else{
			alert('Invalid value for openCategory!');
			return;	
		}
		
		//console.log(value, currentCategory);
		if(value == currentCategory) return;
		categoryTransitionOn=true;
		enableActiveMenuItem();
		activeCategory = value;
		
		if(useDeeplink){
			$.address.value(findAddress2(0));
			if(!$.address.history()) $.address.history(true);//restore history
		}else{
			cleanCategory();
		}
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

