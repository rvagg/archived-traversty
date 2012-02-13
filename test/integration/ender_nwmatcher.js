/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build domready nwmatcher bonzo ../.. --output ender_nwmatcher
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

  /*
   * Copyright (C) 2007-2012 Diego Perini
   * All rights reserved.
   *
   * nwmatcher.js - A fast CSS selector engine and matcher
   *
   * Author: Diego Perini <diego.perini at gmail com>
   * Version: 1.2.5
   * Created: 20070722
   * Release: 20120101
   *
   * License:
   *  http://javascript.nwbox.com/NWMatcher/MIT-LICENSE
   * Download:
   *  http://javascript.nwbox.com/NWMatcher/nwmatcher.js
   */
  
  (function(global) {
  
    var version = 'nwmatcher-1.2.5',
  
    // export the public API for CommonJS implementations,
    // for headless JS engines or for standard web browsers
    Dom =
      // as CommonJS/NodeJS module
      typeof exports == 'object' ? exports :
      // create or extend NW namespace
      ((global.NW || (global.NW = { })) &&
      (global.NW.Dom || (global.NW.Dom = { }))),
  
    // processing context & root element
    doc = global.document,
    root = doc.documentElement,
  
    // save utility methods references
    slice = [ ].slice,
    string = { }.toString,
  
    // persist previous parsed data
    isSingleMatch,
    isSingleSelect,
  
    lastSlice,
    lastContext,
    lastPosition,
  
    lastMatcher,
    lastSelector,
  
    lastPartsMatch,
    lastPartsSelect,
  
    // accepted prefix identifiers
    // (id, class & pseudo-class)
    prefixes = '[#.:]?',
  
    // accepted attribute operators
    operators = '([~*^$|!]?={1})',
  
    // accepted whitespace characters
    whitespace = '[\\x20\\t\\n\\r\\f]*',
  
    // 4 combinators F E, F>E, F+E, F~E
    combinators = '[\\x20]|[>+~][^>+~]',
  
    // an+b format params for pseudo-classes
    pseudoparms = '[-+]?\\d*n?[-+]?\\d*',
  
    // CSS quoted string values
    quotedvalue = '"[^"]*"' + "|'[^']*'",
  
    // skip group of round brackets
    skipround = '\\([^()]+\\)|\\(.*\\)',
    // skip group of curly brackets
    skipcurly = '\\{[^{}]+\\}|\\{.*\\}',
    // skip group of square brackets
    skipsquare = '\\[[^[\\]]*\\]|\\[.*\\]',
  
    // skip [ ], ( ), { } groups in token tails
    skipgroup = '\\[.*\\]|\\(.*\\)|\\{.*\\}',
  
    // http://www.w3.org/TR/css3-syntax/#characters
    // unicode/ISO 10646 characters 161 and higher
    // NOTE: Safari 2.0.x crashes with escaped (\\)
    // Unicode ranges in regular expressions so we
    // use a negated character range class instead
    encoding = '(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)',
  
    // CSS identifier syntax
    identifier = '(?:-?[_a-zA-Z]{1}[-\\w]*|[^\\x00-\\xa0]+|\\\\.+)+',
  
    // build attribute string
    attrcheck = '(' + quotedvalue + '|' + identifier + ')',
    attributes = whitespace + '(' + encoding + '+:?' + encoding + '+)' +
      whitespace + '(?:' + operators + whitespace + attrcheck + ')?' + whitespace,
    attrmatcher = attributes.replace(attrcheck, '([\\x22\\x27]*)((?:\\\\?.)*?)\\3'),
  
    // build pseudoclass string
    pseudoclass = '((?:' +
      // an+b parameters or quoted string
      pseudoparms + '|' + quotedvalue + '|' +
      // id, class, pseudo-class selector
      prefixes + '|' + encoding + '+|' +
      // nested HTML attribute selector
      '\\[' + attributes + '\\]|' +
      // nested pseudo-class selector
      '\\(.+\\)|' + whitespace + '|' +
      // nested pseudos/separators
      ',)+)',
  
    // placeholder for extensions
    extensions = '.+',
  
    // CSS3: syntax scanner and
    // one pass validation only
    // using regular expression
    standardValidator =
      // discard start
      '(?=[\\x20\\t\\n\\r\\f]*[^>+~(){}<>])' +
      // open match group
      '(' +
      //universal selector
      '\\*' +
      // id/class/tag/pseudo-class identifier
      '|(?:' + prefixes + identifier + ')' +
      // combinator selector
      '|' + combinators +
      // HTML attribute selector
      '|\\[' + attributes + '\\]' +
      // pseudo-classes parameters
      '|\\(' + pseudoclass + '\\)' +
      // dom properties selector (extension)
      '|\\{' + extensions + '\\}' +
      // selector group separator (comma)
      '|,' +
      // close match group
      ')+',
  
    // validator for complex selectors in ':not()' pseudo-classes
    extendedValidator = standardValidator.replace(pseudoclass, '.*'),
  
    // validator for standard selectors as default
    reValidator = new RegExp(standardValidator, 'g'),
  
    // whitespace is any combination of these 5 character [\x20\t\n\r\f]
    // http://www.w3.org/TR/css3-selectors/#selector-syntax
    reTrimSpaces = new RegExp('^' +
      whitespace + '|' + whitespace + '$', 'g'),
  
    // only allow simple selectors nested in ':not()' pseudo-classes
    reSimpleNot = new RegExp('^(' +
      '(?!:not)' +
      '(' + prefixes +
      '|' + identifier +
      '|\\([^()]*\\))+' +
      '|\\[' + attributes + '\\]' +
      ')$'),
  
    // split comma groups, exclude commas from
    // quotes '' "" and from brackets () [] {}
    reSplitGroup = new RegExp('(' +
      '[^,\\\\\\[\\]]+' +
      '|' + skipsquare +
      '|' + skipround +
      '|' + skipcurly +
      '|\\\\.' +
      ')+', 'g'),
  
    // split last, right most, selector group token
    reSplitToken = new RegExp('(' +
      '\\[' + attributes + '\\]|' +
      '\\(' + pseudoclass + '\\)|' +
      '[^\\x20>+~]|\\\\.)+', 'g'),
  
    // for in excess whitespace removal
    reWhiteSpace = /[\x20\t\n\r\f]+/g,
  
    reOptimizeSelector = new RegExp(identifier + '|^$'),
  
    /*----------------------------- FEATURE TESTING ----------------------------*/
  
    // detect native methods
    isNative = (function() {
      var s = (doc.appendChild + '').replace(/appendChild/g, '');
      return function(object, method) {
        var m = object && object[method] || false;
        return m && typeof m != 'string' &&
          s == (m + '').replace(new RegExp(method, 'g'), '');
      };
    })(),
  
    // NATIVE_XXXXX true if method exist and is callable
    // detect if DOM methods are native in browsers
    NATIVE_FOCUS = isNative(doc, 'hasFocus'),
    NATIVE_QSAPI = isNative(doc, 'querySelector'),
    NATIVE_GEBID = isNative(doc, 'getElementById'),
    NATIVE_GEBTN = isNative(root, 'getElementsByTagName'),
    NATIVE_GEBCN = isNative(root, 'getElementsByClassName'),
  
    // detect native getAttribute/hasAttribute methods,
    // frameworks extend these to elements, but it seems
    // this does not work for XML namespaced attributes,
    // used to check both getAttribute/hasAttribute in IE
    NATIVE_GET_ATTRIBUTE = isNative(root, 'getAttribute'),
    NATIVE_HAS_ATTRIBUTE = isNative(root, 'hasAttribute'),
  
    // check if slice() can convert nodelist to array
    // see http://yura.thinkweb2.com/cft/
    NATIVE_SLICE_PROTO =
      (function() {
        var isBuggy = false, id = root.id;
        root.id = 'length';
        try {
          isBuggy = !!slice.call(doc.childNodes, 0)[0];
        } catch(e) { }
        root.id = id;
        return isBuggy;
      })(),
  
    // supports the new traversal API
    NATIVE_TRAVERSAL_API =
      'nextElementSibling' in root && 'previousElementSibling' in root,
  
    // BUGGY_XXXXX true if method is feature tested and has known bugs
    // detect buggy gEBID
    BUGGY_GEBID = NATIVE_GEBID ?
      (function() {
        var isBuggy = true, x = 'x' + String(+new Date),
          a = doc.createElementNS ? 'a' : '<a name="' + x + '">';
        (a = doc.createElement(a)).name = x;
        root.insertBefore(a, root.firstChild);
        isBuggy = !!doc.getElementById(x);
        root.removeChild(a);
        return isBuggy;
      })() :
      true,
  
    // detect IE gEBTN comment nodes bug
    BUGGY_GEBTN = NATIVE_GEBTN ?
      (function() {
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));
        return !!div.getElementsByTagName('*')[0];
      })() :
      true,
  
    // detect Opera gEBCN second class and/or UTF8 bugs as well as Safari 3.2
    // caching class name results and not detecting when changed,
    // tests are based on the jQuery selector test suite
    BUGGY_GEBCN = NATIVE_GEBCN ?
      (function() {
        var isBuggy, div = doc.createElement('div'), test = '\u53f0\u5317';
  
        // Opera tests
        div.appendChild(doc.createElement('span')).
          setAttribute('class', test + 'abc ' + test);
        div.appendChild(doc.createElement('span')).
          setAttribute('class', 'x');
  
        isBuggy = !div.getElementsByClassName(test)[0];
  
        // Safari test
        div.lastChild.className = test;
        return isBuggy || div.getElementsByClassName(test).length != 2;
      })() :
      true,
  
    // detect IE bug with dynamic attributes
    BUGGY_GET_ATTRIBUTE = NATIVE_GET_ATTRIBUTE ?
      (function() {
        var input = doc.createElement('input');
        input.setAttribute('value', 5);
        return input.defaultValue != 5;
      })() :
      true,
  
    // detect IE bug with non-standard boolean attributes
    BUGGY_HAS_ATTRIBUTE = NATIVE_HAS_ATTRIBUTE ?
      (function() {
        var option = doc.createElement('option');
        option.setAttribute('selected', 'selected');
        return !option.hasAttribute('selected');
      })() :
      true,
  
    // detect Safari bug with selected option elements
    BUGGY_SELECTED =
      (function() {
        var select = doc.createElement('select');
        select.appendChild(doc.createElement('option'));
        return !select.firstChild.selected;
      })(),
  
    // initialized with the loading context
    // and reset for each different context
    BUGGY_QUIRKS_GEBCN,
    BUGGY_QUIRKS_QSAPI,
  
    QUIRKS_MODE,
    XML_DOCUMENT,
  
    // detect Opera browser
    OPERA = /opera/i.test(string.call(global.opera)),
  
    // skip simpe selector optimizations for Opera >= 11
    OPERA_QSAPI = OPERA && parseFloat(opera.version()) >= 11,
  
    // check Seletor API implementations
    RE_BUGGY_QSAPI = NATIVE_QSAPI ?
      (function() {
        var pattern = [ ], div = doc.createElement('div'), element,
  
        expect = function(selector, context, element, n) {
          var result = false;
          context.appendChild(element);
          try { result = context.querySelectorAll(selector).length == n; } catch(e) { }
          while (context.firstChild) { context.removeChild(context.firstChild); }
          return result;
        };
  
        // ^= $= *= operators bugs whith empty values (Opera 10 / IE8)
        element = doc.createElement('p');
        element.setAttribute('class', '');
        expect('[class^=""]', div, element, 1) &&
          pattern.push('[*^$]=[\\x20\\t\\n\\r\\f]*(?:""|' + "'')");
  
        // :checked bug with option elements (Firefox 3.6.x)
        // it wrongly includes 'selected' options elements
        // HTML5 rules says selected options also match
        element = doc.createElement('option');
        element.setAttribute('selected', 'selected');
        expect(':checked', div, element, 0) &&
          pattern.push(':checked');
  
        // :enabled :disabled bugs with hidden fields (Firefox 3.5 QSA bug)
        // http://www.w3.org/TR/html5/interactive-elements.html#selector-enabled
        // IE8 QSA has problems too and throws error with these dynamic pseudos
        element = doc.createElement('input');
        element.setAttribute('type', 'hidden');
        expect(':enabled', div, element, 1) &&
          pattern.push(':enabled', ':disabled');
  
        // :link bugs with hyperlinks matching (Firefox/Safari)
        element = doc.createElement('link');
        element.setAttribute('href', 'x');
        expect(':link', div, element, 1) ||
          pattern.push(':link');
  
        // avoid attribute selectors for IE QSA
        if (BUGGY_HAS_ATTRIBUTE) {
          // IE fails in reading:
          // - original values for input/textarea
          // - original boolean values for controls
          pattern.push('\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)');
        }
  
        return pattern.length ?
          new RegExp(pattern.join('|')) :
          { 'test': function() { return false; } };
  
      })() :
      true,
  
    // matches class selectors
    RE_CLASS = new RegExp('(?:\\[[\\x20\\t\\n\\r\\f]*class\\b|\\.' + identifier + ')'),
  
    // matches simple id, tag & class selectors
    RE_SIMPLE_SELECTOR = new RegExp(
      !(BUGGY_GEBTN && BUGGY_GEBCN) ? !OPERA ?
        '^(?:\\*|[.#]?-?[_a-zA-Z]{1}' + encoding + '*)$' :
        '^(?:\\*|#-?[_a-zA-Z]{1}' + encoding + '*)$' :
        '^#?-?[_a-zA-Z]{1}' + encoding + '*$'),
  
    /*----------------------------- LOOKUP OBJECTS -----------------------------*/
  
    LINK_NODES = { 'a': 1, 'A': 1, 'area': 1, 'AREA': 1, 'link': 1, 'LINK': 1 },
  
    // boolean attributes should return attribute name instead of true/false
    ATTR_BOOLEAN = {
      'checked': 1, 'disabled': 1, 'ismap': 1,
      'multiple': 1, 'readonly': 1, 'selected': 1
    },
  
    // dynamic attributes that needs to be checked against original HTML value
    ATTR_DEFAULT = {
      value: 'defaultValue',
      checked: 'defaultChecked',
      selected: 'defaultSelected'
    },
  
    // attribute referencing URI data values need special treatment in IE
    ATTR_URIDATA = {
      'action': 2, 'cite': 2, 'codebase': 2, 'data': 2, 'href': 2,
      'longdesc': 2, 'lowsrc': 2, 'src': 2, 'usemap': 2
    },
  
    // HTML 5 draft specifications
    // http://www.whatwg.org/specs/web-apps/current-work/#selectors
    HTML_TABLE = {
      // class attribute must be treated case-insensitive in HTML quirks mode
      // initialized by default to Standard Mode (case-sensitive),
      // set dynamically by the attribute resolver
      'class': 0,
      'accept': 1, 'accept-charset': 1, 'align': 1, 'alink': 1, 'axis': 1,
      'bgcolor': 1, 'charset': 1, 'checked': 1, 'clear': 1, 'codetype': 1, 'color': 1,
      'compact': 1, 'declare': 1, 'defer': 1, 'dir': 1, 'direction': 1, 'disabled': 1,
      'enctype': 1, 'face': 1, 'frame': 1, 'hreflang': 1, 'http-equiv': 1, 'lang': 1,
      'language': 1, 'link': 1, 'media': 1, 'method': 1, 'multiple': 1, 'nohref': 1,
      'noresize': 1, 'noshade': 1, 'nowrap': 1, 'readonly': 1, 'rel': 1, 'rev': 1,
      'rules': 1, 'scope': 1, 'scrolling': 1, 'selected': 1, 'shape': 1, 'target': 1,
      'text': 1, 'type': 1, 'valign': 1, 'valuetype': 1, 'vlink': 1
    },
  
    // the following attributes must be treated case-insensitive in XHTML mode
    // Niels Leenheer http://rakaz.nl/item/css_selector_bugs_case_sensitivity
    XHTML_TABLE = {
      'accept': 1, 'accept-charset': 1, 'alink': 1, 'axis': 1,
      'bgcolor': 1, 'charset': 1, 'codetype': 1, 'color': 1,
      'enctype': 1, 'face': 1, 'hreflang': 1, 'http-equiv': 1,
      'lang': 1, 'language': 1, 'link': 1, 'media': 1, 'rel': 1,
      'rev': 1, 'target': 1, 'text': 1, 'type': 1, 'vlink': 1
    },
  
    /*-------------------------- REGULAR EXPRESSIONS ---------------------------*/
  
    // placeholder to add functionalities
    Selectors = {
      // as a simple example this will check
      // for chars not in standard ascii table
      //
      // 'mySpecialSelector': {
      //  'Expression': /\u0080-\uffff/,
      //  'Callback': mySelectorCallback
      // }
      //
      // 'mySelectorCallback' will be invoked
      // only after passing all other standard
      // checks and only if none of them worked
    },
  
    // attribute operators
    Operators = {
       '=': "n=='%m'",
      '^=': "n.indexOf('%m')==0",
      '*=': "n.indexOf('%m')>-1",
      '|=': "(n+'-').indexOf('%m-')==0",
      '~=': "(' '+n+' ').indexOf(' %m ')>-1",
      '$=': "n.substr(n.length-'%m'.length)=='%m'"
    },
  
    // optimization expressions
    Optimize = {
      ID: new RegExp('^\\*?#(' + encoding + '+)|' + skipgroup),
      TAG: new RegExp('^(' + encoding + '+)|' + skipgroup),
      CLASS: new RegExp('^\\*?\\.(' + encoding + '+$)|' + skipgroup)
    },
  
    // precompiled Regular Expressions
    Patterns = {
      // structural pseudo-classes and child selectors
      spseudos: /^\:((root|empty|nth-)?(?:(first|last|only)-)?(child)?-?(of-type)?)(?:\(([^\x29]*)\))?(.*)/,
      // uistates + dynamic + negation pseudo-classes
      dpseudos: /^\:(link|visited|target|lang|not|active|focus|hover|checked|disabled|enabled|selected)(?:\((["']*)(.*?(\(.*\))?[^'"()]*?)\2\))?(.*)/,
      // element attribute matcher
      attribute: new RegExp('^\\[' + attrmatcher + '\\](.*)'),
      // E > F
      children: /^[\x20\t\n\r\f]*\>[\x20\t\n\r\f]*(.*)/,
      // E + F
      adjacent: /^[\x20\t\n\r\f]*\+[\x20\t\n\r\f]*(.*)/,
      // E ~ F
      relative: /^[\x20\t\n\r\f]*\~[\x20\t\n\r\f]*(.*)/,
      // E F
      ancestor: /^[\x20\t\n\r\f]+(.*)/,
      // all
      universal: /^\*(.*)/,
      // id
      id: new RegExp('^#(' + encoding + '+)(.*)'),
      // tag
      tagName: new RegExp('^(' + encoding + '+)(.*)'),
      // class
      className: new RegExp('^\\.(' + encoding + '+)(.*)')
    },
  
    /*------------------------------ UTIL METHODS ------------------------------*/
  
    // concat elements to data
    concatList =
      function(data, elements) {
        var i = -1, element;
        if (!data.length && Array.slice)
          return Array.slice(elements);
        while ((element = elements[++i]))
          data[data.length] = element;
        return data;
      },
  
    // concat elements to data and callback
    concatCall =
      function(data, elements, callback) {
        var i = -1, element;
        while ((element = elements[++i])) {
          if (false === callback(data[data.length] = element)) { break; }
        }
        return data;
      },
  
    // change context specific variables
    switchContext =
      function(from, force) {
        var div, oldDoc = doc;
        // save passed context
        lastContext = from;
        // set new context document
        doc = from.ownerDocument || from;
        if (force || oldDoc !== doc) {
          // set document root
          root = doc.documentElement;
          // set host environment flags
          XML_DOCUMENT = doc.createElement('DiV').nodeName == 'DiV';
  
          // In quirks mode css class names are case insensitive.
          // In standards mode they are case sensitive. See docs:
          // https://developer.mozilla.org/en/Mozilla_Quirks_Mode_Behavior
          // http://www.whatwg.org/specs/web-apps/current-work/#selectors
          QUIRKS_MODE = !XML_DOCUMENT &&
            typeof doc.compatMode == 'string' ?
            doc.compatMode.indexOf('CSS') < 0 :
            (function() {
              var style = doc.createElement('div').style;
              return style && (style.width = 1) && style.width == '1px';
            })();
  
          div = doc.createElement('div');
          div.appendChild(doc.createElement('p')).setAttribute('class', 'xXx');
          div.appendChild(doc.createElement('p')).setAttribute('class', 'xxx');
  
          // GEBCN buggy in quirks mode, match count is:
          // Firefox 3.0+ [xxx = 1, xXx = 1]
          // Opera 10.63+ [xxx = 0, xXx = 2]
          BUGGY_QUIRKS_GEBCN =
            !XML_DOCUMENT && NATIVE_GEBCN && QUIRKS_MODE &&
            (div.getElementsByClassName('xxx').length != 2 ||
            div.getElementsByClassName('xXx').length != 2);
  
          // QSAPI buggy in quirks mode, match count is:
          // At least Chrome 4+, Firefox 3.5+, Opera 10.x+, Safari 4+ [xxx = 1, xXx = 2]
          // Safari 3.2 QSA doesn't work with mixedcase in quirksmode [xxx = 1, xXx = 0]
          // https://bugs.webkit.org/show_bug.cgi?id=19047
          // must test the attribute selector '[class~=xxx]'
          // before '.xXx' or the bug may not present itself
          BUGGY_QUIRKS_QSAPI =
            !XML_DOCUMENT && NATIVE_QSAPI && QUIRKS_MODE &&
            (div.querySelectorAll('[class~=xxx]').length != 2 ||
            div.querySelectorAll('.xXx').length != 2);
  
          Config.CACHING && Dom.setCache(true, doc);
        }
      },
  
    /*------------------------------ DOM METHODS -------------------------------*/
  
    // element by id (raw)
    // @return reference or null
    byIdRaw =
      function(id, elements) {
        var i = -1, element = null;
        while ((element = elements[++i])) {
          if (element.getAttribute('id') == id) {
            break;
          }
        }
        return element;
      },
  
    // element by id
    // @return reference or null
    _byId = !BUGGY_GEBID ?
      function(id, from) {
        id = id.replace(/\\/g, '');
        return from.getElementById && from.getElementById(id) ||
          byIdRaw(id, from.getElementsByTagName('*'));
      } :
      function(id, from) {
        var element = null;
        id = id.replace(/\\/g, '');
        if (XML_DOCUMENT || from.nodeType != 9) {
          return byIdRaw(id, from.getElementsByTagName('*'));
        }
        if ((element = from.getElementById(id)) &&
          element.name == id && from.getElementsByName) {
          return byIdRaw(id, from.getElementsByName(id));
        }
        return element;
      },
  
    // publicly exposed byId
    // @return reference or null
    byId =
      function(id, from) {
        switchContext(from || (from = doc));
        return _byId(id, from);
      },
  
    // elements by tag (raw)
    // @return array
    byTagRaw =
      function(tag, from) {
        var any = tag == '*', element = from, elements = [ ], next = element.firstChild;
        any || (tag = tag.toUpperCase());
        while ((element = next)) {
          if (element.tagName > '@' && (any || element.tagName.toUpperCase() == tag)) {
            elements[elements.length] = element;
          }
          if ((next = element.firstChild || element.nextSibling)) continue;
          while (!next && (element = element.parentNode) && element !== from) {
            next = element.nextSibling;
          }
        }
        return elements;
      },
  
    // elements by tag
    // @return array
    _byTag = !BUGGY_GEBTN && NATIVE_SLICE_PROTO ?
      function(tag, from) {
        return XML_DOCUMENT || from.nodeType == 11 ? byTagRaw(tag, from) :
          slice.call(from.getElementsByTagName(tag), 0);
      } :
      function(tag, from) {
        var i = -1, j = i, data = [ ],
          element, elements = from.getElementsByTagName(tag);
        if (tag == '*') {
          while ((element = elements[++i])) {
            if (element.nodeName > '@')
              data[++j] = element;
          }
        } else {
          while ((element = elements[++i])) {
            data[i] = element;
          }
        }
        return data;
      },
  
    // publicly exposed byTag
    // @return array
    byTag =
      function(tag, from) {
        switchContext(from || (from = doc));
        return _byTag(tag, from);
      },
  
    // publicly exposed byName
    // @return array
    byName =
      function(name, from) {
        return select('[name="' + name.replace(/\\/g, '') + '"]', from);
      },
  
    // elements by class (raw)
    // @return array
    byClassRaw =
      function(name, from) {
        var i = -1, j = i, data = [ ], element, elements = _byTag('*', from), n;
        name = ' ' + (QUIRKS_MODE ? name.toLowerCase() : name).replace(/\\/g, '') + ' ';
        while ((element = elements[++i])) {
          n = XML_DOCUMENT ? element.getAttribute('class') : element.className;
          if (n && n.length && (' ' + (QUIRKS_MODE ? n.toLowerCase() : n).
            replace(reWhiteSpace, ' ') + ' ').indexOf(name) > -1) {
            data[++j] = element;
          }
        }
        return data;
      },
  
    // elements by class
    // @return array
    _byClass =
      function(name, from) {
        return (BUGGY_GEBCN || BUGGY_QUIRKS_GEBCN || XML_DOCUMENT || !from.getElementsByClassName) ?
          byClassRaw(name, from) : slice.call(from.getElementsByClassName(name.replace(/\\/g, '')), 0);
      },
  
    // publicly exposed byClass
    // @return array
    byClass =
      function(name, from) {
        switchContext(from || (from = doc));
        return _byClass(name, from);
      },
  
    // check element is descendant of container
    // @return boolean
    contains = 'compareDocumentPosition' in root ?
      function(container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16;
      } : 'contains' in root ?
      function(container, element) {
        return container !== element && container.contains(element);
      } :
      function(container, element) {
        while ((element = element.parentNode)) {
          if (element === container) return true;
        }
        return false;
      },
  
    // attribute value
    // @return string
    getAttribute = !BUGGY_GET_ATTRIBUTE ?
      function(node, attribute) {
        return node.getAttribute(attribute) || '';
      } :
      function(node, attribute) {
        attribute = attribute.toLowerCase();
        if (ATTR_DEFAULT[attribute]) {
          return node[ATTR_DEFAULT[attribute]] || '';
        }
        return (
          // specific URI data attributes (parameter 2 to fix IE bug)
          ATTR_URIDATA[attribute] ? node.getAttribute(attribute, 2) || '' :
          // boolean attributes should return name instead of true/false
          ATTR_BOOLEAN[attribute] ? node.getAttribute(attribute) ? attribute : '' :
            ((node = node.getAttributeNode(attribute)) && node.value) || '');
      },
  
    // attribute presence
    // @return boolean
    hasAttribute = !BUGGY_HAS_ATTRIBUTE ?
      function(node, attribute) {
        return XML_DOCUMENT ?
          !!node.getAttribute(attribute) :
          node.hasAttribute(attribute);
      } :
      function(node, attribute) {
        attribute = attribute.toLowerCase();
        if (ATTR_DEFAULT[attribute]) {
          return !!node[ATTR_DEFAULT[attribute]];
        }
        // need to get at AttributeNode first on IE
        node = node.getAttributeNode(attribute);
        // use both "specified" & "nodeValue" properties
        return !!(node && (node.specified || node.nodeValue));
      },
  
    // check node emptyness
    // @return boolean
    isEmpty =
      function(node) {
        node = node.firstChild;
        while (node) {
          if (node.nodeType == 3 || node.nodeName > '@') return false;
          node = node.nextSibling;
        }
        return true;
      },
  
    // check if element matches the :link pseudo
    // @return boolean
    isLink =
      function(element) {
        return hasAttribute(element,'href') && LINK_NODES[element.nodeName];
      },
  
    // child position by nodeType
    // @return number
    nthElement =
      function(element, last) {
        var count = 1, succ = last ? 'nextSibling' : 'previousSibling';
        while ((element = element[succ])) {
          if (element.nodeName > '@') ++count;
        }
        return count;
      },
  
    // child position by nodeName
    // @return number
    nthOfType =
      function(element, last) {
        var count = 1, succ = last ? 'nextSibling' : 'previousSibling', type = element.nodeName;
        while ((element = element[succ])) {
          if (element.nodeName == type) ++count;
        }
        return count;
      },
  
    /*------------------------------- DEBUGGING --------------------------------*/
  
    // set working mode
    configure =
      function(options) {
        for (var i in options) {
          Config[i] = !!options[i];
          if (i == 'SIMPLENOT') {
            matchContexts = { };
            matchResolvers = { };
            selectContexts = { };
            selectResolvers = { };
            Config['USE_QSAPI'] = false;
            reValidator = new RegExp(extendedValidator, 'g');
          } else if (i == 'USE_QSAPI') {
            Config[i] = !!options[i] && NATIVE_QSAPI;
            reValidator = new RegExp(standardValidator, 'g');
          }
        }
      },
  
    // control user notifications
    emit =
      function(message) {
        message = 'SYNTAX_ERR: ' + message + ' ';
        if (Config.VERBOSITY) {
          // FF/Safari/Opera DOMException.SYNTAX_ERR = 12
          if (typeof global.DOMException != 'undefined') {
            throw { code: 12, message: message };
          } else {
            throw new Error(12, message);
          }
        } else {
          if (global.console && global.console.log) {
            global.console.log(message);
          } else {
            global.status += message;
          }
        }
      },
  
    Config = {
  
      // used to enable/disable caching of result sets
      CACHING: false,
  
      // by default do not add missing left/right context
      // to selector string shortcuts like "+div" or "ul>"
      // callable Dom.shortcuts method has to be available
      SHORTCUTS: false,
  
      // by default disable complex selectors nested in
      // ':not()' pseudo-classes, as for specifications
      SIMPLENOT: true,
  
      // HTML5 handling for the ":checked" pseudo-class
      USE_HTML5: false,
  
      // controls enabling the Query Selector API branch
      USE_QSAPI: NATIVE_QSAPI,
  
      // controls the engine error/warning notifications
      VERBOSITY: true
  
    },
  
    /*---------------------------- COMPILER METHODS ----------------------------*/
  
    // code string reused to build compiled functions
    ACCEPT_NODE = 'r[r.length]=c[k];if(f&&false===f(c[k]))break;else continue main;',
  
    // compile a comma separated group of selector
    // @mode boolean true for select, false for match
    // return a compiled function
    compile =
      function(selector, source, mode) {
  
        var parts = typeof selector == 'string' ? selector.match(reSplitGroup) : selector;
  
        // ensures that source is a string
        typeof source == 'string' || (source = '');
  
        if (parts.length == 1) {
          source += compileSelector(parts[0], mode ? ACCEPT_NODE : 'f&&f(k);return true;');
        } else {
          // for each selector in the group
          var i = -1, seen = { }, token;
          while ((token = parts[++i])) {
            token = token.replace(reTrimSpaces, '');
            // avoid repeating the same token
            // in comma separated group (p, p)
            if (!seen[token] && (seen[token] = true)) {
              source += compileSelector(token, mode ? ACCEPT_NODE : 'f&&f(k);return true;');
            }
          }
        }
  
        if (mode) {
          // for select method
          return new Function('c,s,r,d,h,g,f',
            'var N,n,x=0,k=-1,e;main:while((e=c[++k])){' + source + '}return r;');
        } else {
          // for match method
          return new Function('e,s,r,d,h,g,f',
            'var N,n,x=0,k=e;' + source + 'return false;');
        }
      },
  
    // compile a CSS3 string selector into ad-hoc javascript matching function
    // @return string (to be compiled)
    compileSelector =
      function(selector, source) {
  
        var a, b, n, k = 0, expr, match, result, status, test, type;
  
        while (selector) {
  
          k++;
  
          // *** Universal selector
          // * match all (empty block, do not remove)
          if ((match = selector.match(Patterns.universal))) {
            // do nothing, handled in the compiler where
            // BUGGY_GEBTN return comment nodes (ex: IE)
            expr = '';
          }
  
          // *** ID selector
          // #Foo Id case sensitive
          else if ((match = selector.match(Patterns.id))) {
            // document can contain conflicting elements (id/name)
            // prototype selector unit need this method to recover bad HTML forms
            source = 'if(' + (XML_DOCUMENT ?
              's.getAttribute(e,"id")' :
              '(e.submit?s.getAttribute(e,"id"):e.id)') +
              '=="' + match[1] + '"' +
              '){' + source + '}';
          }
  
          // *** Type selector
          // Foo Tag (case insensitive)
          else if ((match = selector.match(Patterns.tagName))) {
            // both tagName and nodeName properties may be upper/lower case
            // depending on their creation NAMESPACE in createElementNS()
            source = 'if(e.nodeName' + (XML_DOCUMENT ?
              '=="' + match[1] + '"' : '.toUpperCase()' +
              '=="' + match[1].toUpperCase() + '"') +
              '){' + source + '}';
          }
  
          // *** Class selector
          // .Foo Class (case sensitive)
          else if ((match = selector.match(Patterns.className))) {
            // W3C CSS3 specs: element whose "class" attribute has been assigned a
            // list of whitespace-separated values, see section 6.4 Class selectors
            // and notes at the bottom; explicitly non-normative in this specification.
            source = 'if((n=' + (XML_DOCUMENT ?
              's.getAttribute(e,"class")' : 'e.className') +
              ')&&n.length&&(" "+' + (QUIRKS_MODE ? 'n.toLowerCase()' : 'n') +
              '.replace(' + reWhiteSpace + '," ")+" ").indexOf(" ' +
              (QUIRKS_MODE ? match[1].toLowerCase() : match[1]) + ' ")>-1' +
              '){' + source + '}';
          }
  
          // *** Attribute selector
          // [attr] [attr=value] [attr="value"] [attr='value'] and !=, *=, ~=, |=, ^=, $=
          // case sensitivity is treated differently depending on the document type (see map)
          else if ((match = selector.match(Patterns.attribute))) {
  
            // xml namespaced attribute ?
            expr = match[1].split(':');
            expr = expr.length == 2 ? expr[1] : expr[0] + '';
  
            if (match[2] && !Operators[match[2]]) {
              emit('Unsupported operator in attribute selectors "' + selector + '"');
              return '';
            }
  
            test = false;
            type = 'false';
  
            // replace Operators parameter if needed
            if (match[2] && match[4] && (type = Operators[match[2]])) {
              // case treatment depends on document
              HTML_TABLE['class'] = QUIRKS_MODE ? 1 : 0;
              // replace escaped values and HTML entities
              match[4] = match[4].replace(/\\([0-9a-f]{2,2})/, '\\x$1');
              test = (XML_DOCUMENT ? XHTML_TABLE : HTML_TABLE)[expr.toLowerCase()];
              type = type.replace(/\%m/g, test ? match[4].toLowerCase() : match[4]);
            } else if (match[2] == '!=' || match[2] == '=') {
              type = 'n' + match[2] + '="' + match[4] + '"';
            }
  
            // build expression for has/getAttribute
            expr = 'n=s.' + (match[2] ? 'get' : 'has') +
              'Attribute(e,"' + match[1] + '")' +
              (test ? '.toLowerCase();' : ';');
  
            source = expr + 'if(' + (match[2] ? type : 'n') + '){' + source + '}';
          }
  
          // *** Adjacent sibling combinator
          // E + F (F adiacent sibling of E)
          else if ((match = selector.match(Patterns.adjacent))) {
            source = NATIVE_TRAVERSAL_API ?
              'var N' + k + '=e;if(e&&(e=e.previousElementSibling)){' + source + '}e=N' + k + ';' :
              'var N' + k + '=e;while(e&&(e=e.previousSibling)){if(e.nodeName>"@"){' + source + 'break;}}e=N' + k + ';';
          }
  
          // *** General sibling combinator
          // E ~ F (F relative sibling of E)
          else if ((match = selector.match(Patterns.relative))) {
            source = NATIVE_TRAVERSAL_API ?
              ('var N' + k + '=e;e=e.parentNode.firstElementChild;' +
              'while(e&&e!==N' + k + '){' + source + 'e=e.nextElementSibling;}e=N' + k + ';') :
              ('var N' + k + '=e;e=e.parentNode.firstChild;' +
              'while(e&&e!==N' + k + '){if(e.nodeName>"@"){' + source + '}e=e.nextSibling;}e=N' + k + ';');
          }
  
          // *** Child combinator
          // E > F (F children of E)
          else if ((match = selector.match(Patterns.children))) {
            source = 'var N' + k + '=e;if(e&&e!==h&&e!==g&&(e=e.parentNode)){' + source + '}e=N' + k + ';';
          }
  
          // *** Descendant combinator
          // E F (E ancestor of F)
          else if ((match = selector.match(Patterns.ancestor))) {
            source = 'var N' + k + '=e;while(e&&e!==h&&e!==g&&(e=e.parentNode)){' + source + '}e=N' + k + ';';
          }
  
          // *** Structural pseudo-classes
          // :root, :empty,
          // :first-child, :last-child, :only-child,
          // :first-of-type, :last-of-type, :only-of-type,
          // :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-of-type()
          else if ((match = selector.match(Patterns.spseudos)) && match[1]) {
  
            switch (match[2]) {
  
              case 'root':
                // element root of the document
                if (match[7]) {
                  source = 'if(e===h||s.contains(h,e)){' + source + '}';
                } else {
                  source = 'if(e===h){' + source + '}';
                }
                break;
  
              case 'empty':
                // element that has no children
                source = 'if(s.isEmpty(e)){' + source + '}';
                break;
  
              default:
                if (match[2] && match[6]) {
                  if (match[6] == 'n') {
                    source = 'if(e!==h){' + source + '}';
                    break;
                  } else if (match[6] == 'even') {
                    a = 2;
                    b = 0;
                  } else if (match[6] == 'odd') {
                    a = 2;
                    b = 1;
                  } else {
                    // assumes correct "an+b" format, "b" before "a" to keep "n" values
                    b = ((n = match[6].match(/(-?\d+)$/)) ? parseInt(n[1], 10) : 0);
                    a = ((n = match[6].match(/(-?\d*)n/)) ? parseInt(n[1], 10) : 0);
                    if (n && n[1] == '-') a = -1;
                  }
  
                  // build test expression out of structural pseudo (an+b) parameters
                  // see here: http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
                  test =  b < 1 && a > 1 ? '(n-(' + b + '))%' + a + '==0' : a > +1 ?
                    (match[3] == 'last') ? '(n-(' + b + '))%' + a + '==0' :
                    'n>=' + b + '&&(n-(' + b + '))%' + a + '==0' : a < -1 ?
                    (match[3] == 'last') ? '(n-(' + b + '))%' + a + '==0' :
                    'n<=' + b + '&&(n-(' + b + '))%' + a + '==0' : a=== 0 ?
                    'n==' + b :
                    (match[3] == 'last') ?
                      a == -1 ? 'n>=' + b : 'n<=' + b :
                      a == -1 ? 'n<=' + b : 'n>=' + b;
  
                  // 4 cases: 1 (nth) x 4 (child, of-type, last-child, last-of-type)
                  source =
                    'if(e!==h){' +
                      'n=s[' + (match[5] ? '"nthOfType"' : '"nthElement"') + ']' +
                        '(e,' + (match[3] == 'last' ? 'true' : 'false') + ');' +
                      'if(' + test + '){' + source + '}' +
                    '}';
  
                } else {
                  // 6 cases: 3 (first, last, only) x 1 (child) x 2 (-of-type)
                  a = match[3] == 'first' ? 'previous' : 'next';
                  n = match[3] == 'only' ? 'previous' : 'next';
                  b = match[3] == 'first' || match[3] == 'last';
  
                  type = match[5] ? '&&n.nodeName!=e.nodeName' : '&&n.nodeName<"@"';
  
                  source = 'if(e!==h){' +
                    ( 'n=e;while((n=n.' + a + 'Sibling)' + type + ');if(!n){' + (b ? source :
                      'n=e;while((n=n.' + n + 'Sibling)' + type + ');if(!n){' + source + '}') + '}' ) + '}';
                }
                break;
            }
  
          }
  
          // *** negation, user action and target pseudo-classes
          // *** UI element states and dynamic pseudo-classes
          // CSS3 :not, :checked, :enabled, :disabled, :target
          // CSS3 :active, :hover, :focus
          // CSS3 :link, :visited
          else if ((match = selector.match(Patterns.dpseudos)) && match[1]) {
  
            switch (match[1]) {
              // CSS3 negation pseudo-class
              case 'not':
                // compile nested selectors, DO NOT pass the callback parameter
                // SIMPLENOT allow disabling complex selectors nested
                // in ':not()' pseudo-classes, breaks some test units
                expr = match[3].replace(reTrimSpaces, '');
  
                if (Config.SIMPLENOT && !reSimpleNot.test(expr)) {
                  // see above, log error but continue execution
                  emit('Negation pseudo-class only accepts simple selectors "' + selector + '"');
                  return '';
                } else {
                  if ('compatMode' in doc) {
                    source = 'if(!' + compile([expr], '', false) + '(e,s,r,d,h,g)){' + source + '}';
                  } else {
                    source = 'if(!s.match(e, "' + expr.replace(/\x22/g, '\\"') + '",g)){' + source +'}';
                  }
                }
                break;
  
              // CSS3 UI element states
              case 'checked':
                // for radio buttons checkboxes (HTML4) and options (HTML5)
                test = 'if((typeof e.form!="undefined"&&(/^(?:radio|checkbox)$/i).test(e.type)&&e.checked)';
                source = (Config.USE_HTML5 ? test + '||(/^option$/i.test(e.nodeName)&&e.selected)' : test) + '){' + source + '}';
                break;
              case 'disabled':
                // does not consider hidden input fields
                source = 'if(((typeof e.form!="undefined"&&!(/^hidden$/i).test(e.type))||s.isLink(e))&&e.disabled){' + source + '}';
                break;
              case 'enabled':
                // does not consider hidden input fields
                source = 'if(((typeof e.form!="undefined"&&!(/^hidden$/i).test(e.type))||s.isLink(e))&&!e.disabled){' + source + '}';
                break;
  
              // CSS3 lang pseudo-class
              case 'lang':
                test = '';
                if (match[3]) test = match[3].substr(0, 2) + '-';
                source = 'do{(n=e.lang||"").toLowerCase();' +
                  'if((n==""&&h.lang=="' + match[3].toLowerCase() + '")||' +
                  '(n&&(n=="' + match[3].toLowerCase() +
                  '"||n.substr(0,3)=="' + test.toLowerCase() + '")))' +
                  '{' + source + 'break;}}while((e=e.parentNode)&&e!==g);';
                break;
  
              // CSS3 target pseudo-class
              case 'target':
                n = doc.location ? doc.location.hash : '';
                if (n) {
                  source = 'if(e.id=="' + n.slice(1) + '"){' + source + '}';
                }
                break;
  
              // CSS3 dynamic pseudo-classes
              case 'link':
                source = 'if(s.isLink(e)&&!e.visited){' + source + '}';
                break;
              case 'visited':
                source = 'if(s.isLink(e)&&e.visited){' + source + '}';
                break;
  
              // CSS3 user action pseudo-classes IE & FF3 have native support
              // these capabilities may be emulated by some event managers
              case 'active':
                if (XML_DOCUMENT) break;
                source = 'if(e===d.activeElement){' + source + '}';
                break;
              case 'hover':
                if (XML_DOCUMENT) break;
                source = 'if(e===d.hoverElement){' + source + '}';
                break;
              case 'focus':
                if (XML_DOCUMENT) break;
                source = NATIVE_FOCUS ?
                  'if(e===d.activeElement&&d.hasFocus()&&(e.type||e.href)){' + source + '}' :
                  'if(e===d.activeElement&&(e.type||e.href)){' + source + '}';
                break;
  
              // CSS2 selected pseudo-classes, not part of current CSS3 drafts
              // the 'selected' property is only available for option elements
              case 'selected':
                // fix Safari selectedIndex property bug
                expr = BUGGY_SELECTED ? '||(n=e.parentNode)&&n.options[n.selectedIndex]===e' : '';
                source = 'if(/^option$/i.test(e.nodeName)&&(e.selected' + expr + ')){' + source + '}';
                break;
  
              default:
                break;
            }
  
          }
  
          else {
  
            // this is where external extensions are
            // invoked if expressions match selectors
            expr = false;
            status = true;
  
            for (expr in Selectors) {
              if ((match = selector.match(Selectors[expr].Expression)) && match[1]) {
                result = Selectors[expr].Callback(match, source);
                source = result.source;
                status = result.status;
                if (status) break;
              }
            }
  
            // if an extension fails to parse the selector
            // it must return a false boolean in "status"
            if (!status) {
              // log error but continue execution, don't throw real exceptions
              // because blocking following processes maybe is not a good idea
              emit('Unknown pseudo-class selector "' + selector + '"');
              return '';
            }
  
            if (!expr) {
              // see above, log error but continue execution
              emit('Unknown token in selector "' + selector + '"');
              return '';
            }
  
          }
  
          // error if no matches found by the pattern scan
          if (!match) {
            emit('Invalid syntax in selector "' + selector + '"');
            return '';
          }
  
          // ensure "match" is not null or empty since
          // we do not throw real DOMExceptions above
          selector = match && match[match.length - 1];
        }
  
        return source;
      },
  
    /*----------------------------- QUERY METHODS ------------------------------*/
  
    // match element with selector
    // @return boolean
    match =
      function(element, selector, from, callback) {
  
        var parts;
  
        if (!(element && element.nodeName > '@')) {
          emit('Invalid element argument');
          return false;
        } else if (!selector || typeof selector != 'string') {
          emit('Invalid selector argument');
          return false;
        } else if (from && from.nodeType == 1 && !contains(from, element)) {
          return false;
        } else if (lastContext !== from) {
          // reset context data when it changes
          // and ensure context is set to a default
          switchContext(from || (from = element.ownerDocument));
        }
  
        selector = selector.replace(reTrimSpaces, '');
  
        Config.SHORTCUTS && (selector = NW.Dom.shortcuts(selector, element, from));
  
        if (lastMatcher != selector) {
          // process valid selector strings
          if ((parts = selector.match(reValidator)) && parts[0] == selector) {
            isSingleMatch = (parts = selector.match(reSplitGroup)).length < 2;
            // save passed selector
            lastMatcher = selector;
            lastPartsMatch = parts;
          } else {
            emit('The string "' + selector + '", is not a valid CSS selector');
            return false;
          }
        } else parts = lastPartsMatch;
  
        // compile matcher resolver if necessary
        if (!matchResolvers[selector] || matchContexts[selector] !== from) {
          matchResolvers[selector] = compile(isSingleMatch ? [selector] : parts, '', false);
          matchContexts[selector] = from;
        }
  
        return matchResolvers[selector](element, Snapshot, [ ], doc, root, from, callback);
      },
  
    // select only the first element
    // matching selector (document ordered)
    first =
      function(selector, from) {
        return select(selector, from, function() { return false; })[0] || null;
      },
  
    // select elements matching selector
    // using new Query Selector API
    // or cross-browser client API
    // @return array
    select =
      function(selector, from, callback) {
  
        var i, changed, element, elements, parts, token, original = selector;
  
        if (arguments.length === 0) {
          emit('Missing required selector parameters');
          return [ ];
        } else if (selector === '') {
          emit('Empty selector string');
          return [ ];
        } else if (typeof selector != 'string') {
          return [ ];
        } else if (from && !(/1|9|11/).test(from.nodeType)) {
          emit('Invalid context element');
          return [ ];
        } else if (lastContext !== from) {
          // reset context data when it changes
          // and ensure context is set to a default
          switchContext(from || (from = doc));
        }
  
        if (Config.CACHING && (elements = Dom.loadResults(original, from, doc, root))) {
          return callback ? concatCall([ ], elements, callback) : elements;
        }
  
        if (!OPERA_QSAPI && RE_SIMPLE_SELECTOR.test(selector)) {
          switch (selector.charAt(0)) {
            case '#':
              if ((element = _byId(selector.slice(1), from))) {
                elements = [ element ];
              } else elements = [ ];
              break;
            case '.':
              elements = _byClass(selector.slice(1), from);
              break;
            default:
              elements = _byTag(selector, from);
              break;
          }
        }
  
        else if (!XML_DOCUMENT && Config.USE_QSAPI &&
          !(BUGGY_QUIRKS_QSAPI && RE_CLASS.test(selector)) &&
          !RE_BUGGY_QSAPI.test(selector)) {
          try {
            elements = from.querySelectorAll(selector);
          } catch(e) { }
        }
  
        if (elements) {
          elements = callback ? concatCall([ ], elements, callback) :
            NATIVE_SLICE_PROTO ? slice.call(elements) : concatList([ ], elements);
          Config.CACHING && Dom.saveResults(original, from, doc, elements);
          return elements;
        }
  
        selector = selector.replace(reTrimSpaces, '');
  
        Config.SHORTCUTS && (selector = NW.Dom.shortcuts(selector, from));
  
        if ((changed = lastSelector != selector)) {
          // process valid selector strings
          if ((parts = selector.match(reValidator)) && parts[0] == selector) {
            isSingleSelect = (parts = selector.match(reSplitGroup)).length < 2;
            // save passed selector
            lastSelector = selector;
            lastPartsSelect = parts;
          } else {
            emit('The string "' + selector + '", is not a valid CSS selector');
            return [ ];
          }
        } else parts = lastPartsSelect;
  
        // commas separators are treated sequentially to maintain order
        if (from.nodeType == 11) {
  
          elements = from.childNodes;
  
        } else if (!XML_DOCUMENT && isSingleSelect) {
  
          if (changed) {
            // get right most selector token
            parts = selector.match(reSplitToken);
            token = parts[parts.length - 1];
  
            // only last slice before :not rules
            lastSlice = token.split(':not')[0];
  
            // position where token was found
            lastPosition = selector.length - token.length;
          }
  
          // ID optimization RTL, to reduce number of elements to visit
          if ((parts = lastSlice.match(Optimize.ID)) && (token = parts[1])) {
            if ((element = _byId(token, from))) {
              if (match(element, selector)) {
                callback && callback(element);
                elements = [ element ];
              } else elements = [ ];
            }
          }
  
          // ID optimization LTR, to reduce selection context searches
          else if ((parts = selector.match(Optimize.ID)) && (token = parts[1])) {
            if ((element = _byId(token, doc))) {
              if ('#' + token == selector) {
                callback && callback(element);
                elements = [ element ];
              }
              if (/[>+~]/.test(selector)) {
                from = element.parentNode;
              } else {
                selector = selector.replace('#' + token, '*');
                lastPosition -= token.length + 1;
                from = element;
              }
            } else elements = [ ];
          }
  
          if (elements) {
            Config.CACHING && Dom.saveResults(original, from, doc, elements);
            return elements;
          }
  
          if (!NATIVE_GEBCN && (parts = lastSlice.match(Optimize.TAG)) && (token = parts[1])) {
            if ((elements = _byTag(token, from)).length === 0) { return [ ]; }
            selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace(token, '*');
          }
  
          else if ((parts = lastSlice.match(Optimize.CLASS)) && (token = parts[1])) {
            if ((elements = _byClass(token, from)).length === 0) { return [ ]; }
            if (reOptimizeSelector.test(selector.charAt(selector.indexOf(token) - 1))) {
              selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token, '');
            } else {
              selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token, '*');
            }
          }
  
          else if ((parts = selector.match(Optimize.CLASS)) && (token = parts[1])) {
            if ((elements = _byClass(token, from)).length === 0) { return [ ]; }
            for (i = 0, els = [ ]; elements.length > i; ++i) {
              els = concatList(els, elements[i].getElementsByTagName('*'));
            }
            elements = els;
            if (reOptimizeSelector.test(selector.charAt(selector.indexOf(token) - 1))) {
              selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token, '');
            } else {
              selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token, '*');
            }
          }
  
          else if (NATIVE_GEBCN && (parts = lastSlice.match(Optimize.TAG)) && (token = parts[1])) {
            if ((elements = _byTag(token, from)).length === 0) { return [ ]; }
            selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace(token, '*');
          }
  
        }
  
        if (!elements) {
          elements = /^(?:applet|object)$/i.test(from.nodeName) ? from.childNodes : _byTag('*', from);
        }
        // end of prefiltering pass
  
        // compile selector resolver if necessary
        if (!selectResolvers[selector] || selectContexts[selector] !== from) {
          selectResolvers[selector] = compile(isSingleSelect ? [selector] : parts, '', true);
          selectContexts[selector] = from;
        }
  
        elements = selectResolvers[selector](elements, Snapshot, [ ], doc, root, from, callback);
  
        Config.CACHING && Dom.saveResults(original, from, doc, elements);
  
        return elements;
      },
  
    /*-------------------------------- STORAGE ---------------------------------*/
  
    // compiled match functions returning booleans
    matchContexts = { },
    matchResolvers = { },
  
    // compiled select functions returning collections
    selectContexts = { },
    selectResolvers = { },
  
    // used to pass methods to compiled functions
    Snapshot = {
  
      // element indexing methods
      nthElement: nthElement,
      nthOfType: nthOfType,
  
      // element inspection methods
      getAttribute: getAttribute,
      hasAttribute: hasAttribute,
  
      // element selection methods
      byClass: _byClass,
      byName: byName,
      byTag: _byTag,
      byId: _byId,
  
      // helper/check methods
      contains: contains,
      isEmpty: isEmpty,
      isLink: isLink,
  
      // selection/matching
      select: select,
      match: match
    };
  
    Tokens = {
      prefixes: prefixes,
      encoding: encoding,
      operators: operators,
      whitespace: whitespace,
      identifier: identifier,
      attributes: attributes,
      combinators: combinators,
      pseudoclass: pseudoclass,
      pseudoparms: pseudoparms,
      quotedvalue: quotedvalue
    };
  
    /*------------------------------- PUBLIC API -------------------------------*/
  
    // code referenced by extensions
    Dom.ACCEPT_NODE = ACCEPT_NODE;
  
    // log resolvers errors/warnings
    Dom.emit = emit;
  
    // retrieve element by id attr
    Dom.byId = byId;
  
    // retrieve elements by tag name
    Dom.byTag = byTag;
  
    // retrieve elements by name attr
    Dom.byName = byName;
  
    // retrieve elements by class name
    Dom.byClass = byClass;
  
    // read the value of the attribute
    // as was in the original HTML code
    Dom.getAttribute = getAttribute;
  
    // check for the attribute presence
    // as was in the original HTML code
    Dom.hasAttribute = hasAttribute;
  
    // element match selector, return boolean true/false
    Dom.match = match;
  
    // first element match only, return element or null
    Dom.first = first;
  
    // elements matching selector, starting from element
    Dom.select = select;
  
    // compile selector into ad-hoc javascript resolver
    Dom.compile = compile;
  
    // check that two elements are ancestor/descendant
    Dom.contains = contains;
  
    // handle selector engine configuration settings
    Dom.configure = configure;
  
    // initialize caching for each document
    Dom.setCache = function() { return; };
  
    // load previously collected result set
    Dom.loadResults = function() { return; };
  
    // save previously collected result set
    Dom.saveResults = function() { return; };
  
    // handle missing context in selector strings
    Dom.shortcuts = function(x) { return x; };
  
    // options enabing specific engine functionality
    Dom.Config = Config;
  
    // pass methods references to compiled resolvers
    Dom.Snapshot = Snapshot;
  
    // operators descriptor
    // for attribute operators extensions
    Dom.Operators = Operators;
  
    // selectors descriptor
    // for pseudo-class selectors extensions
    Dom.Selectors = Selectors;
  
    // export string patterns
    Dom.Tokens = Tokens;
  
    // add or overwrite user defined operators
    Dom.registerOperator =
      function(symbol, resolver) {
        Operators[symbol] || (Operators[symbol] = resolver);
      };
  
    // add selector patterns for user defined callbacks
    Dom.registerSelector =
      function(name, rexp, func) {
        Selectors[name] || (Selectors[name] = {
          Expression: rexp,
          Callback: func
        });
      };
  
    /*---------------------------------- INIT ----------------------------------*/
  
    // init context specific variables
    switchContext(doc, true);
  
  })(this);
  

  provide("nwmatcher", module.exports);

  !function (doc, $) {
    // a bunch of this code is borrowed from Qwery so NW is a drop-in replacement
    var nw = require('nwmatcher')
      , isNode = function (el, t) {
          return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9)
        }
      , arrayLike = function (o) {
          return (typeof o === 'object' && isFinite(o.length))
        }
      , flatten = function (ar) {
          for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
          return r
        }
      , uniq = function (ar) {
          var a = [], i, j
          o: for (i = 0; i < ar.length; ++i) {
            for (j = 0; j < a.length; ++j) {
              if (a[j] == ar[i]) {
                continue o
              }
            }
            a[a.length] = ar[i]
          }
          return a
        }
      , normalizeRoot = function (root) {
          if (!root) return doc
          if (typeof root == 'string') return nw.select(root)[0]
          if (!root.nodeType && arrayLike(root)) return root[0]
          return root
        }
      , select = function (selector, _root) {
          var root = normalizeRoot(_root)
          if (!root || !selector) return []
          if (selector === window || isNode(selector)) {
            return !_root || (selector !== window && isNode(root) && nw.contains(root, container)) ? [selector] : []
          }
          if (selector && arrayLike(selector)) return flatten(selector)
          return nw.select(selector, root)
        }
      , is = function (s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (nw.match(this[i], s, r)) {
              return true
            }
          }
          return false
        }
  
    $._select = function (selector, root) {
      // if 'bonzo' is available at run-time use it for <element> creation
      return ($._select = (function(bonzo) {
        try {
          bonzo = require('bonzo')
          return function (selector, root) {
            return /^\s*</.test(selector) ? bonzo.create(selector, root) : select(selector, root)
          }
        } catch (e) { }
        return select
      })())(selector, root)
    }
  
    $.ender({
        // boolean, does at least one element in the collection match the given selector
        is: is
      , match: is
        // find all elements that are children of the elements in this collection matching
        // the given selector
      , find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = select(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(uniq(r))
        }
        // add additional elements to this collection matching the given selector
      , and: function (s, r) {
          var plus = $(s, r)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          return this
        }
    }, true)
  
    $.ender({
        // allow for NW.Dom.select(selector, root, callback), for speedy code such as
        // $.select("div", null, function ( e ) { e.style.backgroundColor = "#ffe"; });
        select: function () {
          return $(nw.select.apply(null, arguments))
        }
        // like querySelector(), return only the first match, document-order
      , first: function (selector, root) {
          return $(nw.select(selector, root, function() { return false }))
        }
        // direct access in to NW.Dom.configure(options), for use such as:
        // $.configure({ USE_QSAPI: false, VERBOSITY: false });
      , configure: function (options) {
          nw.configure(options)
        }
    })
  
  }(document, ender)
  

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
      , up = integrate('up')
      , down = integrate('down')
      , next = integrate('next')
      , previous = integrate('previous')
  
    $.ender(
        {
            // core
            up: up
          , down: down
          , next: next
          , previous: previous
            // aliases
          , parent: up
          , prev: previous
        }
      , true
    )
  }(ender))
  

}();