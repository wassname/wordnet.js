'use strict'
exports.unique = function(a) {
  return a.reduce(function(p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
};

exports.flatten = function(arr) {
  arr = arr || []
  return arr.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}
