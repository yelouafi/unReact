import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

const app = new App();
const email = step('', 
        app.on('input').filter( e => e.target.validity.valid ).map(e => e.target.value)
      ),
      error = step('', 
        app.on('input').map(e =>
          e.target.validity.valid ? '' : 'Invalid Email'
        )
      )
  
app.view = () =>
  h('div', [
    h('label', 'Name:'),
    h('input', { props: { type: 'email' }, on: { input: app.publish('input') }}),
    h('div', { style: { color: 'red', display: error() ? 'block' : 'none'}  }, error() ),
    h('h1', `Your mail ${email()}`)
  ]);
    
app.mount('#container');
