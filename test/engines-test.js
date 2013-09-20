var buster         = require('bustermove')
  , assert         = buster.assert
  , Q              = require('qwery')
  , Sizzle         = require('sizzle')
  , NW             = require('nwmatcher')
  , T              = require('../traversty')
  , traversalTests = require('./traversal')
  , filterTests    = require('./filters')

var own = Object.prototype.hasOwnProperty
  , extend = function (src, dst) {
      for (var p in src) {
        if (own.call(src, p)) dst[p] = src[p]
      }
      return dst
    }

  , linkTests = function (engine, name, setUp, tests) {
      var test, tc

      for (test in tests) {
        if (own.call(tests, test)) {
          // *copy* from tests
          tc = extend(tests[test], {})
          // don't set a setUp if we're native
          if (!!engine) tc.setUp = setUp
          buster.testCase('(' + name + ') ' + test, tc)
        }
      }
    }

  , engineTest = function (engine, name, customSetUp) {
      var performedSetUp = false
          // setUp for each test calls setSelectorEngine() with the given engine
        , setUp = function () {
            if (!performedSetUp) {
              customSetUp && customSetUp()
              try {
                // throwing in a 'is chainable' test here.. a bit naughty but has to be done somewhere
                assert.same(T.setSelectorEngine(engine), T)
              } catch(e) {
                buster.log(e)
                throw e
              }
              performedSetUp = true
            }
          }

      linkTests(engine, name, setUp, traversalTests)
      linkTests(engine, name, setUp, filterTests)
    }

// native must be first so we start off without T.setSelectorEngine() being called
// we also don't want to run native tests in older browsers that don't support it
if (window.__matchesSelector) engineTest(null, 'Native')
engineTest(Q, 'Qwery')
engineTest(Sizzle, 'Sizzle')
engineTest(NW.Dom, 'NW')
// can't browserify, needs jade !?!? engineTest(zest, 'Zest')

// Sel must be last because it requires es5-basic which extends natives and we don't
// want that impacting any other tests in unexpected ways
// es5-basic causes too many browserify problems
// engineTest(sel, 'Sel', function() { loadES5Basic() })