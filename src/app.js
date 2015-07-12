"use strict";

import Event from './event';
import Subscription from './subscription';
import snabbdom from 'snabbdom';

const patch = snabbdom.init([                 // Init patch function with choosen modules
  require('snabbdom/modules/class'),          // makes it easy to toggle classes
  require('snabbdom/modules/props'),          // for setting properties on DOM elements
  require('snabbdom/modules/style'),          // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

let postEvalQueue = [];
function onPostEval(cb) {
  postEvalQueue.push(cb);
}

function doPostEval() {
  for (var i = 0; i < postEvalQueue.length; i++) {
    postEvalQueue[i]();
  }
  postEvalQueue = [];
}

const actions = [];
let currentEvent = null;

function matchEvent(sub) {
  if(!sub.event) {
    if(sub.match(currentEvent)) {
      sub.event = sub.handler(currentEvent);
      onPostEval(() => sub.event = null);
    }  
  }
  return sub.event;
}

let frameRequested = false;
let lastVNode = {};
function update() {
  const app = App.root;
  lastVNode.value = app.view();
  doPostEval();
  if(!frameRequested)  {
    window.requestAnimationFrame( () => {
      frameRequested = false;
      app.vnode = patch(app.vnode, lastVNode.value);
    });
    frameRequested = true;
  }
}

export class App {
  
  // on : eventId<a> -> Subscription a
  on(eventId) {
    return new Subscription(eventId, this, null, ev => ev && ev.id === eventId && this === ev.app);
  }
  
  tap(eventId, action) {
    actions.push({eventId, app: this, action});
  }

  publish(id, data) {
    const hasData = arguments.length > 1;
    
    return ev => {
      onPostEval( () => currentEvent = null );
     //1- create event
      currentEvent = new Event(id, this, Date.now(), hasData ? data : ev, ev);
      
      //2-notify listeners
      for (var i = 0, len = actions.length; i < len; i++) {
        let a = actions[i];
        if(a.eventId === id && a.app === this)
          a.action(currentEvent);
      }
      
      //3- update UI
      update();
    };
  }
  
  // App lifecycle : mount, update, unmount
  mount(elm) {
    elm = elm instanceof Element ? elm : document.querySelector(elm);
    if(!(elm instanceof Element))
      throw "App.mount needs a valid DOM Element as argument";
    this.vnode = elm;
    App.root = this;
    update();
  }
}

export function step(acc, ...subs) {
  let updated, prevAcc = acc;
  return prev => {
    if(prev) return prevAcc;
    if(!updated) {
      for (var i = 0; i < subs.length; i++) {
        let sub = subs[i];
        let ev = matchEvent(sub);
        if(ev) {
          acc = ev.data;
          break;
        }
      }
      updated = true;
      onPostEval(() => {
        updated = false;
        prevAcc = acc;
      });
    }
    return acc;
  };
}