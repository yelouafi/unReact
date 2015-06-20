import App from '../../src/app';
import h from 'snabbdom/h';

function counter() {

  const app = new App();
  
  const counter = app.when(0, [
    app.on('inc$'), acc => acc+1,
    app.on('dec$'), acc => acc-1
  ]);
    
  const countStyle = {  
    fontSize:   '20px',
    fontFamily: 'monospace',
    width:      '50px',
    textAlign:  'center'
  };
    
  app.view = () =>
    h('div', {style: countStyle}, [
      h('button', { on: {click: app.publish('dec$') } }, '–'),
      h('div', {style: countStyle}, counter()),
      h('button', { on: {click: app.publish('inc$') } }, '+'),
    ]);
    
  return app;
}

export default counter


