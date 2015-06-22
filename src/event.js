"use strict";

class Event {
  
  // constructor a : (String, App, Number, a) -> Event a
  constructor(id, app, time, data, domEvent) {
    this.id = id;
    this.app = app;
    this.time = time;
    this.data = data;
    this.domEvent = domEvent;
  }
  
  // map : (Event a, a -> b) -> Event b
  map(f) {
    return new Event(this.id, this.app, this.time, f(this.data, this.domEvent), this.domEvent);
  }
}

export default Event;