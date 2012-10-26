/*global qwery:true, traversty:true, buster:true*/

this.Q = qwery.noConflict()
this.T = traversty.noConflict()
this.__matchesSelector = (function (el, pfx, name, i, ms) {
      while (i < pfx.length)
        if (el[ms = pfx[i++] + name]) return ms
      return false
    }(document.documentElement, [ 'msM', 'webkitM', 'mozM', 'oM', 'm' ], 'atchesSelector', 0))

//assert.equals.message += ": ${2}";
//assert.same.message += ": ${2}";

buster.assertions.add("hasExactElements", {
    assert: function (actual, expectedSelector) {
      var i
      this.elements = Q(expectedSelector)
      this.actual = []
      for (i = 0; i < actual.length; i++)
        this.actual.push(actual[i])
      if (this.elements.length !== this.actual.length) return false
      for (i = 0; i < this.elements.length; i++)
        if (this.elements[i] !== this.actual[i]) return false
      return true
    }
  , assertMessage: "Expected ${actual} to be ${elements} (selector: ${1}): ${2}"
})

buster.assertions.add("hasExactElementsUnordered", {
    assert: function (actual, expectedSelector) {
      var i, j, found = 0
      this.elements = Q(expectedSelector)
      this.actual = []
      for (i = 0; i < actual.length; i++)
        this.actual.push(actual[i])
      if (this.elements.length !== this.actual.length) return false
      for (i = 0; i < this.elements.length; i++)
        for (j = 0; j < actual.length; j++)
          if (this.elements[i] === actual[j]) found++
      return found == actual.length
    }
  , assertMessage: "Expected ${actual} to be ${elements} (selector: ${1}): ${2}"
})


document.body.appendChild((function() {
  var fixtures = document.createElement('div')
  fixtures.id = 'fixtures'
  fixtures.innerHTML =
    '    <ul>\n' +
    '      <li>ONE</li><!-- comment -->\n' +
    '      <li class="c">TWO</li>\n' +
    '      <li>THREE</li>\n' +
    '      <li class="c">FOUR\n' +
    '        <ul>\n' +
    '          <!-- comment -->\n' +
    '          <li>i</li>\n' +
    '          <li class="c">ii</li>\n' +
    '          <li>iii</li>\n' +
    '          <li class="c">iv\n' +
    '            <span class="c">SPAN</span>\n' +
    '          </li>\n' +
    '        </ul>\n' +
    '      </li>\n' +
    '      <!-- comment -->\n' +
    '      <li class="c five">FIVE</li>\n' +
    '    </ul>\n' +
    '    <ul>\n' +
    '      <!-- comment -->\n' +
    '      <!-- comment -->\n' +
    '      <li>one</li>\n' +
    '      <li class="c">two</li>\n' +
    '      <li>three</li><!-- comment -->\n' +
    '      <li class="c">four\n' +
    '        <ul>\n' +
    '          <li>1</li>\n' +
    '          <li class="c">2</li>\n' +
    '          <!-- comment -->\n' +
    '          <li>3</li>\n' +
    '          <li class="c">4\n' +
    '            <span class="c">span</span>\n' +
    '          </li>\n' +
    '          <!-- comment -->\n' +
    '        </ul>\n' +
    '      </li>\n' +
    '      <!-- comment -->\n' +
    '      <!-- comment -->\n' +
    '      <li class="c five">five</li>\n' +
    '      <!-- comment -->\n' +
    '    </ul>\n' +
    '    <div id="flat">\n' +
    '      <p>P1</p>\n' +
    '      <span>S1</span>\n' +
    '      <div>D1</div>\n' +
    '      <p>P2</p>\n' +
    '      <span>S2</span>\n' +
    '      <div>D2</div>\n' +
    '    </div>\n'
  fixtures.style.display = 'none'
  return fixtures
}()))
