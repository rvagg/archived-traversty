/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build domready sizzle bonzo ../.. --output ender_sizzle
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);

!function () {

  var module = { exports: {} }, exports = module.exports;

  !function (name, definition) {
    if (typeof define == 'function') define(definition)
    else if (typeof module != 'undefined') module.exports = definition()
    else this[name] = this['domReady'] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , loaded = /^loade|c/.test(doc.readyState)
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, (fn = function () {
      if (/^c/.test(doc.readyState)) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    }))
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
   * Sizzle CSS Selector Engine
   *  Copyright 2011, The Dojo Foundation
   *  Released under the MIT, BSD, and GPL Licenses.
   *  More information: http://sizzlejs.com/
   */
  (function(){
  
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
  	done = 0,
  	toString = Object.prototype.toString,
  	hasDuplicate = false,
  	baseHasDuplicate = true,
  	rBackslash = /\\/g,
  	rNonWord = /\W/;
  
  // Here we check if the JavaScript engine is using some sort of
  // optimization where it does not always call our comparision
  // function. If that is the case, discard the hasDuplicate value.
  //   Thus far that includes Google Chrome.
  [0, 0].sort(function() {
  	baseHasDuplicate = false;
  	return 0;
  });
  
  var Sizzle = function( selector, context, results, seed ) {
  	results = results || [];
  	context = context || document;
  
  	var origContext = context;
  
  	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
  		return [];
  	}
  
  	if ( !selector || typeof selector !== "string" ) {
  		return results;
  	}
  
  	var m, set, checkSet, extra, ret, cur, pop, i,
  		prune = true,
  		contextXML = Sizzle.isXML( context ),
  		parts = [],
  		soFar = selector;
  
  	// Reset the position of the chunker regexp (start from head)
  	do {
  		chunker.exec( "" );
  		m = chunker.exec( soFar );
  
  		if ( m ) {
  			soFar = m[3];
  
  			parts.push( m[1] );
  
  			if ( m[2] ) {
  				extra = m[3];
  				break;
  			}
  		}
  	} while ( m );
  
  	if ( parts.length > 1 && origPOS.exec( selector ) ) {
  
  		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
  			set = posProcess( parts[0] + parts[1], context );
  
  		} else {
  			set = Expr.relative[ parts[0] ] ?
  				[ context ] :
  				Sizzle( parts.shift(), context );
  
  			while ( parts.length ) {
  				selector = parts.shift();
  
  				if ( Expr.relative[ selector ] ) {
  					selector += parts.shift();
  				}
  
  				set = posProcess( selector, set );
  			}
  		}
  
  	} else {
  		// Take a shortcut and set the context if the root selector is an ID
  		// (but not if it'll be faster if the inner selector is an ID)
  		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
  				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
  
  			ret = Sizzle.find( parts.shift(), context, contextXML );
  			context = ret.expr ?
  				Sizzle.filter( ret.expr, ret.set )[0] :
  				ret.set[0];
  		}
  
  		if ( context ) {
  			ret = seed ?
  				{ expr: parts.pop(), set: makeArray(seed) } :
  				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
  
  			set = ret.expr ?
  				Sizzle.filter( ret.expr, ret.set ) :
  				ret.set;
  
  			if ( parts.length > 0 ) {
  				checkSet = makeArray( set );
  
  			} else {
  				prune = false;
  			}
  
  			while ( parts.length ) {
  				cur = parts.pop();
  				pop = cur;
  
  				if ( !Expr.relative[ cur ] ) {
  					cur = "";
  				} else {
  					pop = parts.pop();
  				}
  
  				if ( pop == null ) {
  					pop = context;
  				}
  
  				Expr.relative[ cur ]( checkSet, pop, contextXML );
  			}
  
  		} else {
  			checkSet = parts = [];
  		}
  	}
  
  	if ( !checkSet ) {
  		checkSet = set;
  	}
  
  	if ( !checkSet ) {
  		Sizzle.error( cur || selector );
  	}
  
  	if ( toString.call(checkSet) === "[object Array]" ) {
  		if ( !prune ) {
  			results.push.apply( results, checkSet );
  
  		} else if ( context && context.nodeType === 1 ) {
  			for ( i = 0; checkSet[i] != null; i++ ) {
  				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
  					results.push( set[i] );
  				}
  			}
  
  		} else {
  			for ( i = 0; checkSet[i] != null; i++ ) {
  				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
  					results.push( set[i] );
  				}
  			}
  		}
  
  	} else {
  		makeArray( checkSet, results );
  	}
  
  	if ( extra ) {
  		Sizzle( extra, origContext, results, seed );
  		Sizzle.uniqueSort( results );
  	}
  
  	return results;
  };
  
  Sizzle.uniqueSort = function( results ) {
  	if ( sortOrder ) {
  		hasDuplicate = baseHasDuplicate;
  		results.sort( sortOrder );
  
  		if ( hasDuplicate ) {
  			for ( var i = 1; i < results.length; i++ ) {
  				if ( results[i] === results[ i - 1 ] ) {
  					results.splice( i--, 1 );
  				}
  			}
  		}
  	}
  
  	return results;
  };
  
  Sizzle.matches = function( expr, set ) {
  	return Sizzle( expr, null, null, set );
  };
  
  Sizzle.matchesSelector = function( node, expr ) {
  	return Sizzle( expr, null, null, [node] ).length > 0;
  };
  
  Sizzle.find = function( expr, context, isXML ) {
  	var set;
  
  	if ( !expr ) {
  		return [];
  	}
  
  	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
  		var match,
  			type = Expr.order[i];
  
  		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
  			var left = match[1];
  			match.splice( 1, 1 );
  
  			if ( left.substr( left.length - 1 ) !== "\\" ) {
  				match[1] = (match[1] || "").replace( rBackslash, "" );
  				set = Expr.find[ type ]( match, context, isXML );
  
  				if ( set != null ) {
  					expr = expr.replace( Expr.match[ type ], "" );
  					break;
  				}
  			}
  		}
  	}
  
  	if ( !set ) {
  		set = typeof context.getElementsByTagName !== "undefined" ?
  			context.getElementsByTagName( "*" ) :
  			[];
  	}
  
  	return { set: set, expr: expr };
  };
  
  Sizzle.filter = function( expr, set, inplace, not ) {
  	var match, anyFound,
  		old = expr,
  		result = [],
  		curLoop = set,
  		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );
  
  	while ( expr && set.length ) {
  		for ( var type in Expr.filter ) {
  			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
  				var found, item,
  					filter = Expr.filter[ type ],
  					left = match[1];
  
  				anyFound = false;
  
  				match.splice(1,1);
  
  				if ( left.substr( left.length - 1 ) === "\\" ) {
  					continue;
  				}
  
  				if ( curLoop === result ) {
  					result = [];
  				}
  
  				if ( Expr.preFilter[ type ] ) {
  					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
  
  					if ( !match ) {
  						anyFound = found = true;
  
  					} else if ( match === true ) {
  						continue;
  					}
  				}
  
  				if ( match ) {
  					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
  						if ( item ) {
  							found = filter( item, match, i, curLoop );
  							var pass = not ^ !!found;
  
  							if ( inplace && found != null ) {
  								if ( pass ) {
  									anyFound = true;
  
  								} else {
  									curLoop[i] = false;
  								}
  
  							} else if ( pass ) {
  								result.push( item );
  								anyFound = true;
  							}
  						}
  					}
  				}
  
  				if ( found !== undefined ) {
  					if ( !inplace ) {
  						curLoop = result;
  					}
  
  					expr = expr.replace( Expr.match[ type ], "" );
  
  					if ( !anyFound ) {
  						return [];
  					}
  
  					break;
  				}
  			}
  		}
  
  		// Improper expression
  		if ( expr === old ) {
  			if ( anyFound == null ) {
  				Sizzle.error( expr );
  
  			} else {
  				break;
  			}
  		}
  
  		old = expr;
  	}
  
  	return curLoop;
  };
  
  Sizzle.error = function( msg ) {
  	throw "Syntax error, unrecognized expression: " + msg;
  };
  
  var Expr = Sizzle.selectors = {
  	order: [ "ID", "NAME", "TAG" ],
  
  	match: {
  		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
  		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
  		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
  		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
  		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
  		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
  		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
  		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
  	},
  
  	leftMatch: {},
  
  	attrMap: {
  		"class": "className",
  		"for": "htmlFor"
  	},
  
  	attrHandle: {
  		href: function( elem ) {
  			return elem.getAttribute( "href" );
  		},
  		type: function( elem ) {
  			return elem.getAttribute( "type" );
  		}
  	},
  
  	relative: {
  		"+": function(checkSet, part){
  			var isPartStr = typeof part === "string",
  				isTag = isPartStr && !rNonWord.test( part ),
  				isPartStrNotTag = isPartStr && !isTag;
  
  			if ( isTag ) {
  				part = part.toLowerCase();
  			}
  
  			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
  				if ( (elem = checkSet[i]) ) {
  					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
  
  					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
  						elem || false :
  						elem === part;
  				}
  			}
  
  			if ( isPartStrNotTag ) {
  				Sizzle.filter( part, checkSet, true );
  			}
  		},
  
  		">": function( checkSet, part ) {
  			var elem,
  				isPartStr = typeof part === "string",
  				i = 0,
  				l = checkSet.length;
  
  			if ( isPartStr && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  
  				for ( ; i < l; i++ ) {
  					elem = checkSet[i];
  
  					if ( elem ) {
  						var parent = elem.parentNode;
  						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
  					}
  				}
  
  			} else {
  				for ( ; i < l; i++ ) {
  					elem = checkSet[i];
  
  					if ( elem ) {
  						checkSet[i] = isPartStr ?
  							elem.parentNode :
  							elem.parentNode === part;
  					}
  				}
  
  				if ( isPartStr ) {
  					Sizzle.filter( part, checkSet, true );
  				}
  			}
  		},
  
  		"": function(checkSet, part, isXML){
  			var nodeCheck,
  				doneName = done++,
  				checkFn = dirCheck;
  
  			if ( typeof part === "string" && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  				nodeCheck = part;
  				checkFn = dirNodeCheck;
  			}
  
  			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
  		},
  
  		"~": function( checkSet, part, isXML ) {
  			var nodeCheck,
  				doneName = done++,
  				checkFn = dirCheck;
  
  			if ( typeof part === "string" && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  				nodeCheck = part;
  				checkFn = dirNodeCheck;
  			}
  
  			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
  		}
  	},
  
  	find: {
  		ID: function( match, context, isXML ) {
  			if ( typeof context.getElementById !== "undefined" && !isXML ) {
  				var m = context.getElementById(match[1]);
  				// Check parentNode to catch when Blackberry 4.6 returns
  				// nodes that are no longer in the document #6963
  				return m && m.parentNode ? [m] : [];
  			}
  		},
  
  		NAME: function( match, context ) {
  			if ( typeof context.getElementsByName !== "undefined" ) {
  				var ret = [],
  					results = context.getElementsByName( match[1] );
  
  				for ( var i = 0, l = results.length; i < l; i++ ) {
  					if ( results[i].getAttribute("name") === match[1] ) {
  						ret.push( results[i] );
  					}
  				}
  
  				return ret.length === 0 ? null : ret;
  			}
  		},
  
  		TAG: function( match, context ) {
  			if ( typeof context.getElementsByTagName !== "undefined" ) {
  				return context.getElementsByTagName( match[1] );
  			}
  		}
  	},
  	preFilter: {
  		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
  			match = " " + match[1].replace( rBackslash, "" ) + " ";
  
  			if ( isXML ) {
  				return match;
  			}
  
  			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
  				if ( elem ) {
  					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
  						if ( !inplace ) {
  							result.push( elem );
  						}
  
  					} else if ( inplace ) {
  						curLoop[i] = false;
  					}
  				}
  			}
  
  			return false;
  		},
  
  		ID: function( match ) {
  			return match[1].replace( rBackslash, "" );
  		},
  
  		TAG: function( match, curLoop ) {
  			return match[1].replace( rBackslash, "" ).toLowerCase();
  		},
  
  		CHILD: function( match ) {
  			if ( match[1] === "nth" ) {
  				if ( !match[2] ) {
  					Sizzle.error( match[0] );
  				}
  
  				match[2] = match[2].replace(/^\+|\s*/g, '');
  
  				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
  				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
  					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
  					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
  
  				// calculate the numbers (first)n+(last) including if they are negative
  				match[2] = (test[1] + (test[2] || 1)) - 0;
  				match[3] = test[3] - 0;
  			}
  			else if ( match[2] ) {
  				Sizzle.error( match[0] );
  			}
  
  			// TODO: Move to normal caching system
  			match[0] = done++;
  
  			return match;
  		},
  
  		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
  			var name = match[1] = match[1].replace( rBackslash, "" );
  
  			if ( !isXML && Expr.attrMap[name] ) {
  				match[1] = Expr.attrMap[name];
  			}
  
  			// Handle if an un-quoted value was used
  			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );
  
  			if ( match[2] === "~=" ) {
  				match[4] = " " + match[4] + " ";
  			}
  
  			return match;
  		},
  
  		PSEUDO: function( match, curLoop, inplace, result, not ) {
  			if ( match[1] === "not" ) {
  				// If we're dealing with a complex expression, or a simple one
  				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
  					match[3] = Sizzle(match[3], null, null, curLoop);
  
  				} else {
  					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
  
  					if ( !inplace ) {
  						result.push.apply( result, ret );
  					}
  
  					return false;
  				}
  
  			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
  				return true;
  			}
  
  			return match;
  		},
  
  		POS: function( match ) {
  			match.unshift( true );
  
  			return match;
  		}
  	},
  
  	filters: {
  		enabled: function( elem ) {
  			return elem.disabled === false && elem.type !== "hidden";
  		},
  
  		disabled: function( elem ) {
  			return elem.disabled === true;
  		},
  
  		checked: function( elem ) {
  			return elem.checked === true;
  		},
  
  		selected: function( elem ) {
  			// Accessing this property makes selected-by-default
  			// options in Safari work properly
  			if ( elem.parentNode ) {
  				elem.parentNode.selectedIndex;
  			}
  
  			return elem.selected === true;
  		},
  
  		parent: function( elem ) {
  			return !!elem.firstChild;
  		},
  
  		empty: function( elem ) {
  			return !elem.firstChild;
  		},
  
  		has: function( elem, i, match ) {
  			return !!Sizzle( match[3], elem ).length;
  		},
  
  		header: function( elem ) {
  			return (/h\d/i).test( elem.nodeName );
  		},
  
  		text: function( elem ) {
  			var attr = elem.getAttribute( "type" ), type = elem.type;
  			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
  			// use getAttribute instead to test this case
  			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
  		},
  
  		radio: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
  		},
  
  		checkbox: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
  		},
  
  		file: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
  		},
  
  		password: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
  		},
  
  		submit: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return (name === "input" || name === "button") && "submit" === elem.type;
  		},
  
  		image: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
  		},
  
  		reset: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return (name === "input" || name === "button") && "reset" === elem.type;
  		},
  
  		button: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return name === "input" && "button" === elem.type || name === "button";
  		},
  
  		input: function( elem ) {
  			return (/input|select|textarea|button/i).test( elem.nodeName );
  		},
  
  		focus: function( elem ) {
  			return elem === elem.ownerDocument.activeElement;
  		}
  	},
  	setFilters: {
  		first: function( elem, i ) {
  			return i === 0;
  		},
  
  		last: function( elem, i, match, array ) {
  			return i === array.length - 1;
  		},
  
  		even: function( elem, i ) {
  			return i % 2 === 0;
  		},
  
  		odd: function( elem, i ) {
  			return i % 2 === 1;
  		},
  
  		lt: function( elem, i, match ) {
  			return i < match[3] - 0;
  		},
  
  		gt: function( elem, i, match ) {
  			return i > match[3] - 0;
  		},
  
  		nth: function( elem, i, match ) {
  			return match[3] - 0 === i;
  		},
  
  		eq: function( elem, i, match ) {
  			return match[3] - 0 === i;
  		}
  	},
  	filter: {
  		PSEUDO: function( elem, match, i, array ) {
  			var name = match[1],
  				filter = Expr.filters[ name ];
  
  			if ( filter ) {
  				return filter( elem, i, match, array );
  
  			} else if ( name === "contains" ) {
  				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
  
  			} else if ( name === "not" ) {
  				var not = match[3];
  
  				for ( var j = 0, l = not.length; j < l; j++ ) {
  					if ( not[j] === elem ) {
  						return false;
  					}
  				}
  
  				return true;
  
  			} else {
  				Sizzle.error( name );
  			}
  		},
  
  		CHILD: function( elem, match ) {
  			var type = match[1],
  				node = elem;
  
  			switch ( type ) {
  				case "only":
  				case "first":
  					while ( (node = node.previousSibling) )	 {
  						if ( node.nodeType === 1 ) {
  							return false;
  						}
  					}
  
  					if ( type === "first" ) {
  						return true;
  					}
  
  					node = elem;
  
  				case "last":
  					while ( (node = node.nextSibling) )	 {
  						if ( node.nodeType === 1 ) {
  							return false;
  						}
  					}
  
  					return true;
  
  				case "nth":
  					var first = match[2],
  						last = match[3];
  
  					if ( first === 1 && last === 0 ) {
  						return true;
  					}
  
  					var doneName = match[0],
  						parent = elem.parentNode;
  
  					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
  						var count = 0;
  
  						for ( node = parent.firstChild; node; node = node.nextSibling ) {
  							if ( node.nodeType === 1 ) {
  								node.nodeIndex = ++count;
  							}
  						}
  
  						parent.sizcache = doneName;
  					}
  
  					var diff = elem.nodeIndex - last;
  
  					if ( first === 0 ) {
  						return diff === 0;
  
  					} else {
  						return ( diff % first === 0 && diff / first >= 0 );
  					}
  			}
  		},
  
  		ID: function( elem, match ) {
  			return elem.nodeType === 1 && elem.getAttribute("id") === match;
  		},
  
  		TAG: function( elem, match ) {
  			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
  		},
  
  		CLASS: function( elem, match ) {
  			return (" " + (elem.className || elem.getAttribute("class")) + " ")
  				.indexOf( match ) > -1;
  		},
  
  		ATTR: function( elem, match ) {
  			var name = match[1],
  				result = Expr.attrHandle[ name ] ?
  					Expr.attrHandle[ name ]( elem ) :
  					elem[ name ] != null ?
  						elem[ name ] :
  						elem.getAttribute( name ),
  				value = result + "",
  				type = match[2],
  				check = match[4];
  
  			return result == null ?
  				type === "!=" :
  				type === "=" ?
  				value === check :
  				type === "*=" ?
  				value.indexOf(check) >= 0 :
  				type === "~=" ?
  				(" " + value + " ").indexOf(check) >= 0 :
  				!check ?
  				value && result !== false :
  				type === "!=" ?
  				value !== check :
  				type === "^=" ?
  				value.indexOf(check) === 0 :
  				type === "$=" ?
  				value.substr(value.length - check.length) === check :
  				type === "|=" ?
  				value === check || value.substr(0, check.length + 1) === check + "-" :
  				false;
  		},
  
  		POS: function( elem, match, i, array ) {
  			var name = match[2],
  				filter = Expr.setFilters[ name ];
  
  			if ( filter ) {
  				return filter( elem, i, match, array );
  			}
  		}
  	}
  };
  
  var origPOS = Expr.match.POS,
  	fescape = function(all, num){
  		return "\\" + (num - 0 + 1);
  	};
  
  for ( var type in Expr.match ) {
  	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
  	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
  }
  
  var makeArray = function( array, results ) {
  	array = Array.prototype.slice.call( array, 0 );
  
  	if ( results ) {
  		results.push.apply( results, array );
  		return results;
  	}
  
  	return array;
  };
  
  // Perform a simple check to determine if the browser is capable of
  // converting a NodeList to an array using builtin methods.
  // Also verifies that the returned array holds DOM nodes
  // (which is not the case in the Blackberry browser)
  try {
  	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;
  
  // Provide a fallback method if it does not work
  } catch( e ) {
  	makeArray = function( array, results ) {
  		var i = 0,
  			ret = results || [];
  
  		if ( toString.call(array) === "[object Array]" ) {
  			Array.prototype.push.apply( ret, array );
  
  		} else {
  			if ( typeof array.length === "number" ) {
  				for ( var l = array.length; i < l; i++ ) {
  					ret.push( array[i] );
  				}
  
  			} else {
  				for ( ; array[i]; i++ ) {
  					ret.push( array[i] );
  				}
  			}
  		}
  
  		return ret;
  	};
  }
  
  var sortOrder, siblingCheck;
  
  if ( document.documentElement.compareDocumentPosition ) {
  	sortOrder = function( a, b ) {
  		if ( a === b ) {
  			hasDuplicate = true;
  			return 0;
  		}
  
  		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
  			return a.compareDocumentPosition ? -1 : 1;
  		}
  
  		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  	};
  
  } else {
  	sortOrder = function( a, b ) {
  		// The nodes are identical, we can exit early
  		if ( a === b ) {
  			hasDuplicate = true;
  			return 0;
  
  		// Fallback to using sourceIndex (in IE) if it's available on both nodes
  		} else if ( a.sourceIndex && b.sourceIndex ) {
  			return a.sourceIndex - b.sourceIndex;
  		}
  
  		var al, bl,
  			ap = [],
  			bp = [],
  			aup = a.parentNode,
  			bup = b.parentNode,
  			cur = aup;
  
  		// If the nodes are siblings (or identical) we can do a quick check
  		if ( aup === bup ) {
  			return siblingCheck( a, b );
  
  		// If no parents were found then the nodes are disconnected
  		} else if ( !aup ) {
  			return -1;
  
  		} else if ( !bup ) {
  			return 1;
  		}
  
  		// Otherwise they're somewhere else in the tree so we need
  		// to build up a full list of the parentNodes for comparison
  		while ( cur ) {
  			ap.unshift( cur );
  			cur = cur.parentNode;
  		}
  
  		cur = bup;
  
  		while ( cur ) {
  			bp.unshift( cur );
  			cur = cur.parentNode;
  		}
  
  		al = ap.length;
  		bl = bp.length;
  
  		// Start walking down the tree looking for a discrepancy
  		for ( var i = 0; i < al && i < bl; i++ ) {
  			if ( ap[i] !== bp[i] ) {
  				return siblingCheck( ap[i], bp[i] );
  			}
  		}
  
  		// We ended someplace up the tree so do a sibling check
  		return i === al ?
  			siblingCheck( a, bp[i], -1 ) :
  			siblingCheck( ap[i], b, 1 );
  	};
  
  	siblingCheck = function( a, b, ret ) {
  		if ( a === b ) {
  			return ret;
  		}
  
  		var cur = a.nextSibling;
  
  		while ( cur ) {
  			if ( cur === b ) {
  				return -1;
  			}
  
  			cur = cur.nextSibling;
  		}
  
  		return 1;
  	};
  }
  
  // Utility function for retreiving the text value of an array of DOM nodes
  Sizzle.getText = function( elems ) {
  	var ret = "", elem;
  
  	for ( var i = 0; elems[i]; i++ ) {
  		elem = elems[i];
  
  		// Get the text from text nodes and CDATA nodes
  		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
  			ret += elem.nodeValue;
  
  		// Traverse everything else, except comment nodes
  		} else if ( elem.nodeType !== 8 ) {
  			ret += Sizzle.getText( elem.childNodes );
  		}
  	}
  
  	return ret;
  };
  
  // Check to see if the browser returns elements by name when
  // querying by getElementById (and provide a workaround)
  (function(){
  	// We're going to inject a fake input element with a specified name
  	var form = document.createElement("div"),
  		id = "script" + (new Date()).getTime(),
  		root = document.documentElement;
  
  	form.innerHTML = "<a name='" + id + "'/>";
  
  	// Inject it into the root element, check its status, and remove it quickly
  	root.insertBefore( form, root.firstChild );
  
  	// The workaround has to do additional checks after a getElementById
  	// Which slows things down for other browsers (hence the branching)
  	if ( document.getElementById( id ) ) {
  		Expr.find.ID = function( match, context, isXML ) {
  			if ( typeof context.getElementById !== "undefined" && !isXML ) {
  				var m = context.getElementById(match[1]);
  
  				return m ?
  					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
  						[m] :
  						undefined :
  					[];
  			}
  		};
  
  		Expr.filter.ID = function( elem, match ) {
  			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
  
  			return elem.nodeType === 1 && node && node.nodeValue === match;
  		};
  	}
  
  	root.removeChild( form );
  
  	// release memory in IE
  	root = form = null;
  })();
  
  (function(){
  	// Check to see if the browser returns only elements
  	// when doing getElementsByTagName("*")
  
  	// Create a fake element
  	var div = document.createElement("div");
  	div.appendChild( document.createComment("") );
  
  	// Make sure no comments are found
  	if ( div.getElementsByTagName("*").length > 0 ) {
  		Expr.find.TAG = function( match, context ) {
  			var results = context.getElementsByTagName( match[1] );
  
  			// Filter out possible comments
  			if ( match[1] === "*" ) {
  				var tmp = [];
  
  				for ( var i = 0; results[i]; i++ ) {
  					if ( results[i].nodeType === 1 ) {
  						tmp.push( results[i] );
  					}
  				}
  
  				results = tmp;
  			}
  
  			return results;
  		};
  	}
  
  	// Check to see if an attribute returns normalized href attributes
  	div.innerHTML = "<a href='#'></a>";
  
  	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
  			div.firstChild.getAttribute("href") !== "#" ) {
  
  		Expr.attrHandle.href = function( elem ) {
  			return elem.getAttribute( "href", 2 );
  		};
  	}
  
  	// release memory in IE
  	div = null;
  })();
  
  if ( document.querySelectorAll ) {
  	(function(){
  		var oldSizzle = Sizzle,
  			div = document.createElement("div"),
  			id = "__sizzle__";
  
  		div.innerHTML = "<p class='TEST'></p>";
  
  		// Safari can't handle uppercase or unicode characters when
  		// in quirks mode.
  		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
  			return;
  		}
  
  		Sizzle = function( query, context, extra, seed ) {
  			context = context || document;
  
  			// Only use querySelectorAll on non-XML documents
  			// (ID selectors don't work in non-HTML documents)
  			if ( !seed && !Sizzle.isXML(context) ) {
  				// See if we find a selector to speed up
  				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
  
  				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
  					// Speed-up: Sizzle("TAG")
  					if ( match[1] ) {
  						return makeArray( context.getElementsByTagName( query ), extra );
  
  					// Speed-up: Sizzle(".CLASS")
  					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
  						return makeArray( context.getElementsByClassName( match[2] ), extra );
  					}
  				}
  
  				if ( context.nodeType === 9 ) {
  					// Speed-up: Sizzle("body")
  					// The body element only exists once, optimize finding it
  					if ( query === "body" && context.body ) {
  						return makeArray( [ context.body ], extra );
  
  					// Speed-up: Sizzle("#ID")
  					} else if ( match && match[3] ) {
  						var elem = context.getElementById( match[3] );
  
  						// Check parentNode to catch when Blackberry 4.6 returns
  						// nodes that are no longer in the document #6963
  						if ( elem && elem.parentNode ) {
  							// Handle the case where IE and Opera return items
  							// by name instead of ID
  							if ( elem.id === match[3] ) {
  								return makeArray( [ elem ], extra );
  							}
  
  						} else {
  							return makeArray( [], extra );
  						}
  					}
  
  					try {
  						return makeArray( context.querySelectorAll(query), extra );
  					} catch(qsaError) {}
  
  				// qSA works strangely on Element-rooted queries
  				// We can work around this by specifying an extra ID on the root
  				// and working up from there (Thanks to Andrew Dupont for the technique)
  				// IE 8 doesn't work on object elements
  				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
  					var oldContext = context,
  						old = context.getAttribute( "id" ),
  						nid = old || id,
  						hasParent = context.parentNode,
  						relativeHierarchySelector = /^\s*[+~]/.test( query );
  
  					if ( !old ) {
  						context.setAttribute( "id", nid );
  					} else {
  						nid = nid.replace( /'/g, "\\$&" );
  					}
  					if ( relativeHierarchySelector && hasParent ) {
  						context = context.parentNode;
  					}
  
  					try {
  						if ( !relativeHierarchySelector || hasParent ) {
  							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
  						}
  
  					} catch(pseudoError) {
  					} finally {
  						if ( !old ) {
  							oldContext.removeAttribute( "id" );
  						}
  					}
  				}
  			}
  
  			return oldSizzle(query, context, extra, seed);
  		};
  
  		for ( var prop in oldSizzle ) {
  			Sizzle[ prop ] = oldSizzle[ prop ];
  		}
  
  		// release memory in IE
  		div = null;
  	})();
  }
  
  (function(){
  	var html = document.documentElement,
  		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
  
  	if ( matches ) {
  		// Check to see if it's possible to do matchesSelector
  		// on a disconnected node (IE 9 fails this)
  		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
  			pseudoWorks = false;
  
  		try {
  			// This should fail with an exception
  			// Gecko does not error, returns false instead
  			matches.call( document.documentElement, "[test!='']:sizzle" );
  
  		} catch( pseudoError ) {
  			pseudoWorks = true;
  		}
  
  		Sizzle.matchesSelector = function( node, expr ) {
  			// Make sure that attribute selectors are quoted
  			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
  
  			if ( !Sizzle.isXML( node ) ) {
  				try {
  					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
  						var ret = matches.call( node, expr );
  
  						// IE 9's matchesSelector returns false on disconnected nodes
  						if ( ret || !disconnectedMatch ||
  								// As well, disconnected nodes are said to be in a document
  								// fragment in IE 9, so check for that
  								node.document && node.document.nodeType !== 11 ) {
  							return ret;
  						}
  					}
  				} catch(e) {}
  			}
  
  			return Sizzle(expr, null, null, [node]).length > 0;
  		};
  	}
  })();
  
  (function(){
  	var div = document.createElement("div");
  
  	div.innerHTML = "<div class='test e'></div><div class='test'></div>";
  
  	// Opera can't find a second classname (in 9.6)
  	// Also, make sure that getElementsByClassName actually exists
  	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
  		return;
  	}
  
  	// Safari caches class attributes, doesn't catch changes (in 3.2)
  	div.lastChild.className = "e";
  
  	if ( div.getElementsByClassName("e").length === 1 ) {
  		return;
  	}
  
  	Expr.order.splice(1, 0, "CLASS");
  	Expr.find.CLASS = function( match, context, isXML ) {
  		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
  			return context.getElementsByClassName(match[1]);
  		}
  	};
  
  	// release memory in IE
  	div = null;
  })();
  
  function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
  		var elem = checkSet[i];
  
  		if ( elem ) {
  			var match = false;
  
  			elem = elem[dir];
  
  			while ( elem ) {
  				if ( elem.sizcache === doneName ) {
  					match = checkSet[elem.sizset];
  					break;
  				}
  
  				if ( elem.nodeType === 1 && !isXML ){
  					elem.sizcache = doneName;
  					elem.sizset = i;
  				}
  
  				if ( elem.nodeName.toLowerCase() === cur ) {
  					match = elem;
  					break;
  				}
  
  				elem = elem[dir];
  			}
  
  			checkSet[i] = match;
  		}
  	}
  }
  
  function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
  		var elem = checkSet[i];
  
  		if ( elem ) {
  			var match = false;
  
  			elem = elem[dir];
  
  			while ( elem ) {
  				if ( elem.sizcache === doneName ) {
  					match = checkSet[elem.sizset];
  					break;
  				}
  
  				if ( elem.nodeType === 1 ) {
  					if ( !isXML ) {
  						elem.sizcache = doneName;
  						elem.sizset = i;
  					}
  
  					if ( typeof cur !== "string" ) {
  						if ( elem === cur ) {
  							match = true;
  							break;
  						}
  
  					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
  						match = elem;
  						break;
  					}
  				}
  
  				elem = elem[dir];
  			}
  
  			checkSet[i] = match;
  		}
  	}
  }
  
  if ( document.documentElement.contains ) {
  	Sizzle.contains = function( a, b ) {
  		return a !== b && (a.contains ? a.contains(b) : true);
  	};
  
  } else if ( document.documentElement.compareDocumentPosition ) {
  	Sizzle.contains = function( a, b ) {
  		return !!(a.compareDocumentPosition(b) & 16);
  	};
  
  } else {
  	Sizzle.contains = function() {
  		return false;
  	};
  }
  
  Sizzle.isXML = function( elem ) {
  	// documentElement is verified for cases where it doesn't yet exist
  	// (such as loading iframes in IE - #4833)
  	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
  
  	return documentElement ? documentElement.nodeName !== "HTML" : false;
  };
  
  var posProcess = function( selector, context ) {
  	var match,
  		tmpSet = [],
  		later = "",
  		root = context.nodeType ? [context] : context;
  
  	// Position selectors must be done after the filter
  	// And so must :not(positional) so we move all PSEUDOs to the end
  	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
  		later += match[0];
  		selector = selector.replace( Expr.match.PSEUDO, "" );
  	}
  
  	selector = Expr.relative[selector] ? selector + "*" : selector;
  
  	for ( var i = 0, l = root.length; i < l; i++ ) {
  		Sizzle( selector, root[i], tmpSet );
  	}
  
  	return Sizzle.filter( later, tmpSet );
  };
  
  // EXPOSE
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sizzle;
  } else {
    window.Sizzle = Sizzle;
  }
  
  
  })();
  

  provide("sizzle", module.exports);

  !function (doc) {
    var Sizzle = require('sizzle')
    var table = 'table',
        nodeMap = {
          thead: table,
          tbody: table,
          tfoot: table,
          tr: 'tbody',
          th: 'tr',
          td: 'tr',
          fieldset: 'form',
          option: 'select'
        }
  
    function create(node, root) {
      var tag = /^<([^\s>]+)/.exec(node)[1]
      var el = (root || doc).createElement(nodeMap[tag] || 'div'), els = [];
      el.innerHTML = node;
      var nodes = el.childNodes;
      el = el.firstChild;
      els.push(el);
      while (el = el.nextSibling) {
        (el.nodeType == 1) && els.push(el);
      }
      return els;
    }
    $._select = function (s, r) {
      return /^\s*</.test(s) ? create(s, r) : Sizzle(s, r);
    };
  
    $.ender({
      find: function (s) {
        return $(Sizzle(s, this[0]));
      }
    }, true);
  }(document);

}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2011
    * https://github.com/ded/bonzo
    * License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
  }('bonzo', function() {
    var context = this
      , win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null
      , specialAttributes = /^checked|value|selected$/
      , specialTags = /select|fieldset|table|tbody|tfoot|td|tr|colgroup/i
      , table = [ '<table>', '</table>', 1 ]
      , td = [ '<table><tbody><tr>', '</tr></tbody></table>', 3 ]
      , option = [ '<select>', '</select>', 1 ]
      , tagMap = {
          thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: [ '<table><tbody>', '</tbody></table>', 2 ]
          , th: td , td: td
          , col: [ '<table><colgroup>', '</colgroup></table>', 2 ]
          , fieldset: [ '<form>', '</form>', 1 ]
          , legend: [ '<form><fieldset>', '</fieldset></form>', 2 ]
          , option: option
          , optgroup: option }
      , stateAttributes = /^checked|selected$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
    function each(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) fn.call(scope || ar[i], ar[i], i, ar)
      return ar
    }
  
    function deepEach(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, scope)
          fn.call(scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
    function clearData(el) {
      uid = el[getAttribute]('data-node-uid')
      uid && (delete uidMap[uid])
    }
  
    function dataValue(d) {
      try {
        return d === 'true' ? true : d === 'false' ? false : d === 'null' ? null : !isNaN(d) ? parseFloat(d) : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && node.nodeType == 1
    }
  
    function some(ar, fn, scope, i) {
      for (i = 0, j = ar.length; i < j; ++i) if (fn.call(scope, ar[i], i, ar)) return true
      return false
    }
  
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      function (el, property) {
        if (property == 'opacity') {
          var val = 100
          try {
            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el.filters('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t) {
        each(self, function (el) {
          var n = !el[parentNode] || (el[parentNode] && !el[parentNode][parentNode]) ?
            function () {
              var c = el.cloneNode(true)
              // check for existence of an event cloner
              // preferably https://github.com/fat/bean
              // otherwise Bonzo won't do this for you
              self.$ && self.cloneEvents && self.$(c).cloneEvents(el)
              return c
            }() : el
          fn(t, n)
          r[i] = n
          i++
        })
      }, this)
      each(r, function (e, i) {
        self[i] = e
      })
      self.length = i
      return self
    }
  
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once,
    // so we have to iterate. bullshit
    if (features.classList) {
      hasClass = function (el, c) {
        return some(c.toString().split(' '), function (c) {
          return el.classList.contains(c)
        })
      }
      addClass = function (el, c) {
        each(c.toString().split(' '), function (c) {
          el.classList.add(c)
        })
      }
      removeClass = function (el, c) { el.classList.remove(c) }
    }
    else {
      hasClass = function (el, c) { return classReg(c).test(el.className) }
      addClass = function (el, c) { el.className = trim(el.className + ' ' + c) }
      removeClass = function (el, c) { el.className = trim(el.className.replace(classReg(c), ' ')) }
    }
  
  
    // this allows method calling for setting values
    // example:
    // bonzo(elements).css('color', function (el) {
    //   return el.getAttribute('data-original-color')
    // })
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) {
          this[i] = elements[i]
        }
      }
    }
  
    Bonzo.prototype = {
  
        // indexr method, because jQueriers want this method
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
      , each: function (fn, scope) {
          return each(this, fn, scope)
        }
  
      , deepEach: function (fn, scope) {
          return deepEach(this, fn, scope)
        }
  
      , map: function (fn, reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            reject ? (reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
      , html: function (h, text) {
          var method = text ?
            html.textContent === undefined ?
              'innerText' :
              'textContent' :
            'innerHTML', m;
          function append(el) {
            each(normalize(h), function (node) {
              el.appendChild(node)
            })
          }
          return typeof h !== 'undefined' ?
              this.empty().each(function (el) {
                !text && (m = el.tagName.match(specialTags)) ?
                  append(el, m[0]) :
                  !function() {
                    try { (el[method] = h) }
                    catch(e) { append(el) }
                  }();
              }) :
            this[0] ? this[0][method] : ''
        }
  
      , text: function (text) {
          return this.html(text, 1)
        }
  
        // more related insertion methods
      , append: function (node) {
          return this.each(function (el) {
            each(normalize(node), function (i) {
              el.appendChild(i)
            })
          })
        }
  
      , prepend: function (node) {
          return this.each(function (el) {
            var first = el.firstChild
            each(normalize(node), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
      , appendTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.appendChild(el)
          })
        }
  
      , prependTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          })
        }
  
      , before: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
      , after: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            })
          })
        }
  
      , insertBefore: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
      , insertAfter: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            var sibling = t.nextSibling
            if (sibling) {
              t[parentNode].insertBefore(el, sibling);
            }
            else {
              t[parentNode].appendChild(el)
            }
          })
        }
  
      , replaceWith: function(html) {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el.parentNode.replaceChild(bonzo.create(html)[0], el)
          })
        }
  
        // class management
      , addClass: function (c) {
          return this.each(function (el) {
            hasClass(el, setter(el, c)) || addClass(el, setter(el, c))
          })
        }
  
      , removeClass: function (c) {
          return this.each(function (el) {
            hasClass(el, setter(el, c)) && removeClass(el, setter(el, c))
          })
        }
  
      , hasClass: function (c) {
          return some(this, function (el) {
            return hasClass(el, c)
          })
        }
  
      , toggleClass: function (c, condition) {
          return this.each(function (el) {
            typeof condition !== 'undefined' ?
              condition ? addClass(el, c) : removeClass(el, c) :
              hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
          })
        }
  
        // display togglers
      , show: function (type) {
          return this.each(function (el) {
            el.style.display = type || ''
          })
        }
  
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
      , toggle: function (callback, type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : type || ''
          })
          callback && callback()
          return this
        }
  
        // DOM Walkers & getters
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
      , next: function () {
          return this.related('nextSibling')
        }
  
      , previous: function () {
          return this.related('previousSibling')
        }
  
      , parent: function() {
        return this.related('parentNode')
      }
  
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
        // meh. use with care. the ones in Bean are better
      , focus: function () {
          return this.length > 0 ? this[0].focus() : null
        }
  
      , blur: function () {
          return this.each(function (el) {
            el.blur()
          })
        }
  
        // style getter setter & related methods
      , css: function (o, v, p) {
          // is this a request for just getting a style?
          if (v === undefined && typeof o == 'string') {
            // repurpose 'v'
            v = this[0]
            if (!v) {
              return null
            }
            if (v === doc || v === win) {
              p = (v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(v, o) : null
          }
          var iter = o
          if (typeof o == 'string') {
            iter = {}
            iter[o] = v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }
  
      , offset: function (x, y) {
          if (typeof x == 'number' || typeof y == 'number') {
            return this.each(function (el) {
              xy(el, x, y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
      , dim: function () {
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t, s) {
                  s = {
                      position: el.style.position || ''
                    , visibility: el.style.visibility || ''
                    , display: el.style.display || ''
                  }
                  t.first().css({
                      position: 'absolute'
                    , visibility: 'hidden'
                    , display: 'block'
                  })
                  return s
                }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
      , attr: function (k, v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof v == 'undefined' ?
            specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, v)) : el[setAttribute](k, setter(el, v))
            })
        }
  
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
      , val: function (s) {
          return (typeof s == 'string') ? this.attr('value', s) : this[0].value
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
      , data: function (k, v) {
          var el = this[0], uid, o, m
          if (typeof v === 'undefined') {
            o = data(el)
            if (typeof k === 'undefined') {
              each(el.attributes, function(a) {
                (m = (''+a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              return typeof o[k] === 'undefined' ?
                (o[k] = dataValue(this.attr('data-' + decamelize(k)))) : o[k]
            }
          } else {
            return this.each(function (el) { data(el)[k] = v })
          }
        }
  
        // DOM detachment & related
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
      , detach: function () {
          return this.map(function (el) {
            return el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node) {
      return typeof node == 'string' ? bonzo.create(node) : isNode(node) ? [node] : node // assume [nodes]
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    function bonzo(els, host) {
      return new Bonzo(els, host)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
  
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  })
  

  provide("bonzo", module.exports);

  !function ($) {
  
    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension(v, this, 'height')
      }
  
    , width: function (v) {
        return dimension(v, this, 'width')
      }
    }, true)
  
    function dimension(v, self, which) {
      return v ?
        self.css(which, v) :
        function (r) {
          if (!self[0]) return 0
          r = parseInt(self.css(which), 10);
          return isNaN(r) ? self[0]['offset' + which.replace(/^\w/, function (m) {return m.toUpperCase()})] : r
        }()
    }
  
  }(ender);
  

}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /**************************************************************
    * Traversty: DOM Traversal Utility (c) Rod Vagg (@rvagg) 2011
    * https://github.com/rvagg/traversty
    * License: MIT
    */
  
  !(function (name, definition) {
    if (typeof module !== 'undefined') module.exports = definition()
    else if (typeof define === 'function' && define.amd) define(name, definition)
    else this[name] = definition()
  }('traversty', function () {
  
    var context = this
      , old = context.traversty
      , doc = window.document
      , html = doc.documentElement
      , toString = Object.prototype.toString
      , slice = Array.prototype.slice
        // feature test to find native matchesSelector()
      , matchesSelector = (function (el, pfx, name, i, ms) {
          while (i < pfx.length)
            if (el[ms = pfx[i++] + name]) return ms
          if (el[name = 'm' + name.substring(1)]) return name
        }(html, [ 'ms', 'webkit', 'moz', 'o' ], 'MatchesSelector', 0))
  
      , isNumber = function (o) {
          return toString.call(o) === '[object Number]'
        }
  
      , isString = function (o) {
          return toString.call(o) === '[object String]'
        }
  
      , isFunction = function (o) {
          return toString.call(o) === '[object Function]'
        }
  
      , isUndefined = function (o) {
          return o === void 0
        }
  
      , isElement = function (o) {
          return o && o.nodeType === 1
        }
  
        // figure out which argument, if any, is our 'index'
      , getIndex = function (selector, index) {
          return isUndefined(selector) && !isNumber(index) ? 0 :
            isNumber(selector) ? selector : isNumber(index) ? index : null
        }
  
        // figure out which argument, if any, is our 'selector'
      , getSelector = function (selector) {
          return isString(selector) ? selector : '*'
        }
  
      , nativeSelectorFind = function (selector, el) {
          return slice.call(el.querySelectorAll(selector), 0)
        }
  
      , nativeSelectorMatches = function (selector, el) {
          return selector === '*' || el[matchesSelector](selector)
        }
  
      , selectorFind = nativeSelectorFind
  
      , selectorMatches = nativeSelectorMatches
  
        // used in the case where our selector engine does out-of-order element returns for
        // grouped selectors, e.g. '.class, tag', we need our elements in document-order
        // so we do it ourselves if need be
      , createUnorderedEngineSelectorFind = function(engineSelect, selectorMatches) {
          return function (selector, el) {
            if (/,/.test(selector)) {
              var ret = [], i = -1, els = el.getElementsByTagName('*')
              while (++i < els.length) {
                if (isElement(els[i]) && selectorMatches(selector, els[i])) ret.push(els[i])
              }
              return ret
            }
            return engineSelect(selector, el)
          }
        }
  
      , unique = function (ar) {
          var a = [], i = -1, j, has
          while (++i < ar.length) {
            j = -1
            has = false
            while (++j < a.length) {
              if (a[j] === ar[i]) {
                has = true
                break
              }
            }
            if (!has) a.push(ar[i])
          }
          return a
        }
  
      , collect = function (els, fn) {
          var ret = [], i = 0, l = els.length
          while (i < l) ret = ret.concat(fn(els[i++]))
          return ret
        }
  
     , move = function (els, method, selector, index) {
          index = getIndex(selector, index)
          selector = getSelector(selector)
          return collect(els
            , function (el) {
                var i = index || 0, ret = []
                while (el && (index === null || i >= 0)) {
                  el = el[method]
                  // ignore non-elements, only consider selector-matching elements
                  // handle both the index and no-index (selector-only) cases
                  if (isElement(el) &&
                      selectorMatches(selector, el) &&
                      (index === null || i-- === 0)) {
                    // this concat vs push is to make sure we add elements to the result array
                    // in reverse order when doing a previous(selector) and up(selector)
                    index === null && method !== 'nextSibling' ? ret = [el].concat(ret) : ret.push(el)
                  }
                }
                return ret
              }
          )
        }
  
      , traversty = (function () {
          function T(els) {
            this.length = 0
            if (els) {
              els = unique(!els.nodeType && !isUndefined(els.length) ? els : [ els ])
              var i = this.length = els.length
              while (i--) this[i] = els[i]
            }
          }
  
          T.prototype = {
              down: function (selector, index) {
                index = getIndex(selector, index)
                selector = getSelector(selector)
                return traversty(collect(this
                  , function (el) {
                      var f = selectorFind(selector, el)
                      return index === null ? f : ([ f[index] ] || [])
                    }
                  ))
              }
  
            , up: function (selector, index) {
                return traversty(move(this, 'parentNode', selector, index))
              }
  
            , previous: function (selector, index) {
                return traversty(move(this, 'previousSibling', selector, index))
              }
  
            , next: function (selector, index) {
                return traversty(move(this, 'nextSibling', selector, index))
              }
          }
  
          function t(els) {
            return new T(isString(els) ? selectorFind(els, doc) : els)
          }
  
          t.setSelectorEngine = function (s) {
            // feature testing the selector engine like a boss
            var ss, r, a, _selectorMatches, _selectorFind
              , e = doc.createElement('p')
              , select = s.select || s.sel || s
            e.innerHTML = '<a/><i/><b/>'
            a = e.firstChild
            try {
              // check to see how we do a matchesSelector
              _selectorMatches =
                isFunction(s.matching) ? function (selector, el) { return s.matching([el], selector).length > 0 } :
                  isFunction(s.is) ? function (selector, el) { return s.is(el, selector) } :
                    isFunction(s.matchesSelector) ? function (selector, el) { return s.matchesSelector(el, selector) } :
                      isFunction(s.match) ? function (selector, el) { return s.match(el, selector) } : null
  
              if (!_selectorMatches) {
                // perhaps it's an selector(x).is(y) type selector?
                ss = s('a', e)
                _selectorMatches =
                  isFunction(ss.matching) ? function (selector, el) { return s(el).matching(selector).length > 0 } :
                    isFunction(ss.is) ? function (selector, el) { return s(el).is(selector) } :
                      isFunction(ss.matchesSelector) ? function (selector, el) { return s(el).matchesSelector(selector) } :
                        isFunction(ss.match) ? function (selector, el) { return s(el).match(selector) } : null
              }
  
              if (!_selectorMatches)
                  throw 'Traversty: couldn\'t find selector engine\'s `matchesSelector`'
  
              // verify that we have a working `matchesSelector`
              if (_selectorMatches('x,y', e) || !_selectorMatches('a,p', e))
                  throw 'Traversty: couldn\'t make selector engine\'s `matchesSelector` work'
  
              // basic select
              if ((r = select('b,a', e)).length !== 2) throw 'Traversty: don\'t know how to use this selector engine'
              // check to see if the selector engine has given us the results in document-order
              // and if not, work around it
              _selectorFind = r[0] === a ? select : createUnorderedEngineSelectorFind(select, _selectorMatches)
              // have we done enough to get a working `selectorFind`?
              if ((r = _selectorFind('b,a', e)).length !== 2 || r[0] !== a)
                throw 'Traversty: couldn\'t make selector engine work'
  
              selectorMatches = _selectorMatches
              selectorFind = _selectorFind
            } catch (ex) {
              if (isString(ex)) throw ex
              throw 'Traversty: error while figuring out how the selector engine works: ' + (ex.message || ex)
            } finally {
              e = null
            }
          }
  
          t.noConflict = function () {
            context.traversty = old
            return this
          }
  
          return t
        }())
   
    return traversty
  }))
  

  provide("traversty", module.exports);

  /*global ender:true*/
  (function ($) {
    var t = require('traversty')
      , integrated = false
      , integrate = function(meth) {
          // this crazyness is for lazy initialisation because we can't be guaranteed
          // that a selector engine has been installed *before* traversty in an ender build
          var fn = function(self, selector, index) {
              if (!integrated) {
                try {
                  t.setSelectorEngine($)
                } catch (ex) { } // ignore exception, we may have an ender build with no selector engine
                integrated = true
              }
              fn = function(self, selector, index) { return $(t(self)[meth](selector, index)) }
              return fn(self, selector, index)
            }
          return function(selector, index) { return fn(this, selector, index) }
        }
    $.ender(
        {
            up: integrate('up')
          , down: integrate('down')
          , next: integrate('next')
          , previous: integrate('previous')
        }
      , true
    )
  }(ender))
  

}();