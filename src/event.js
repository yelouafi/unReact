"use strict";

class Event {
  
  // constructor a : (String, App, Number, a) -> Event a
  constructor(id, app, time, data) {
    this.id = id;
    this.app = app;
    this.time = time;
    this.data = data;
  }
  
  // map : (Event a, a -> b) -> Event b
  map(f) {
    return new Event(this.id, this.app, this.time, f(this.data));
  }
}

export default Event;