var Q = qwery.noConflict()
var T = traversty.noConflict()

assert.equals.message += ": ${2}";
assert.same.message += ": ${2}";

document.body.appendChild((function() {
  var fixtures = document.createElement('div')
  fixtures.id = 'fixtures'
  fixtures.innerHTML =
    '    <ul>\n' +
    '      <li>ONE</li>\n' +
    '      <li class="c">TWO</li>\n' +
    '      <li>THREE</li>\n' +
    '      <li class="c">FOUR\n' +
    '        <ul>\n' +
    '          <li>i</li>\n' +
    '          <li class="c">ii</li>\n' +
    '          <li>iii</li>\n' +
    '          <li class="c">iv\n' +
    '            <span class="c">SPAN</span>\n' +
    '          </li>\n' +
    '        </ul>\n' +
    '      </li>\n' +
    '      <li class="c">FIVE</li>\n' +
    '    </ul>\n' +
    '    <ul>\n' +
    '      <li>one</li>\n' +
    '      <li class="c">two</li>\n' +
    '      <li>three</li>\n' +
    '      <li class="c">four\n' +
    '        <ul>\n' +
    '          <li>1</li>\n' +
    '          <li class="c">2</li>\n' +
    '          <li>3</li>\n' +
    '          <li class="c">4\n' +
    '            <span class="c">span</span>\n' +
    '          </li>\n' +
    '        </ul>\n' +
    '      </li>\n' +
    '      <li class="c">five</li>\n' +
    '    </ul>\n' +
    '    <div id="flat">\n' +
    '    </div>\n'
  return fixtures
})())
