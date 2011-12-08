var config = module.exports

config['Traversty Tests'] = {
    environment: 'browser'
  , sources: [
        '../node_modules/qwery/qwery.js'
      , '../node_modules/qwery/src/pseudos.js'
      , 'noconflict.js'
      , '../src/traversty.js'
      , 'setup.js'
      , 'common.js'
    ]
  , tests: [
      '*-test.js'
    ]
}
