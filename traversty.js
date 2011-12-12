/*!
  * Traversty: DOM Traversal Utility (c) Rod Vagg (@rvagg) 2011
  * https://github.com/rvagg/traversty
  * License MIT
  */

/*global module:true, define:true*/
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
    , createUnorderedEngineSelectorFind = function(engineSelect) {
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

      // used in the case where our selector engine can't handle matches('x,y') properly
      // (Sel), so we split up the selector and feed it in parts
    , createSplittingEngineSelectorMatches = function(engineMatches) {
        return function(selector, el) {
          var s = selector.split(','), i = s.length
          while (i--) {
            if (engineMatches(s[i], el)) return true
          }
          return false
        }
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
          var select = s.select || s.sel || s, r, a, e = doc.createElement('p')
          e.innerHTML = '<a/><i/><b/>'
          a = e.firstChild
          try {
            // basic select, can we make this baby work
            if ((r = select('b,a', e)).length !== 2) throw 'Traversty: don\'t know how to use this selector engine'
            // check to see if the selector engine has given us the results in document-order
            // and if not, work around it
            selectorFind = r[0] === a ? select : createUnorderedEngineSelectorFind(select)
            // have we done enough to get a working `selectorFind`?
            if ((r = selectorFind('b,a', e)).length !== 2 || r[0] !== a)
              throw 'Traversty: couldn\'t make selector engine work'

            // check to see how we do a matchesSelector
            selectorMatches =
              s.matching ? function (selector, el) { return s.matching([el], selector).length > 0 } :
                s.is ? function (selector, el) { return s.is(el, selector) } :
                  s.matchesSelector ? function (selector, el) { return s.matchesSelector(el, selector) } :
                    s.match ? function (selector, el) { return s.match(el, selector) } : null

            if (!selectorMatches) {
              // perhaps it's an selector(x).is(y) type selector?
              a = s('a', e)
              selectorMatches =
                a.matching ? function (selector, el) { return s(el).matching(selector).length > 0 } :
                  a.is ? function (selector, el) { return s(el).is(selector) } :
                    a.matchesSelector ? function (selector, el) { return s(el).matchesSelector(selector) } :
                      a.match ? function (selector, el) { return s(el).match(selector) } : null
            }

            if (!selectorMatches)
                throw 'Traversty: couldn\'t find selector engine\'s `matchesSelector`'

            // do we have a grouping selector problem? (Sel)
            if (selectorMatches('x,y', e))
              selectorMatches = createSplittingEngineSelectorMatches(selectorMatches)

            // verify that we have a working `matchesSelector`
            if (selectorMatches('x,y', e) || !selectorMatches('a,p', e))
                throw 'Traversty: couldn\'t make selector engine\'s `matchesSelector` work'
          } catch (ex) {
            if (isString(ex)) throw ex
            throw 'Traversty: error while figuring out how the selector engine works: ' + ex
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
