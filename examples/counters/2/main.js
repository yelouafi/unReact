import App from '../../../src/app';
import h from 'snabbdom/h';
import counter from './counter';

const app = new App(), 
      reset$ = app.on('reset$'),
      topCounter = counter(app, reset$),
      bottomCounter = counter(app, reset$);


app.view = () =>
  h('div', [
    topCounter.view(),
    bottomCounter.view(),
    h('button', {on: {click: app.publish('reset$')}}, 'RESET'),
  ]);
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
