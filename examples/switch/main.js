import App from '../../src/app';
import h from 'snabbdom/h';

const app = new App(),
      views = [
        app.scanB( acc => acc + 1, 0, app.on('click$') ).keepAlive(),
        app.constB('Hello there')
      ],
      idx = app.scanB( n => 1 - n, 0, app.on('switch$') );


app.view = () =>
  h('div', {}, [
    h('button', { on: {click: app.publish('switch$')} }, 'Switch'),
    h('button', { on: {click: app.publish('click$')} }, 'Counter'),
    h('div', [ views[idx()]()  ])
  ]);
    
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});

