/*global Q:true, T:true, assert:true*/
// note: `T` is `traversty` and `Q` is `qwery` (selector engine), see setup.js

this.traversalTests = {
    'Simple no-arg traversal': {

        'next()': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next()
            , '#fixtures > ul > li:nth-child(2)'
            , 'next() on two elements moved to nextSibling on both'
          )
        }

      , 'previous()': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(4)')).previous()
            , '#fixtures > ul > li:nth-child(3)'
            , 'previous() on two elements moved to previousSibling on both'
          )
        }

      , 'up()': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(3)')).up()
            , '#fixtures > ul'
            , 'up() on two elements moved to parentNode on both'
          )
        }

      , 'down()': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul')).down()
            , '#fixtures > ul > li:nth-child(1)'
            , 'down() on two elements moved to the first childNode on both'
          )
        }

    }

  , 'Index argument traversal': {

        'next(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next(0)
            , '#fixtures > ul > li:nth-child(2)'
            , 'next(0) on two elements moved to 1st nextSibling element on both'
          )
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next(1)
            , '#fixtures > ul > li:nth-child(3)'
            , 'next(1) on two elements moved to 2nd nextSibling element on both'
          )
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next(3)
            , '#fixtures > ul > li:nth-child(5)'
            , 'next(3) on two elements moved to 3rd nextSibling element on both'
          )
        }

      , 'previous(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous(0)
            , '#fixtures > ul > li:nth-child(4)'
            , 'previous(0) on two elements moved to 1st previousSibling element on both'
          )
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous(1)
            , '#fixtures > ul > li:nth-child(3)'
            , 'previous(1) on two elements moved to 2nd previousSibling element on both'
          )
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous(3)
            , '#fixtures > ul > li:nth-child(1)'
            , 'previous(3) on two elements moved to 3rd previousSibling element on both'
          )
        }

      , 'up(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up(0)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'up(0) on two elements moved to 1st parentNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up(3)
            , '#fixtures > ul'
            , 'up(3) on two elements moved to 3rd parentNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up(4)
            , '#fixtures'
            , 'up(4) on two elements moved to *single* common ancestor node for both'
          )
        }

      , 'down(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul')).down(0)
            , '#fixtures > ul > li:nth-child(1)'
            , 'down(0) on two elements moved to first childNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).down(1)
            , '#fixtures > ul > li:nth-child(2)'
            , 'down(1) on two elements moved to second childNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).down(9)
            , '#fixtures > ul > li > ul > li > span'
            , 'down(9) on two elements moved down to 10th descendent in document order'
          )
        }
    }

  , 'Selector and index argument traversal': {

        'next(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next('li', 1)
            , '#fixtures > ul > li:nth-child(3)'
            , 'next("li", 1) moves to 2nd nextSibling, both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next('.c', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'next(".c", 1) moves to the second nextSibling with class "c", both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next('li.c', 2)
            , '#fixtures > ul > li:nth-child(5)'
            , 'next("li.c", 2) moves to the 3rd nextSibling li with class "c", both elements'
          )

          assert.hasExactElements(
              T(Q('#flat *:nth-child(2)')).next('div, p', 2)
            , '#flat *:nth-child(6)'
            , 'next("div, p", 2) matches 3rd following <div> or <p>'
          )
        }

      , 'next(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#flat *:nth-child(-n+2)')).next('div', 1)
            , '#flat *:nth-child(6)'
            , 'next("div", 1) on two elements matches single 2nd following <div>'
          )
        }

      , 'previous(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous('li', 1)
            , '#fixtures > ul > li:nth-child(3)'
            , 'previous("li", 1) moves to 2nd previousSibling, both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous('.c', 0)
            , '#fixtures > ul > li:nth-child(4)'
            , 'previous(".c", 0) moves to the first previousSibling with class "c", both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous('li.c', 1)
            , '#fixtures > ul > li:nth-child(2)'
            , 'previous("li.c", 2) moves to the 2nd previousSibling li with class "c", both elements'
          )

          assert.hasExactElements(
              T(Q('#flat *:nth-child(5)')).previous('div, p', 2)
            , '#flat *:nth-child(1)'
            , 'previous("div, p", 2) matches 3rd preceeding <div> or <p>'
          )
        }

      , 'previous(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#flat *:nth-child(n+5)')).previous('p', 1)
            , '#flat *:nth-child(1)'
            , 'previous("p", 1) on two elements matches single 2nd preceeding <p>'
          )
        }

      , 'up(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('li', 0)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'up("li", 0) moves to first parentNode of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('li', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'up("li", 1) moves to second li parentNode (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('li.c', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'up("li.c", 0) moves to second li parentNode with class "c" (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('li, ul', 2)
            , '#fixtures > ul > li:nth-child(4)'
            , 'up("li, ul", 2) moves to 3rd parentNode, either <li> or <ul> of both elements'
          )
        }

      , 'up(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('#fixtures', 0)
            , '#fixtures'
            , 'up("#fixtures", 0) moves up to common (single) parent node of both elements'
          )
        }

      , 'down(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul')).down('li', 0)
            , '#fixtures > ul > li:nth-child(1)'
            , 'down("li", 0) moves to first li element in document-order on both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).down('li', 2)
            , '#fixtures > ul > li:nth-child(3)'
            , 'down("li", 2) moves to third li element in document-order on both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).down('.c', 4)
            , '#fixtures > ul > li > ul > li > span'
            , 'down(".c", 4) moves to 4th element with class "c" in document-order on both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures')).down('li', 0)
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'down("li", 0) moves to first li element in document-order on first branch only'
          )

          assert.hasExactElements(
              T(Q('#fixtures')).down('li', 2)
            , '#fixtures > ul:nth-child(1) > li:nth-child(3)'
            , 'down("li", 2) moves to third li element in document-order on first branch only'
          )

          assert.hasExactElements(
              T(Q('#fixtures')).down('.c', 4)
            , '#fixtures > ul:nth-child(1) > li > ul > li > span'
            , 'down(".c", 4) moves to 4th element with class "c" in document-order on first branch only'
          )

          assert.hasExactElements(
              T(Q('#fixtures')).down('ul, .c', 3)
            , '#fixtures > ul:nth-child(1) > li > ul'
            , 'down("ul, .c", 3) moves to 4th <ul> element or element with class "c" in document-order on first branch only'
          )
        }

      , 'down(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures, #fixtures > ul:nth-child(1)')).down('li', 0)
            , '#fixtures > ul:nth-child(1) > li:nth-child(1)'
            , 'down("li", 0) from both root and first child of root moves to first li element in document-order on first branch only'
          )
        }
    }

  , 'Selector argument traversal': {

        'next(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(1)')).next('li')
            , '#fixtures > ul > li:nth-child(n+2)'
            , 'next("li") on two first-elements matches all following sibling elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(3)')).next('li')
            , '#fixtures > ul > li:nth-child(n+4)'
            , 'next("li") on two second-elements matches all following sibling elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(2)')).next('.c')
            , '#fixtures > ul > li:nth-child(n+4).c' // nth-child doesn't look for .c children but actual children, so 4 is our next .c (note we have to write our selector with the trailling .c rather than the nicer li.c cause WebKit's nth-child is garbage
            , 'next(".c") on two second-elements matches all following sibling elements with class "c"'
          )

          assert.hasExactElements(
              T(Q('#flat *:nth-child(2)')).next('span, p')
            , '#flat *:nth-child(4),#flat *:nth-child(5)'
            , 'next("span, p") matches all following <span> and <p> sibling elements'
          )
        }

      , 'previous(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous('li')
            , '#fixtures > ul > li:nth-child(-n+4)' // all but last
            , 'previous("li") on two first-elements matches all preceeding sibling elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(3)')).previous('li')
            , '#fixtures > ul > li:nth-child(-n+2)' // first 2
            , 'previous("li") on two second-elements matches all preceeding sibling elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).previous('.c')
            , '#fixtures > ul > li.c:nth-child(-n+4)' // nth-child doesn't look for .c children but actual children, so 4 is our previous .c
            , 'previous(".c") on two second-elements matches all preceeding sibling elements with class "c"'
          )

          assert.hasExactElements(
              T(Q('#flat *:nth-child(5)')).previous('span, p')
            , '#flat *:nth-child(-n+2),#flat *:nth-child(4)'
            , 'previous("span, p") matches all preceeding <span> and <p> sibling elements'
          )
        }

      , 'up(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('li')
            , '#fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4),#fixtures > ul > li:nth-child(4), #fixtures > ul > li > ul > li:nth-child(4)'
            , 'up("li") on two deep elements matches all <li> ancestor elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('*')
            , 'html, body, #fixtures, #fixtures > ul:nth-child(1), #fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li:nth-child(4) > ul, #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4), #fixtures > ul, #fixtures > ul > li:nth-child(4), #fixtures > ul > li:nth-child(4) > ul, #fixtures > ul > li > ul > li:nth-child(4)'
            , 'up("*") on two deep elements matches all ancestor elements up to <html>'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).up('ul, li')
            , '#fixtures > ul:nth-child(1), #fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li:nth-child(4) > ul, #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4),#fixtures > ul, #fixtures > ul > li:nth-child(4), #fixtures > ul > li > ul, #fixtures > ul > li > ul > li:nth-child(4)'
            , 'up("ul, li") on two deep elements matches all <ul> and <li> ancestor elements'
          )
        }

      , 'down(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures')).down('li')
            , '#fixtures li'
            , 'down("li") selects all descendent <li> elements, same as qSA'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).down('*')
            , '#fixtures > ul > li *'
            , 'down("*") selects all descendent elements, same as qSA'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:nth-child(1)')).down('li, span')
            , '#fixtures > ul:nth-child(1) > li:nth-child(-n+4), #fixtures > ul:nth-child(1) > li > ul > li, #fixtures > ul:nth-child(1) > li > ul > li > span, #fixtures > ul:nth-child(1) > li.five'
            , 'down("li, span") selects all descendent <li> and <span> elements, same as qSA'
          )

        }
    }

  , 'parents()': {
        'parents() is the same as up(*)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents()
            , 'html, body, #fixtures, #fixtures > ul:nth-child(1), #fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li:nth-child(4) > ul, #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4), #fixtures > ul, #fixtures > ul > li:nth-child(4), #fixtures > ul > li:nth-child(4) > ul, #fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents() on two deep elements matches all ancestor elements up to <html>'
          )
        }

      , 'parents(index) === up(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents(0)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents(0) on two elements moved to 1st parentNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents(3)
            , '#fixtures > ul'
            , 'parents(3) on two elements moved to 3rd parentNode on both'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents(4)
            , '#fixtures'
            , 'parents(4) on two elements moved to *single* common ancestor node for both'
          )
        }

      , 'parents(selector, index) === up(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('li', 0)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents("li", 0) moves to first parentNode of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('li', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'parents("li", 1) moves to second li parentNode (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('li.c', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'parents("li.c", 0) moves to second li parentNode with class "c" (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('li, ul', 2)
            , '#fixtures > ul > li:nth-child(4)'
            , 'parents("li, ul", 2) moves to 3rd parentNode, either <li> or <ul> of both elements'
          )
        }

      , 'parents(selector, index) === up(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('#fixtures', 0)
            , '#fixtures'
            , 'parents("#fixtures", 0) moves up to common (single) parent node of both elements'
          )
        }

      , 'parents(selector) === up(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('li')
            , '#fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4),#fixtures > ul > li:nth-child(4), #fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents("li") on two deep elements matches all <li> ancestor elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('*')
            , 'html, body, #fixtures, #fixtures > ul:nth-child(1), #fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li:nth-child(4) > ul, #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4), #fixtures > ul, #fixtures > ul > li:nth-child(4), #fixtures > ul > li:nth-child(4) > ul, #fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents("*") on two deep elements matches all ancestor elements up to <html>'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).parents('ul, li')
            , '#fixtures > ul:nth-child(1), #fixtures > ul:nth-child(1) > li:nth-child(4), #fixtures > ul:nth-child(1) > li:nth-child(4) > ul, #fixtures > ul:nth-child(1) > li > ul > li:nth-child(4),#fixtures > ul, #fixtures > ul > li:nth-child(4), #fixtures > ul > li > ul, #fixtures > ul > li > ul > li:nth-child(4)'
            , 'parents("ul, li") on two deep elements matches all <ul> and <li> ancestor elements'
          )
        }
    }

  , 'siblings()': {
        'siblings() of empty collection': function () {
          assert.hasExactElements(
              T([]).siblings()
            , '#foobar'
            , 'siblings() on empty collection returned empty collection'
          )
        }

      , 'siblings() with no argument returns all siblings': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:first-child')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings() with no-arg returns all siblings (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:first-child')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings() with no-arg returns all siblings (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(5)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4)'
            , 'siblings() with no-arg returns all siblings (single collection, lastChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'siblings() with no-arg returns all siblings (multi collection, lastChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(2)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings() with no-arg returns all siblings (single collection, midChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(2)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings() with no-arg returns all siblings (multi collection, midChildren)'
          )
        }

      , 'siblings() on siblings should include those siblings': function () {
          assert.hasExactElementsUnordered(
              T(Q('#fixtures > ul:first-child > li:nth-child(1),#fixtures > ul:first-child > li:nth-child(3)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings() no-arg with sibs 1 & 5 should also include 1 & 5 in result'
          )

          assert.hasExactElementsUnordered(
              T(Q('#fixtures > ul > li:nth-child(1),#fixtures > ul > li:nth-child(5)')).siblings()
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings() no-arg with sibs 1s & 5s should also include 1s & 5s in result'
          )
        }

      , 'siblings(selector) returns correct elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:first-child')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings(selector) returns all siblings (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:first-child')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings(selector) returns all siblings (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(5)')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4)'
            , 'siblings(selector) returns all siblings (single collection, lastChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'siblings(selector) returns all siblings (multi collection, lastChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(2)')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings(selector) returns all siblings (single collection, midChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(2)')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings(selector) returns all siblings (multi collection, midChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(2)')).siblings('*')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings(*) returns all siblings (multi collection, midChildren)'
          )
        }
 
      , 'siblings(selector) on matching siblings should include those siblings': function () {
          assert.hasExactElementsUnordered(
              T(Q('#fixtures > ul:first-child > li:nth-child(1),#fixtures > ul:first-child > li:nth-child(5)')).siblings('li')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5)'
            , 'siblings() no-arg with sibs 1 & 5 should also include 1 & 5 in result'
          )

          assert.hasExactElementsUnordered(
              T(Q('#fixtures > ul > li:nth-child(1),#fixtures > ul > li:nth-child(5)')).siblings('*')
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(1),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(2),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings() no-arg with sibs 1s & 5s should also include 1s & 5s in result'
          )
        }
 
      , 'siblings(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:first-child')).siblings(2)
            ,  '#fixtures > ul:nth-child(1) > li:nth-child(4)'
            , 'siblings(index) returns correct sibling (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:first-child')).siblings(3)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(5),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(5)'
            , 'siblings(index) returns correct siblings (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(5)')).siblings(1)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
            , 'siblings(index) returns correct sibling (single collection, lastChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(5)')).siblings(2)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
            , 'siblings(index) returns correct siblings (multi collection, lastChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(2)')).siblings(3)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(5),'
            , 'siblings(index) returns correct sibling (single collection, midChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(2)')).siblings(2)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4),'
            , 'siblings(index) returns siblings (multi collection, midChildren)'
          )
        }

      , 'siblings(selector, index)': function () {
          assert.hasExactElements(
              T([]).siblings('*', 0)
            , '#foobar'
            , 'siblings(*,0) on empty collection returns empty collection'
          )

          assert.hasExactElements(
              T([]).siblings('*', 10)
            , '#foobar'
            , 'siblings(*,10) on empty collection returns empty collection'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:first-child')).siblings('*', 1)
            , '#fixtures > ul:first-child > li:nth-child(3)'
            , 'siblings(*,1) on returns correct element (after)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child > li:nth-child(4)')).siblings('*', 1)
            , '#fixtures > ul:first-child > li:nth-child(2)'
            , 'siblings(*,1) on returns correct element (before)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:first-child')).siblings('*', 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(3)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(3)'
            , 'siblings(*,1) on returns correct element (after, multi)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(4)')).siblings('*', 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
            , 'siblings(*,1) on returns correct element (before, multi)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li:nth-child(4)')).siblings('*', 20)
            ,    '#foobar'
            , 'siblings(*, 29) on returns empty collection'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul li:nth-child(3)')).siblings('.c', 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) li li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li li:nth-child(4)'
            , 'siblings(.c, 2) on returns correct elements (complex, multi-depth selector)'
          )
        }
    }

  , 'children()': {
        'children() of empty collection': function () {
          assert.hasExactElements(
              T([]).children()
            , '#foobar'
            , 'children() on empty collection returned empty collection'
          )
        }

      , 'children() with no argument returns all children': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children()
            , '#fixtures > ul:nth-child(1) > li'
            , 'sublings() with no-arg returns all children (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children()
            , '#fixtures > ul > li,'
            , 'sublings() with no-arg returns all children (multi collection, firstChildren)'
          )
        }

      , 'children(selector) returns correct elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children('li')
            , '#fixtures > ul:nth-child(1) > li'
            , 'sublings(selector) returns all children (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children('li')
            , '#fixtures > ul > li'
            , 'sublings(selector) returns all children (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children('*')
            , '#fixtures > ul > li'
            , 'sublings(selector) returns all children (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children('.c')
            , '#fixtures > ul > li.c'
            , 'sublings(selector) returns correct children'
          )
        }
 
      , 'children(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children(2)
            ,  '#fixtures > ul:nth-child(1) > li:nth-child(3)'
            , 'sublings(index) returns correct sibling (single collection, firstChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children(3)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(4),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(4)'
            , 'sublings(index) returns correct children (multi collection, firstChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children(1)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(2),'
            , 'sublings(index) returns correct sibling (single collection, lastChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children(2)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
            , 'sublings(index) returns correct children (multi collection, lastChildren)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children(3)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(4),'
            , 'sublings(index) returns correct sibling (single collection, midChild)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children(2)
            ,   '#fixtures > ul:nth-child(1) > li:nth-child(3),'
              + '#fixtures > ul:nth-child(2) > li:nth-child(3),'
            , 'sublings(index) returns children (multi collection, midChildren)'
          )
        }

      , 'children(selector, index)': function () {
          assert.hasExactElements(
              T([]).children('*', 0)
            , '#foobar'
            , 'children(*,0) on empty collection returns empty collection'
          )

          assert.hasExactElements(
              T([]).children('*', 10)
            , '#foobar'
            , 'children(*,10) on empty collection returns empty collection'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children('*', 1)
            , '#fixtures > ul:first-child > li:nth-child(2)'
            , 'children(*,1) on returns correct element (after)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul:first-child')).children('*', 1)
            , '#fixtures > ul:first-child > li:nth-child(2)'
            , 'children(*,1) on returns correct element (before)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children('*', 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(2)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(2)'
            , 'children(*,1) on returns correct element (after, multi)'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul')).children('*', 20)
            ,    '#foobar'
            , 'children(*, 29) on returns empty collection'
          )

          assert.hasExactElements(
              T(Q('#fixtures ul')).children('.c', 1)
            ,    '#fixtures > ul:nth-child(1) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(1) li li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li:nth-child(4)'
              + ',#fixtures > ul:nth-child(2) > li li:nth-child(4)'
            , 'children(.c, 2) on returns correct elements (complex, multi-depth selector)'
          )
        }
    }

  , 'closest()': {
        'closest() no-arg returns empty set': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).closest()
            , '#foobar'
            , 'closest() with no arguments returns empty set'
          )

          assert.hasExactElements(
              T(Q('#foobar')).closest()
            , '#foobar'
            , 'closest() on empty set with no arguments returns empty set'
          )

          assert.hasExactElements(
              T(Q('#foobar')).closest('*')
            , '#foobar'
            , 'closest(*) on empty set with no arguments returns empty set'
          )
        }

      , 'closest(index) === up(index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li')).closest(0)
            , '#fixtures > ul > li'
            , 'closest(0) returns same elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest(1)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'closest(1) moves up to parent node'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest(5)
            , '#fixtures'
            , 'closest(5) on two elements moved to *single* common ancestor node for both'
          )
        }

      , 'closest(selector, index) === up(selector, index)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('span', 0)
            , '#fixtures > ul > li > ul > li > span'
            , 'closest("span", 0) returns same elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('li', 0)
            , '#fixtures > ul > li > ul > li:nth-child(4)'
            , 'closest("li", 0) returns empty set'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('li', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'closest("li", 1) moves to second li parentNode (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('li.c', 1)
            , '#fixtures > ul > li:nth-child(4)'
            , 'closest("li.c", 1) moves to second li parentNode with class "c" (3rd actual parentNode) of both elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('li, ul', 2)
            , '#fixtures > ul > li:nth-child(4)'
            , 'closest("li, ul", 2) moves to 3rd parentNode, either <li> or <ul> of both elements'
          )
        }

      , 'closest(selector, index) === up(selector, index) returns unique elements': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('#fixtures', 0)
            , '#fixtures'
            , 'closest("#fixtures", 0) moves up to common (single) parent node of both elements'
          )
        }

      , 'closest(selector) === up(selector)': function () {
          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('li')
            , '#fixtures > ul:nth-child(1) > li > ul > li:nth-child(4), #fixtures > ul > li > ul > li:nth-child(4)'
            , 'closest("li") on two deep elements matches parent <li> ancestor elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('*')
            , '#fixtures > ul > li > ul > li > span'
            , 'closest("*") returns same elements'
          )

          assert.hasExactElements(
              T(Q('#fixtures > ul > li > ul > li > span')).closest('ul, li')
            , '#fixtures > ul:nth-child(1) > li > ul > li:nth-child(4), #fixtures > ul > li > ul > li:nth-child(4)'
            , 'closest("ul, li") on two deep elements matches parent <li> ancestor elements'
          )
        }
    }
}