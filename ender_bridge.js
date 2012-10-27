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
            fn = meth == 'is'
              ? function (self, slfn) {
                  return t(self)[meth](slfn) // boolean
                }
              : function (self, selector, index) {
                  return $(t(self)[meth](selector, index)) // collection
                }
            return fn(self, selector, index)
          }
        return function (selector, index) { return fn(this, selector, index) }
      }
    , methods = 'up down next previous prev parents closest siblings children first last eq slice filter not is has'.split(' ')
    , b = {}, i = methods.length

  // does this build have an .is()? if so, shift it to _is() for traversty to use and
  // allow us to integrate a new is(), wrapped around it
  if ($.fn.is) $.fn._is = $.fn.is
  while (--i >= 0) b[methods[i]] = integrate(methods[i])
  $.ender(b, true)
  $.fn.is.__ignore = true
}(ender))