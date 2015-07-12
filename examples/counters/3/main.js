import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import counter from './counter';

const app = new App(), 
      
      reset$ = app.on('reset'),
      counters = step([],
        app.on('add').map( _ => counters(-1).concat( counter(reset$) )),
        app.on('remove').map( _ => counters(-1).slice(1) )
      );


app.view = () =>
  h('div.main', [
    h('button', {on: {click: app.publish('reset')}}, 'RESET'),
    h('button', {on: {click: app.publish('add')}}, 'Add'),
    h('button', {on: {click: app.publish('remove')}}, 'Remove'),
    h('div', counters().map( c => c.view() ))
  ]);
  
app.mount('#container');
