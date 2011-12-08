!function ($) {
  var t = require('traversty')
    , integrate = function(meth) {
        return function(selector, index) {
          return $(t(this)[meth](selector, index))
        }
      }
  t.setSelectorEngine($)
  $.ender(
      {
          up: integrate('up')
        , down: integrate('down')
        , next: integrate('next')
        , previous: integrate('previous')
      }
    , true
  )
}(ender);
