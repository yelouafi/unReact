/** @jsx html */

import 'babel-polyfill'
import { html } from 'snabbdom-jsx';
import { mount, Event, stepper } from '../../../src';
import Counter from './counter'

const add = Event()
const remove = Event()
const reset = Event()

const counterList = stepper([],
  add.map(() => [...counterList(), Counter(reset)]),
  remove.map(c => counterList().filter(it => it !== c))
)

const render = ({e}) =>
  <div>
    <button on-click={add.fire}>Add</button>
    <button on-click={reset.fire}>Reset</button>
    <div>{
      counterList(e).map(CounterItem => <CounterItem e={e} onRemove={remove.fire} /> )
    }</div>
  </div>

mount(render, '#container')
