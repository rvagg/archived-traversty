/*global commonTests:true, buster:true, T:true, Q:true, Sizzle:true, NW:true, sel:true, loadES5Basic:true, __matchesSelector:true*/

var own = Object.prototype.hasOwnProperty
  , extend = function (src, dst) {
      for (var p in src) {
        if (own.call(src, p)) dst[p] = src[p]
      }
      return dst
    }
  , engineTest = function (engine, name, customSetUp) {
      var test, tc, performedSetUp = false
          // setUp for each test calls setSelectorEngine() with the given engine
        , setUp = function () {
            if (!performedSetUp) {
              customSetUp && customSetUp()
              try {
                T.setSelectorEngine(engine)
              } catch(e) {
                buster.log(e)
                throw e
              }
              performedSetUp = true
            }
          }

      for (test in commonTests) {
        if (own.call(commonTests, test)) {
          // *copy* from commonTests
          tc = extend(commonTests[test], {})
          // don't set a setUp if we're native
          if (!!engine) tc.setUp = setUp
          buster.testCase('(' + name + ') ' + test, tc)
        }
      }
    }

// native must be first so we start off without T.setSelectorEngine() being called
// we also don't want to run native tests in older browsers that don't support it
if (!!__matchesSelector)
  engineTest(null, 'Native')
engineTest(Q, 'Qwery')
engineTest(Sizzle, 'Sizzle')
engineTest(NW.Dom, 'NW')
// Sel must be last because it requires es5-basic which extends natives and we don't
// want that impacting any other tests in unexpected ways
engineTest(sel, 'Sel', function() { loadES5Basic() })
