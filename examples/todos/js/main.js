"use strict";

import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import task from './task';
import { remove } from '../../../src/base';
import { targetValue, targetChecked } from './utils';

const app = new App();

let id = 0;

const leftTodos = todos => todos.filter( todo => !todo.done() );
const toggleAll$ = app.on('toggleAll').map(targetChecked);
const $enter = app.publish('enter');

app.todos = step([],
  app.on('enter').map( title => app.todos(-1).concat(task(++id, title, toggleAll$, app)) ),
  app.on('remove').map( todo => remove(app.todos(-1), todo) ),
  app.on('clearDone').map( _ => leftTodos(app.todos(-1)) )
);

//app.input = step('', app.on('keydown').map( e => e.keyCode === 13 ? '' : e.target.value) );
app.input = '';
const onInput = e => {
  if(e.keyCode === 13) {
    app.input = '';
    $enter(e.target.value);
  } else {
    app.input = e.target.value;
  }
}

function clear(oldVnode, vnode) {
  if(app.input == '')
    vnode.elm.value = '';
}

app.activeView = step('all', app.on('viewChange').map( _ => window.location.hash.substr(2) || 'all'));

window.addEventListener("hashchange", app.publish('viewChange') );

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
      h('input#new-todo.new-todo', {
        props: {placeholder: 'What needs to be done?', value: app.input},
        on: { keydown: onInput},
        hook: {update: clear},
      }),
    ]),
    h('section.main', {
      style: {display: hasTodos ? 'block' : 'none'}
    }, [
      h('input.toggle-all', {props: {type: 'checkbox', checked: left === 0}, on: {click: app.publish('toggleAll')}}),
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
      h('button.clear-completed', {on: {click: app.publish('clearDone')}}, 'Clear completed'),
    ])
  ]);
};

app.mount('.todoapp');