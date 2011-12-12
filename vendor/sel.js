
(function(sel) {
  /* util.coffee
  */
  var attrPattern, checkNth, combinatorPattern, combine, contains, create, eachElement, elCmp, evaluate, extend, filter, filterDescendants, find, html, name, nextElementSibling, normalizeRoots, nthPattern, outerDescendants, parentMap, parse, parseSimple, pseudoPattern, select, selectorGroups, selectorPattern, synonym, tagPattern, _attrMap, _positionalPseudos, _ref;
  html = document.documentElement;
  extend = function(a, b) {
    var x, _i, _len;
    for (_i = 0, _len = b.length; _i < _len; _i++) {
      x = b[_i];
      a.push(x);
    }
    return a;
  };
  eachElement = function(el, first, next, fn) {
    el = el[first];
    while (el) {
      if (el.nodeType === 1) fn(el);
      el = el[next];
    }
  };
  nextElementSibling = html.nextElementSibling ? function(el) {
    return el.nextElementSibling;
  } : function(el) {
    el = el.nextSibling;
    while (el && el.nodeType !== 1) {
      el = el.nextSibling;
    }
    return el;
  };
  contains = html.compareDocumentPosition != null ? function(a, b) {
    return (a.compareDocumentPosition(b) & 16) === 16;
  } : html.contains != null ? function(a, b) {
    if (a.documentElement) {
      return b.ownerDocument === a;
    } else {
      return a !== b && a.contains(b);
    }
  } : function(a, b) {
    if (a.documentElement) return b.ownerDocument === a;
    while (b = b.parentNode) {
      if (a === b) return true;
    }
    return false;
  };
  elCmp = html.compareDocumentPosition ? function(a, b) {
    if (a === b) {
      return 0;
    } else if (a.compareDocumentPosition(b) & 4) {
      return -1;
    } else {
      return 1;
    }
  } : html.sourceIndex ? function(a, b) {
    if (a === b) {
      return 0;
    } else if (a.sourceIndex < b.sourceIndex) {
      return -1;
    } else {
      return 1;
    }
  } : void 0;
  filterDescendants = function(els) {
    return els.filter(function(el, i) {
      return el && !(i && (els[i - 1] === el || contains(els[i - 1], el)));
    });
  };
  outerDescendants = function(els) {
    var r;
    r = [];
    filterDescendants(els).forEach(function(el) {
      var parent;
      parent = el.parentNode;
      if (parent && parent !== r[r.length - 1]) r.push(parent);
    });
    return r;
  };
  combine = function(a, b, aRest, bRest, map) {
    var i, j, r;
    r = [];
    i = 0;
    j = 0;
    while (i < a.length && j < b.length) {
      switch (map[elCmp(a[i], b[j])]) {
        case -1:
          i++;
          break;
        case -2:
          j++;
          break;
        case 1:
          r.push(a[i++]);
          break;
        case 2:
          r.push(b[j++]);
          break;
        case 0:
          r.push(a[i++]);
          j++;
      }
    }
    if (aRest) {
      while (i < a.length) {
        r.push(a[i++]);
      }
    }
    if (bRest) {
      while (j < b.length) {
        r.push(b[j++]);
      }
    }
    return r;
  };
  sel.union = function(a, b) {
    return combine(a, b, true, true, {
      '0': 0,
      '-1': 1,
      '1': 2
    });
  };
  sel.intersection = function(a, b) {
    return combine(a, b, false, false, {
      '0': 0,
      '-1': -1,
      '1': -2
    });
  };
  sel.difference = function(a, b) {
    return combine(a, b, true, false, {
      '0': -1,
      '-1': 1,
      '1': -2
    });
  };
  /* find.coffee
  */
  _attrMap = {
    'tag': function(el) {
      return el.tagName;
    },
    'class': function(el) {
      return el.className;
    }
  };
  (function() {
    var p;
    p = document.createElement('p');
    p.innerHTML = '<a href="#"></a>';
    if (p.firstChild.getAttribute('href') !== '#') {
      _attrMap['href'] = function(el) {
        return el.getAttribute('href', 2);
      };
      return _attrMap['src'] = function(el) {
        return el.getAttribute('src', 2);
      };
    }
  })();
  _positionalPseudos = {
    'nth-child': false,
    'nth-of-type': false,
    'first-child': false,
    'first-of-type': false,
    'nth-last-child': true,
    'nth-last-of-type': true,
    'last-child': true,
    'last-of-type': true,
    'only-child': false,
    'only-of-type': false
  };
  find = function(e, roots) {
    var els;
    if (e.id) {
      els = [];
      roots.forEach(function(root) {
        var el;
        el = (root.ownerDocument || root).getElementById(e.id);
        if (el && contains(root, el)) els.push(el);
      });
      e.id = null;
    } else if (e.classes && html.getElementsByClassName) {
      els = roots.map(function(root) {
        return e.classes.map(function(cls) {
          return root.getElementsByClassName(cls);
        }).reduce(sel.union);
      }).reduce(extend, []);
      e.classes = null;
    } else {
      els = roots.map(function(root) {
        return root.getElementsByTagName(e.tag || '*');
      }).reduce(extend, []);
      e.tag = null;
    }
    if (els && els.length) {
      return filter(e, els);
    } else {
      return [];
    }
  };
  filter = function(e, els) {
    els = els.filter(function(el) {
      return el.nodeType === 1;
    });
    if (e.id) {
      els = els.filter(function(el) {
        return el.id === e.id;
      });
    }
    if (e.tag && e.tag !== '*') {
      els = els.filter(function(el) {
        return el.nodeName.toLowerCase() === e.tag;
      });
    }
    if (e.classes) {
      e.classes.forEach(function(cls) {
        els = els.filter(function(el) {
          return (" " + el.className + " ").indexOf(" " + cls + " ") >= 0;
        });
      });
    }
    if (e.attrs) {
      e.attrs.forEach(function(_arg) {
        var name, op, val;
        name = _arg.name, op = _arg.op, val = _arg.val;
        els = els.filter(function(el) {
          var attr, value;
          attr = _attrMap[name] ? _attrMap[name](el) : el.getAttribute(name);
          value = attr + "";
          return (attr || (el.attributes && el.attributes[name] && el.attributes[name].specified)) && (!op ? true : op === '=' ? value === val : op === '!=' ? value !== val : op === '*=' ? value.indexOf(val) >= 0 : op === '^=' ? value.indexOf(val) === 0 : op === '$=' ? value.substr(value.length - val.length) === val : op === '~=' ? (" " + value + " ").indexOf(" " + val + " ") >= 0 : op === '|=' ? value === val || (value.indexOf(val) === 0 && value.charAt(val.length) === '-') : false);
        });
      });
    }
    if (e.pseudos) {
      e.pseudos.forEach(function(_arg) {
        var filtered, first, name, next, pseudo, val;
        name = _arg.name, val = _arg.val;
        pseudo = sel.pseudos[name];
        if (!pseudo) throw new Error("no pseudo with name: " + name);
        if (name in _positionalPseudos) {
          first = _positionalPseudos[name] ? 'lastChild' : 'firstChild';
          next = _positionalPseudos[name] ? 'previousSibling' : 'nextSibling';
          els.forEach(function(el) {
            var indices, parent;
            if ((parent = el.parentNode) && parent._sel_children === void 0) {
              indices = {
                '*': 0
              };
              eachElement(parent, first, next, function(el) {
                el._sel_index = ++indices['*'];
                el._sel_indexOfType = indices[el.nodeName] = (indices[el.nodeName] || 0) + 1;
              });
              parent._sel_children = indices;
            }
          });
        }
        filtered = els.filter(function(el) {
          return pseudo(el, val);
        });
        if (name in _positionalPseudos) {
          els.forEach(function(el) {
            var parent;
            if ((parent = el.parentNode) && parent._sel_children !== void 0) {
              eachElement(parent, first, next, function(el) {
                el._sel_index = el._sel_indexOfType = void 0;
              });
              parent._sel_children = void 0;
            }
          });
        }
        els = filtered;
      });
    }
    return els;
  };
  /* pseudos.coffee
  */
  nthPattern = /\s*((?:\+|\-)?(\d*))n\s*((?:\+|\-)\s*\d+)?\s*/;
  checkNth = function(i, val) {
    var a, b, m;
    if (!val) {
      return false;
    } else if (isFinite(val)) {
      return i == val;
    } else if (val === 'even') {
      return i % 2 === 0;
    } else if (val === 'odd') {
      return i % 2 === 1;
    } else if (m = nthPattern.exec(val)) {
      a = m[2] ? parseInt(m[1]) : parseInt(m[1] + '1');
      b = m[3] ? parseInt(m[3].replace(/\s*/, '')) : 0;
      if (!a) {
        return i === b;
      } else {
        return ((i - b) % a === 0) && ((i - b) / a >= 0);
      }
    } else {
      throw new Error('invalid nth expression');
    }
  };
  sel.pseudos = {
    'first-child': function(el) {
      return el._sel_index === 1;
    },
    'only-child': function(el) {
      return el._sel_index === 1 && el.parentNode._sel_children['*'] === 1;
    },
    'nth-child': function(el, val) {
      return checkNth(el._sel_index, val);
    },
    'first-of-type': function(el) {
      return el._sel_indexOfType === 1;
    },
    'only-of-type': function(el) {
      return el._sel_indexOfType === 1 && el.parentNode._sel_children[el.nodeName] === 1;
    },
    'nth-of-type': function(el, val) {
      return checkNth(el._sel_indexOfType, val);
    },
    target: function(el) {
      return el.getAttribute('id') === location.hash.substr(1);
    },
    checked: function(el) {
      return el.checked === true;
    },
    enabled: function(el) {
      return el.disabled === false;
    },
    disabled: function(el) {
      return el.disabled === true;
    },
    selected: function(el) {
      return el.selected === true;
    },
    focus: function(el) {
      return el.ownerDocument.activeElement === el;
    },
    empty: function(el) {
      return !el.childNodes.length;
    },
    contains: function(el, val) {
      var _ref;
      return ((_ref = el.textContent) != null ? _ref : el.innerText).indexOf(val) >= 0;
    },
    "with": function(el, val) {
      return select(val, [el]).length > 0;
    },
    without: function(el, val) {
      return select(val, [el]).length === 0;
    }
  };
  _ref = {
    'has': 'with',
    'last-child': 'first-child',
    'nth-last-child': 'nth-child',
    'last-of-type': 'first-of-type',
    'nth-last-of-type': 'nth-of-type'
  };
  for (synonym in _ref) {
    name = _ref[synonym];
    sel.pseudos[synonym] = sel.pseudos[name];
  }
  /* parser.coffee
  */
  attrPattern = /\[\s*([-\w]+)\s*(?:([~|^$*!]?=)\s*(?:([-\w]+)|['"]([^'"]*)['"])\s*)?\]/g;
  pseudoPattern = /::?([-\w]+)(?:\((\([^()]+\)|[^()]+)\))?/g;
  combinatorPattern = /^\s*([,+~])/;
  selectorPattern = RegExp("^(?:\\s*(>))?\\s*(?:(\\*|\\w+))?(?:\\#([-\\w]+))?(?:\\.([-\\.\\w]+))?((?:" + attrPattern.source + ")*)((?:" + pseudoPattern.source + ")*)");
  selectorGroups = {
    type: 1,
    tag: 2,
    id: 3,
    classes: 4,
    attrsAll: 5,
    pseudosAll: 10
  };
  parse = function(selector) {
    var e, last, result;
    result = last = parseSimple(selector);
    if (last.compound) last.children = [];
    while (last[0].length < selector.length) {
      selector = selector.substr(last[0].length);
      e = parseSimple(selector);
      if (e.compound) {
        e.children = [result];
        result = e;
      } else if (last.compound) {
        last.children.push(e);
      } else {
        last.child = e;
      }
      last = e;
    }
    return result;
  };
  parseSimple = function(selector) {
    var e, group, name;
    if (e = combinatorPattern.exec(selector)) {
      e.compound = true;
      e.type = e[1];
    } else if (e = selectorPattern.exec(selector)) {
      e.simple = true;
      for (name in selectorGroups) {
        group = selectorGroups[name];
        e[name] = e[group];
      }
      e.type || (e.type = ' ');
      if (e.tag) e.tag = e.tag.toLowerCase();
      if (e.classes) e.classes = e.classes.toLowerCase().split('.');
      if (e.attrsAll) {
        e.attrs = [];
        e.attrsAll.replace(attrPattern, function(all, name, op, val, quotedVal) {
          e.attrs.push({
            name: name,
            op: op,
            val: val || quotedVal
          });
          return "";
        });
      }
      if (e.pseudosAll) {
        e.pseudos = [];
        e.pseudosAll.replace(pseudoPattern, function(all, name, val) {
          if (name === 'not') {
            e.not = parse(val);
          } else {
            e.pseudos.push({
              name: name,
              val: val
            });
          }
          return "";
        });
      }
    } else {
      throw new Error("Parse error at: " + selector);
    }
    return e;
  };
  /* eval.coffee
  */
  evaluate = function(e, roots) {
    var els, outerRoots, sibs;
    els = [];
    if (roots.length) {
      switch (e.type) {
        case ' ':
        case '>':
          outerRoots = filterDescendants(roots);
          els = find(e, outerRoots);
          if (e.type === '>') {
            roots.forEach(function(el) {
              el._sel_mark = true;
            });
            els = els.filter(function(el) {
              if ((el = el.parentNode)) return el._sel_mark;
            });
            roots.forEach(function(el) {
              el._sel_mark = false;
            });
          }
          if (e.not) els = sel.difference(els, find(e.not, outerRoots));
          if (e.child) els = evaluate(e.child, els);
          break;
        case '+':
        case '~':
        case ',':
          if (e.children.length === 2) {
            sibs = evaluate(e.children[0], roots);
            els = evaluate(e.children[1], roots);
          } else {
            sibs = roots;
            roots = outerDescendants(roots);
            els = evaluate(e.children[0], roots);
          }
          if (e.type === ',') {
            els = sel.union(sibs, els);
          } else if (e.type === '+') {
            sibs.forEach(function(el) {
              if ((el = nextElementSibling(el))) el._sel_mark = true;
            });
            els = els.filter(function(el) {
              return el._sel_mark;
            });
            sibs.forEach(function(el) {
              if ((el = nextElementSibling(el))) el._sel_mark = void 0;
            });
          } else if (e.type === '~') {
            sibs.forEach(function(el) {
              while ((el = nextElementSibling(el)) && !el._sel_mark) {
                el._sel_mark = true;
              }
            });
            els = els.filter(function(el) {
              return el._sel_mark;
            });
            sibs.forEach(function(el) {
              while ((el = nextElementSibling(el)) && el._sel_mark) {
                el._sel_mark = void 0;
              }
            });
          }
      }
    }
    return els;
  };
  /* select.coffee
  */
  parentMap = {
    thead: 'table',
    tbody: 'table',
    tfoot: 'table',
    tr: 'tbody',
    th: 'tr',
    td: 'tr',
    fieldset: 'form',
    option: 'select'
  };
  tagPattern = /^\s*<([^\s>]+)/;
  create = function(html, root) {
    var els, parent;
    parent = (root || document).createElement(parentMap[tagPattern.exec(html)[1]] || 'div');
    parent.innerHTML = html;
    els = [];
    eachElement(parent, 'firstChild', 'nextSibling', function(el) {
      return els.push(el);
    });
    return els;
  };
  select = document.querySelector && document.querySelectorAll ? function(selector, roots) {
    try {
      return roots.map(function(root) {
        return root.querySelectorAll(selector);
      }).reduce(extend, []);
    } catch (e) {
      return evaluate(parse(selector), roots);
    }
  } : function(selector, roots) {
    return evaluate(parse(selector), roots);
  };
  normalizeRoots = function(roots) {
    if (!roots) {
      return [document];
    } else if (typeof roots === 'string') {
      return select(roots, [document]);
    } else if (typeof roots === 'object' && isFinite(roots.length)) {
      if (roots.sort) roots.sort(elCmp);
      return filterDescendants(roots);
    } else {
      return [roots];
    }
  };
  sel.sel = function(selector, _roots) {
    var roots;
    roots = normalizeRoots(_roots);
    if (!selector) {
      return [];
    } else if (Array.isArray(selector)) {
      return selector;
    } else if (tagPattern.test(selector)) {
      return create(selector, roots[0]);
    } else if (selector === window || selector === 'window') {
      return [window];
    } else if (selector === document || selector === 'document') {
      return [document];
    } else if (selector.nodeType === 1) {
      if (!_roots || roots.some(function(root) {
        return contains(root, selector);
      })) {
        return [selector];
      } else {
        return [];
      }
    } else {
      return select(selector, roots);
    }
  };
  return sel.matching = function(els, selector) {
    return filter(parse(selector), els);
  };
})(typeof exports !== "undefined" && exports !== null ? exports : (this['sel'] = {}));
