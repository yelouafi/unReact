import { App, step } from '../../src/app';
import h from 'snabbdom/h';

const app = new App();
const yourName = step('', app.on('input').map(e => e.target.value));
  
app.view = () =>
  h('div', [
    h('label', 'Name:'),
    h('input', { props: { type: 'text' }, on: { input: app.publish('input') }}),
    h('hr'),
    h('h1', `Hello ${yourName()}` )
  ]);
    
app.mount('#container');
