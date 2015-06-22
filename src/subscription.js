"use strict";

import { Fn } from './base';

class Subscription {
  
  // constructor : (String, App, Event a -> Event b) -> Subscription b
  constructor(id, app, handler, match) {
    this.id = id;
    this.app = app;
    this.handler = Fn(handler);
    this.match = match || (ev => ev && ev.id === this.id && this.app === ev.app);
  }
  
  // map : Subscription a, (a -> b), Subscription b
  map(f) {
    f = Fn(f);
    return new Subscription(this.id, this.app, ev => this.handler(ev).map(f), this.match );
  }
  
  // tap : Subscription a, (a -> ()), Subscription a
  tap(action) {
    return new Subscription(
      this.id, 
      this.app, 
      ev => {
        action(ev);
        return this.handler(ev);
      },
      this.match 
    );
  }
  
  // filter : (Subscription a, a -> aBool) -> Subscription a
  filter(p) {
    return new Subscription(this.id, this.app, this.handler, ev => this.match(ev) && p(ev.data) );
  }
  
  // merge : (Subscription a, Subscription b) -> Subscription a | b
  merge(sub2) {
    return new Subscription(
      this.id, 
      this.app,
      ev => this.match(ev) ? this.handler(ev) : sub2.handler(ev),
      ev => this.match(ev) || sub2.match(ev)
    );
  }
  
}

export default Subscription;
