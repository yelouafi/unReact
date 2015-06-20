import App from '../../../src/app';
import h from 'snabbdom/h';

function task(parent, id, title, toggleAll$) {

  const app = new App(parent), post = App.post;
  
  app.id = id;
  app.title = app.scanB((_, ev) => ev.target.value, title, app.on('enter$'));
  app.done = app.when(false, [
    app.on('toggle$'), (_, v) => !v,
    toggleAll$, (_, v) => v
  ]);
  
  const editing = app.when(false,[
    app.on('startEditing$'), () => true,
    app.on('stopEditing$').merge(app.on('enter$')), () => false
  ]);
  
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
        on: {click: app.publish('toggle$')},
      }),
      h('label', {
        on: {dblclick: app.publish('startEditing$')}
      }, app.title()),
      h('button.destroy', {on: {click: post.publish('remove$', app)}}),
    ]),
    h('input.edit', {
      props: {value: app.title()},
      on: {
        blur: app.publish('stopEditing$'),
        keydown: app.publishIf('enter$', ev => ev.keyCode === 13),
      }
    })
  ]);
    
  return app;
}

export default task;


