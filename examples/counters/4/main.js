import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import counter from './counter';
import { remove } from '../../../src/base';

const app = new App(),
      reset$ = app.on('reset'),
      counters = step([],
        app.on('add').map( _ => counters(-1).concat( counter(app, reset$) )),
        app.on('remove').map( c => remove( counters(-1), c ) )
      );


app.view = () =>
  h('div',[
    h('button', {on: {click: app.publish('reset')}}, 'RESET'),
    h('button', {on: {click: app.publish('add')}}, 'Add'),
    h('div', { style: { 'margin-top': '20px' }  },counters().map( c => c.view() ))
  ]);
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
