// Plugin jQuery of Interaction for MSEdition
// Ref: http://docs.jquery.com/Plugins/Authoring

// Callback

var Callback = function(func, caller) {
    if(!func) return null;
	this.func = func;
	this.caller = caller;
	if(arguments.length > 2) {
		this.args = new Array();
		for(var i = 2; i < arguments.length; i++)
			this.args.push(arguments[i]);
	}
	
	this.link = function(cb) {
		if(!this.linked) this.linked = new Array();
		this.linked.push(cb);
	};
	
	this.invoke = function(paramSup) {
		var arr = null;
		if(this.args) arr = (arguments.length>0 ? this.args.concat(Array.prototype.slice.call(arguments)) : this.args);
		else if(!this.args && arguments.length>0) var arr = arguments;
		this.func.apply(caller, arr);
		
		if(this.linked) {
			for(var i in this.linked) this.linked[i].invoke();
		}
	};
};

(function( $ ){

// Multi touch support
var Path = function(p) {
    this.pts = [];
    this.add(p);
}
Path.prototype = {
    constructor: Path,
    add: function(p) {
        if(isNaN(p.x) || isNaN(p.y)) return;
        this.pts.push({'x':p.x, 'y':p.y});
    },
    origin: function() {
        return this.pts[0];
    },
    last: function() {
        return this.pts[this.pts.length-1];
    },
    toString: function() {
    	return "[object Path]";
    }
}


var GestureAnalyser = function(listeners){
    this.blobs = {};
    this.count = 0;
    this.listeners = listeners;
    
    // Tags
    this.tapwait = false;
    this.tapid = 0;
}
GestureAnalyser.prototype = {
    constructor: GestureAnalyser,
    // Blob management
    addBlob: function(e) {
        for(var i in e.touches) {
            this.blobs[i] = null;
            this.blobs[i] = new Path(e.touches[i]);
            this.count++;
            this.analyseAdd(i);
        }
    },
    updateBlob: function(e) {
        for(var i in e.touches) {
            if(!this.blobs[i]) continue;
            this.blobs[i].add(e.touches[i]);
            this.analyseUpdate(i);
        }
    },
    removeBlob: function(e) {
        for(var i in e.touches) {
            this.analyseRemove(i);
            this.count--;
            delete this.blobs[i];
        }
    },
    
    // Analyse functions
    analyseAdd: function(id) {
        if(this.count == 1){
			// One finger translate begin
			
			// Timeout for tap event
			var analyser = this;
			this.tapwait = true;
			this.tapid = id;
			setTimeout(function() {
			    analyser.tapwait = false;
			}, 500);
		}
		else if(this.count == 2){
			// Two finger scale begin
			
		}
    },
    analyseUpdate: function(id) {
        if(this.count == 1){
    		// One finger translate
    		var begin = this.blobs[id].origin();
    		var end = this.blobs[id].last();
    		var e = {'dx': end.x-begin.x, 'dy': end.y-begin.y, 'type':'translation'};
    		if(this.listeners['translate'] instanceof Callback)
    		    this.listeners['translate'].invoke( e );
    	}
    	else if(this.count == 2){
    		// Two finger scale
    		// Collect two finger info
    		var begin = [];
    		var end = [];
    		for(var id in this.blobs) {
    		    begin.push(this.blobs[id].origin());
    		    end.push(this.blobs[id].last());
    		}
    		var disBegin = [begin[1].x - begin[0].x, begin[1].y - begin[0].y];
    		var disEnd = [end[1].x - end[0].x, end[1].y - end[0].y];
    		var lbegin = Math.sqrt(disBegin[0]*disBegin[0] + disBegin[1]*disBegin[1]);
    		var lend = Math.sqrt(disEnd[0]*disEnd[0] + disEnd[1]*disEnd[1]);
    		var e = {'scale': lend/lbegin, 'type':'scale'};
    		if(this.listeners['scale'] instanceof Callback)
    		    this.listeners['scale'].invoke( e );
    	}
    },
    analyseRemove: function(id) {
        if(this.count == 1){
    		// One finger translate end or tapped
    		if(this.tapwait && this.tapid == id) {
    		    var touch = this.blobs[id].last();
    		    var e = {'offsetX': touch.x, 'offsetY': touch.y, 'type':'click'};
    		    if(this.listeners['click'] instanceof Callback)
    		        this.listeners['click'].invoke( e );
    		}
    	}
    	else if(this.count == 2){
    		// Two finger scale end
    		
    	}
    },
    
    // Math part
    computeTranslation: function() {
    }
}


// Variable private

var _pressTimer;
var dblClickTimeOut = 400;
var pressTime = 1000;
var clickTime = 200;
var swipeLSeuil = 40;
var swipeWSeuil = 30;

var _currentEvt;
var _listeners;
var _src;
var _analyser;

var _clicked = false;
var _clickDown = false;

var _prevLoc = [0,0];

// Event list
var eventsWeb = {

	click			: 'click',
	doubleClick		: 'dblclick',
	longPress		: 'mousedown mousemove mouseup',
	move			: 'mousemove',
	swipe			: 'mousedown mousemove mouseup',
	gestureSingle	: 'mousedown mousemove mouseup',
	keydown			: 'keydown',
	keypress		: 'keypress',
	keyup			: 'keyup',
	scroll			: 'mousewheel DOMMouseScroll'
};

var eventsMobile = {

	click			: 'click',
	doubleClick		: 'click',
	longPress		: 'taphold',
	move			: 'touchmove',
	swipe			: 'touchstart touchmove touchend',
	swipeleft		: 'swipeleft',
	swiperight		: 'swiperight',
	gestureSingle	: 'touchstart touchmove touchend',
	gestureMulti    : 'touchstart touchmove touchend',
	translate       : 'touchstart touchmove touchend',
	scale           : 'touchstart touchmove touchend'
};

var methods = {

	init : function( src ) {
		if( !$.data($(this), 'mselisteners') ) {
			var lis = {};
			$.data( $(this).get(0), 'mselisteners', lis );
			_analyser = new GestureAnalyser(lis);
			$.data( $(this).get(0), 'mseAnalyser', _analyser );
			if(src)
				$.data($(this).get(0), 'mseSrc', src);
		}
	},
    
    destroy : function() {
		return this.each(function(){
			// Cancel dominate
			if($.fn.mseInteraction.prototype.dominateElem == $(this).get(0))
				$.fn.mseInteraction.prototype.dominateElem = null;
			// Unbind listeners
			$(this).unbind('.mseInteraction');
			$.removeData( $(this).get(0), 'mselisteners' );
			if(MseConfig.mobile) {
				$(this).get(0).removeEventListener('touchstart', analyse, false);
				$(this).get(0).removeEventListener('touchend', analyse, false);
				$(this).get(0).removeEventListener('touchmove', analyse, false);
			}
		});
	},
	
	setDominate : function() {
		$.fn.mseInteraction.prototype.dominateElem = $(this).get(0);
	},
	cancelDominate : function() {
		if($.fn.mseInteraction.prototype.dominateElem == $(this).get(0))
			$.fn.mseInteraction.prototype.dominateElem = null;
	},
	
	addListener : function(type, cb) {
		if( typeof(type) != 'string' || !(cb instanceof Callback) )
			return false;
		
		// Events corresponds
		var evts;
		if(MseConfig.mobile) evts = eventsMobile;
		else evts = eventsWeb;
		
		if( evts[type] != null ) {
			var listeners = $.data( $(this).get(0), 'mselisteners' );
			
			// If not existe, define listeners
			if( !listeners ) {
				var lis = {};
				listeners = $.data( $(this).get(0), 'mselisteners', lis );
			}
			listeners[type] = cb;
			
			// Bind event to delegate function 'analyse'
			// No need for spercial bind
			if( !MseConfig.mobile ) 
				$(this).bind(evts[type]+'.mseInteraction', analyse);
			else {
			// Special bind for mobile touch event which is not supported by jQuery
				var arr = evts[type].split(' ');
				for( var i=0; i < arr.length; i++ ) {
					$(this).get(0).addEventListener(arr[i], analyse, false);
					//$(this).bind(arr[i], analyse);
				}
			}
		}
	},
	removeListener : function(type) {
	    var listeners = $.data( $(this).get(0), 'mselisteners' );
	    if(listeners) delete listeners[type];
	},
	
	setDelegate : function(cb) {
	    if(!cb instanceof Callback) return;
		// Events corresponds
		var evts;
		if(MseConfig.mobile) evts = eventsMobile;
		else evts = eventsWeb;
		
		var listeners = $.data( $(this).get(0), 'mselisteners' );
		
		// If not existe, fail to set delegate
		if( !listeners ) return;
		for(var type in evts)
			listeners[type] = cb;
		// Bind all events
		if(MseConfig.mobile) {
			$(this).bind('click dblclick taphold swipeleft swiperight.mseInteraction', analyse);
			$(this).get(0).addEventListener('touchstart', analyse, false);
			$(this).get(0).addEventListener('touchmove', analyse, false);
			$(this).get(0).addEventListener('touchend', analyse, false);
		}
		else {
			$(this).bind('click dblclick mousedown mousemove mouseup mousewheel DOMMouseScroll.mseInteraction', analyse);
			
			$(document).mseInteraction($.data( $(this).get(0), 'mseSrc' ));
			$(document).bind('keypress keydown keyup.mseInteraction', analyse);
			listeners = $.data( $(document).get(0), 'mselisteners' );
			listeners['keydown'] = cb;
			listeners['keyup'] = cb;
			listeners['keypress'] = cb;
		}
	},
	setMultiAnalyser : function(analyser) {
	    if(analyser instanceof GestureAnalyser) {
	        _analyser = null;
	        _analyser = analyser;
	    }
	}

};


$.fn.mseInteraction = function( method ) {

	if ( methods[method] ) {
		return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
	} else if ( typeof method === 'object' || ! method ) {
		return methods.init.apply( this, arguments );
	} else {
		$.error( 'Method ' +  method + ' does not exist on jQuery.mseInteraction' );
    }
	
};
$.fn.mseInteraction.prototype.dominateElem = null;


function dblTimeOut() {
	_clicked = false;
}

// All interaction needed is listened by this function, it will analyse all the event occured and propose the real event which is happenning
function analyse(e) {
	if( !( $.fn.mseInteraction.prototype.dominateElem == null
		|| $.fn.mseInteraction.prototype.dominateElem == $(this).get(0) ) ) {
		return;
	}
	
	// Get listener list
	_listeners = $.data( $(this).get(0), 'mselisteners' );
	_analyser = $.data( $(this).get(0), 'mseAnalyser' );
	_src = $.data( $(this).get(0), 'mseSrc' );
	_src = (!_src) ? $(this) : _src;
	if(!_listeners) return;
	
	var evt = (e.originalEvent ? e.originalEvent : e) || window.event;
	evt.preventDefault();
	var event = new MseGestEvt(evt);
	
	switch( event.type ) {
	
	case 'click' :
		if( _listeners['click'] instanceof Callback )
			;//_listeners['click'].invoke( event );
		if( _listeners['doubleClick'] instanceof Callback ) {
			// Detect the double click on mobile
			if(MseConfig.mobile) {
				// Already clicked
				if( _clicked ) {
					event.type = 'doubleClick';
					_listeners['doubleClick'].invoke( event );
					_clicked = false;
				}
				else {
					_clicked = true;
					_target = event.target;
					setTimeout( // Time out, redefine clicked as false
						dblTimeOut, 
						dblClickTimeOut );
				}
			}
		}
		break;
	
	case 'dblclick' : 
		if( _listeners['doubleClick'] instanceof Callback )
			event.type = 'doubleClick';
			_listeners['doubleClick'].invoke( event );
		break;
	
// Mouse Events	
	case 'mousedown' : 
		gestureStart(e);
		break;
		
	case 'mousemove' :
		// Gesture Analyser add new point
		if(_currentEvt != null)
			gestureUpdate(e);

		if( _listeners['move'] instanceof Callback ) {
			event.type = 'move';
			event.prev = _prevLoc;
			_listeners['move'].invoke( event );
			_prevLoc = [event.offsetX, event.offsetY];
		}
		break;
		
	case 'mouseup' :
		// Gesture Analyser add new point
		if(_currentEvt != null)
			gestureEnd(e);
		break;
		
	case 'mousewheel' :
		if( _listeners['scroll'] instanceof Callback )
			_listeners['scroll'].invoke( event );
		break;
		
	
// Touch Events for iOS
	case 'taphold' :
		if( _listeners['longPress'] instanceof Callback ){
			event.type = 'longPress';
			_listeners['longPress'].invoke( event );
		}
		break;
		
	case 'touchstart' :
		if( e.touches.length === 1 ) gestureStart(e);
		// Multi touch predefined events
		var evt = new MultiGestEvt(e, "multiGestAdd");
		_analyser.addBlob(evt);
		// Support multi touch custom events
		if( _listeners['gestureMulti'] instanceof Callback ) {
		    _listeners['gestureMulti'].invoke( evt );
		}
		break;
	
	case 'touchmove' :
		if( e.touches.length === 1 ) {
			gestureUpdate(e);
	
		    if( _listeners['move'] instanceof Callback ) {
		    	event.type = 'move';
		    	event.prev = _prevLoc;
		    	_listeners['move'].invoke( event );
		    	_prevLoc = [event.offsetX, event.offsetY];
		    }
		}
		// Multi touch predefined events
		var evt = new MultiGestEvt(e, "multiGestUpdate");
		_analyser.updateBlob(evt);
		// Support multi touch custom events
		if( _listeners['gestureMulti'] instanceof Callback ) {
		    _listeners['gestureMulti'].invoke( evt );
		}
		break;
	
	case 'touchend' : 
		if( e.touches.length === 0 )
			gestureEnd(e);
		// Multi touch predefined events
		var evt = new MultiGestEvt(e, "multiGestRemove");
		_analyser.removeBlob(evt);
		// Support multi touch custom events
		if( _listeners['gestureMulti'] instanceof Callback ) {
		    _listeners['gestureMulti'].invoke( evt );
		}
		break;
		

// Swipe Event propose by jQuery Mobile
	case 'swipeleft' :
	case 'swiperight' :
		if( _listeners[event.type] instanceof Callback )
			_listeners[event.type].invoke( event );
		break;
		
		
// Key Events Handling Generate a common result for all navigators
// Capable to handle normal key events and alt/shift pressed event(not implemented for ctrl)
// In Firefox, key 'enter' doesn't function in keypress events
    case 'keypress' :
    	if( _listeners[event.type] instanceof Callback )
    		_listeners[event.type].invoke( event );
    	break;
	case 'keydown' :
	case 'keyup' :
		if( _listeners[event.type] instanceof Callback )
			_listeners[event.type].invoke( event );
		break;
		
	}
}

function pressTimeout() {
	if(_currentEvt) {
		_currentEvt.type = 'longPress';
		_listeners['longPress'].invoke( _currentEvt );
	}
}
function clickTimeout() {_clickDown=false;}

function gestureStart(e) {
	// Gesture Analyser add start point
	_currentEvt = new MseGestEvt(e, true);
	_addPoint(e);
	
	if( _listeners['longPress'] instanceof Callback )
		_pressTimer = setTimeout( pressTimeout, pressTime );
	if( MseConfig.mobile && _listeners['click'] instanceof Callback ) {
		_clickDown = true;
		setTimeout( clickTimeout, clickTime );
	}
	if( _listeners['gestureSingle'] instanceof Callback ) {
		_currentEvt.type = 'gestureStart';
		_listeners['gestureSingle'].invoke( _currentEvt );
	}
}

function gestureUpdate(e) {
    if(!_currentEvt) return;
	_addPoint(e);
	
	if( _listeners['longPress'] instanceof Callback )
		clearTimeout(_pressTimer);
	if( _listeners['gestureSingle'] instanceof Callback ) {
		_currentEvt.type = 'gestureUpdate';
		_listeners['gestureSingle'].invoke( _currentEvt );
	}
}

function gestureEnd(e) {
    if(!_currentEvt) return;
	_currentEvt.offsetX = _currentEvt.listX[_currentEvt.listX.length-1];
	_currentEvt.offsetY = _currentEvt.listY[_currentEvt.listY.length-1];
	// Temporary tag correction modification, normally, it must be setted in mse.js( for supporting the correction with viewport in Gesture events )
	if(_currentEvt.corrected) _currentEvt.corrected = false;
	
	// Click
	if(_clickDown) {
		_currentEvt.type = 'click';
		//_listeners['click'].invoke( _currentEvt );
		_clickDown = false;
	}
	// Long Press
	if( _listeners['longPress'] instanceof Callback )
		clearTimeout(_pressTimer);
		
	// Swipe left right
	if( _listeners['swipe'] instanceof Callback ) {
		if(!MseConfig.mobile) {
			// Init
			var maxY = _currentEvt.listY[0];
			var minY = _currentEvt.listY[0];
			var length = _currentEvt.listX.length;
			var validLeft = true, validRight = true;
			
			for(var i = 1; i < length; i++) {
				// Max and Min
				if(_currentEvt.listY[i] > maxY)
					maxY = _currentEvt.listY[i];
				if(_currentEvt.listY[i] < minY)
					minY = _currentEvt.listY[i];
				
				// Direction left
				if(validRight && _currentEvt.listX[i] < _currentEvt.listX[i-1]) {
					validRight = false;
					if(!validLeft) break;
				}
				// Direction right
				if(validLeft && _currentEvt.listX[i] > _currentEvt.listX[i-1]) {
					validLeft = false;
					if(!validRight) break;
				}
			}
			
			_currentEvt.distance = Math.abs(_currentEvt.listX[length-1] - _currentEvt.listX[0]);
			
			if(maxY-minY < swipeWSeuil && _currentEvt.distance > swipeLSeuil) {
				if(validLeft) { // Swipe Left
					_currentEvt.type = 'swipeleft';
					_listeners['swipe'].invoke( _currentEvt );
				}
				else if(validRight) { // Swipe Left
					_currentEvt.type = 'swiperight';
					_listeners['swipe'].invoke( _currentEvt );
				}
			}
		}
		// Swipe up down
		var maxX = _currentEvt.listX[0];
		var minX = _currentEvt.listX[0];
		var length = _currentEvt.listX.length;
		var validUp = true, validDown = true;
		for(var i = 1; i < length; i++) {
			if(_currentEvt.listX[i] > maxX)
				maxX = _currentEvt.listX[i];
			if(_currentEvt.listX[i] < minX)
				minX = _currentEvt.listX[i];
			// Direction Up
			if(validUp && _currentEvt.listY[i] > _currentEvt.listY[i-1]) {
				validUp = false;
				if(!validDown) break;
			}
			// Direction right
			if(validDown && _currentEvt.listY[i] < _currentEvt.listY[i-1]) {
				validDown = false;
				if(!validUp) break;
			}
		}
		_currentEvt.distance = Math.abs(_currentEvt.listY[length-1] - _currentEvt.listY[0]);
		
		if(maxX-minX < swipeWSeuil && _currentEvt.distance > swipeLSeuil) {
			if(validUp) {
				_currentEvt.type = 'swipeup';
				_listeners['swipe'].invoke( _currentEvt );
			}
			else if(validDown) {
				_currentEvt.type = 'swipedown';
				_listeners['swipe'].invoke( _currentEvt );
			}
		}
	}
	
	// Gesture Single
	if( _listeners['gestureSingle'] instanceof Callback ) {
		_currentEvt.type = 'gestureEnd';
		_listeners['gestureSingle'].invoke( _currentEvt );
	}
	
	
	_currentEvt = null;
}

function _addPoint(e) {
	if( e.type.indexOf('mouse') >= 0 ) {
		// Web interacton with mouse or Android touch( TODO: correction )
		if(MseConfig.browser === 'Firefox') {
			var offX = e.pageX - $(e.target).offset().left;
			var offY = e.pageY - $(e.target).offset().top;
		}else {
			var offX = e.offsetX;
			var offY = e.offsetY;
		}
		_currentEvt.listX.push(offX);
		_currentEvt.listY.push(offY);
	}
	else {
        // iOS interaction with touch
		var touch = e.targetTouches[0]; // Get the information for finger #1
		_currentEvt.listX.push(touch.pageX - $(e.target).position().left);
		_currentEvt.listY.push(touch.pageY - $(e.target).position().top);
        
	}
	_currentEvt.offsetX = _currentEvt.listX[_currentEvt.listX.length-1];
	_currentEvt.offsetY = _currentEvt.listY[_currentEvt.listY.length-1];
// Temporary tag correction modification, normally, it must be setted in mse.js( for supporting the correction with viewport in Gesture events )
	if(_currentEvt.corrected) _currentEvt.corrected = false;
}


function MseGestEvt( e, forAnalyse ) {
	this.target = e.target;
	
	// Event for analyser to analyse the gestures
	if(forAnalyse) this.type = 'temporary';
	else this.type = e.type;
	
	this.windowX = e.clientX;
	this.windowY = e.clientY;
	if(e.type === 'touchmove') {
		var evt = e.targetTouches[0]; // Get the information for finger #1
		this.offsetX = evt.pageX - $(e.target).offset().left;
		this.offsetY = evt.pageY - $(e.target).offset().top;
	} else if(MseConfig.browser === 'Firefox') {
		this.offsetX = e.pageX - $(e.target).offset().left;
		this.offsetY = e.pageY - $(e.target).offset().top;
	} else {
		this.offsetX = e.offsetX;
		this.offsetY = e.offsetY;
	}
	
	if(forAnalyse) {
		this.listX = new Array();
		this.listY = new Array();
	}
	
	if(e.type === 'keydown' || e.type === 'keyup') {
		this.keyCode = e.keyCode;
		this.charCode = e.keyCode;
		this.altKey = e.altKey;
		this.ctrlKey = false;
		this.shiftKey = e.shiftKey;
	}
	if(e.type === 'keypress') {
		this.altKey = e.altKey==null ? false : e.altKey;
		this.ctrlKey = false;
		this.shiftKey = e.shiftKey==null ? false : e.shiftKey;
		
		if(MseConfig.browser === 'Firefox') {
			// key 'enter' doesn't function
			this.keyCode = e.charCode;
			this.charCode = e.charCode;
		}
		else {
			this.keyCode = e.keyCode;
			this.charCode = e.keyCode;
		}
	}
	if(e.type === 'DOMMouseScroll') {// Firefox
		// The measurement units of the detail and wheelDelta properties are different.
		if(e.detail) 
		    this.rolled = -40 * e.detail;
		else this.rolled = 0;
		this.type = 'mousewheel';
	}
	else if(e.type === 'mousewheel') {
	    if(e.wheelDelta)
    	    this.rolled = e.wheelDelta;
    	else this.rolled = 0;
	}
}



function MultiGestEvt( e, type ) {
    this.target = e.target;
    this.type = type;
    // Get the information for every touch
    this.touches = {};
    var tarPos = $(e.target).position();
    for(var i = 0; i < e.changedTouches.length; ++i) {
        var touch = e.changedTouches[i];
        if(!touch.identifier) continue;
        var x = touch.pageX - tarPos.left;
        var y = touch.pageY - tarPos.top;
        this.touches[touch.identifier] = {'x':x, 'y':y, 'evt':type};
    }
}


})( jQuery );



