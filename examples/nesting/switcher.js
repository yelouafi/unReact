import App from '../../src/app';
import h from 'snabbdom/h';

function switcher(parent, n) {
  
  const app = new App(parent);
  app.name = 'switcher';
  const model = app.scanB( n => 1-n, n, app.on('toggle$') );

  app.view = () => 
    h('div.switch', {on: {click: app.publish('toggle$')}}, [
      h('span', {class: {active: model() === 0 }}, 'On'),
      h('span', {class: {active: model() === 1 }}, 'Off')
    ]) 
  
  return app;
}

export default switcher;
