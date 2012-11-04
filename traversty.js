/***************************************************************
  * Traversty: A DOM collection management and traversal utility
  * (c) Rod Vagg (@rvagg) 2012
  * https://github.com/rvagg/traversty
  * License: MIT
  */

!(function (name, definition) {
  if (typeof module !== 'undefined')
    module.exports = definition()
  else if (typeof define === 'function' && define.amd)
    define(name, definition)
  else
    this[name] = definition()
}('traversty', function () {

  var context = this
    , old = context.traversty
    , doc = window.document
    , html = doc.documentElement
    , toString = Object.prototype.toString
    , Ap = Array.prototype
    , slice = Ap.slice
      // feature test to find native matchesSelector()
    , matchesSelector = (function (el, pfx, name, i, ms) {
        while (i < pfx.length)
          if (el[ms = pfx[i++] + name])
            return ms
      }(html, [ 'msM', 'webkitM', 'mozM', 'oM', 'm' ], 'atchesSelector', 0))

    , Kfalse = function () { return false }

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
            while (++i < els.length)
              if (isElement(els[i]) && selectorMatches(selector, els[i]))
                ret.push(els[i])
            return ret
          }
          return engineSelect(selector, el)
        }
      }

      // is 'element' underneath 'container' somewhere
    , isAncestor = 'compareDocumentPosition' in html
        ? function (element, container) {
            return (container.compareDocumentPosition(element) & 16) == 16
          }
        : 'contains' in html
          ? function (element, container) {
              container = container.nodeType === 9 || container == window ? html : container
              return container !== element && container.contains(element)
            }
          : function (element, container) { // old smelly browser
              while (element = element.parentNode)
                if (element === container)
                  return 1
              return 0
            }

      // return an array containing only unique elements
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
          if (!has)
            a.push(ar[i])
        }
        return a
      }

      // for each element of 'els' execute 'fn' to get an array of elements to collect
    , collect = function (els, fn) {
        var ret = [], res, i = 0, j, l = els.length, l2
        while (i < l) {
          j = 0
          l2 = (res = fn(els[i], i++)).length
          while (j < l2)
            ret.push(res[j++])
        }
        return ret
      }

     // generic DOM navigator to move multiple elements around the DOM
   , move = function (els, method, selector, index, filterFn) {
        index = getIndex(selector, index)
        selector = getSelector(selector)
        return collect(els
          , function (el, elind) {
              var i = index || 0, ret = []
              if (!filterFn)
                el = el[method]
              while (el && (index === null || i >= 0)) {
                // ignore non-elements, only consider selector-matching elements
                // handle both the index and no-index (selector-only) cases
                if (isElement(el)
                    && (!filterFn || filterFn === true || filterFn(el, elind))
                    && selectorMatches(selector, el)
                    && (index === null || i-- === 0)) {
                  // this concat vs push is to make sure we add elements to the result array
                  // in reverse order when doing a previous(selector) and up(selector)
                  index === null && method !== 'nextSibling' ? ret = [el].concat(ret) : ret.push(el)
                }
                el = el[method]
              }
              return ret
            }
        )
      }

      // given an index & length, return a 'fixed' index, fixes non-numbers & neative indexes
    , eqIndex = function (length, index, def) {
        if (index < 0)
          index = length + index
        if (index < 0 || index >= length)
          return null
        return !index && index !== 0 ? def : index
      }

      // collect elements of an array that match a filter function
    , filter = function (els, fn) {
        var arr = [], i = 0, l = els.length
        for (; i < l; i++)
          if (fn(els[i], i))
            arr.push(els[i])
        return arr
      }

      // create a filter function, for use by filter(), is() & not()
      // allows the argument to be an element, a function or a selector
    , filterFn = function (slfn) {
        var to
        return isElement(slfn)
          ? function (el) { return el === slfn }
          : (to = typeof slfn) == 'function'
            ? function (el, i) { return slfn.call(el, i) }
            : to == 'string' && slfn.length
              ? function (el) { return selectorMatches(slfn, el) }
              : Kfalse
      }

      // fn = !fn
    , inv = function (fn) {
        return function () {
          return !fn.apply(this, arguments)
        }
      }

    , traversty = (function () {
        function T(els) {
          this.length = 0
          if (els) {
            els = unique(!els.nodeType && !isUndefined(els.length) ? els : [ els ])
            var i = this.length = els.length
            while (i--)
              this[i] = els[i]
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

          , parents: function () {
              return T.prototype.up.apply(this, arguments.length ? arguments : [ '*' ])
            }

          , closest: function (selector, index) {
              if (isNumber(selector)) {
                index = selector
                selector = '*'
              } else if (!isString(selector)) {
                return traversty([])
              } else if (!isNumber(index)) {
                index = 0
              }
              return traversty(move(this, 'parentNode', selector, index, true))
            }

          , previous: function (selector, index) {
              return traversty(move(this, 'previousSibling', selector, index))
            }

          , next: function (selector, index) {
              return traversty(move(this, 'nextSibling', selector, index))
            }

          , siblings: function (selector, index) {
              var self = this
                , arr = slice.call(this, 0)
                , i = 0, l = arr.length

              for (; i < l; i++) {
                arr[i] = arr[i].parentNode.firstChild
                while (!isElement(arr[i]))
                  arr[i] = arr[i].nextSibling
              }

              if (isUndefined(selector))
                selector = '*'

              return traversty(move(arr, 'nextSibling', selector || '*', index
                    , function (el, i) { return el !== self[i] } // filter
                  ))
            }

          , children: function (selector, index) {
              return traversty(move(T.prototype.down.call(this), 'nextSibling', selector || '*', index, true))
            }

          , first: function () {
              return T.prototype.eq.call(this, 0)
            }

          , last: function () {
              return T.prototype.eq.call(this, -1)
            }

          , eq: function (index) {
              return traversty(this.get(index))
            }

          , get: function (index) {
              return this[eqIndex(this.length, index, 0)]
            }

            // a crazy man wrote this, don't try to understand it, see the tests
          , slice: function (start, end) {
              var e = end, l = this.length, arr = []
              start = eqIndex(l, Math.max(-this.length, start), 0)
              e = eqIndex(end < 0 ? l : l + 1, end, l)
              end = e === null || e > l ? end < 0 ? 0 : l : e
              while (start !== null && start < end)
                arr.push(this[start++])
              return traversty(arr)
            }

          , filter: function (slfn) {
              return traversty(filter(this, filterFn(slfn)))
            }

          , not: function (slfn) {
              return traversty(filter(this, inv(filterFn(slfn))))
            }

            // similar to filter() but cares about descendent elements
          , has: function (slel) {
              return traversty(filter(
                  this
                , isElement(slel)
                    ? function (el) { return isAncestor(slel, el) }
                    : typeof slel == 'string' && slel.length
                      ? function (el) { return selectorFind(slel, el).length } //TODO: performance
                      : Kfalse
              ))
            }

            // same as filter() but return a boolean so quick-return after first successful find
          , is: function (slfn) {
              var i = 0, l = this.length
                , fn = filterFn(slfn)
              for (; i < l; i++)
                if (fn(this[i], i))
                  return true
              return false
            }

          , toArray: function () { return Ap.slice.call(this) }

          , size: function () { return this.length }

          , each: function (fn, ctx) {
              var i = 0, l = this.length
              for (; i < l; i++)
                fn.call(ctx || this[i], this[i], i, this)
              return this
            }

            // quack like a duck (Array)
          , push: Ap.push
          , sort: Ap.sort
          , splice: Ap.splice
        }

        T.prototype.prev = T.prototype.previous

        function t(els) {
          return new T(isString(els) ? selectorFind(els, doc) : els)
        }

        // extend traversty functionality with custom methods
        t.aug = function (methods) {
          var key, method
          for (key in methods) {
            method = methods[key]
            if (typeof method == 'function')
              T.prototype[key] = method
          }
        }


        t.setSelectorEngine = function (s) {
          // feature testing the selector engine like a boss
          var ss, r, a, _selectorMatches, _selectorFind
            , e = doc.createElement('p')
            , select = s.select || s.sel || s

          e.innerHTML = '<a/><i/><b/>'
          a = e.firstChild
          try {
            // YO! I HEARD YOU LIKED NESTED TERNARY OPERATORS SO I COOKED SOME UP FOR YOU!
            // (one day I might loop this...)

            // check to see how we do a matchesSelector
            _selectorMatches = isFunction(s.matching)
              ? function (selector, el) { return s.matching([el], selector).length > 0 }
              : isFunction(s.is)
                ? function (selector, el) { return s.is(el, selector) }
                : isFunction(s.matchesSelector)
                  ? function (selector, el) { return s.matchesSelector(el, selector) }
                  : isFunction(s.match)
                    ? function (selector, el) { return s.match(el, selector) }
                    : isFunction(s.matches)
                      ? function (selector, el) { return s.matches(el, selector) }
                      : null

            if (!_selectorMatches) {
              // perhaps it's an selector(x).is(y) type selector?
              ss = s('a', e)
              _selectorMatches = isFunction(ss._is)
                ? function (selector, el) { return s(el)._is(selector) } // original .is(), replaced by Ender bridge
                : isFunction(ss.matching)
                  ? function (selector, el) { return s(el).matching(selector).length > 0 }
                  : isFunction(ss.is) && !ss.is.__ignore
                    ? function (selector, el) { return s(el).is(selector) }
                      : isFunction(ss.matchesSelector)
                        ? function (selector, el) { return s(el).matchesSelector(selector) }
                        : isFunction(ss.match)
                          ? function (selector, el) { return s(el).match(selector) }
                          : isFunction(ss.matches)
                            ? function (selector, el) { return s(el).matches(selector) }
                            : null
            }

            if (!_selectorMatches)
                throw new Error('Traversty: couldn\'t find selector engine\'s `matchesSelector`')

            // verify that we have a working `matchesSelector`
            if (_selectorMatches('x,y', e) || !_selectorMatches('a,p', e))
                throw new Error('Traversty: couldn\'t make selector engine\'s `matchesSelector` work')

            // basic select
            if ((r = select('b,a', e)).length !== 2)
              throw new Error('Traversty: don\'t know how to use this selector engine')

            // check to see if the selector engine has given us the results in document-order
            // and if not, work around it
            _selectorFind = r[0] === a ? select : createUnorderedEngineSelectorFind(select, _selectorMatches)

            // have we done enough to get a working `selectorFind`?
            if ((r = _selectorFind('b,a', e)).length !== 2 || r[0] !== a)
              throw new Error('Traversty: couldn\'t make selector engine work')

            selectorMatches = _selectorMatches
            selectorFind = _selectorFind
          } catch (ex) {
            throw isString(ex)
              ? ex
              : new Error('Traversty: error while figuring out how the selector engine works: ' + (ex.message || ex))
          } finally {
            e = null
          }

          return t
        }

        t.noConflict = function () {
          context.traversty = old
          return this
        }

        return t
      }())
 
  return traversty
}));