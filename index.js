// for component: https://github.com/component/component

var T = module.exports = require('./traversty')
  , engines = [ 'zest', 'qwery', 'jquery', 'sizzle' ]
  , i = 0
  , l = engines.length

for (; i < l; i++) {
  try {
    T.setSelectorEngine(require(engines[i]))
    break
  } catch (e) {}
}