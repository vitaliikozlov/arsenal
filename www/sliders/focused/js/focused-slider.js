$(function() {
	var sWidth = $("#focus-slider").width(); 
	var len = $("#focus-slider ul li").length; 
	var index = 0;
	var picTimer;
	
	var btn = "<div class='focus-btnBg'></div><div class='focus-btn'>";
	for(var i=0; i < len; i++) {
		btn += "<span>" + (i+1) + "</span>";
	}
	btn += "</div>"
	$("#focus-slider").append(btn);
	$("#focus-slider .focus-btnBg").css("opacity",0.3);
	

	$("#focus-slider .focus-btn span").mouseenter(function() {
		index = $("#focus-slider .focus-btn span").index(this);
		showPics(index);
	}).eq(0).trigger("mouseenter");

	$("#focus-slider ul").css("width",sWidth * (len + 1));
	
	$("#focus-slider ul li div").hover(function() {
		$(this).siblings().css("opacity",0.7);
	},function() {
		$("#focus-slider ul li div").css("opacity",1);
	});
	
	$("#focus-slider").hover(function() {
		clearInterval(picTimer);
	},function() {
		picTimer = setInterval(function() {
			if(index == len) { 
				showFirPic();
				index = 0;
			} else {
				showPics(index);
			}
			index++;
		},3000); 
	}).trigger("mouseleave");
	
	function showPics(index) { 
		var nowLeft = -index*sWidth; 
		$("#focus-slider ul").stop(true,false).animate({"left":nowLeft},500); 
		$("#focus-slider .focus-btn span").removeClass("on").eq(index).addClass("on")
	}
	
	function showFirPic() { 
		$("#focus-slider ul").append($("#focus-slider ul li:first").clone());
		var nowLeft = -len*sWidth;
		$("#focus-slider ul").stop(true,false).animate({"left":nowLeft},500,function() {
			$("#focus-slider ul").css("left","0");
			$("#focus-slider ul li:last").remove();
		}); 
		$("#focus-slider .btn span").removeClass("on").eq(0).addClass("on");
	}
});
