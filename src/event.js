"use strict";

class Event {
  
  // constructor a : (String, App, Number, a) -> Event a
  constructor(id, app, time, data, source) {
    this.id = id;
    this.app = app;
    this.time = time;
    this.data = data;
    this.source = source;
  }
  
  // map : (Event a, a -> b) -> Event b
  map(f) {
    return new Event(this.id, this.app, this.time, f(this.data, this.source), this.source);
  }
}

export default Event;