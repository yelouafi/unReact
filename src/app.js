"use strict";

import { Const, add, remove, Fn } from './base';
import Event from './event';
import Subscription from './subscription';
import snabbdom from 'snabbdom';
import h from 'snabbdom/h';

const patch = snabbdom.init([                 // Init patch function with choosen modules
  require('snabbdom/modules/class'),          // makes it easy to toggle classes
  require('snabbdom/modules/props'),          // for setting properties on DOM elements
  require('snabbdom/modules/style'),          // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners'), // attaches event listeners
  { post: doPostPatch }
]);

let postPatchQueue = [];
function onPostPacth(cb) {
  postPatchQueue.push(cb);
}

function doPostPatch() {
  for (var i = 0; i < postPatchQueue.length; i++) {
    postPatchQueue[i]();
  }
  postPatchQueue = [];
}

const eagerBehs = [];
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
  b.keepAlive = () => { eagerBehs.push(b); return b; };
  
  b.map = f => Beh(app, () => f(b()));
  
  b.switch = sub => {
    let curB = b, updated;
    return Beh(app, function() {
      if(!updated) {
        var ev = app.findEvent(sub);
        if(ev) {
          curB = ev.data && ev.data.$$beh ? ev.data : app.constB(ev.data);
        }
        updated = true;
        onPostPacth( () => updated = false );
      }
      return curB();
    });
  };

  b.until = sub => {
    var curB = b, ok;
    return Beh(app, function() {
      if(ok) return curB();
      var ev = app.findEvent(sub);
      if(ev) {
        curB = ev.data.$$beh ? ev.data : app.constB(ev.data);
        ok = true;
      }                
      return curB();
    });
  };

  return b;
}


class App {
  // constructor : App -> App
  constructor(parent) {}
  
  // on : eventId<a> -> Subscription a
  on(eventId, app) {
    return new Subscription(eventId, app || this);
  }
  
  view() {
    return h('h1', 'Hello FRP');
  }
  
  mount(elm) {
    elm = elm instanceof Element ? elm : document.querySelector(elm);
    if(!(elm instanceof Element))
      throw "App.mount need a valid DOM Element as argument";
    App.root = this;
    this.elm = patch(elm, this.view());
  }
  
  publish(id, data) {
    const hasData = arguments.length > 1;
    return ev => {
        let root = App.root;
        root.event = new Event(id, this, Date.now(), hasData ? data : ev, ev);
        updatedEagerBehs();
        if(root.elm)
          root.elm = patch(root.elm, root.view());
      };
  };
  
  publishIf(id, pred, data) {
    const hasData = arguments.length > 2;
    return ev => {
        if(!pred(ev)) return;
        let root = App.root;
        root.event = new Event(id, this, Date.now(), hasData ? data : ev);
        updatedEagerBehs();
        if(root.elm)
          root.elm = patch(root.elm, root.view());
      };
  };
  
  findEvent(sub) {
    if(!sub.event) {
      let root = App.root;
      if(sub.match(root.event)) {
        sub.event = sub.handler(root.event);
        onPostPacth(() => sub.event = null);
      }  
    }
    return sub.event;
  }
  
  B(f) {
    return Beh(this, f);
  }
  
  constB(v) {
    return this.B( Const(v) );
  }
  
  step(start, sub) {
    return this.scanB((_, v) => v , start, sub)
  }
  
  scanB(f, acc, sub) {
    let updated;
    return this.B( () => {
      if(!updated) {
        let ev = this.findEvent(sub);
        if(ev)
          acc = f(acc, ev.data);  
        updated = true;
        onPostPacth(() => updated = false);
      }
      return acc;
    });
  }
  
  // cases : [(Subscription a , a -> b)]
  when(acc, cases) { 
    let updated, events = [], fns = [];
    for(var i=0; i < cases.length-1; i+=2) {
      events.push(cases[i]);
      fns.push(Fn(cases[i+1]));
    }
    return this.B( () => {
      if(!updated) {
        let ev;
        updated = true;
        onPostPacth(() => updated = false);
        for(var i=0; i < events.length; i++) {
          ev = this.findEvent(events[i]);
          if(ev) {
            acc = fns[i](acc, ev.data);
            return acc;
          }
        } 
      }
      return acc;
    });
  }
  
  arrayB(events, state=[]) {
    let cases = [];
    if(events.add) {
      cases.push(events.add);
      cases.push(add);
    }
    if(events.remove) {
      cases.push(events.remove);
      cases.push(remove);    
    }
    if(events.reverse) {
      cases.push(events.reverse);
      cases.push(arr => arr.slice().reverse() );    
    }
    if(events.other) {
      cases.push(events.other);
      cases.push((arr, fn) => fn(arr) );    
    }
    return this.when(state, cases);
  }
  
  prop(val) {
    function p() {  return val; }
    p.set = v => val = v;
    return p;
  }
  
}

App.post = new App();

export default App;
