import App from '../../../src/app';
import h from 'snabbdom/h';
import task from './task';

const app = new App(), post = App.post;

let id = 0;
const value = ev => ev.target.value;
const leftTodos = todos => todos.filter( todo => !todo.done() );
const toggleAll$ = app.on('toggleAll$').map( ev => ev.target.checked );
const enter$ = app.on('keydown$').filter(ev => ev.keyCode === 13);

app.todos = app.arrayB({
  add     : enter$.map(value).map( title => task(app, ++id, title, toggleAll$ )),
  remove  : post.on('remove$'),
  other   : app.on('clearDone$').map(() => leftTodos)
});

app.input = app.scanB((_, e) => e.keyCode === 13 ? '' : e.target.value  ,'', app.on('keydown$'))
app.activeView = app.scanB(() => window.location.hash.substr(2) || 'all', 'all', app.on('viewChange$'));

window.addEventListener("hashchange", app.publish('viewChange$') );


app.view = () => {
  const todos = app.todos(),
        hasTodos = todos.length,
        left = todos.reduce((acc, todo) => acc + (!todo.done() ? 1 : 0), 0),
        filteredTodos = app.activeView() === 'all'   ? todos
                      : app.activeView() === 'active' ? todos.filter( todo => !todo.done())
                                                : todos.filter( todo => todo.done())
  return h('section.todoapp', [
    h('header.header', [
      h('h1', 'todos'),
      h('input.new-todo', {
        props: {placeholder: 'What needs to be done?', value: app.input()},
        on: { keydown: app.publish('keydown$')},
      }),
    ]),
    h('section.main', {
      style: {display: hasTodos ? 'block' : 'none'}
    }, [
      h('input.toggle-all', {props: {type: 'checkbox', checked: left === 0}, on: {click: app.publish('toggleAll$')}}),
      h('ul.todo-list', filteredTodos.map( todo => todo.view() )),
    ]),
    h('footer.footer', {
      style: {display: hasTodos ? 'block' : 'none'}
    }, [
      h('span.todo-count', [h('strong', left), ` item${left === 1 ? '' : 's'} left`]),
      h('ul.filters', [
        h('li', [h('a', {class: {selected: app.activeView() === 'all'}, props: {href: '#/'}}, 'All')]),
        h('li', [h('a', {class: {selected: app.activeView() === 'active'}, props: {href: '#/active'}}, 'Active')]),
        h('li', [h('a', {class: {selected: app.activeView() === 'completed'}, props: {href: '#/completed'}}, 'Completed')]),
      ]),
      h('button.clear-completed', {on: {click: app.publish('clearDone$')}}, 'Clear completed'),
    ])
  ]);
};


window.addEventListener('DOMContentLoaded', () => {
  app.mount('.todoapp');
});