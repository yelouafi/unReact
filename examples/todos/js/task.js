import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import { targetValue, targetChecked, kFalse, kTrue } from './utils';

function task(id, title, toggleAll$, channel) {

  const app = new App();
  
  const $enter = app.publish('enter');
  const onInput = e => {
    if(e.keyCode === 13)
      $enter(e.target.value);
  }
  
  app.id = id;
  app.title = step(title, app.on('enter'));
  
  app.done = step(false,
    app.on('toggle').map(targetChecked),
    toggleAll$
  );
  
  const editing = step(false,
    app.on('startEditing').map(kTrue),
    app.on('stopEditing').merge(app.on('enter')).map(kFalse)
  );
  
  function focus(oldVnode, vnode) {
    if (oldVnode.data.class.editing === false &&
        vnode.data.class.editing === true) {
      vnode.elm.querySelector('input.edit').focus();
    }
  }
  
  app.view = () =>
    h('li', {
      class: {completed: app.done() && !editing(), editing: editing()},
      hook: {update: focus},
      key: app.id,
    }, [
      h('div.view', [
        h('input.toggle', {
          props: {checked: app.done(), type: 'checkbox'},
          on: {click: app.publish('toggle')},
        }),
        h('label', {
          on: {dblclick: app.publish('startEditing')}
        }, app.title()),
        h('button.destroy', {on: {click: channel.publish('remove', app)}}),
      ]),
      h('input.edit', {
        props: {value: app.title()},
        on: {
          blur: app.publish('stopEditing'),
          keydown: onInput,
        }
      })
    ]);
    
  return app;
}

export default task;


