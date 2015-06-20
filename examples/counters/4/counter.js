import App from '../../../src/app';
import h from 'snabbdom/h';

let id = 1;
function counter(reset$) {

  const app = new App(), post = App.post;
  
  app.id = id++;
  const counter = app.when(0, [
    app.on('inc$'), acc => acc+1,
    app.on('dec$'), acc => acc-1,
    reset$, () => 0
  ]);
    
  const countStyle = {  
    fontSize:   '20px',
    fontFamily: 'monospace',
    width:      '50px',
    textAlign:  'center'
  };
    
  app.view = () =>
    h('div', { key: id}, [
      h('button', { on: {click: app.publish('dec$') } }, '–'),
      h('span', {style: countStyle}, counter() + `(${app.id})`),
      h('button', { on: {click: app.publish('inc$') } }, '+'),
      h('button', {on: {click: post.publish('remove$', app)}}, 'X'),
    ]);
    
  return app;
}

export default counter


