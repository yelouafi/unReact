import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

function counter(reset$) {

  const app = new App();
  
  const counter = step(0,
    app.on('inc').map( _ => counter(-1) + 1),
    app.on('dec').map( _ => counter(-1) - 1),
    reset$.map(_ => 0)
  );
    
  const countStyle = {  
    fontSize:   '20px',
    fontFamily: 'monospace',
    width:      '50px',
    textAlign:  'center'
  };
    
  app.view = () =>
    h('div.counter', {style: countStyle}, [
      h('button', { on: {click: app.publish('dec') } }, '–'),
      h('div', {style: countStyle}, counter()),
      h('button', { on: {click: app.publish('inc') } }, '+'),
    ]);
    
  return app;
}

export default counter


