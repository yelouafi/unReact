import App from '../../../src/app';
import h from 'snabbdom/h';
import counter from './counter';

const app = new App(), 
      
      reset$ = app.on('reset$'),
      counters = app.when([], [
        app.on('add$')      , arr => arr.concat(counter(app, reset$)),
        app.on('remove$')   , arr => arr.slice(1)
      ])


app.view = () =>
  h('div', [
    h('button', {on: {click: app.publish('reset$')}}, 'RESET'),
    h('button', {on: {click: app.publish('add$')}}, 'Add'),
    h('button', {on: {click: app.publish('remove$')}}, 'Remove'),
    h('div', counters().map( c => c.view() ))
  ]);
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
