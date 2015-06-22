(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../../src/app');

var _srcApp2 = _interopRequireDefault(_srcApp);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var app = new _srcApp2['default'](),
    post = _srcApp2['default'].post;

var id = 0;
var value = function value(ev) {
  return ev.target.value;
};
var leftTodos = function leftTodos(todos) {
  return todos.filter(function (todo) {
    return !todo.done();
  });
};
var toggleAll$ = app.on('toggleAll$').map(function (ev) {
  return ev.target.checked;
});
var enter$ = app.on('keydown$').filter(function (ev) {
  return ev.keyCode === 13;
});

app.todos = app.arrayB({
  add: enter$.map(value).map(function (title) {
    return (0, _task2['default'])(++id, title, toggleAll$);
  }),
  remove: post.on('remove$'),
  other: app.on('clearDone$').map(function () {
    return leftTodos;
  })
});

app.input = app.scanB(function (_, e) {
  return e.keyCode === 13 ? '' : e.target.value;
}, '', app.on('keydown$'));
app.activeView = app.scanB(function () {
  return window.location.hash.substr(2) || 'all';
}, 'all', app.on('viewChange$'));

window.addEventListener('hashchange', app.publish('viewChange$'));

app.view = function () {
  var todos = app.todos(),
      hasTodos = todos.length,
      dones = todos.map(function (todo) {
    return todo.done();
  }),
      left = dones.reduce(function (acc, done) {
    return acc + (!done ? 1 : 0);
  }, 0),
      filteredTodos = app.activeView() === 'all' ? todos : app.activeView() === 'active' ? dones.filter(function (done) {
    return !done;
  }) : todos.filter(function (done) {
    return done;
  });
  return (0, _snabbdomH2['default'])('section.todoapp', [(0, _snabbdomH2['default'])('header.header', [(0, _snabbdomH2['default'])('h1', 'todos'), (0, _snabbdomH2['default'])('input#new-todo.new-todo', {
    props: { placeholder: 'What needs to be done?', value: app.input() },
    on: { keydown: app.publish('keydown$') }
  })]), (0, _snabbdomH2['default'])('section.main', {
    style: { display: hasTodos ? 'block' : 'none' }
  }, [(0, _snabbdomH2['default'])('input.toggle-all', { props: { type: 'checkbox', checked: left === 0 }, on: { click: app.publish('toggleAll$') } }), (0, _snabbdomH2['default'])('ul.todo-list', filteredTodos.map(function (todo) {
    return todo.view();
  }))]), (0, _snabbdomH2['default'])('footer.footer', {
    style: { display: hasTodos ? 'block' : 'none' }
  }, [(0, _snabbdomH2['default'])('span.todo-count', [(0, _snabbdomH2['default'])('strong', left), ' item' + (left === 1 ? '' : 's') + ' left']), (0, _snabbdomH2['default'])('ul.filters', [(0, _snabbdomH2['default'])('li', [(0, _snabbdomH2['default'])('a', { 'class': { selected: app.activeView() === 'all' }, props: { href: '#/' } }, 'All')]), (0, _snabbdomH2['default'])('li', [(0, _snabbdomH2['default'])('a', { 'class': { selected: app.activeView() === 'active' }, props: { href: '#/active' } }, 'Active')]), (0, _snabbdomH2['default'])('li', [(0, _snabbdomH2['default'])('a', { 'class': { selected: app.activeView() === 'completed' }, props: { href: '#/completed' } }, 'Completed')])]), (0, _snabbdomH2['default'])('button.clear-completed', { on: { click: app.publish('clearDone$') } }, 'Clear completed')])]);
};

window.addEventListener('DOMContentLoaded', function () {
  app.mount('.todoapp');
});

},{"../../../src/app":11,"./task":2,"snabbdom/h":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../../src/app');

var _srcApp2 = _interopRequireDefault(_srcApp);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

function task(id, title, toggleAll$) {

  var app = new _srcApp2['default'](),
      post = _srcApp2['default'].post;

  app.id = id;
  app.title = app.scanB(function (_, ev) {
    return ev.target.value;
  }, title, app.on('enter$'));
  app.done = app.when(false, [app.on('toggle$'), function (v, _) {
    return !v;
  }, toggleAll$, function (_, v) {
    return v;
  }]);

  var editing = app.when(false, [app.on('startEditing$'), function () {
    return true;
  }, app.on('stopEditing$').merge(app.on('enter$')), function () {
    return false;
  }]);

  function focus(oldVnode, vnode) {
    if (oldVnode.data['class'].editing === false && vnode.data['class'].editing === true) {
      vnode.elm.querySelector('input.edit').focus();
    }
  }

  app.view = function () {
    return (0, _snabbdomH2['default'])('li', {
      'class': { completed: app.done() && !editing(), editing: editing() },
      hook: { update: focus },
      key: app.id
    }, [(0, _snabbdomH2['default'])('div.view', [(0, _snabbdomH2['default'])('input.toggle', {
      props: { checked: app.done(), type: 'checkbox' },
      on: { click: app.publish('toggle$') }
    }), (0, _snabbdomH2['default'])('label', {
      on: { dblclick: app.publish('startEditing$') }
    }, app.title()), (0, _snabbdomH2['default'])('button.destroy', { on: { click: post.publish('remove$', app) } })]), (0, _snabbdomH2['default'])('input.edit', {
      props: { value: app.title() },
      on: {
        blur: app.publish('stopEditing$'),
        keydown: app.publishIf('enter$', function (ev) {
          return ev.keyCode === 13;
        })
      }
    })]);
  };

  return app;
}

exports['default'] = task;
module.exports = exports['default'];

},{"../../../src/app":11,"snabbdom/h":3}],3:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _base = require('./base');

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _subscription = require('./subscription');

