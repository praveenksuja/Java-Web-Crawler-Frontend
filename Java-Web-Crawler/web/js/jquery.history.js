
(function($) {

function History()
{
	this._curHash = '';
	this._callback = function(hash){};
};

$.extend(History.prototype, {

	init: function(callback) {
		this._callback = callback;
		this._curHash = location.hash;

		if($.browser.msie) {
			// To stop the callback firing twice during initilization if no hash present
			if (this._curHash == '') {
				this._curHash = '#';
			}

			// add hidden iframe for IE
			$("body").prepend('<iframe id="jQuery_history" style="display: none;"></iframe>');
			var iframe = $("#jQuery_history")[0].contentWindow.document;
			iframe.open();
			iframe.close();
			iframe.location.hash = this._curHash;
		}
		else if ($.browser.safari) {
			// etablish back/forward stacks
			this._historyBackStack = [];
			this._historyBackStack.length = history.length;
			this._historyForwardStack = [];
			this._isFirst = true;
			this._dontCheck = false;
		}
		this._callback(this._curHash.replace(/^#/, ''));
		setInterval(this._check, 100);
	},

	add: function(hash) {
		// This makes the looping function do something
		this._historyBackStack.push(hash);
		
		this._historyForwardStack.length = 0; // clear forwardStack (true click occured)
		this._isFirst = true;
	},
	
});
_check: function() {
	if($.browser.msie) {
		// On IE, check for location.hash of iframe
		var ihistory = $("#jQuery_history")[0];
		var iframe = ihistory.contentDocument || ihistory.contentWindow.document;
		var current_hash = iframe.location.hash;
		if(current_hash != $.history._curHash) {
		
			location.hash = current_hash;
			$.history._curHash = current_hash;
			$.history._callback(current_hash.replace(/^#/, ''));
			
		}
	} else if ($.browser.safari) {
		if (!$.history._dontCheck) {
			var historyDelta = history.length - $.history._historyBackStack.length;
			
			if (historyDelta) { // back or forward button has been pushed
				$.history._isFirst = false;
				if (historyDelta < 0) { // back button has been pushed
					// move items to forward stack
					for (var i = 0; i < Math.abs(historyDelta); i++) $.history._historyForwardStack.unshift($.history._historyBackStack.pop());
				} else { // forward button has been pushed
					// move items to back stack
					for (var i = 0; i < historyDelta; i++) $.history._historyBackStack.push($.history._historyForwardStack.shift());
				}
				var cachedHash = $.history._historyBackStack[$.history._historyBackStack.length - 1];
				if (cachedHash != undefined) {
					$.history._curHash = location.hash;
					$.history._callback(cachedHash);
				}
			} else if ($.history._historyBackStack[$.history._historyBackStack.length - 1] == undefined && !$.history._isFirst) {
				// back button has been pushed to beginning and URL already pointed to hash (e.g. a bookmark)
				// document.URL doesn't change in Safari
				if (document.URL.indexOf('#') >= 0) {
					$.history._callback(document.URL.split('#')[1]);
				} else {
					$.history._callback('');
				}
				$.history._isFirst = true;
			}
		}
	} else {
		// otherwise, check for location.hash
		var current_hash = location.hash;
		if(current_hash != $.history._curHash) {
			$.history._curHash = current_hash;
			$.history._callback(current_hash.replace(/^#/, ''));
		}
	}
},

load: function(hash) {
	var newhash;
	
	if ($.browser.safari) {
		newhash = hash;
	} else {
		newhash = '#' + hash;
		location.hash = newhash;
	}
	this._curHash = newhash;
	
	if ($.browser.msie) {
		var ihistory = $("#jQuery_history")[0]; // TODO: need contentDocument?
		var iframe = ihistory.contentWindow.document;
		iframe.open();
		iframe.close();
		iframe.location.hash = newhash;
		this._callback(hash);
	}
	else if ($.browser.safari) {
		this._dontCheck = true;
		this.add(hash);
		
		window.setTimeout(fn, 200);
		this._callback(hash);

		location.hash = newhash;
	}
	else {
	  this._callback(hash);
	}
}
});

$(document).ready(function() {
	$.history = new History(); // singleton instance
});

})(jQuery);
