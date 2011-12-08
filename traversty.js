/*!
  * Traversty: DOM Traversal Utility (c) Rod Vagg (@rvagg) 2011
  * https://github.com/rvagg/traversty
  * License MIT
  */

!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else this[name] = definition()
}('traversty', function() {
  var context = this
    , old = context.traversty
    , win = window
    , doc = win.document
    , selectorEngine = null
    , toString = Object.prototype.toString
    , matchesSelector = (function(el, pfx, name, i, ms) {
        for (; i < pfx.length; i++)
          if (el[ms = pfx[i] + name]) return ms
        if (el[name = 'm' + name.substring(1)]) return name
      })(document.documentElement, [ 'ms', 'webkit', 'moz', 'o' ], 'MatchesSelector', 0)

    , isNumber = function (o) {
        return toString.call(o) === '[object Number]'
      }

    , isString = function(o) {
        return toString.call(o) === '[object String]'
      }

    , isUndefined = function(o) {
        return o === void 0
      }

    , isElement = function(o) {
        return o && o.nodeType === 1
      }

    , getIndex = function(selector, index) {
        return isUndefined(selector) && !isNumber(index) ? 0 :
          isNumber(selector) ? selector : index
      }

    , getSelector = function(selector) {
        return isString(selector) ? selector : '*'
      }

    , unique = function(ar) {
        var a = [], i, j
        label:
        for (i = 0; i < ar.length; i++) {
          for (j = 0; j < a.length; j++)
            if (a[j] === ar[i]) continue label
          a.push(ar[i])
        }
        return a
      }

    , collect = function (els, fn) {
        var ret = [], i = 0, l = els.length
        while (i < l) ret.push(fn(els[i++]))
        return ret
      }

   , move = function (els, method, selector, index) {
        index = getIndex(selector, index)
        selector = getSelector(selector)
        return collect(els
          , function (el) {
              for (var i = index; el && i >= 0;) {
                el = el[method]
                if (isElement(el) && selectorMatches(el, selector)) i--
              }
              return el || 0
            }
        )
      }

    , selectorFind = function(el, selector) {
        return el.querySelectorAll(selector)
      }

    , selectorMatches = function(el, selector) {
        return selector === '*' || el[matchesSelector](selector)
      }

    , down = function(selector, index) {
        index = getIndex(selector, index)
        selector = getSelector(selector)
        return traversty(collect(this
          , function (el) {
              return selectorFind(el, selector)[index] || 0
            }
          ))
      }

    , up = function(selector, index) {
        return traversty(unique(move(this, 'parentNode', selector, index)))
      }

    , previous = function (selector, index) {
        return traversty(move(this, 'previousSibling', selector, index))
      }

    , next = function (selector, index) {
        return traversty(move(this, 'nextSibling', selector, index))
      }

    , traversty = (function() {
        function T(els) {
          this.length = 0
          if (els) {
            els = typeof els !== 'string' && !els.nodeType && typeof els.length !== 'undefined' ? els : [els]
            this.length = els.length
            for (var i = 0; i < els.length; i++) this[i] = els[i]
          }
        }

        T.prototype = { up: up, down: down, previous: previous, next: next }

        function t(els) {
          return new T(isString(els) ? selectorFind(doc, els) : els)
        }

        t.setSelectorEngine = function (s) {
          selectorEngine = s
        }

        t.noConflict = function () {
          context.traversty = old
          return this
        }

        return t
      })()
 
  return traversty
})
