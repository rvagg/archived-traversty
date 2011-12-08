var commonTests = {
    'Simple no-arg traversal': {

        'next()': function () {
          var t

          // next() on two elements moved to nextSibling on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next()).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(2)')[0])
        }

      , 'previous()': function () {
          var t

          // previous() on two elements moved to previousSibling on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(4)')).previous()).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(3)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(3)')[0])
        }

      , 'up()': function () {
          var t

          // up() on two elements moved to parentNode on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(4)')).up()).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2)')[0])
        }

      , 'down()': function () {
         var t

         // down() on two elements moved to first childNode on both
         assert.equals((t = T(Q('#fixtures > ul')).down()).length, 2)
         assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')[0])
         assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(1)')[0])
        }

    }

  , 'Index argument traversal': {

        'next(index)': function () {
          var t

          // next(0) on two elements moved to 1st nextSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next(0)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(2)')[0])

          // next(1) on two elements moved to 2nd nextSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next(1)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(3)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(3)')[0])

          // next(4) on two elements moved to 5th nextSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next(3)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(5)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(5)')[0])
        }

      , 'previous(index)': function () {
          var t

          // previous(0) on two elements moved to 1st previousSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous(0)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(4)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(4)')[0])

          // previous(1) on two elements moved to 2nd previousSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous(1)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(3)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(3)')[0])

          // previous(4) on two elements moved to 5th previousSibling element on both
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous(3)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(1)')[0])

        }

      , 'up(index)': function () {
          var t

          // up(0) on two elements moved to 1st parentNode on both
          assert.equals((t = T(Q('#fixtures > ul > li > ul > li > span')).up(0)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li > ul > li:nth-child(4)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li > ul > li:nth-child(4)')[0])

          // up(3) on two elements moved to 3rd parentNode on both
          assert.equals((t = T(Q('#fixtures > ul > li > ul > li > span')).up(3)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2)')[0])

          // up(4) on two elements moved to single common ancestor node for both
          assert.equals((t = T(Q('#fixtures > ul > li > ul > li > span')).up(4)).length, 1)
          assert.same(t[0], Q('#fixtures')[0])

        }

      , 'down(index)': function () { 
          var t

          // down(0) on two elements moved to first childNode on both
          assert.equals((t = T(Q('#fixtures > ul')).down(0)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(1)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(1)')[0])

          // down(0) on two elements moved to second childNode on both
          assert.equals((t = T(Q('#fixtures > ul')).down(1)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(2)')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(2)')[0])

          // down(9) on two elements moved down to 10th descendent in document order
          assert.equals((t = T(Q('#fixtures > ul')).down(9)).length, 2)
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li > ul > li > span')[0])
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li > ul > li > span')[0])

        }
    }

  , 'Selector and index argument traversal': {

    // some awkward selectors in here because of a WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=70879

        'next(selector, index)': function () { 
          var t

          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next('li', 1)).length, 2, 'next("li", 1) moves to 2nd nextSibling, both elements')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(3)')[0], 'next("li", 1) moves to 2nd nextSibling, first element')
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(3)')[0], 'next("li", 1) moves to 2nd nextSibling, second element')

          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next('.c', 1)).length, 2, 'next(".c", 1) moves to 2nd nextSibling with class "c", both elements')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > .c')[1], 'next(".c", 1) moves to 2nd nextSibling with class "c", first element')
          assert.same(t[1], Q('> .c', Q('#fixtures > ul:nth-child(2)'))[1], 'next(".c", 1) moves to 2nd nextSibling with class "c", second element')

          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(1)')).next('li.c', 2)).length, 2, 'next("li.c", 2) moves to 3rd nextSibling li with class "c"')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li.c')[2], 'next("li.c", 2) moves to 3rd nextSibling li with class "c"')
          assert.same(t[1], Q('> li.c', Q('#fixtures > ul:nth-child(2)'))[2], 'next("li.c", 2) moves to 3rd nextSibling li with class "c"')

        }

      , 'previous(selector, index)': function () { 
          var t

          // previous("li", 1) moves to 2nd previousSibling
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous('li', 1)).length, 2, 'msg')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li:nth-child(3)')[0], 'msg')
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li:nth-child(3)')[0], 'msg')

          // previous(".c", 0) moves to 1st previousSibling with class "c"
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous('.c', 0)).length, 2, 'msg')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > .c')[1], 'msg')
          assert.same(t[1], Q('> .c', Q('#fixtures > ul:nth-child(2)'))[1], 'msg')

          // previous("li.c", 1) moves to 2nd previousSibling li with class "c"
          assert.equals((t = T(Q('#fixtures > ul > li:nth-child(5)')).previous('li.c', 1)).length, 2, 'msg')
          assert.same(t[0], Q('#fixtures > ul:nth-child(1) > li.c')[0], 'msg')
          assert.same(t[1], Q('#fixtures > ul:nth-child(2) > li.c')[0], 'msg')

        }
    }
}
