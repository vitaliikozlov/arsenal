/* dCodes Framework: (c) TemplateAccess */

(function(d){var c=false,g=null;d.tinysort={id:"TinySort",version:"1.1.1",copyright:"Copyright (c) 2008-2011 Ron Valstar",uri:"http://tinysort.sjeiti.com/",licenced:{MIT:"http://www.opensource.org/licenses/mit-license.php",GPL:"http://www.gnu.org/licenses/gpl.html"},defaults:{order:"asc",attr:g,data:g,useVal:c,place:"start",returns:c,cases:c,forceStrings:c,sortFunction:g}};d.fn.extend({tinysort:function(l,f){if(l&&typeof(l)!="string"){f=l;l=g}var m=d.extend({},d.tinysort.defaults,f),v=parseFloat,s,A={},o=!(!l||l==""),r=!(m.attr===g||m.attr==""),w=m.data!==g,h=o&&l[0]==":",j=h?this.filter(l):this,q=m.sortFunction;if(!q){q=m.order=="rand"?function(){return Math.random()<0.5?1:-1}:function(C,p){var i=!m.cases?b(C.s):C.s,D=!m.cases?b(p.s):p.s;if(!m.forceStrings&&e(C.s)&&e(p.s)){i=v(C.s);D=v(p.s)}return(m.order=="asc"?1:-1)*(i<D?-1:(i>D?1:0))}}this.each(function(C,E){var D=d(E),G=o?(h?j.filter(this):D.find(l)):D,F=w?G.data(m.data):(r?G.attr(m.attr):(m.useVal?G.val():G.text())),p=D.parent();if(!A[p]){A[p]={s:[],n:[]}}if(G.length>0){A[p].s.push({s:F,e:D,n:C})}else{A[p].n.push({e:D,n:C})}});for(s in A){A[s].s.sort(q)}var k=[];for(s in A){var x=A[s],z=[],B=d(this).length;switch(m.place){case"first":d.each(x.s,function(p,C){B=Math.min(B,C.n)});break;case"org":d.each(x.s,function(p,C){z.push(C.n)});break;case"end":B=x.n.length;break;default:B=0}var u=[0,0];for(var y=0;y<d(this).length;y++){var n=y>=B&&y<B+x.s.length;if(a(z,y)){n=true}var t=(n?x.s:x.n)[u[n?0:1]].e;t.parent().append(t);if(n||!m.returns){k.push(t.get(0))}u[n?0:1]++}}return this.pushStack(k)}});function b(f){return f&&f.toLowerCase?f.toLowerCase():f}function e(h){var f=/^\s*?[\+-]?(\d*\.?\d*?)\s*?$/.exec(h);return f&&f.length>0?f[1]:c}function a(h,i){var f=c;d.each(h,function(k,j){if(!f){f=j==i}});return f}d.fn.TinySort=d.fn.Tinysort=d.fn.tsort=d.fn.tinysort})(jQuery);

	
;(function($){
	$(document).ready(function() {
		$('#freetile-demo').children().each(function()
		{
			$(this).freetile({
				animate: true,
				elementDelay: 10
			});
		});
	});
})(jQuery)



var _A = { c: 320,};
$(document).ready(function () {
	_A.$tags = $("#dc_tile_portfolio_tags");
	_A.$tag = $(".dc_tile_portfolio_tag");
	_A.$options = $(".options");
	_A.$container = $("#element-container");
	jQuery.fx.interval = 22;
	jQuery.easing.def = "easeOutQuint";
	$(".element").addClass("invis1");
	_A.$tag.addClass("active").filter("#element").addClass("current");
	_A.$options.show().data("fadeout", setTimeout(function () { _A.$options.fadeTo(400, 0.2) },
	2600));
	_A.$tags.delegate(".dc_tile_portfolio_tag", "click", function (d) {
		$this = $(this);
		_id = this.id;
		$(".nest:not(." + _id + "-nest)").slideUp(240);
		$(".parent-is-" + _id).each(function () { var e = $(this); if (e.children().length > 1) { e.slideDown(240) }});
		_A.$tag.removeClass("active").removeClass("current");
		$("." + _id + "-tag").addClass("active");
		$this.addClass("current");
		var c = "." + _id;
		if (!$this.hasClass("base")) { c += ":not( .hidden.leaf )" }
		$(".element").not(c).addClass("nosort").fadeOut(400);
		$(c).removeClass("nosort").not(":visible").addClass("noanim").fadeIn(400);
		_A.$container.freetile("layout", { animate: true, selector: ".element:not(.nosort)" });
		$(".element").removeClass("noanim")
	});
	/*$(".element a").each(function (c) { $(this).append('<span class="elementCat invis1">' + c + "</span>") });*/
	var b = _A.$container.attr("sorting");
	_A.$container.prepend($(".featured"));
	$(".sort-option").click(function () {
		$(".sort-option").removeClass("current");
		$(this).addClass("current")
	});
	$("#sbd").click(function () {
		$(".element:not(#control)").tsort(".elementDate", { order: "desc" });
		_A.$container.prepend($(".featured"));
		_A.$container.freetile("layout")
	});
	$("#sbc").click(function () {
		$(".element:not(#control)").tsort(".elementCat", { order: "asc" });
		_A.$container.prepend($(".featured"));
		_A.$container.freetile("layout")
	});
	$("#sbr").click(function () {
		$(".element:not(#control)").tsort("", { order: "rand" });
		_A.$container.prepend($(".featured"));
		_A.$container.freetile("layout")
	});
	var a = ".element:not(.nosort, .hidden.leaf)";
	$(a).find(".element img").imagesLoaded(function () {
		$("#dc_tile_portfolio").css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 },
		600, function () {
			$(".element").each(function () {
				var f = $(this),
				e = f.find(".element img");
				if (e) {
					var c = false;
					if ($(this).is(":not(:visible)")) { c = true }
					if (c) { f.show() }
					var d = e.width();
					if (d > 0) { f.width(d) }
					if (c) { f.hide() }
				}
			});
			_A.$container.freetile({
				selector: a,
				animate: true,
				elementDelay: 36,
				callback: function (c) {
					$(a).each(function (d) {
						var e = $(this);
						setTimeout(function () { e.fadeIn(360).removeClass("invis1").css("display", "") },
						600 + 40 * d);
					})
				},
				animationOptions: { duration: 380, easing: "easeInOutExpo" }
			})
		})
	});
});



