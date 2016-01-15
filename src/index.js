import snabbdom from 'snabbdom';

const patch = snabbdom.init([                 // Init patch function with choosen modules
  require('snabbdom/modules/class'),          // makes it easy to toggle classes
  require('snabbdom/modules/props'),          // for setting properties on DOM elements
  require('snabbdom/modules/style'),          // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners')  // attaches event listeners
]);

let frameRequested = false
let topRender, prevNode, nextNode

function update(e) {
  nextNode = topRender({e})
  if(!frameRequested)  {
    requestAnimationFrame( () => {
      frameRequested = false;
      prevNode = patch(prevNode, nextNode);
    });
    frameRequested = true;
  }
}

const EVENT = Symbol('EVENT')

export function Event() {

  const self = {}
  let defers = []

  const match = e => e[EVENT] === self
  const data = e => e.data

  function fire(data) {
    defers.forEach(r => r(data))
    defers = []
    update({data, [EVENT]: self})
  }

  function next() {
    return new Promise(r => defers.push(r))
  }

  return {
    match,
    fire,
    next,
    data,
    map: fn => ({ fire, match, next, data: e => fn(data(e)) })
  }
}

export function Beh(fn) {
  let prevState
  let lastState, lastEvent

  return (e) => {
    if(e === undefined)
      return prevState

    if(lastEvent !== e) {
      lastEvent = e
      prevState = lastState
      lastState = fn(e, lastState)
    }

    return lastState
  }
}

export function stepper(seed, ...steps) {
  return Beh((e, state = seed) => {
    for (var i = 0; i < steps.length; i++) {
      const step = steps[i]
      if(step.match(e))
        return step.data(e)
    }
    return state
  })
}

export function mount(render, elm) {
  elm = elm instanceof Element ? elm : document.querySelector(elm);
  if(!(elm instanceof Element))
    throw "mount needs a valid DOM Element as argument";
  prevNode = elm;
  topRender = render;
  update({type: '@@unReact/INIT'});
}
