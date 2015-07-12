import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

const app = new App();

let counter = step(0, 
  app.on('inc').map( _ => counter(-1) + 1),
  app.on('dec').map( _ => counter(-1) - 1 )  
);
  
const countStyle = {  
  fontSize:   '20px',
  fontFamily: 'monospace',
  width:      '50px',
  textAlign:  'center'
};

  
app.view = () =>
  h('div', {style: countStyle}, [
    h('button', { on: {click: app.publish('dec') } }, '–'),
    h('div', {style: countStyle}, counter()),
    h('button', { on: {click: app.publish('inc') } }, '+'),
  ]);
    
app.mount('#container');
