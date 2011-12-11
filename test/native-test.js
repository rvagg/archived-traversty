/*global commonTests:true, buster:true*/

for (var test in commonTests) {
  if (commonTests.hasOwnProperty(test))
    buster.testCase(test, commonTests[test])
}
