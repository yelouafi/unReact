(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../src/app');

var _srcBase = require('../../src/base');

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _rod = require('./rod');

var _rod2 = _interopRequireDefault(_rod);

function createDisks(n) {
  var disks = [];
  for (var i = 0; i < n; i++) {
    disks[i] = { id: i, size: 150 - (n - i) * 10 };
  }
  return disks;
}

var app = new _srcApp.App();

app.tap('dragStart', function (ev) {
  var domEvent = ev.source;
  domEvent.dataTransfer.effectAllowed = 'move';
  domEvent.dataTransfer.setData('text/html', domEvent.currentTarget);
});

app.tap('dragOver', function (ev) {
  var disks = ev.data.disks(),
      curMove = move(-1);

  if (curMove.source && (disks.length === 0 || disks[0].size > curMove.disk.size)) ev.source.preventDefault();
});

app.tap('dragEnd', function (ev) {
  if (gameFinished()) setTimeout(function () {
    return alert('Game finished');
  }, 4);
});

var changeDisks$ = app.on('changeDisks').filter(function (_) {
  return confirm('Are you sure you want reset ?');
});
var nbDisks = (0, _srcApp.step)(3, app.on('nbDisks').map(function (e) {
  return +e.target.value;
}));

var move = (0, _srcApp.step)({}, app.on('dragStart').map(function (data) {
  return data.disk === data.source.disks()[0] ? data : {};
}), app.on('dragOver').map(function (target) {
  var disks = target.disks(),
      curMove = move(-1);

  if (!curMove.source) return curMove;
  return (0, _srcBase.extend)({}, curMove, disks.length === 0 || disks[0].size > curMove.disk.size ? { target: target, started: true } : { started: true });
}), app.on('dragEnd').merge(changeDisks$).map(function (_) {
  return {};
}));

var gameFinished = function gameFinished() {
  return rods[1].disks().length === 3 || rods[2].disks().length === 3;
};

var createDisksBeh = function createDisksBeh(idx) {
  var start = idx === 1 ? createDisks(nbDisks()) : [];
  var disks = (0, _srcApp.step)(start, app.on('dragEnd').map(function (_) {
    var acc = disks(-1),
        curRod = rods[idx - 1],
        curMove = move(-1);

    return curMove.source && curMove.target && curMove.source !== curMove.target ? curRod === curMove.source ? (0, _srcBase.remove)(acc, curMove.disk) : curRod === curMove.target ? [curMove.disk].concat(acc) : acc : acc;
  }), changeDisks$.map(function (n) {
    return idx === 1 ? createDisks(nbDisks()) : [];
  }));
  return disks;
};

var rods = [1, 2, 3].map(function (idx) {
  return (0, _rod2['default'])(app, idx, createDisksBeh(idx), move);
});

app.view = function () {
  return (0, _snabbdomH2['default'])('div', rods.map(function (r) {
    return r.view();
  }).concat([(0, _snabbdomH2['default'])('hr'), (0, _snabbdomH2['default'])('button', { on: { click: app.publish('changeDisks') } }, 'Reset'), (0, _snabbdomH2['default'])('input', { props: { type: 'number', value: 3 }, on: { change: app.publish('nbDisks') } })]));
};

app.mount('#container');

},{"../../src/app":11,"../../src/base":12,"./rod":2,"snabbdom/h":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../src/app');

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

function rod(channel, id, disks, move) {

  var app = new _srcApp.App();
  app.id = id;
  app.disks = disks;

  var diskview = function diskview(disk, idx) {
    return (0, _snabbdomH2['default'])('li.disk', {
      key: disk.id,
      props: { draggable: true },
      style: {
        width: '' + disk.size + 'px',
        display: disk === move().disk && move().started ? 'none' : 'block'
      },
      on: {
        dragstart: channel.publish('dragStart', { source: app, disk: disk }),
        dragend: channel.publish('dragEnd')
      }
    });
  };

  app.view = function () {
    return (0, _snabbdomH2['default'])('div.rod', {
      on: {
        dragover: channel.publish('dragOver', app)
      }
    }, [(0, _snabbdomH2['default'])('ul', disks().map(diskview))]);
  };

  return app;
}

exports['default'] = rod;
module.exports = exports['default'];

},{"../../src/app":11,"snabbdom/h":3}],3:[function(require,module,exports){
var VNode = require('./vnode');
var is = require('./is');

module.exports = function h(sel, b, c) {
  var data = {}, children, text, i;
  if (arguments.length === 3) {
    data = b;
    if (is.array(c)) { children = c; }
    else if (is.primitive(c)) { text = c; }
  } else if (arguments.length === 2) {
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else { data = b; }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  return VNode(sel, data, children, text, undefined);
};

},{"./is":4,"./vnode":10}],4:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],5:[function(require,module,exports){
function updateClass(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldClass = oldVnode.data.class || {},
      klass = vnode.data.class || {};
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

module.exports = {create: updateClass, update: updateClass};

},{}],6:[function(require,module,exports){
var is = require('../is');

function arrInvoker(arr) {
  return function() { arr[0](arr[1]); };
}

function fnInvoker(arr) {
  return function(ev) { arr[0](ev); };
}

function updateEventListeners(oldVnode, vnode) {
  var name, cur, old, elm = vnode.elm,
      oldOn = oldVnode.data.on || {}, on = vnode.data.on;
  if (!on) return;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      if (is.array(cur)) {
        elm.addEventListener(name, arrInvoker(cur));
      } else {
        cur = [cur];
        on[name] = cur;
        elm.addEventListener(name, fnInvoker(cur));
      }
    } else if (old.length === 2) {
      old[0] = cur[0]; // Deliberately modify old array since it's
      old[1] = cur[1]; // captured in closure created with `arrInvoker`
      on[name]  = old;
    } else {
      old[0] = cur;
      on[name] = old;
    }
  }
}

module.exports = {create: updateEventListeners, update: updateEventListeners};

},{"../is":4}],7:[function(require,module,exports){
function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props || {}, props = vnode.data.props || {};
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur) {
      elm[key] = cur;
    }
  }
}

