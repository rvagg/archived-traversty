var config = module.exports

config['Traversty Tests'] = {
    environment: 'browser'
  , sources: [
        '../vendor/qwery.js'
      , '../vendor/qwery_pseudos.js'
      , '../vendor/sizzle.js'
      , '../vendor/nwmatcher.js'
      , '../vendor/es5-basic_mod.js'
      , '../vendor/sel.js'
      , 'noconflict.js'
      , '../src/traversty.js'
      , 'setup.js'
      , 'common.js'
    ]
  , tests: [
      '*-test.js'
    ]
}
