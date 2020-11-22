/* dCodes Framework: (c) TemplateAccess */

jQuery("html").removeClass("no-js").addClass("js");
if(navigator.appVersion.indexOf("Mac")!=-1){jQuery("html").addClass("osx")}
jQuery(document).ready(function(a){
  (function(){
	// add overlay on image:hover
    a(window).load(function(){
	  a(".dc_iso_item").each(function(){a(this).addClass(a(this).attr("data-fsize"));});
      a("#acols4").click(function(){ a('#dc_iso_portfolio_items article').removeClass('div6').removeClass('div3').removeClass('div4').addClass('div3'); a("#dc_iso_portfolio_filter li").removeClass('active'); a("#dc_iso_portfolio_filter li#f-all").addClass('active'); a('#dc_iso_portfolio_items').isotope({filter:'*'}); return false; });
      a("#acols3").click(function(){ a('#dc_iso_portfolio_items article').removeClass('div6').removeClass('div3').removeClass('div4').addClass('div4'); a("#dc_iso_portfolio_filter li").removeClass('active'); a("#dc_iso_portfolio_filter li#f-all").addClass('active'); a('#dc_iso_portfolio_items').isotope({filter:'*'}); return false; });
      a("#acols2").click(function(){ a('#dc_iso_portfolio_items article').removeClass('div6').removeClass('div3').removeClass('div4').addClass('div6'); a("#dc_iso_portfolio_filter li").removeClass('active'); a("#dc_iso_portfolio_filter li#f-all").addClass('active'); a('#dc_iso_portfolio_items').isotope({filter:'*'}); return false; });
      a("#acolsinit").click(function(){ a('#dc_iso_portfolio_items article').each(function(){a(this).removeClass('div6').removeClass('div3').removeClass('div4').addClass(a(this).attr('data-fsize'));}); a("#dc_iso_portfolio_filter li").removeClass('active'); a("#dc_iso_portfolio_filter li#f-all").addClass('active'); a('#dc_iso_portfolio_items').isotope({filter:'*'}); return false; });
      a(".link").each(function(){
        var d=a(this);
        var b=d.find("img").height();
		var m=d.find("a");
		var c=a("<span>").addClass("img-overlay").html("&nbsp;");
        m.append(c)})})})();
  (function(){
	// image-filter
    a(window).load(function(){
      var c=a("#dc_iso_portfolio_items");
      function b(d){
        c.isotope({filter:d});
        a("li.active").removeClass("active");
        a("#dc_iso_portfolio_filter").find("[data-filter='"+d+"']").parent().addClass("active");
        if(d!="*"){window.location.hash=d.replace(".","")}if(d=="*"){window.location.hash=""}}
      if(c.length){
        a(".dc_iso_item").each(function(){$this=a(this);var d=$this.data("tags");if(d){var f=d.split(",");for(var e=f.length-1;e>=0;e--){$this.addClass(f[e])}}});
        c.isotope({itemSelector:".dc_iso_item",layoutMode:"fitRows"});
        a("#dc_iso_portfolio_filter li a").click(function(){var d=a(this).attr("data-filter");b(d);return false});
        if(window.location.hash!=""){b("."+window.location.hash.replace("#",""))}}})})();
});