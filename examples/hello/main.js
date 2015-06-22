import App from '../../src/app';
import h from 'snabbdom/h';

const app = new App();
const yourName = app.step('', app.on('input$').map(e => e.target.value));
  
app.view = () =>
  h('div', [
    h('label', 'Name:'),
    h('input', { props: { type: 'text' }, on: { input: app.publish('input$') }}),
    h('hr'),
    h('h1', `Hello ${yourName()}` )
  ]);
    
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
