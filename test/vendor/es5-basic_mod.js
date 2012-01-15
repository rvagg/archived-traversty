// modified for Traversty testing, simply wrapped in a function so we can load it when we need it
// and not have it in place the whole time we're testing

function loadES5Basic() { // MOD

var __hasProp = Object.prototype.hasOwnProperty;

if (!Function.prototype.bind) {
  Function.prototype.bind = function(that) {
    var Bound, args, target;
    target = this;
    if (typeof target.apply !== "function" || typeof target.call !== "function") {
      return new TypeError();
    }
    args = Array.prototype.slice.call(arguments);
    Bound = (function() {

      function Bound() {
        var Type, self;
        if (this instanceof Bound) {
          self = new (Type = (function() {

            function Type() {}

            Type.prototype = target.prototype;

            return Type;

          })());
          target.apply(self, args.concat(Array.prototype.slice.call(arguments)));
          return self;
        } else {
          return target.call.apply(target, args.concat(Array.prototype.slice.call(arguments)));
        }
      }

      Bound.prototype.length = (typeof target === "function" ? Math.max(target.length - args.length, 0) : 0);

      return Bound;

    })();
    return Bound;
  };
}

if (!Array.isArray) {
  Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, that) {
    var i, val, _len;
    for (i = 0, _len = this.length; i < _len; i++) {
      val = this[i];
      if (i in this) fn.call(that, val, i, this);
    }
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function(fn, that) {
    var i, val, _len, _results;
    _results = [];
    for (i = 0, _len = this.length; i < _len; i++) {
      val = this[i];
      if (i in this) _results.push(fn.call(that, val, i, this));
    }
    return _results;
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fn, that) {
    var i, val, _len, _results;
    _results = [];
    for (i = 0, _len = this.length; i < _len; i++) {
      val = this[i];
      if (i in this && fn.call(that, val, i, this)) _results.push(val);
    }
    return _results;
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fn, that) {
    var i, val, _len;
    for (i = 0, _len = this.length; i < _len; i++) {
      val = this[i];
      if (i in this) if (fn.call(that, val, i, this)) return true;
    }
    return false;
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function(fn, that) {
    var i, val, _len;
    for (i = 0, _len = this.length; i < _len; i++) {
      val = this[i];
      if (i in this) if (!fn.call(that, val, i, this)) return false;
    }
    return true;
  };
}

if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(fn) {
    var i, result;
    i = 0;
    if (arguments.length > 1) {
      result = arguments[1];
    } else if (this.length) {
      result = this[i++];
    } else {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    while (i < this.length) {
      if (i in this) result = fn.call(null, result, this[i], i, this);
      i++;
    }
    return result;
  };
}

if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function(fn) {
    var i, result;
    i = this.length - 1;
    if (arguments.length > 1) {
      result = arguments[1];
    } else if (this.length) {
      result = this[i--];
    } else {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    while (i >= 0) {
      if (i in this) result = fn.call(null, result, this[i], i, this);
      i--;
    }
    return result;
  };
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(value) {
    var i, _ref;
    i = (_ref = arguments[1]) != null ? _ref : 0;
    if (i < 0) i += length;
    i = Math.max(i, 0);
    while (i < this.length) {
      if (i in this) if (this[i] === value) return i;
      i++;
    }
    return -1;
  };
}

if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(value) {
    var i;
    i = arguments[1] || this.length;
    if (i < 0) i += length;
    i = Math.min(i, this.length - 1);
    while (i >= 0) {
      if (i in this) if (this[i] === value) return i;
      i--;
    }
    return -1;
  };
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var key, _results;
    _results = [];
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      _results.push(key);
    }
    return _results;
  };
}

if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function() {
    return ("" + (this.getUTCFullYear()) + "-" + (this.getUTCMonth() + 1) + "-" + (this.getUTCDate()) + "T") + ("" + (this.getUTCHours()) + ":" + (this.getUTCMinutes()) + ":" + (this.getUTCSeconds()) + "Z");
  };
}

if (!Date.prototype.toJSON) {
  Date.prototype.toJSON = function() {
    return this.toISOString();
  };
}

if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };
}

} // MOD