var _subscription2 = _interopRequireDefault(_subscription);

var _snabbdom = require('snabbdom');

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var patch = _snabbdom2['default'].init([// Init patch function with choosen modules
require('snabbdom/modules/class'), // makes it easy to toggle classes
require('snabbdom/modules/props'), // for setting properties on DOM elements
require('snabbdom/modules/style'), // handles styling on elements with support for animations
require('snabbdom/modules/eventlisteners'), // attaches event listeners
{ post: doPostPatch }]);

var postPatchQueue = [];
function onPostPacth(cb) {
  postPatchQueue.push(cb);
}

function doPostPatch() {
  for (var i = 0; i < postPatchQueue.length; i++) {
    postPatchQueue[i]();
  }
  postPatchQueue = [];
}

var eagerBehs = [];
function updatedEagerBehs() {
  for (var i = 0, len = eagerBehs.length; i < len; i++) {
    eagerBehs[i]();
  }
}

// t : Number
// B a : t -> a
// Beh : (App, () -> a) -> B a
function Beh(app, f) {

  function b() {
    return f();
  }

  b.$$beh = true;
  b.keepAlive = function () {
    eagerBehs.push(b);return b;
  };

  b.map = function (f) {
    return Beh(app, function () {
      return f(b());
    });
  };

  b['switch'] = function (sub) {
    var curB = b,
        updated = undefined;
    return Beh(app, function () {
      if (!updated) {
        var ev = app.findEvent(sub);
        if (ev) {
          curB = ev.data && ev.data.$$beh ? ev.data : app.constB(ev.data);
        }
        updated = true;
        onPostPacth(function () {
          return updated = false;
        });
      }
      return curB();
    });
  };

  b.until = function (sub) {
    var curB = b,
        ok;
    return Beh(app, function () {
      if (ok) return curB();
      var ev = app.findEvent(sub);
      if (ev) {
        curB = ev.data.$$beh ? ev.data : app.constB(ev.data);
        ok = true;
      }
      return curB();
    });
  };

  return b;
}

