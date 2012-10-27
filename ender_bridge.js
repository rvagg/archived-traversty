/*global ender:true*/

(function ($) {
  var t = require('traversty')
    , integrated = false
    , integrate = function (meth) {
        // this crazyness is for lazy initialisation because we can't be guaranteed
        // that a selector engine has been installed *before* traversty in an ender build
        var fn = function (self, selector, index) {
            if (!integrated) {
              try {
                t.setSelectorEngine($)
              } catch (ex) { } // ignore exception, we may have an ender build with no selector engine
              integrated = true
            }
            fn = function (self, selector, index) { return $(t(self)[meth](selector, index)) }
            return fn(self, selector, index)
          }
        return function (selector, index) { return fn(this, selector, index) }
      }
    , methods = 'up down next previous prev parents closest siblings children first last eq slice filter not is has'.split(' ')
    , b = {}, i = methods.length

  while (--i >= 0) b[methods[i]] = integrate(methods[i])
  $.ender(b, true)
}(ender))