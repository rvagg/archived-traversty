var config = module.exports

config['Traversty Tests'] = {
    environment: 'browser'
  , sources: [
        './test/vendor/qwery.js'
      , './test/vendor/qwery_pseudos.js'
      , './test/vendor/sizzle.js'
      , './test/vendor/nwmatcher.js'
      , './test/vendor/es5-basic_mod.js'
      , './test/vendor/sel.js'
      , './test/noconflict.js'
      , './traversty.js'
      , './test/setup.js'
      , './test/traversal.js'
      , './test/filters.js'
    ]
  , tests: [
      './test/*-test.js'
    ]
}