var App = (function () {
  // constructor : App -> App

  function App(parent) {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'on',

    // on : eventId<a> -> Subscription a
    value: function on(eventId, app) {
      return new _subscription2['default'](eventId, app || this);
    }
  }, {
    key: 'view',
    value: function view() {
      return (0, _snabbdomH2['default'])('h1', 'Hello FRP');
    }
  }, {
    key: 'mount',
    value: function mount(elm) {
      elm = elm instanceof Element ? elm : document.querySelector(elm);
      if (!(elm instanceof Element)) throw 'App.mount need a valid DOM Element as argument';
      App.root = this;
      this.elm = patch(elm, this.view());
    }
  }, {
    key: 'publish',
    value: function publish(id, data) {
      var _this = this;

      var hasData = arguments.length > 1;
      return function (ev) {
        var root = App.root;
        root.event = new _event2['default'](id, _this, Date.now(), hasData ? data : ev, ev);
        updatedEagerBehs();
        if (root.elm) root.elm = patch(root.elm, root.view());
      };
    }
  }, {
    key: 'publishIf',
    value: function publishIf(id, pred, data) {
      var _this2 = this;

      var hasData = arguments.length > 2;
      return function (ev) {
        if (!pred(ev)) return;
        var root = App.root;
        root.event = new _event2['default'](id, _this2, Date.now(), hasData ? data : ev);
        updatedEagerBehs();
        if (root.elm) root.elm = patch(root.elm, root.view());
      };
    }
  }, {
    key: 'findEvent',
    value: function findEvent(sub) {
      if (!sub.event) {
        var root = App.root;
        if (sub.match(root.event)) {
          sub.event = sub.handler(root.event);
          onPostPacth(function () {
            return sub.event = null;
          });
        }
      }
      return sub.event;
    }
  }, {
    key: 'B',
    value: function B(f) {
      return Beh(this, f);
    }
  }, {
    key: 'constB',
    value: function constB(v) {
      return this.B((0, _base.Const)(v));
    }
  }, {
    key: 'step',
    value: function step(start, sub) {
      return this.scanB(function (_, v) {
        return v;
      }, start, sub);
    }
  }, {
    key: 'scanB',
    value: function scanB(f, acc, sub) {
      var _this3 = this;

      var updated = undefined;
      return this.B(function () {
        if (!updated) {
          var ev = _this3.findEvent(sub);
          if (ev) acc = f(acc, ev.data);
          updated = true;
          onPostPacth(function () {
            return updated = false;
          });
        }
        return acc;
      });
    }
  }, {
    key: 'when',

    // cases : [(Subscription a , a -> b)]
    value: function when(acc, cases) {
      var _this4 = this;

      var updated = undefined,
          events = [],
          fns = [];
      for (var i = 0; i < cases.length - 1; i += 2) {
        events.push(cases[i]);
        fns.push((0, _base.Fn)(cases[i + 1]));
      }
      return this.B(function () {
        if (!updated) {
          var ev = undefined;
          updated = true;
          onPostPacth(function () {
            return updated = false;
          });
          for (var i = 0; i < events.length; i++) {
            ev = _this4.findEvent(events[i]);
            if (ev) {
              acc = fns[i](acc, ev.data);
              return acc;
            }
          }
        }
        return acc;
      });
    }
  }, {
    key: 'arrayB',
    value: function arrayB(events) {
      var state = arguments[1] === undefined ? [] : arguments[1];

      var cases = [];
      if (events.add) {
        cases.push(events.add);
        cases.push(_base.add);
      }
      if (events.remove) {
        cases.push(events.remove);
        cases.push(_base.remove);
      }
      if (events.reverse) {
        cases.push(events.reverse);
        cases.push(function (arr) {
          return arr.slice().reverse();
        });
      }
      if (events.other) {
        cases.push(events.other);
        cases.push(function (arr, fn) {
          return fn(arr);
        });
      }
      return this.when(state, cases);
    }
  }, {
    key: 'prop',
    value: function prop(val) {
      function p() {
        return val;
      }
      p.set = function (v) {
        return val = v;
      };
      return p;
    }
  }]);

  return App;
})();

App.post = new App();

exports['default'] = App;
module.exports = exports['default'];

},{"./base":12,"./event":13,"./subscription":14,"snabbdom":9,"snabbdom/h":3,"snabbdom/modules/class":5,"snabbdom/modules/eventlisteners":6,"snabbdom/modules/props":7,"snabbdom/modules/style":8}],12:[function(require,module,exports){
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
  return v === undefined;
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

  function Event(id, app, time, data, domEvent) {
    _classCallCheck(this, Event);

    this.id = id;
    this.app = app;
    this.time = time;
    this.data = data;
    this.domEvent = domEvent;
  }

  _createClass(Event, [{
    key: "map",

    // map : (Event a, a -> b) -> Event b
    value: function map(f) {
      return new Event(this.id, this.app, this.time, f(this.data, this.domEvent), this.domEvent);
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
    var _this = this;

    _classCallCheck(this, Subscription);

    this.id = id;
    this.app = app;
    this.handler = (0, _base.Fn)(handler);
    this.match = match || function (ev) {
      return ev && ev.id === _this.id && _this.app === ev.app;
    };
  }

  _createClass(Subscription, [{
    key: "map",

    // map : Subscription a, (a -> b), Subscription b
    value: function map(f) {
      var _this2 = this;

      f = (0, _base.Fn)(f);
      return new Subscription(this.id, this.app, function (ev) {
        return _this2.handler(ev).map(f);
      }, this.match);
    }
  }, {
    key: "tap",

    // tap : Subscription a, (a -> ()), Subscription a
    value: function tap(action) {
      var _this3 = this;

      return new Subscription(this.id, this.app, function (ev) {
        action(ev);
        return _this3.handler(ev);
      }, this.match);
    }
  }, {
    key: "filter",

    // filter : (Subscription a, a -> aBool) -> Subscription a
    value: function filter(p) {
      var _this4 = this;

      return new Subscription(this.id, this.app, this.handler, function (ev) {
        return _this4.match(ev) && p(ev.data);
      });
    }
  }, {
    key: "merge",

    // merge : (Subscription a, Subscription b) -> Subscription a | b
    value: function merge(sub2) {
      var _this5 = this;

      return new Subscription(this.id, this.app, function (ev) {
        return _this5.match(ev) ? _this5.handler(ev) : sub2.handler(ev);
      }, function (ev) {
        return _this5.match(ev) || sub2.match(ev);
      });
    }
  }]);

  return Subscription;
})();

exports["default"] = Subscription;
module.exports = exports["default"];

},{"./base":12}]},{},[1]);
