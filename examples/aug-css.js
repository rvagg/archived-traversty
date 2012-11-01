/*global self:true, traversty:true */

// Augment Traversty with a feature-complete `css()` method

// This is ripped straight out of Bonzo with minimal modification
// https://github.com/ded/bonzo (c) Dustin Diaz 2012, Licence: MIT

(function (T) {
  var win = window
    , doc = win.document
    , html = doc.documentElement
    , ie = /msie/i.test(navigator.userAgent)
    , digit = /^-?[\d\.]+$/
    , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
    , px = 'px'

    , features = (function() {
        var e = doc.createElement('p')
        e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
        return {
            cssFloat: e.getElementsByTagName('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: (function () {
              var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }())
        }
      }())

    , camelize = function (s) {
        return s.replace(/-(.)/g, function (m, m1) {
          return m1.toUpperCase()
        })
      }

    , viewportdim = function () {
        return {
            width: ie ? html.clientWidth : self.innerWidth
          , height: ie ? html.clientHeight : self.innerHeight
        }
      }

    , docdim = function () {
        var vp = viewportdim()
        return {
            width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
          , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
        }
      }

    , setter = function (el, v) {
        return typeof v == 'function' ? v(el) : v
      }

    , styleProperty = function (p) {
          (p == 'transform' && (p = features.transform)) ||
            (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + 'Origin')) ||
            (p == 'float' && (p = features.cssFloat))
          return p ? camelize(p) : null
      }

    , getStyle = features.computedStyle
        ? function (el, property) {
            var value = null
              , computed = doc.defaultView.getComputedStyle(el, '')
            computed && (value = computed[property])
            return el.style[property] || value
          }
        : (ie && html.currentStyle)
          ? function (el, property) {
              var value = 100
              if (property == 'opacity' && !features.opasity) {
                try {
                  value = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
                } catch (e1) {
                  try {
                    value = el['filters']('alpha').opacity
                  } catch (e2) {}
                }
                return value / 100
              }
              value = el.currentStyle ? el.currentStyle[property] : null
              return el.style[property] || value
            }
          : function (el, property) {
              return el.style[property]
            }

    , css = function (o, opt_v) {
        var p, iter = o
        // is this a request for just getting a style?
        if (opt_v === undefined && typeof o == 'string') {
          // repurpose 'v'
          opt_v = this[0]
          if (!opt_v) return null
          if (opt_v === doc || opt_v === win) {
            p = (opt_v === doc) ? docdim() : viewportdim()
            return o == 'width' ? p.width : o == 'height' ? p.height : ''
          }
          return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
        }

        if (typeof o == 'string') {
          iter = {}
          iter[o] = opt_v
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
              try { el.style[p] = setter(el, v) } catch(e) {}
            }
          }
        }
        return this.each(fn)
      }

  // This is the bit we actually care about for Traversty
  T.aug({ css: css })
}(traversty))