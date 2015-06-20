import App from '../../src/app';
import h from 'snabbdom/h';

function list(parent, comp, params, actions) {
  
  const app = new App(parent);
  app.name = 'list';
  const newComp = () => comp(app, params);
  const items = app.arrayB({
    add     : app.on('add$').map(newComp),
    reverse : app.on('reverse$')
  }, [newComp(), newComp()]);

  app.view = t => 
    h('div.list', [
      h('button', {on: {click: app.publish('reverse$')}}, 'Reverse'),
      h('button', {on: {click: app.publish('add$')}}, 'Add'),
      h('span', actions || ''),
      h('ul', items(t).map( item => h('li', [item.view(t)])))
    ]);
  
  return app;
}

export default list;
