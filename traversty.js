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
    , selector = null

    , up = function(selector, index) {
        console.log('up!', this[0])
        return this
      }

    , down = function(selector, index) {
        console.log('down!', this[0])
        return this
      }

    , previous = function(selector, index) {
        console.log('previous!', this[0])
        return this
      }

    , next = function(selector, index) {
        console.log('next!', this[0])
        return this
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
          return new T(selector && els && typeof els === 'string' ? selector(els) : els)
        }

        t.setSelectorEngine = function (s) {
          selector = s;
          delete t.setQueryEngine
        }

        t.noConflict = function () {
          context.traversty = old
          return this
        }

        return t
      })()
 
  return traversty
})
