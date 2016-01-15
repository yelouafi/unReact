/** @jsx html */

import { html } from 'snabbdom-jsx';
import { Event, stepper } from '../../../src';


function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export default function Counter(reset) {

  const self = {}

  const inc = Event()
  const dec = Event()
  const incAsync = Event()

  const counter = stepper(0,
    inc.map(() => counter() + 1),
    dec.map(() => counter() - 1),
    reset.map(() => 0)
  )

  async function incAsyncWatch() {
    while(true) {
      await incAsync.next()
      await sleep(1000)
      inc.fire()
    }
  }


  self.render = ({e, onRemove}) =>
    <div>
      <button on-click={inc.fire} >+</button>
      <div>{ counter(e) }</div>
      <button on-click={dec.fire} >-</button>
      <button on-click={incAsync.fire} >+ (async)</button>
      <button on-click={() => onRemove(self)} >remove (async)</button>
    </div>

  incAsyncWatch()

  return self

}
