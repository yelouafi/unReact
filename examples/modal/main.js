import App from '../../src/app';
import h from 'snabbdom/h';
import modal from './modal';

const app = new App(),
      
      myModal = modal(app),
      isModalOpen = app.when(false, [
        app.on('open$'), _ => true,  
        app.on('close$'), _ => false
      ])


app.view = () => 
    h('div', [
      'Press the button below to open the modal', h('br'),
      h('button', {on: {click: app.publish('open$')}}, 'Open modal'),
      isModalOpen() ? myModal.view([
                          'This is inside the modal', h('br'),
                          'The modal is attached to the body', h('br'),
                           h('button', {on: {click: app.publish('close$')}}, 'Close'),
                        ])
                      : h('span')
    ])
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
