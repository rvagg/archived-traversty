/*global Q:true, T:true, assert:true*/
// note: `T` is `traversty` and `Q` is `qwery` (selector engine), see setup.js

this.filterTests = {
    'first()': {
        'first() of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).first()
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'first() on a collection returns only the first element'
          )
        }

      , 'first() of one': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')).first()
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'first() on a collection of one returns the one element'
          )
        }

      , 'first() of none': function () {
          assert.hasExactElements(
              T(Q('#foobar')).first()
            , '#doobar'
            , 'first() on an empty collection returns an empty collection'
          )
        }
    }

  , 'last()': {
        'last() of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).last()
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'last() on a collection returns only the last element'
          )
        }

      , 'last() of one': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')).last()
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'last() on a collection of one returns the one element'
          )
        }

      , 'last() of none': function () {
          assert.hasExactElements(
              T(Q('#foobar')).last()
            , '#doobar'
            , 'last() on an empty collection returns an empty collection'
          )
        }
    }

  , 'eq()': {
        'eq(0) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(0)
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'eq(0) on a collection returns only the first element'
          )
        }

      , 'eq(2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(2)
            , '#fixtures > ul:nth-child(1) > li:nth-child(3)'
            , 'eq(2) on a collection returns only the 3rd element'
          )
        }

      , 'eq(last index) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(9)
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'eq(last index) on a collection returns only the last element'
          )
        }

      , 'eq(-1) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(-1)
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'eq(-1) on a collection returns only the last element'
          )
        }

      , 'eq(-2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(-2)
            , '#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'eq(-2) on a collection returns only the second last element'
          )
        }

      , 'eq() of one': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')).eq()
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'eq() on a collection of one returns the one element'
          )
        }

      , 'eq(0) of none': function () {
          assert.hasExactElements(
              T(Q('#foobar')).eq(0)
            , '#doobar'
            , 'eq() on an empty collection returns an empty collection'
          )
        }

      , 'eq(100) of none': function () {
          assert.hasExactElements(
              T(Q('#foobar')).eq(100)
            , '#doobar'
            , 'eq(100) on an empty collection returns an empty collection'
          )
        }

      , 'eq(100) of < 100': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq(100)
            , '#doobar'
            , 'eq(100) on a collection of < 100 returns empty collection'
          )
        }

      , 'eq() of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).eq()
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'eq() on a collection returns only the first element'
          )
        }
    }

  , 'slice()': {
        'slice(0) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0)
            , '#fixtures > ul > li'
            , 'slice(0) on a collection returns all elements'
          )
        }

      , 'slice(1) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(1) on a collection returns all but first element'
          )
        }

      , 'slice(5) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(5)
            ,    '#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(5) on a collection returns half of the collection'
          )
        }

      , 'slice(9) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(9)
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(9) on a collection returns last element'
          )
        }

      , 'slice(10) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(10)
            , '#foobar'
            , 'slice(10) on a collection returns empty collection'
          )
        }

      , 'slice(100) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(100)
            , '#foobar'
            , 'slice(100) on a collection returns empty collection'
          )
        }

      , 'slice(-1) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-1)
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(-1) on a collection returns last element'
          )
        }

      , 'slice(-9) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-9)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(-9) on a collection returns all but first element'
          )
        }

      , 'slice(-10) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-10)
            , '#fixtures > ul > li'
            , 'slice(-10) on a collection returns complete collection'
          )
        }

      , 'slice(-100) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-100)
            , '#fixtures > ul > li'
            , 'slice(-100) on a collection returns complete collection'
          )
        }

      , 'slice(0, length) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0, 10)
            , '#fixtures > ul > li'
            , 'slice(0, length) on a collection returns complete collection'
          )
        }

      , 'slice(0, length - 2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0, 8)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
            , 'slice(0, length - 2) on a collection returns all but last 2'
          )
        }

      , 'slice(2, length) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(2, 10)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(2, length) on a collection returns all but first 2'
          )
        }

      , 'slice(2, length - 2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(2, 8)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
            , 'slice(2, length - 2) on a collection returns all but first and last 2'
          )
        }

      , 'slice(0, 0) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0, 0)
            , '#foobar'
            , 'slice(0, 0) on a collection returns empty collection'
          )
        }

      , 'slice(2, 2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(2, 2)
            , '#foobar'
            , 'slice(2, 2) on a collection returns empty collection'
          )
        }

      , 'slice(0, 1) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0, 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'slice(0, 1) on a collection returns first element'
          )
        }

      , 'slice(2, 3) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(2, 3)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(3)'
            , 'slice(2, 3) on a collection returns correct element'
          )
        }

      , 'slice(100, 200) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(100, 200)
            , '#foobar'
            , 'slice(100, 200) on a collection returns empty collection'
          )
        }

      , 'slice(0, 100) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(0, 100)
            , '#fixtures > ul > li'
            , 'slice(0, 100) on a collection returns entire collection'
          )
        }

      , 'slice(-1, length) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-1, 10)
            , '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'slice(-1, length) on a collection returns last element'
          )
        }

      , 'slice(-1, length - 1) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-1, 9)
            , '#foobar'
            , 'slice(-1, length - 1) on a collection returns empty collection'
          )
        }

      , 'slice(-2, -2) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-2, -2)
            , '#foobar'
            , 'slice(-2, -2) on a collection returns empty collection'
          )
        }

      , 'slice(-length, length) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-10, 10)
            , '#fixtures > ul > li'
            , 'slice(-length, length) on a collection returns entire collection'
          )
        }

      , 'slice(-100, length) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-100, 10)
            , '#fixtures > ul > li'
            , 'slice(-100, length) on a collection returns entire collection'
          )
        }

      , 'slice(-100, -100) of many': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).slice(-100, -100)
            , '#foobar'
            , 'slice(-100, -100) on a collection returns empty collection'
          )
        }

      , 'slice(-100, -100) of none': function () {
          assert.hasExactElements(
              T(Q('#foobar')).slice(-100, -100)
            , '#foobar'
            , 'slice(-100, -100) on an empty collection returns empty collection'
          )
        }
    }

  , 'filter()': {
        'filter() with no arguments on multi': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter()
            , '#foobar'
            , 'filter() on a collection returns an empty collection'
          )
        }

      , 'filter() with no arguments on empty collection': function () {
          assert.hasExactElements(
              T([]).filter()
            , '#foobar'
            , 'filter() on empty collection returns an empty collection'
          )
        }

      , 'filter(fn) on empty collection': function () {
          assert.hasExactElements(
              T([]).filter(function() { return true })
            , '#foobar'
            , 'filter(fn) on empty collection returns an empty collection'
          )
        }

      , 'filter(selector) on empty collection': function () {
          assert.hasExactElements(
              T([]).filter('*')
            , '#foobar'
            , 'filter(selector) on empty collection returns an empty collection'
          )
        }

      , 'filter(elsewhere element) on empty collection': function () {
          assert.hasExactElements(
              T([]).filter(Q('#fixtures')[0])
            , '#foobar'
            , 'filter(selector) on empty collection returns an empty collection'
          )
        }

      , 'filter(fn) `this` and arguments check': function () {
          var spy      = this.spy()
            , elements = Q('#fixtures > ul > li')
            , i = 0

          T(Q('#fixtures > ul > li')).filter(spy)
          assert.equals(spy.callCount, elements.length)
          for (; i < elements.length; i++) {
            assert.equals(elements[i], spy.getCall(i).thisValue)
            assert.equals(1, spy.getCall(i).args.length)
            assert.equals(i, spy.getCall(i).args[0])
          }
        }

      , 'filter() with non-returning function': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(function () {})
            , '#foobar'
            , 'filter(function () {}) on a collection returns an empty collection'
          )
        }

      , 'filter() with function returning false': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(function () { return false })
            , '#foobar'
            , 'filter(function () { return false }) on a collection returns an empty collection'
          )
        }

      , 'filter() with function returning true': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(function () { return true })
            , '#fixtures > ul > li'
            , 'filter(function () { return true }) on a collection returns entire collection'
          )
        }

      , 'filter() with function returning true and false': function () {
          var b = false
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(function () { return b = !b })
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'filter(function () { return true&false }) on a collection returns correct element'
          )
        }

      , 'filter("")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter('')
            , '#foobar'
            , 'filter("") on a collection returns empty collection'
          )
        }

      , 'filter("*")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter('*')
            , '#fixtures > ul > li'
            , 'filter("*") on a collection returns entire collection'
          )
        }

      , 'filter("li")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter('li')
            , '#fixtures > ul > li'
            , 'filter("li") on a collection returns entire collection'
          )
        }

      , 'filter(":nth-child(1)")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(':nth-child(1)')
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
            , 'filter(":nth-child(1)") on a collection returns correct elements'
          )
        }

      , 'filter(element)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).filter(Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0])
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
            , 'filter(element) on a collection returns correct element'
          )
        }
    }

  , 'not()': {
        'not() with no arguments on multi': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not()
            , '#fixtures > ul > li'
            , 'not() on a collection returns an empty collection'
          )
        }

      , 'not() with no arguments on empty collection': function () {
          assert.hasExactElements(
              T([]).not()
            , '#foobar'
            , 'not() on empty collection returns an empty collection'
          )
        }

      , 'not(fn) on empty collection': function () {
          assert.hasExactElements(
              T([]).not(function() { return true })
            , '#foobar'
            , 'not(fn) on empty collection returns an empty collection'
          )
        }

      , 'not(selector) on empty collection': function () {
          assert.hasExactElements(
              T([]).not('*')
            , '#foobar'
            , 'not(selector) on empty collection returns an empty collection'
          )
        }

      , 'not(elsewhere element) on empty collection': function () {
          assert.hasExactElements(
              T([]).not(Q('#fixtures')[0])
            , '#foobar'
            , 'not(selector) on empty collection returns an empty collection'
          )
        }

      , 'not(fn) `this` and arguments check': function () {
          var spy      = this.spy()
            , elements = Q('#fixtures > ul > li')
            , i = 0

          T(Q('#fixtures > ul > li')).not(spy)
          assert.equals(spy.callCount, elements.length)
          for (; i < elements.length; i++) {
            assert.equals(elements[i], spy.getCall(i).thisValue)
            assert.equals(1, spy.getCall(i).args.length)
            assert.equals(i, spy.getCall(i).args[0])
          }
        }

      , 'not() with non-returning function': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(function () {})
            , '#fixtures > ul > li'
            , 'not(function () {}) on a collection returns an empty collection'
          )
        }

      , 'not() with function returning false': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(function () { return false })
            , '#fixtures > ul > li'
            , 'not(function () { return false }) on a collection returns an empty collection'
          )
        }

      , 'not() with function returning true': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(function () { return true })
            , '#foobar'
            , 'not(function () { return true }) on a collection returns entire collection'
          )
        }

      , 'not() with function returning true and false': function () {
          var b = false
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(function () { return b = !b })
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'not(function () { return true&false }) on a collection returns correct element'
          )
        }

      , 'not("")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not('')
            , '#fixtures > ul > li'
            , 'not("") on a collection returns empty collection'
          )
        }

      , 'not("*")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not('*')
            , '#foobar'
            , 'not("*") on a collection returns entire collection'
          )
        }

      , 'not("li")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not('li')
            , '#foobar'
            , 'not("li") on a collection returns entire collection'
          )
        }

      , 'not(":nth-child(1)")': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(':nth-child(1)')
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'not(":nth-child(1)") on a collection returns correct elements'
          )
        }

      , 'not(element)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).not(Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0])
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) > li:nth-child(5)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(1)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'not(element) on a collection returns correct element'
          )
        }
    }

  , 'has()': {
        'has() on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).has()
            , '#foobar'
            , 'has() on collection returns empty collection'
          )
        }

      , 'has(selector) on empty collection': function () {
          assert.hasExactElements(
              T([]).has('*')
            , '#foobar'
            , 'has(selector) on collection returns empty collection'
          )
        }

      , 'has(element) on empty collection': function () {
          assert.hasExactElements(
              T([]).has(Q('#fixtures')[0])
            , '#foobar'
            , 'has(element) on collection returns empty collection'
          )
        }

      , 'has(*) on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul')).has('*')
            , '#fixtures > ul'
            , 'has(*) on collection returns entire collection'
          )
        }

      , 'has(li) on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul')).has('li')
            , '#fixtures > ul'
            , 'has(li) on collection returns entire collection'
          )
        }

      , 'has(span) on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).has('span')
            , '#fixtures > ul > li:nth-child(4)'
            , 'has(span) on collection returns correct elements'
          )
        }

      , 'has(elsewhere element) on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).has(Q('#fixtures')[0])
            , '#foobar'
            , 'has(elsewhere element) on collection returns empty collection'
          )
        }


      , 'has(element) on multiples': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).has(Q('#fixtures > ul > li:nth-child(4) span')[0])
            , '#fixtures > ul:nth-child(1) > li:nth-child(4)'
            , 'has(element) on collection returns correct element'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).has(Q('#fixtures > ul > li:nth-child(4) span')[1])
            , '#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'has(element) on collection returns correct element'
          )
        }
    }

  , 'is()': {
          'is() on empty collection': function () {
            refute(T([]).is())
          }

        , 'is() on multi collection': function () {
            refute(T(Q('#fixtures > ul > li')).is())
          }

        , 'is(fn=false) on multi collection': function () {
            refute(T(Q('#fixtures > ul > li')).is(function () { return false }))
          }

        , 'is(fn=true) on multi collection': function () {
            assert(T(Q('#fixtures > ul > li')).is(function () { return true }))
          }

        , 'is(fn=true) on empty collection': function () {
            refute(T([]).is(function () { return true }))
          }
   
       , 'is(fn) `this` and arguments check': function () {
            var spy      = this.spy()
              , elements = Q('#fixtures > ul > li')
              , i = 0

            T(Q('#fixtures > ul > li')).is(spy)
            assert.equals(spy.callCount, elements.length)
            for (; i < elements.length; i++) {
              assert.equals(elements[i], spy.getCall(i).thisValue)
              assert.equals(1, spy.getCall(i).args.length)
              assert.equals(i, spy.getCall(i).args[0])
            }
          }

        , 'is(nonmatch selector) on multi collection': function () {
            refute(T(Q('#fixtures > ul > li')).is('ul'))
          }

        , 'is(selector) on multi collection': function () {
            assert(T(Q('#fixtures > ul > li')).is('li'))
          }

        , 'is(nonmatch element) on multi collection': function () {
            refute(T(Q('#fixtures > ul > li')).is(Q('#fixtures')[0]))
          }

        , 'is(element) on multi collection': function () {
            assert(T(Q('#fixtures > ul > li')).is(Q('#fixtures > ul > li')[0]))
            assert(T(Q('#fixtures > ul > li')).is(Q('#fixtures > ul > li')[2]))
            assert(T(Q('#fixtures > ul > li')).is(Q('#fixtures > ul > li')[6]))
          }
    }
}