__KEY_DOWN	= 40;
__KEY_UP	= 38;
__KEY_LEFT	= 37;
__KEY_RIGHT	= 39;
__KEY_SPACE = 32;



(function() {
	var _init = false;
	
	MseConfigrationSingleton = function() {
		// Class singleton for all general configration
		this.os = BrowserDetect.OS;
        this.mobile = (this.os.indexOf("Mobile") != -1);
		this.iPhone = (this.os == "Mobile/iOS/iPhone");
		this.iPad = (this.os == "Mobile/iOS/iPad");
		this.iOS = (this.os.indexOf("Mobile/iOS") != -1);
        this.android = (this.os == "Mobile/Android");
		this.browser = BrowserDetect.browser; // Chrome/Safari/Firefox/Opera/Explorer
		//this.version = BrowserDetect.version;
		
		this.update = function() {
			if(this.iPhone || this.android) {
				this.orientation = window.innerWidth > 320 ? 'landscape' : 'portrait';
				this.pageWidth = window.innerWidth > 320 ? 480 : 320;
				this.pageHeight = window.innerWidth > 320 ? 268 : 416;
			}
			else if(this.mobile) {
				this.pageWidth = window.innerWidth;
				this.pageHeight = window.innerHeight;
			}
			else {
				this.pageWidth = $(window).width();
				this.pageHeight = $(window).height();
			}
		};

		this.update();
		
		if(this.mobile) $(window).bind('orientationchange', 
						function(e){
							setTimeout(function(){
								window.scrollTo(0, 1);
								MseConfig.update();
								if(mse.root) {
								    mse.root.setCenteredViewport();
								    if(MseConfig.mobile)
								        mse.root.gamewindow.relocate();
								}
							}, 50);
						});
	}
	
	window.initMseConfig = function() {
		if(!_init) {
			window.MseConfig = new MseConfigrationSingleton();
			_init = true;
		}
	};
	
	$(window).resize(function() {
		MseConfig.update();
	});
})();