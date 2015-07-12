import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

function counter(channel, reset$) {

  const app = new App();
  
  const counter = step(0,
    app.on('inc').map( _ => counter(-1) + 1),
    app.on('dec').map( _ => counter(-1) - 1),
    reset$.map(_ => 0)
  );
    
  const countStyle = {  
    fontSize:   '20px',
    fontFamily: 'monospace',
  };
    
  app.view = () =>
    h('div.counter', [
      h('button', { on: {click: app.publish('dec') } }, '–'),
      h('span', {style: countStyle}, counter()),
      h('button', { on: {click: app.publish('inc') } }, '+'),
      h('button', { on: {click: channel.publish('remove', app) } }, 'X'),
    ]);
    
  return app;
}

export default counter


