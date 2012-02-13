/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build domready sel bonzo ../../ --output ender_sel
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

!function () {

  var module = { exports: {} }, exports = module.exports;

  var __hasProp = Object.prototype.hasOwnProperty;
  
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(that) {
      var Bound, args, target;
      target = this;
      if (typeof target.apply !== "function" || typeof target.call !== "function") {
        return new TypeError();
      }
      args = Array.prototype.slice.call(arguments);
      Bound = (function() {
  
        function Bound() {
          var Type, self;
          if (this instanceof Bound) {
            self = new (Type = (function() {
  
              function Type() {}
  
              Type.prototype = target.prototype;
  
              return Type;
  
            })());
            target.apply(self, args.concat(Array.prototype.slice.call(arguments)));
            return self;
          } else {
            return target.call.apply(target, args.concat(Array.prototype.slice.call(arguments)));
          }
        }
  
        Bound.prototype.length = (typeof target === "function" ? Math.max(target.length - args.length, 0) : 0);
  
        return Bound;
  
      })();
      return Bound;
    };
  }
  
  if (!Array.isArray) {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
  }
  
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, that) {
      var i, val, _len;
      for (i = 0, _len = this.length; i < _len; i++) {
        val = this[i];
        if (i in this) fn.call(that, val, i, this);
      }
    };
  }
  
  if (!Array.prototype.map) {
    Array.prototype.map = function(fn, that) {
      var i, val, _len, _results;
      _results = [];
      for (i = 0, _len = this.length; i < _len; i++) {
        val = this[i];
        if (i in this) _results.push(fn.call(that, val, i, this));
      }
      return _results;
    };
  }
  
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fn, that) {
      var i, val, _len, _results;
      _results = [];
      for (i = 0, _len = this.length; i < _len; i++) {
        val = this[i];
        if (i in this && fn.call(that, val, i, this)) _results.push(val);
      }
      return _results;
    };
  }
  
  if (!Array.prototype.some) {
    Array.prototype.some = function(fn, that) {
      var i, val, _len;
      for (i = 0, _len = this.length; i < _len; i++) {
        val = this[i];
        if (i in this) if (fn.call(that, val, i, this)) return true;
      }
      return false;
    };
  }
  
  if (!Array.prototype.every) {
    Array.prototype.every = function(fn, that) {
      var i, val, _len;
      for (i = 0, _len = this.length; i < _len; i++) {
        val = this[i];
        if (i in this) if (!fn.call(that, val, i, this)) return false;
      }
      return true;
    };
  }
  
  if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fn) {
      var i, result;
      i = 0;
      if (arguments.length > 1) {
        result = arguments[1];
      } else if (this.length) {
        result = this[i++];
      } else {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      while (i < this.length) {
        if (i in this) result = fn.call(null, result, this[i], i, this);
        i++;
      }
      return result;
    };
  }
  
  if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(fn) {
      var i, result;
      i = this.length - 1;
      if (arguments.length > 1) {
        result = arguments[1];
      } else if (this.length) {
        result = this[i--];
      } else {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      while (i >= 0) {
        if (i in this) result = fn.call(null, result, this[i], i, this);
        i--;
      }
      return result;
    };
  }
  
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(value) {
      var i, _ref;
      i = (_ref = arguments[1]) != null ? _ref : 0;
      if (i < 0) i += length;
      i = Math.max(i, 0);
      while (i < this.length) {
        if (i in this) if (this[i] === value) return i;
        i++;
      }
      return -1;
    };
  }
  
  if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(value) {
      var i;
      i = arguments[1] || this.length;
      if (i < 0) i += length;
      i = Math.min(i, this.length - 1);
      while (i >= 0) {
        if (i in this) if (this[i] === value) return i;
        i--;
      }
      return -1;
    };
  }
  
  if (!Object.keys) {
    Object.keys = function(obj) {
      var key, _results;
      _results = [];
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        _results.push(key);
      }
      return _results;
    };
  }
  
  if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }
  
  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
      return ("" + (this.getUTCFullYear()) + "-" + (this.getUTCMonth() + 1) + "-" + (this.getUTCDate()) + "T") + ("" + (this.getUTCHours()) + ":" + (this.getUTCMinutes()) + ":" + (this.getUTCSeconds()) + "Z");
    };
  }
  
  if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function() {
      return this.toISOString();
    };
  }
  
  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
  }
  

  provide("es5-basic", module.exports);

}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  
  (function(sel) {
    /* util.coffee
    */
    var attrPattern, combinatorPattern, combine, contains, create, difference, eachElement, elCmp, evaluate, extend, filter, filterDescendants, find, findRoots, getAttribute, html, intersection, matchesDisconnected, matchesSelector, matching, nextElementSibling, normalizeRoots, outerParents, parentMap, parse, parseSimple, pseudoPattern, pseudos, qSA, select, selectorGroups, selectorPattern, tagPattern, takeElements, union, _attrMap;
    html = document.documentElement;
    extend = function(a, b) {
      var x, _i, _len;
      for (_i = 0, _len = b.length; _i < _len; _i++) {
        x = b[_i];
        a.push(x);
      }
      return a;
    };
    takeElements = function(els) {
      return els.filter(function(el) {
        return el.nodeType === 1;
      });
    };
    eachElement = function(el, first, next, fn) {
      if (first) el = el[first];
      while (el) {
        if (el.nodeType === 1) if (fn(el) === false) break;
        el = el[next];
      }
    };
    nextElementSibling = html.nextElementSibling ? function(el) {
      return el.nextElementSibling;
    } : function(el) {
      el = el.nextSibling;
      while (el && el.nodeType !== 1) {
        el = el.nextSibling;
      }
      return el;
    };
    contains = html.compareDocumentPosition != null ? function(a, b) {
      return (a.compareDocumentPosition(b) & 16) === 16;
    } : html.contains != null ? function(a, b) {
      if (a.documentElement) {
        return b.ownerDocument === a;
      } else {
        return a !== b && a.contains(b);
      }
    } : function(a, b) {
      if (a.documentElement) return b.ownerDocument === a;
      while (b = b.parentNode) {
        if (a === b) return true;
      }
      return false;
    };
    elCmp = html.compareDocumentPosition ? function(a, b) {
      if (a === b) {
        return 0;
      } else if (a.compareDocumentPosition(b) & 4) {
        return -1;
      } else {
        return 1;
      }
    } : html.sourceIndex ? function(a, b) {
      if (a === b) {
        return 0;
      } else if (a.sourceIndex < b.sourceIndex) {
        return -1;
      } else {
        return 1;
      }
    } : void 0;
    filterDescendants = function(els) {
      return els.filter(function(el, i) {
        return el && !(i && (els[i - 1] === el || contains(els[i - 1], el)));
      });
    };
    outerParents = function(els) {
      return filterDescendents(els.map(function(el) {
        return el.parentNode;
      }));
    };
    findRoots = function(els) {
      var r;
      r = [];
      els.forEach(function(el) {
        while (el.parentNode) {
          el = el.parentNode;
        }
        if (r[r.length - 1] !== el) r.push(el);
      });
      return r;
    };
    combine = function(a, b, aRest, bRest, map) {
      var i, j, r;
      r = [];
      i = 0;
      j = 0;
      while (i < a.length && j < b.length) {
        switch (map[elCmp(a[i], b[j])]) {
          case -1:
            i++;
            break;
          case -2:
            j++;
            break;
          case 1:
            r.push(a[i++]);
            break;
          case 2:
            r.push(b[j++]);
            break;
          case 0:
            r.push(a[i++]);
            j++;
        }
      }
      if (aRest) {
        while (i < a.length) {
          r.push(a[i++]);
        }
      }
      if (bRest) {
        while (j < b.length) {
          r.push(b[j++]);
        }
      }
      return r;
    };
    sel.union = union = function(a, b) {
      return combine(a, b, true, true, {
        '0': 0,
        '-1': 1,
        '1': 2
      });
    };
    sel.intersection = intersection = function(a, b) {
      return combine(a, b, false, false, {
        '0': 0,
        '-1': -1,
        '1': -2
      });
    };
    sel.difference = difference = function(a, b) {
      return combine(a, b, true, false, {
        '0': -1,
        '-1': 1,
        '1': -2
      });
    };
    /* parser.coffee
    */
    attrPattern = /\[\s*([-\w]+)\s*(?:([~|^$*!]?=)\s*(?:([-\w]+)|['"]([^'"]*)['"]\s*(i))\s*)?\]/g;
    pseudoPattern = /::?([-\w]+)(?:\((\([^()]+\)|[^()]+)\))?/g;
    combinatorPattern = /^\s*([,+~]|\/([-\w]+)\/)/;
    selectorPattern = RegExp("^(?:\\s*(>))?\\s*(?:(\\*|\\w+))?(?:\\#([-\\w]+))?(?:\\.([-\\.\\w]+))?((?:" + attrPattern.source + ")*)((?:" + pseudoPattern.source + ")*)(!)?");
    selectorGroups = {
      type: 1,
      tag: 2,
      id: 3,
      classes: 4,
      attrsAll: 5,
      pseudosAll: 11,
      subject: 14
    };
    parse = function(selector) {
      var e, last, result;
      if (selector in parse.cache) return parse.cache[selector];
      result = last = e = parseSimple(selector);
      if (e.compound) e.children = [];
      while (e[0].length < selector.length) {
        selector = selector.substr(last[0].length);
        e = parseSimple(selector);
        if (e.compound) {
          e.children = [result];
          result = e;
        } else if (last.compound) {
          last.children.push(e);
        } else {
          last.child = e;
        }
        last = e;
      }
      return (parse.cache[selector] = result);
    };
    parse.cache = {};
    parseSimple = function(selector) {
      var e, group, name;
      if (e = combinatorPattern.exec(selector)) {
        e.compound = true;
        e.type = e[1].charAt(0);
        if (e.type === '/') e.idref = e[2];
      } else if ((e = selectorPattern.exec(selector)) && e[0].trim()) {
        e.simple = true;
        for (name in selectorGroups) {
          group = selectorGroups[name];
          e[name] = e[group];
        }
        e.type || (e.type = ' ');
        e.tag && (e.tag = e.tag.toLowerCase());
        if (e.classes) e.classes = e.classes.toLowerCase().split('.');
        if (e.attrsAll) {
          e.attrs = [];
          e.attrsAll.replace(attrPattern, function(all, name, op, val, quotedVal, ignoreCase) {
            name = name.toLowerCase();
            val || (val = quotedVal);
            if (op === '=') {
              if (name === 'id' && !e.id) {
                e.id = val;
                return "";
              } else if (name === 'class') {
                if (e.classes) {
                  e.classes.append(val);
                } else {
                  e.classes = [val];
                }
                return "";
              }
            }
            if (ignoreCase) val = val.toLowerCase();
            e.attrs.push({
              name: name,
              op: op,
              val: val,
              ignoreCase: ignoreCase
            });
            return "";
          });
        }
        if (e.pseudosAll) {
          e.pseudos = [];
          e.pseudosAll.replace(pseudoPattern, function(all, name, val) {
            name = name.toLowerCase();
            e.pseudos.push({
              name: name,
              val: val
            });
            return "";
          });
        }
      } else {
        throw new Error("Parse error at: " + selector);
      }
      return e;
    };
    /* find.coffee
    */
    _attrMap = {
      'tag': function(el) {
        return el.tagName;
      },
      'class': function(el) {
        return el.className;
      }
    };
    getAttribute = function(el, name) {
      if (_attrMap[name]) {
        return _attrMap[name](el);
      } else {
        return el.getAttribute(name);
      }
    };
    find = function(e, roots, matchRoots) {
      var els;
      if (e.id) {
        els = [];
        roots.forEach(function(root) {
          var doc, el;
          doc = root.ownerDocument || root;
          if (root === doc || (root.nodeType === 1 && contains(doc.documentElement, root))) {
            el = doc.getElementById(e.id);
            if (el && contains(root, el)) els.push(el);
          } else {
            extend(els, root.getElementsByTagName(e.tag || '*'));
          }
        });
      } else if (e.classes && find.byClass) {
        els = roots.map(function(root) {
          return e.classes.map(function(cls) {
            return root.getElementsByClassName(cls);
          }).reduce(union);
        }).reduce(extend, []);
        e.ignoreClasses = true;
      } else {
        els = roots.map(function(root) {
          return root.getElementsByTagName(e.tag || '*');
        }).reduce(extend, []);
        if (find.filterComments && (!e.tag || e.tag === '*')) {
          els = takeElements(els);
        }
        e.ignoreTag = true;
      }
      if (els && els.length) {
        els = filter(els, e, roots, matchRoots);
      } else {
        els = [];
      }
      e.ignoreTag = void 0;
      e.ignoreClasses = void 0;
      if (matchRoots) {
        els = union(els, filter(takeElements(roots), e, roots, matchRoots));
      }
      return els;
    };
    filter = function(els, e, roots, matchRoots) {
      if (e.id) {
        els = els.filter(function(el) {
          return el.id === e.id;
        });
      }
      if (e.tag && e.tag !== '*' && !e.ignoreTag) {
        els = els.filter(function(el) {
          return el.nodeName.toLowerCase() === e.tag;
        });
      }
      if (e.classes && !e.ignoreClasses) {
        e.classes.forEach(function(cls) {
          els = els.filter(function(el) {
            return (" " + el.className + " ").indexOf(" " + cls + " ") >= 0;
          });
        });
      }
      if (e.attrs) {
        e.attrs.forEach(function(_arg) {
          var ignoreCase, name, op, val;
          name = _arg.name, op = _arg.op, val = _arg.val, ignoreCase = _arg.ignoreCase;
          els = els.filter(function(el) {
            var attr, value;
            attr = getAttribute(el, name);
            value = attr + "";
            if (ignoreCase) value = value.toLowerCase();
            return (attr || (el.attributes && el.attributes[name] && el.attributes[name].specified)) && (!op ? true : op === '=' ? value === val : op === '!=' ? value !== val : op === '*=' ? value.indexOf(val) >= 0 : op === '^=' ? value.indexOf(val) === 0 : op === '$=' ? value.substr(value.length - val.length) === val : op === '~=' ? (" " + value + " ").indexOf(" " + val + " ") >= 0 : op === '|=' ? value === val || (value.indexOf(val) === 0 && value.charAt(val.length) === '-') : false);
          });
        });
      }
      if (e.pseudos) {
        e.pseudos.forEach(function(_arg) {
          var name, pseudo, val;
          name = _arg.name, val = _arg.val;
          pseudo = pseudos[name];
          if (!pseudo) throw new Error("no pseudo with name: " + name);
          if (pseudo.batch) {
            els = pseudo(els, val, roots, matchRoots);
          } else {
            els = els.filter(function(el) {
              return pseudo(el, val);
            });
          }
        });
      }
      return els;
    };
    (function() {
      var div;
      div = document.createElement('div');
      div.innerHTML = '<a href="#"></a>';
      if (div.firstChild.getAttribute('href') !== '#') {
        _attrMap['href'] = function(el) {
          return el.getAttribute('href', 2);
        };
        _attrMap['src'] = function(el) {
          return el.getAttribute('src', 2);
        };
      }
      div.innerHTML = '<div class="a b"></div><div class="a"></div>';
      if (div.getElementsByClassName && div.getElementsByClassName('b').length) {
        div.lastChild.className = 'b';
        if (div.getElementsByClassName('b').length === 2) find.byClass = true;
      }
      div.innerHTML = '';
      div.appendChild(document.createComment(''));
      if (div.getElementsByTagName('*').length > 0) find.filterComments = true;
      div = null;
    })();
    /* pseudos.coffee
    */
    sel.pseudos = pseudos = {
      selected: function(el) {
        return el.selected === true;
      },
      focus: function(el) {
        return el.ownerDocument.activeElement === el;
      },
      enabled: function(el) {
        return el.disabled === false;
      },
      checked: function(el) {
        return el.checked === true;
      },
      disabled: function(el) {
        return el.disabled === true;
      },
      root: function(el) {
        return el.ownerDocument.documentElement === el;
      },
      target: function(el) {
        return el.id === location.hash.substr(1);
      },
      empty: function(el) {
        return !el.childNodes.length;
      },
      dir: function(el, val) {
        while (el) {
          if (el.dir) return el.dir === val;
          el = el.parentNode;
        }
        return false;
      },
      lang: function(el, val) {
        var lang;
        while (el) {
          if ((lang = el.lang)) {
            return lang === val || lang.indexOf("" + val + "-") === 0;
          }
          el = el.parentNode;
        }
        el = select('head meta[http-equiv="Content-Language" i]', el.ownerDocument)[0];
        if (el) {
          lang = getAttribute(el, 'content').split(',')[0];
          return lang === val || lang.indexOf("" + val + "-") === 0;
        }
        return false;
      },
      'local-link': function(el, val) {
        var href, i, location;
        if (!el.href) return false;
        href = el.href.replace(/#.*?$/, '');
        location = el.ownerDocument.location.href.replace(/#.*?$/, '');
        if (val === void 0) {
          return href === location;
        } else {
          href = href.split('/').slice(2);
          location = location.split('/').slice(2);
          for (i = 0; i <= val; i += 1) {
            if (href[i] !== location[i]) return false;
          }
          return true;
        }
      },
      contains: function(el, val) {
        var _ref;
        return ((_ref = el.textContent) != null ? _ref : el.innerText).indexOf(val) >= 0;
      },
      "with": function(el, val) {
        return select(val, [el]).length > 0;
      },
      without: function(el, val) {
        return select(val, [el]).length === 0;
      }
    };
    pseudos['has'] = pseudos['with'];
    pseudos.matches = function(els, val, roots, matchRoots) {
      return intersection(els, select(val, roots, matchRoots));
    };
    pseudos.matches.batch = true;
    pseudos.not = function(els, val, roots, matchRoots) {
      return difference(els, select(val, roots, matchRoots));
    };
    pseudos.not.batch = true;
    (function() {
      var checkNth, fn, matchColumn, name, nthMatch, nthMatchPattern, nthPattern, nthPositional, positionalPseudos;
      nthPattern = /^\s*(even|odd|(?:(\+|\-)?(\d*)(n))?(?:\s*(\+|\-)?\s*(\d+))?)(?:\s+of\s+(.*?))?\s*$/;
      checkNth = function(i, m) {
        var a, b;
        a = parseInt((m[2] || '+') + (m[3] === '' ? (m[4] ? '1' : '0') : m[3]));
        b = parseInt((m[5] || '+') + (m[6] === '' ? '0' : m[6]));
        if (m[1] === 'even') {
          return i % 2 === 0;
        } else if (m[1] === 'odd') {
          return i % 2 === 1;
        } else if (a) {
          return ((i - b) % a === 0) && ((i - b) / a >= 0);
        } else if (b) {
          return i === b;
        } else {
          throw new Error('Invalid nth expression');
        }
      };
      matchColumn = function(nth, reversed) {
        var first, next;
        first = reversed ? 'lastChild' : 'firstChild';
        next = reversed ? 'previousSibling' : 'nextSibling';
        return function(els, val, roots) {
          var check, m, set;
          set = [];
          if (nth) {
            m = nthPattern.exec(val);
            check = function(i) {
              return checkNth(i, m);
            };
          }
          select('table', roots).forEach(function(table) {
            var col, max, min, tbody, _i, _len, _ref;
            if (!nth) {
              col = select(val, [table])[0];
              min = 0;
              eachElement(col, 'previousSibling', 'previousSibling', function(col) {
                return min += parseInt(col.getAttribute('span') || 1);
              });
              max = min + parseInt(col.getAttribute('span') || 1);
              check = function(i) {
                return (min < i && i <= max);
              };
            }
            _ref = table.tBodies;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              tbody = _ref[_i];
              eachElement(tbody, 'firstChild', 'nextSibling', function(row) {
                var i;
                if (row.tagName.toLowerCase() !== 'tr') return;
                i = 0;
                eachElement(row, first, next, function(col) {
                  var span;
                  span = parseInt(col.getAttribute('span') || 1);
                  while (span) {
                    if (check(++i)) set.push(col);
                    span--;
                  }
                });
              });
            }
          });
          return intersection(els, set);
        };
      };
      pseudos['column'] = matchColumn(false);
      pseudos['column'].batch = true;
      pseudos['nth-column'] = matchColumn(true);
      pseudos['nth-column'].batch = true;
      pseudos['nth-last-column'] = matchColumn(true, true);
      pseudos['nth-last-column'].batch = true;
      nthMatchPattern = /^(.*?)\s*of\s*(.*)$/;
      nthMatch = function(reversed) {
        return function(els, val, roots) {
          var filtered, len, m, set;
          m = nthPattern.exec(val);
          set = select(m[7], roots);
          len = set.length;
          set.forEach(function(el, i) {
            el._sel_index = (reversed ? len - i : i) + 1;
          });
          filtered = els.filter(function(el) {
            return checkNth(el._sel_index, m);
          });
          set.forEach(function(el, i) {
            el._sel_index = void 0;
          });
          return filtered;
        };
      };
      pseudos['nth-match'] = nthMatch();
      pseudos['nth-match'].batch = true;
      pseudos['nth-last-match'] = nthMatch(true);
      pseudos['nth-last-match'].batch = true;
      nthPositional = function(fn, reversed) {
        var first, next;
        first = reversed ? 'lastChild' : 'firstChild';
        next = reversed ? 'previousSibling' : 'nextSibling';
        return function(els, val) {
          var filtered, m;
          if (val) m = nthPattern.exec(val);
          els.forEach(function(el) {
            var indices, parent;
            if ((parent = el.parentNode) && parent._sel_children === void 0) {
              indices = {
                '*': 0
              };
              eachElement(parent, first, next, function(el) {
                el._sel_index = ++indices['*'];
                el._sel_indexOfType = indices[el.nodeName] = (indices[el.nodeName] || 0) + 1;
              });
              parent._sel_children = indices;
            }
          });
          filtered = els.filter(function(el) {
            return fn(el, m);
          });
          els.forEach(function(el) {
            var parent;
            if ((parent = el.parentNode) && parent._sel_children !== void 0) {
              eachElement(parent, first, next, function(el) {
                el._sel_index = el._sel_indexOfType = void 0;
              });
              parent._sel_children = void 0;
            }
          });
          return filtered;
        };
      };
      positionalPseudos = {
        'first-child': function(el) {
          return el._sel_index === 1;
        },
        'only-child': function(el) {
          return el._sel_index === 1 && el.parentNode._sel_children['*'] === 1;
        },
        'nth-child': function(el, m) {
          return checkNth(el._sel_index, m);
        },
        'first-of-type': function(el) {
          return el._sel_indexOfType === 1;
        },
        'only-of-type': function(el) {
          return el._sel_indexOfType === 1 && el.parentNode._sel_children[el.nodeName] === 1;
        },
        'nth-of-type': function(el, m) {
          return checkNth(el._sel_indexOfType, m);
        }
      };
      for (name in positionalPseudos) {
        fn = positionalPseudos[name];
        pseudos[name] = nthPositional(fn);
        pseudos[name].batch = true;
        if (name.substr(0, 4) !== 'only') {
          name = name.replace('first', 'last').replace('nth', 'nth-last');
          pseudos[name] = nthPositional(fn, true);
          pseudos[name].batch = true;
        }
      }
    })();
    /* eval.coffee
    */
    evaluate = function(e, roots, matchRoots) {
      var els, ids, outerRoots, sibs;
      els = [];
      if (roots.length) {
        switch (e.type) {
          case ' ':
          case '>':
            outerRoots = filterDescendants(roots);
            els = find(e, outerRoots, matchRoots);
            if (e.type === '>') {
              roots.forEach(function(el) {
                el._sel_mark = true;
              });
              els = els.filter(function(el) {
                if (el.parentNode) return el.parentNode._sel_mark;
              });
              roots.forEach(function(el) {
                el._sel_mark = void 0;
              });
            }
            if (e.child) {
              if (e.subject) {
                els = els.filter(function(el) {
                  return evaluate(e.child, [el]).length;
                });
              } else {
                els = evaluate(e.child, els);
              }
            }
            break;
          case '+':
          case '~':
          case ',':
          case '/':
            if (e.children.length === 2) {
              sibs = evaluate(e.children[0], roots, matchRoots);
              els = evaluate(e.children[1], roots, matchRoots);
            } else {
              sibs = roots;
              els = evaluate(e.children[0], outerParents(roots), matchRoots);
            }
            if (e.type === ',') {
              els = union(sibs, els);
            } else if (e.type === '/') {
              ids = sibs.map(function(el) {
                return getAttribute(el, e.idref).replace(/^.*?#/, '');
              });
              els = els.filter(function(el) {
                return ~ids.indexOf(el.id);
              });
            } else if (e.type === '+') {
              sibs.forEach(function(el) {
                if ((el = nextElementSibling(el))) el._sel_mark = true;
              });
              els = els.filter(function(el) {
                return el._sel_mark;
              });
              sibs.forEach(function(el) {
                if ((el = nextElementSibling(el))) el._sel_mark = void 0;
              });
            } else if (e.type === '~') {
              sibs.forEach(function(el) {
                while ((el = nextElementSibling(el)) && !el._sel_mark) {
                  el._sel_mark = true;
                }
              });
              els = els.filter(function(el) {
                return el._sel_mark;
              });
              sibs.forEach(function(el) {
                while ((el = nextElementSibling(el)) && el._sel_mark) {
                  el._sel_mark = void 0;
                }
              });
            }
        }
      }
      return els;
    };
    /* select.coffee
    */
    parentMap = {
      thead: 'table',
      tbody: 'table',
      tfoot: 'table',
      tr: 'tbody',
      th: 'tr',
      td: 'tr',
      fieldset: 'form',
      option: 'select'
    };
    tagPattern = /^\s*<([^\s>]+)/;
    create = function(html, root) {
      var els, parent;
      parent = (root || document).createElement(parentMap[tagPattern.exec(html)[1]] || 'div');
      parent.innerHTML = html;
      els = [];
      eachElement(parent, 'firstChild', 'nextSibling', function(el) {
        return els.push(el);
      });
      return els;
    };
    qSA = function(selector, root) {
      var els, id;
      if (root.nodeType === 1) {
        id = root.id;
        if (!id) root.id = '_sel_root';
        selector = "#" + root.id + " " + selector;
      }
      els = root.querySelectorAll(selector);
      if (root.nodeType === 1 && !id) root.removeAttribute('id');
      return els;
    };
    select = html.querySelectorAll ? function(selector, roots, matchRoots) {
      if (!matchRoots && !combinatorPattern.exec(selector)) {
        try {
          return roots.map(function(root) {
            return qSA(selector, root);
          }).reduce(extend, []);
        } catch (e) {
  
        }
      }
      return evaluate(parse(selector), roots, matchRoots);
    } : function(selector, roots, matchRoots) {
      return evaluate(parse(selector), roots, matchRoots);
    };
    normalizeRoots = function(roots) {
      if (!roots) {
        return [document];
      } else if (typeof roots === 'string') {
        return select(roots, [document]);
      } else if (typeof roots === 'object' && isFinite(roots.length)) {
        if (roots.sort) {
          roots.sort(elCmp);
        } else {
          roots = extend([], roots);
        }
        return roots;
      } else {
        return [roots];
      }
    };
    sel.sel = function(selector, _roots, matchRoots) {
      var roots;
      roots = normalizeRoots(_roots);
      if (!selector) {
        return [];
      } else if (Array.isArray(selector)) {
        return selector;
      } else if (tagPattern.test(selector)) {
        return create(selector, roots[0]);
      } else if (selector === window || selector === 'window') {
        return [window];
      } else if (selector === document || selector === 'document') {
        return [document];
      } else if (selector.nodeType === 1) {
        if (!_roots || roots.some(function(root) {
          return contains(root, selector);
        })) {
          return [selector];
        } else {
          return [];
        }
      } else {
        return select(selector, roots, matchRoots);
      }
    };
    matchesSelector = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
    matchesDisconnected = matchesSelector && matchesSelector.call(document.createElement('div'), 'div');
    sel.matching = matching = function(els, selector, roots) {
      if (matchesSelector && (matchesDisconnected || els.every(function(el) {
        return el.document && el.document.nodeType !== 11;
      }))) {
        try {
          return els.filter(function(el) {
            return matchesSelector.call(el, selector);
          });
        } catch (e) {
  
        }
      }
      e = parse(selector);
      if (!e.child && !e.children && !e.pseudos) {
        return filter(els, e);
      } else {
        return intersection(els, sel.sel(selector, findRoots(els), true));
      }
    };
  })(typeof exports !== "undefined" && exports !== null ? exports : (this['sel'] = {}));
  

  provide("sel", module.exports);

  
  (function($) {
    var methods, sel;
    sel = require('sel');
    $._select = sel.sel;
    methods = {
      find: function(s) {
        return $(s, this);
      },
      union: function(s, r) {
        return $(sel.union(this, sel.sel(s, r)));
      },
      difference: function(s, r) {
        return $(sel.difference(this, sel.sel(s, r)));
      },
      intersection: function(s, r) {
        return $(sel.intersection(this, sel.sel(s, r)));
      },
      matching: function(s) {
        return $(sel.matching(this, s));
      },
      is: function(s, r) {
        return sel.matching(this, s, r).length > 0;
      }
    };
    methods.and = methods.union;
    methods.not = methods.difference;
    methods.matches = methods.matching;
    $.pseudos = sel.pseudos;
    return $.ender(methods, true);
  })(ender);
  

}();