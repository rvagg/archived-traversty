/*global Q:true, T:true, traversty:true, buster:true, assert:true, __matchesSelector:true*/
buster.testCase('traversty', {

    'noConflict': function () {
      assert.equals(traversty(), 'success')
      assert.isFunction(T().up)
    }

  , 'traversty() can be passed nodes': function () {
      var el, t

      // T(body) has body (only)
      assert.equals((t = T(el = document.body)).length, 1)
      assert.same(t[0], el)

      // T(#fixtures) has #fixtures element (only)
      assert.equals((t = T(el = Q('#fixtures')[0])).length, 1)
      assert.same(t[0], el)

      // T([#fixtures]) has #fixtures element (only)
      assert.equals((t = T([el = Q('#fixtures')[0]])).length, 1)
      assert.same(t[0], el)

      // T([#fixtures, body]) has #fixtures element and body
      assert.equals((t = T([el = Q('#fixtures')[0], document.body])).length, 2)
      assert.same(t[0], el)
      assert.same(t[1], document.body)
    }

  , 'traversty() can be passed selector strings': function () {
      var el, t

      if (__matchesSelector) { // defined in setup.js
        // T("#fixtures") has #fixtures element (only)
        assert.equals((t = T('#fixtures')).length, 1)
        assert.same(t[0], Q('#fixtures')[0])

        // T("#fixtures,h1,ol#tests") has all expected 3 elements (only)
        assert.equals((t = T('#fixtures,div#flat')).length, 2)
        assert.same(t[0], Q('#fixtures')[0])
        assert.same(t[1], Q('div#flat')[0])
      }
    }
  }
)
