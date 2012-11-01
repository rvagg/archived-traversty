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
      var t

      if (__matchesSelector) { // defined in setup.js
        // T("#fixtures") has #fixtures element (only)
        assert.equals((t = T('#fixtures')).length, 1)
        assert.same(t[0], Q('#fixtures')[0])

        // T("#fixtures,h1,ol#tests") has all expected 3 elements (only)
        assert.equals((t = T('#fixtures,div#flat')).length, 2)
        assert.same(t[0], Q('#fixtures')[0])
        assert.same(t[1], Q('div#flat')[0])
      } else
        assert(true) // needed for buster
    }

  , 'toArray()': function () {
      var a = T(Q('#foobar')).toArray()
      assert(a instanceof Array)
      assert.equals(a, [])
      a = T(Q('#fixtures')).toArray()
      assert(a instanceof Array)
      assert.equals(a, [ Q('#fixtures')[0] ])
      a = T(Q('#fixtures > ul > li:nth-child(2)')).toArray()
      assert(a instanceof Array)
      assert.equals(a, [ Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0], Q('#fixtures > ul:nth-child(2) > li:nth-child(2)')[0] ])
    }

  , 'size()': function () {
      assert.same(T(Q('#foobar')).size(), 0)
      assert.same(T(Q('#fixtures')).size(), 1)
      assert.same(T(Q('#fixtures > ul > li:nth-child(2)')).size(), 2)
      assert.same(T(Q('#fixtures > ul > li')).size(), 10)
    }

  , 'aug()': function () {
      T.aug({ 'foobar': function () {
        for (var i = 0; i < this.length; i++) {
          this[i].setAttribute('data-foobar', String(i))
        }
        return this
      }})

      T(Q('#fixtures li')).foobar()
      var els = Q('#fixtures li'), i = 0
      for (i = 0; i < els.length; i++)
        assert.equals(els[i].getAttribute('data-foobar'), String(i))
    }

  , 'each()': function () {
      var els = Q('#fixtures li')
        , spy = this.spy()
        , i = 0
        , t = T(Q('#fixtures li')).each(spy)

      assert.equals(t.length, els.length)
      assert.equals(spy.callCount, els.length)
      for (; i < els.length; i++) {
        assert.same(spy.getCall(i).thisValue, els[i], 'call ' + i + ' called with correct `this`')
        assert.same(spy.getCall(i).args[0], els[i], 'call ' + i + ' called with correct first arg')
        assert.same(spy.getCall(i).args[1], i, 'call ' + i + ' called with correct first arg')
        assert.same(spy.getCall(i).args[2], t, 'call ' + i + ' called with correct first arg')
      }
    }
})