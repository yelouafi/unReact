import App from '../../src/app';
import h from 'snabbdom/h';

function switcher(n=0) {
  
  const app = new App();
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
