import App from '../../../src/app';
import h from 'snabbdom/h';

  
const countStyle = {  
  fontSize:   '20px',
  fontFamily: 'monospace',
  width:      '50px',
  textAlign:  'center'
};
  
const app = new App();

const counter = app.when(0, [
  app.on('inc$'), (acc, _) => acc+1,
  app.on('dec$'), (acc, _) => acc-1
]);

const doubleCounter = counter.map(n => 2 * n);

app.view = () =>
  h('div', {style: countStyle}, [
    h('button', { on: {click: app.publish('dec$') } }, '–'),
    h('div', {style: countStyle}, doubleCounter()),
    h('button', { on: {click: app.publish('inc$') } }, '+'),
  ]);

window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});