/*global ender:true*/
(function ($) {
  var t = require('traversty')
    , integrated = false
    , integrate = function(meth) {
        // this crazyness is for lazy initialisation because we can't be guaranteed
        // that a selector engine has been installed *before* traversty in an ender build
        var fn = function(self, selector, index) {
            if (!integrated) {
              t.setSelectorEngine($)
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
