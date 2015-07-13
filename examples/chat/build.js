(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../../src/app');

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _srcBase = require('../../../src/base');

var _threadList = require('./threadList');

var _threadList2 = _interopRequireDefault(_threadList);

var _messageList = require('./messageList');

var _messageList2 = _interopRequireDefault(_messageList);

var _utils = require('./utils');

function markMsgsAsRead(messages, thread) {
  var msgs = messages.slice();
  for (var i = 0; i < msgs.length; i++) {
    var msg = msgs[i];
    if (msg.threadID === thread.id) msgs[i] = (0, _srcBase.extend)({}, msg, { isRead: true });
  }
  return msgs;
}

var app = new _srcApp.App();
var $receiveMsgs = app.publish('receive_messages');

var fetched = false;
app.tap('fecth', function () {
  return setTimeout(function () {
    if (!fetched) {
      fetched = true;
      $receiveMsgs((0, _utils.getMessages2)());
    }
  }, 2000);
});

var allMessages = (0, _srcApp.step)([], app.on('receive_messages').map(function (msgs) {
  return markMsgsAsRead(allMessages(-1).concat(msgs), threadItems.currentThread());
}), app.on('thread.click').map(function (_) {
  return markMsgsAsRead(allMessages(-1), threadItems.currentThread());
}));

var threadItems = (0, _threadList2['default'])(app, allMessages);
var messageItems = (0, _messageList2['default'])(threadItems.currentThread, allMessages, app);

app.view = function () {
  return (0, _snabbdomH2['default'])('div.chatapp', {}, [threadItems.view(), messageItems.view(), (0, _snabbdomH2['default'])('button', {
    props: { disabled: fetched },
    on: { click: app.publish('fecth') }
  }, 'Check new messages')]);
};

setTimeout(function () {
  return $receiveMsgs((0, _utils.getMessages)());
}, 10);

app.mount('#chatapp');

},{"../../../src/app":13,"../../../src/base":14,"./messageList":2,"./threadList":3,"./utils":4,"snabbdom/h":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../../src/app');

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

function findMsg(id, messages) {
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    if (msg.id === id) return msg;
  }
}

function messageList(currentThread, allMessages) {

  var app = new _srcApp.App();

  app.view = function () {
    var thread = currentThread(),
        messages = allMessages().filter(function (message) {
      return message.threadID === thread.id;
    }),
        oldMessages = allMessages(-1);

    return (0, _snabbdomH2['default'])('div.message-section', {}, [(0, _snabbdomH2['default'])('h3.message-thread-heading', {}, thread.name), (0, _snabbdomH2['default'])('ul.message-list', {}, messages.map(function (item, ind) {
      return messageItem(item, findMsg(item.id, oldMessages));
    }))]);
  };

  function messageItem(message, oldMsg) {

    return (0, _snabbdomH2['default'])('li.message-list-item', {
      key: message.id,
      'class': { highlight: !oldMsg || !oldMsg.isRead }
    }, [(0, _snabbdomH2['default'])('h5.message-author-name', message.authorName), (0, _snabbdomH2['default'])('div.message-time', new Date(message.timestamp).toLocaleTimeString()), (0, _snabbdomH2['default'])('div.message-text', message.text)]);
  }

  return app;
}

exports['default'] = messageList;
module.exports = exports['default'];

},{"../../../src/app":13,"snabbdom/h":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcApp = require('../../../src/app');

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _utils = require('./utils');

function addThreads(threads, rawMessages) {
  var result = threads.slice();
  for (var i = 0; i < rawMessages.length; i++) {
    var msg = rawMessages[i];
    var thread = getThread(result, msg.threadID);
    if (!thread) {
      result.push(thread = { id: msg.threadID, name: msg.threadName });
    }
    if (!thread.lastMessage || thread.lastMessage.timestamp < msg.timestamp) thread.lastMessage = msg;
  }

  return result;
}

function getThread(threads, id) {
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    if (thread.id === id) return thread;
  }
}

function lastMessage(thread, messages) {
  var result = undefined;
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    if (msg.threadID === thread.id && (!result || result.timestamp < msg.timestamp)) result = msg;
  }
  return result;
}

var EMPTY_THREAD = {};

