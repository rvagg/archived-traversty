!(function (name, definition) {
  if (typeof this.module !== 'undefined') this.module.exports = definition()
  else if (typeof this.define === 'function' && this.define.amd) this.define(name, definition)
  else this[name] = definition()
}('traversty', function () {
  var context = this
    , old = context.traversty
    , doc = window.document
    , html = doc.documentElement
    , selectorEngine = null
    , toString = Object.prototype.toString
    , slice = Array.prototype.slice
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

    , isUndefined = function (o) {
        return o === void 0
      }

    , isElement = function (o) {
        return o && o.nodeType === 1
      }

    , getIndex = function (selector, index) {
        return isUndefined(selector) && !isNumber(index) ? 0 :
          isNumber(selector) ? selector : isNumber(index) ? index : null
      }

    , getSelector = function (selector) {
        return isString(selector) ? selector : '*'
      }

    , selectorFind = function (el, selector) {
        return slice.call(el.querySelectorAll(selector), 0)
      }

    , selectorMatches = function (el, selector) {
        return selector === '*' || el[matchesSelector](selector)
      }

    , unique = function (ar) {
        var a = [], i = -1, j
        label:
        while (++i < ar.length) {
          j = -1
          while (++j < a.length)
            if (a[j] === ar[i]) continue label
          a.push(ar[i])
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
                    selectorMatches(el, selector) &&
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
                    var f = selectorFind(el, selector)
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
      }())
 
  return traversty
}))
