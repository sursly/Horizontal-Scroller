/* Horizontal Tiny Scrolling - a smooth scrolling script for horizontal websites
(the brother of the vertical "Tiny Scrolling")
by Marco Rosella - http://www.centralscrutinizer.it/en/design/js-php/horizontal-tiny-scrolling
                v0.6 - February 14, 2007
				
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA				
*/

window.onload = function() {
	HtinyScrolling.init(); scrollTips.init();
	}

var HtinyScrolling = {
	speed : 3,      //set here the scroll speed: when this value increase, the speed decrease. 
	maxStep: 100,	 //set here the "uniform motion" step for long distances
	brakeK: 50,		 //set here the coefficient of slowing down
	hash:null,		
	currentBlock:null,
	requestedX:0,
	init: function() {
		var lnks = document.getElementsByTagName('a');   
		for(var i = 0, lnk; lnk = lnks[i]; i++) {   
			if ((lnk.href && lnk.href.indexOf('#') != -1) &&  ( (lnk.pathname == location.pathname) ||
			('/'+lnk.pathname == location.pathname) ) && (lnk.search == location.search)) {  
			addEvent(lnk,'click',HtinyScrolling.initScroll,false);
			lnk.onclick=function(){return false;} // Safari
			}   
		}    
	},
	getTarget: function(target) {
		while(target.tagName.toLowerCase() != 'a')
			target = target.parentNode;
		return target;
	},
	getElementXpos: function(el){
		var x = 0;
		while(el.offsetParent){  
			x += el.offsetLeft;    
			el = el.offsetParent;
		}	return x;
	},		
	getScrollLeft: function(){
		if(document.all) return (document.documentElement.scrollLeft) ? document.documentElement.scrollLeft : document.body.scrollLeft;
		else return window.pageXOffset;   
	},	
	getWindowWidth: function(){
		if (window.innerWidth)	return window.innerWidth; 
		if(document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
	},
	getDocumentWidth: function(){
		if (document.width) return document.width;
		if(document.body.offsetWidth) return document.body.offsetWidth;
	},
	initScroll: function(e){
		var targ;  
		if (!e) var e = window.event;
		if (e.target) targ = e.target;
		else if (e.srcElement) targ = e.srcElement;  
		targ = HtinyScrolling.getTarget(targ);  //a fix by Skid X
		HtinyScrolling.hash = targ.href.substr(targ.href.indexOf('#')+1,targ.href.length); 
		HtinyScrolling.currentBlock = document.getElementById(HtinyScrolling.hash);   
		if(!HtinyScrolling.currentBlock) return;
		HtinyScrolling.requestedX = HtinyScrolling.getElementXpos(HtinyScrolling.currentBlock); 
		HtinyScrolling.scroll(targ); 
		return false;
	},
	scroll: function(targ){
		var left  = HtinyScrolling.getScrollLeft();
		if(HtinyScrolling.requestedX > left) { 
			var endDistance = Math.round((HtinyScrolling.getDocumentWidth() - (left + HtinyScrolling.getWindowWidth())) / HtinyScrolling.brakeK);
			endDistance = Math.min(Math.round((HtinyScrolling.requestedX-left)/ HtinyScrolling.brakeK), endDistance);
			var offset = Math.max(2, Math.min(endDistance, HtinyScrolling.maxStep));
		} else { var offset = - Math.min(Math.abs(Math.round((HtinyScrolling.requestedX-left)/ HtinyScrolling.brakeK)), HtinyScrolling.maxStep);
		} window.scrollTo(left + offset, 0);  
		if(Math.abs(left-HtinyScrolling.requestedX) <= 1 || HtinyScrolling.getScrollLeft() == left) {
			window.scrollTo(HtinyScrolling.requestedX, 0);
			if(typeof XULDocument != 'undefined') {
				location.hash = HtinyScrolling.hash;
			}
			
			//optional instructions: you can add an effect to enlight after the scroll the selected section.
			//uncomment this line below if you want to change the opacity:
			//mark.change_opacity(HtinyScrolling.hash);
			
			//you can also call the function "mark.change_colors(HtinyScrolling.hash, fps, (duration in sec), #(color in hex), #(color in hex))" to change background color of selected section   
			HtinyScrolling.hash = null;
		} else 	setTimeout(HtinyScrolling.scroll,HtinyScrolling.speed);			
	}
}

/* the mouse scrolling doesn't work with Opera, that hasn't a event associated to the mouse wheel */
 
var scrollTips = {
	dx : null,
	init : function() {	
		if (window.addEventListener) {
		window.addEventListener("DOMMouseScroll", this.mouseScroll, false);
		} else document.attachEvent("onmousewheel", this.mouseScroll); 
		var left = document.getElementById('left');
		addEvent(left,'mouseover', function() {this.dx=setInterval('scrollTips.arrowScroll(0)',100);return false;});
		addEvent(left,'mouseout', function() { clearInterval(this.dx); return false;});
		var right = document.getElementById('right');
		addEvent(right,'mouseover', function() {this.dx=setInterval('scrollTips.arrowScroll(1)',100);return false;});
		addEvent(right,'mouseout', function() { clearInterval(this.dx); return false;});
	},
	mouseScroll : function(e) {
		if (!e) var e = window.event;
		if (e.wheelDelta <= 0 || e.detail>=0){  
		window.scrollBy(80,0);
		} else  window.scrollBy(-80,0) ; 
	},	
	arrowScroll: function(val) {
		if(val==1) {
			window.scrollBy(70,0);
		} else {
			window.scrollBy(-70,0)
		}
	}
}

var mark = {        //first four functions are based on The Fade Anything Technique by Adam Michela 
	valop : 100,
	req : 0,
	make_hex: function(r,g,b) {
		r = r.toString(16); if (r.length == 1) r = '0' + r;
		g = g.toString(16); if (g.length == 1) g = '0' + g;
		b = b.toString(16); if (b.length == 1) b = '0' + b;
		return "#" + r + g + b;
	},
	change_colors: function(id, fps, duration, from, to) {  
		var frames = Math.round(fps * (duration / 1000));
		var interval = duration / frames;
		var delay = interval;
		var frame = 0;		
		if (from.length < 7) from += from.substr(1,3);
		if (to.length < 7) to += to.substr(1,3);		
		var rf = parseInt(from.substr(1,2),16);
		var gf = parseInt(from.substr(3,2),16);
		var bf = parseInt(from.substr(5,2),16);
		var rt = parseInt(to.substr(1,2),16);
		var gt = parseInt(to.substr(3,2),16);
		var bt = parseInt(to.substr(5,2),16);		
		var r,g,b,h;
		while (frame < frames) {
			r = Math.floor(rf * ((frames-frame)/frames) + rt * (frame/frames));
			g = Math.floor(gf * ((frames-frame)/frames) + gt * (frame/frames));
			b = Math.floor(bf * ((frames-frame)/frames) + bt * (frame/frames));
			h = this.make_hex(r,g,b); 		
			setTimeout("mark.set_img_bgcolor('"+id+"','"+h+"')", delay);
			frame++;
			delay = interval * frame; 
		}
		setTimeout("mark.set_img_bgcolor('"+id+"','"+to+"')", delay);
	},  
	
	set_img_bgcolor: function(id, c) {   
	    if(document.getElementById(id).getElementsByTagName('img')[0]) {
		var o = document.getElementById(id).getElementsByTagName('img')[0];
		o.style.backgroundColor = c;} else return;
	},
	get_img_bgcolor: function(id)  { 
		var o = document.getElementById(id).getElementsByTagName('img')[0];
		while(o) {
			var c;
			if (window.getComputedStyle) c = window.getComputedStyle(o,null).getPropertyValue("background-color");
			if (o.currentStyle) c = o.currentStyle.backgroundColor;
			if ((c != "" && c != "transparent") || o.tagName == "BODY") { break; }
			o = o.parentNode;
		}
		if (c == undefined || c == "" || c == "transparent") c = "#FFFFFF";
		var rgb = c.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
		if (rgb) c = this.make_hex(parseInt(rgb[1]),parseInt(rgb[2]),parseInt(rgb[3]));
		return c;
	},
	change_opacity: function(el) {
		if(!(/^menu/.test(el))) {
			var post = document.getElementById(el);
			if (mark.valop > 10 && mark.req == 0) {
				mark.valop -= 10;
				mark.set_opacity(post,mark.valop);
				if(mark.valop == 10) {mark.req = 1};
			} else 
			if (mark.valop < 100 && mark.req == 1) {
				mark.valop += 10;
				mark.set_opacity(post,mark.valop);
				if(mark.valop == 100) {mark.req = 2};
			} 
			if (mark.req != 2){
			setTimeout("mark.change_opacity('"+el+"')", 50);
			}
			else { mark.set_opacity(post,9999); mark.req = 0; return;}
		}
	},
	set_opacity: function(post,val){
		post.style.opacity='0.' + val ;
		post.style.filter="alpha(opacity=" + val + ")";
	}
}

function addEvent( obj, type, fn ) {
	if (obj.addEventListener)
		obj.addEventListener( type, fn, false );
	else if (obj.attachEvent) {
		obj["e"+type+fn] = fn;
		obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
		obj.attachEvent( "on"+type, obj[type+fn] );
	}
}

function removeEvent( obj, type, fn ) {
	if (obj.removeEventListener)
		obj.removeEventListener( type, fn, false );
	else if (obj.detachEvent) {
		obj.detachEvent( "on"+type, obj[type+fn] );
		obj[type+fn] = null;
		obj["e"+type+fn] = null;
	}
}