function threadList(channel, allMessages) {

  var app = new _srcApp.App();

  app.threads = (0, _srcApp.step)([], channel.on('receive_messages').map(function (msgs) {
    return addThreads(app.threads(-1), msgs);
  }));

  app.unreadCount = function () {
    return (0, _utils.count)(app.threads(), function (thread) {
      return !lastMessage(thread, allMessages()).isRead;
    });
  };
  app.currentThread = (0, _srcApp.step)(app.threads()[0] || EMPTY_THREAD, channel.on('receive_messages').map(function (_) {
    return app.currentThread(-1) === EMPTY_THREAD ? app.threads()[0] : app.currentThread(-1);
  }), channel.on('thread.click'));

  app.view = function () {

    var unreadCount = app.unreadCount();
    var currentThread = app.currentThread();

    return (0, _snabbdomH2['default'])('div.thread-section', {}, [(0, _snabbdomH2['default'])('div.thread-count', {
      'class': { hide: unreadCount === 0 }
    }, [(0, _snabbdomH2['default'])('span', 'Unread threads: ' + unreadCount)]), (0, _snabbdomH2['default'])('ul.thread-list', app.threads().map(function (item) {
      return threadItem(item, currentThread === item);
    }))]);
  };

  return app;

  function threadItem(thread, isCurrent) {
    var lastMsg = lastMessage(thread, allMessages());

    return (0, _snabbdomH2['default'])('li.thread-list-item', {
      key: thread.id,
      'class': { active: isCurrent },
      on: {
        click: channel.publish('thread.click', thread)
      }
    }, [(0, _snabbdomH2['default'])('h5.thread-name', thread.name), (0, _snabbdomH2['default'])('div.thread-time', new Date(lastMsg.timestamp).toLocaleTimeString()), (0, _snabbdomH2['default'])('div.thread-last-message', lastMsg.text)]);
  }
}

exports['default'] = threadList;
module.exports = exports['default'];

},{"../../../src/app":13,"./utils":4,"snabbdom/h":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.memo1 = memo1;
exports.count = count;
exports.getMessages = getMessages;
exports.getMessages2 = getMessages2;
var konst = function konst(val) {
  return function () {
    return val;
  };
};

exports.konst = konst;

function memo1(fn) {
  var lastArg = undefined,
      lastResult = undefined;
  return function (arg) {
    if (arg === lastArg) return lastResult;else {
      lastArg = arg;
      lastResult = fn(arg);
      return lastResult;
    }
  };
}

function count(array, predicate) {
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) result++;
  }
  return result;
}

function getMessages() {

  return [{
    id: 'm_1',
    threadID: 't_1',
    threadName: 'Jing and Bill',
    authorName: 'Bill',
    text: 'Hey Jing, want to give a Flux talk at ForwardJS?',
    timestamp: Date.now() - 99999
  }, {
    id: 'm_2',
    threadID: 't_1',
    threadName: 'Jing and Bill',
    authorName: 'Bill',
    text: 'Seems like a pretty cool conference.',
    timestamp: Date.now() - 89999
  }, {
    id: 'm_3',
    threadID: 't_1',
    threadName: 'Jing and Bill',
    authorName: 'Jing',
    text: 'Sounds good.  Will they be serving dessert?',
    timestamp: Date.now() - 79999
  }, {
    id: 'm_4',
    threadID: 't_2',
    threadName: 'Dave and Bill',
    authorName: 'Bill',
    text: 'Hey Dave, want to get a beer after the conference?',
    timestamp: Date.now() - 69999
  }, {
    id: 'm_5',
    threadID: 't_2',
    threadName: 'Dave and Bill',
    authorName: 'Dave',
    text: 'Totally!  Meet you at the hotel bar.',
    timestamp: Date.now() - 59999
  }, {
    id: 'm_6',
    threadID: 't_3',
    threadName: 'Functional Heads',
    authorName: 'Bill',
    text: 'Hey Brian, are you going to be talking about functional stuff?',
    timestamp: Date.now() - 49999
  }, {
    id: 'm_7',
    threadID: 't_3',
    threadName: 'Bill and Brian',
    authorName: 'Brian',
    text: 'At ForwardJS?  Yeah, of course.  See you there!',
    timestamp: Date.now() - 39999
  }];
}

function getMessages2() {

  return [{
    id: 'm_8',
    threadID: 't_1',
    threadName: 'Jing and Bill',
    authorName: 'Bill',
    text: 'You you must watch out for your line',
    timestamp: Date.now() - 29999
  }, {
    id: 'm_9',
    threadID: 't_3',
    threadName: 'Functional Heads',
    authorName: 'Bill',
    text: 'Ok, then',
    timestamp: Date.now() - 19999
  }];
}

},{}],5:[function(require,module,exports){
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

},{"./is":6,"./vnode":12}],6:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"../is":6}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./is":6,"./vnode":12}],12:[function(require,module,exports){
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};

},{}],13:[function(require,module,exports){
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

},{"./event":15,"./subscription":16,"snabbdom":11,"snabbdom/modules/class":7,"snabbdom/modules/eventlisteners":8,"snabbdom/modules/props":9,"snabbdom/modules/style":10}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./base":14}]},{},[1]);
