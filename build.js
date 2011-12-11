require('smoosh').config({
  "JAVASCRIPT": {
      "DIST_DIR": "./"
    , "traversty": [
          "./src/copyright.js"
        , "./src/traversty.js"
      ]
  }
  , "JSHINT_OPTS": {
      "boss": true
    , "bitwise": true
    , "shadow": true
    , "trailing": true
    , "immed": true
    , "latedef": true
    , "newcap": true
    , "forin": true
    , "curly": false
    , "debug": true
    , "devel": false
    , "evil": false
    , "regexp": false
    , "undef": true
    , "sub": true
    , "white": false
    , "indent": 2
    , "whitespace": true
    , "asi": true
    , "laxbreak": true
    , "eqeqeq": true
    , "eqnull": true
    , "browser": true
    , "node": true
  }
}).run().build().analyze()
