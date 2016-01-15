/** @jsx html */
import 'babel-polyfill'
import { html } from 'snabbdom-jsx';
import { mount, Event, stepper } from '../../../src';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

const inc = Event()
const dec = Event()
const incAsync = Event()

const counter = stepper(0,
  inc.map(() => counter() + 1),
  dec.map(() => counter() - 1)
)

async function incAsyncWatch() {
  while(true) {
    await incAsync.next()
    await sleep(1000)
    inc.fire()
  }
}


const render = ({e}) =>
  <div>
    <button on-click={inc.fire} >+</button>
    <div>{ counter(e) }</div>
    <button on-click={dec.fire} >-</button>
    <button on-click={incAsync.fire} >+ (async)</button>
  </div>

mount(render, '#container');
incAsyncWatch()