module.exports = {create: updateProps, update: updateProps};

},{}],8:[function(require,module,exports){
var raf = requestAnimationFrame || setTimeout;
var nextFrame = function(fn) { raf(function() { raf(fn); }); };

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
}

function updateStyle(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldStyle = oldVnode.data.style || {},
      style = vnode.data.style || {},
      oldHasDel = 'delayed' in oldStyle;
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style, name, elm = vnode.elm, s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name, elm = vnode.elm, idx, i = 0, maxDur = 0,
      compStyle, style = s.remove, amount = 0;
  var applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if(applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function(ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

module.exports = {create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle};

},{}],9:[function(require,module,exports){
// jshint newcap: false
/* global require, module, document, Element */
'use strict';

var VNode = require('./vnode');
var is = require('./is');

function isUndef(s) { return s === undefined; }

function emptyNodeAt(elm) {
  return VNode(elm.tagName, {}, [], undefined, elm);
}

var emptyNode = VNode('', {}, [], undefined, undefined);

var insertedVnodeQueue;

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (!isUndef(key)) map[key] = i;
  }
  return map;
}

function createRmCb(parentElm, childElm, listeners) {
  return function() {
    if (--listeners === 0) parentElm.removeChild(childElm);
  };
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules) {
  var i, j, cbs = {};
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function createElm(vnode) {
    var i, data = vnode.data;
    if (!isUndef(data)) {
      if (!isUndef(i = data.hook) && !isUndef(i = i.init)) i(vnode);
      if (!isUndef(i = data.vnode)) vnode = i;
    }
    var elm, children = vnode.children, sel = vnode.sel;
    if (!isUndef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = !isUndef(data) && !isUndef(i = data.ns) ? document.createElementNS(i, tag)
                                                                : document.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot+1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          elm.appendChild(createElm(children[i]));
        }
      } else if (is.primitive(vnode.text)) {
        elm.appendChild(document.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (!isUndef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = document.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      parentElm.insertBefore(createElm(vnodes[startIdx]), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i = vnode.data, j;
    if (!isUndef(i)) {
      if (!isUndef(i = i.hook) && !isUndef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (!isUndef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i, listeners, rm, ch = vnodes[startIdx];
      if (!isUndef(ch)) {
        invokeDestroyHook(ch);
        listeners = cbs.remove.length + 1;
        rm = createRmCb(parentElm, ch.elm, listeners);
        for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
        if (!isUndef(i = ch.data) && !isUndef(i = i.hook) && !isUndef(i = i.remove)) {
          i(ch, rm);
        } else {
          rm();
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh) {
    var oldStartIdx = 0, newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode);
        parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode);
        parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) { // New element
          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode) {
    var i, hook;
    if (!isUndef(i = vnode.data) && !isUndef(hook = i.hook) && !isUndef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    if (!isUndef(i = oldVnode.data) && !isUndef(i = i.vnode)) oldVnode = i;
    if (!isUndef(i = vnode.data) && !isUndef(i = i.vnode)) vnode = i;
    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!isUndef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (!isUndef(i) && !isUndef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (!isUndef(oldCh) && !isUndef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch);
      } else if (!isUndef(ch)) {
        addVnodes(elm, null, ch, 0, ch.length - 1);
      } else if (!isUndef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
    } else if (oldVnode.text !== vnode.text) {
      elm.textContent = vnode.text;
    }
    if (!isUndef(hook) && !isUndef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
    return vnode;
  }

  return function(oldVnode, vnode) {
    var i;
    insertedVnodeQueue = [];
    if (oldVnode instanceof Element) {
      oldVnode = emptyNodeAt(oldVnode);
    }
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
    patchVnode(oldVnode, vnode);
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    insertedVnodeQueue = undefined;
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

module.exports = {init: init};

},{"./is":4,"./vnode":10}],10:[function(require,module,exports){
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.step = step;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _subscription = require('./subscription');

var _subscription2 = _interopRequireDefault(_subscription);

var _snabbdom = require('snabbdom');

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var patch = _snabbdom2['default'].init([// Init patch function with choosen modules
require('snabbdom/modules/class'), // makes it easy to toggle classes
require('snabbdom/modules/props'), // for setting properties on DOM elements
require('snabbdom/modules/style'), // handles styling on elements with support for animations
require('snabbdom/modules/eventlisteners')]);

var postEvalQueue = [];
function onPostEval(cb) {
  postEvalQueue.push(cb);
}

function doPostEval() {
  for (var i = 0; i < postEvalQueue.length; i++) {
    postEvalQueue[i]();
  }
  postEvalQueue = [];
}

var actions = [];
var currentEvent = null;

function matchEvent(sub) {
  if (!sub.event) {
    if (sub.match(currentEvent)) {
      sub.event = sub.handler(currentEvent);
      onPostEval(function () {
        return sub.event = null;
      });
    }
  }
  return sub.event;
}

var frameRequested = false;
var lastVNode = {};
function update() {
  var app = App.root;
  lastVNode.value = app.view();
  doPostEval();
  if (!frameRequested) {
    window.requestAnimationFrame(function () {
      frameRequested = false;
      app.vnode = patch(app.vnode, lastVNode.value);
    });
    frameRequested = true;
  }
}

var App = (function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'on',

    // on : eventId<a> -> Subscription a
    value: function on(eventId) {
      var _this = this;

      return new _subscription2['default'](eventId, this, null, function (ev) {
        return ev && ev.id === eventId && _this === ev.app;
      });
    }
  }, {
    key: 'tap',
    value: function tap(eventId, action) {
      actions.push({ eventId: eventId, app: this, action: action });
    }
  }, {
    key: 'publish',
    value: function publish(id, data) {
      var _this2 = this;

      var hasData = arguments.length > 1;

      return function (ev) {
        onPostEval(function () {
          return currentEvent = null;
        });
        //1- create event
        currentEvent = new _event2['default'](id, _this2, Date.now(), hasData ? data : ev, ev);

        //2-notify listeners
        for (var i = 0, len = actions.length; i < len; i++) {
          var a = actions[i];
          if (a.eventId === id && a.app === _this2) a.action(currentEvent);
        }

        //3- update UI
        update();
      };
    }
  }, {
    key: 'mount',

    // App lifecycle : mount, update, unmount
    value: function mount(elm) {
      elm = elm instanceof Element ? elm : document.querySelector(elm);
      if (!(elm instanceof Element)) throw 'App.mount needs a valid DOM Element as argument';
      this.vnode = elm;
      App.root = this;
      update();
    }
  }]);

  return App;
})();

exports.App = App;

function step(acc) {
  for (var _len = arguments.length, subs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    subs[_key - 1] = arguments[_key];
  }

  var updated = undefined,
      prevAcc = acc;
  return function (prev) {
    if (prev) return prevAcc;
    if (!updated) {
      for (var i = 0; i < subs.length; i++) {
        var sub = subs[i];
        var ev = matchEvent(sub);
        if (ev) {
          acc = ev.data;
          break;
        }
      }
      updated = true;
      onPostEval(function () {
        updated = false;
        prevAcc = acc;
      });
    }
    return acc;
  };
}

// attaches event listeners

},{"./event":13,"./subscription":14,"snabbdom":9,"snabbdom/modules/class":5,"snabbdom/modules/eventlisteners":6,"snabbdom/modules/props":7,"snabbdom/modules/style":8}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Const = function Const(v) {
  return function (_) {
    return v;
  };
};
exports.Const = Const;
var Id = function Id(v) {
  return v;
};
exports.Id = Id;
var Fn = function Fn(v) {
  return isUndef(v) ? Id : isFunction(v) ? v : Const(v);
};

exports.Fn = Fn;
var isUndef = function isUndef(v) {
  return v === undefined || v === null;
};
exports.isUndef = isUndef;
var isArray = Array.isArray;
exports.isArray = isArray;
var isObject = function isObject(arg) {
  return arg !== null && typeof arg === 'object';
};
exports.isObject = isObject;
var isFunction = function isFunction(arg) {
  return typeof arg === 'function';
};
exports.isFunction = isFunction;
var isString = function isString(arg) {
  return typeof arg === 'string';
};

exports.isString = isString;
var eachKey = function eachKey(obj, cb) {
  return Object.keys(obj).forEach(function (key) {
    return cb(key, obj[key]);
  });
};
exports.eachKey = eachKey;
var extend = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    eachKey(source, function (key, val) {
      return target[key] = val;
    });
  }
  return target;
};

exports.extend = extend;
var add = function add(arr, el) {
  return arr.concat(el);
};

exports.add = add;
var remove = function remove(arr, el) {
  var idx = arr.indexOf(el);
  if (idx >= 0) {
    var copy = arr.slice();
    copy.splice(idx, 1);
    return copy;
  }
  return arr;
};
exports.remove = remove;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = (function () {

  // constructor a : (String, App, Number, a) -> Event a

  function Event(id, app, time, data, source) {
    _classCallCheck(this, Event);

    this.id = id;
    this.app = app;
    this.time = time;
    this.data = data;
    this.source = source;
  }

  _createClass(Event, [{
    key: "map",

    // map : (Event a, a -> b) -> Event b
    value: function map(f) {
      return new Event(this.id, this.app, this.time, f(this.data, this.source), this.source);
    }
  }]);

  return Event;
})();

exports["default"] = Event;
module.exports = exports["default"];

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _base = require("./base");

var Subscription = (function () {

  // constructor : (String, App, Event a -> Event b) -> Subscription b

  function Subscription(id, app, handler, match) {
    _classCallCheck(this, Subscription);

    this.id = id;
    this.app = app;
    this.handler = (0, _base.Fn)(handler);
    this.match = match;
  }

  _createClass(Subscription, [{
    key: "map",

    // map : Subscription a, (a -> b), Subscription b
    value: function map(f) {
      var _this = this;

      f = (0, _base.Fn)(f);
      return new Subscription(this.id, this.app, function (ev) {
        return _this.handler(ev).map(f);
      }, this.match);
    }
  }, {
    key: "filter",

    // filter : (Subscription a, a -> aBool) -> Subscription a
    value: function filter(p) {
      var _this2 = this;

      return new Subscription(this.id, this.app, this.handler, function (ev) {
        return _this2.match(ev) && p(ev.data);
      });
    }
  }, {
    key: "merge",

    // merge : (Subscription a, Subscription b) -> Subscription a | b
    value: function merge(sub2) {
      return Subscription.merge(this, sub2);
    }
  }]);

  return Subscription;
})();

Subscription.merge = function () {
  for (var _len = arguments.length, subs = Array(_len), _key = 0; _key < _len; _key++) {
    subs[_key] = arguments[_key];
  }

  var match = function match(ev) {
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].match(ev)) return i;
    }
    return -1;
  };

  var idx = undefined;
  return new Subscription(null, null, function (ev) {
    return (idx = match(ev)) >= 0 ? subs[idx].handler(ev) : void 0;
  }, function (ev) {
    return match(ev) >= 0;
  });
};

exports["default"] = Subscription;
module.exports = exports["default"];

},{"./base":12}]},{},[1]);
