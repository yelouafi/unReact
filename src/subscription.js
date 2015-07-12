"use strict";

import { Fn } from './base';

class Subscription {
  
  // constructor : (String, App, Event a -> Event b) -> Subscription b
  constructor(id, app, handler, match) {
    this.id = id;
    this.app = app;
    this.handler = Fn(handler);
    this.match = match;
  }
  
  // map : Subscription a, (a -> b), Subscription b
  map(f) {
    f = Fn(f);
    return new Subscription(this.id, this.app, ev => this.handler(ev).map(f), this.match );
  }
  
  // filter : (Subscription a, a -> aBool) -> Subscription a
  filter(p) {
    return new Subscription(this.id, this.app, this.handler, ev => this.match(ev) && p(ev.data) );
  }
  
  // merge : (Subscription a, Subscription b) -> Subscription a | b
  merge(sub2) {
    return Subscription.merge(this, sub2);
  }
  
}

Subscription.merge = (...subs) => {
  
  let match = ev => {
    for (var i = 0; i < subs.length; i++) {
      if( subs[i].match(ev) )
        return i;
    }
    return -1;
  }
  
  let idx;
  return new Subscription(
      null, 
      null,
      ev => (idx = match(ev)) >= 0  ? subs[idx].handler(ev) : void(0),
      ev => match(ev) >= 0
    ); 
}

export default Subscription;
