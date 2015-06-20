import App from '../../../src/app';
import h from 'snabbdom/h';
import counter from './counter';

const app = new App(), post = App.post,
      reset$ = app.on('reset$'),
      counters = app.arrayB({
        add     : app.on('add$').map( _ => counter(reset$) ),
        remove  : post.on('remove$')
      });


app.view = () =>
  h('div', [
    h('button', {on: {click: app.publish('reset$')}}, 'RESET'),
    h('button', {on: {click: app.publish('add$')}}, 'Add'),
    h('div', counters().map( c => c.view() ))
  ]);
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
