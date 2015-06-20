import App from '../../src/app';
import h from 'snabbdom/h';
import list from './list';

import counter from './counter';
import switcher from './switcher';

const app = new App();

const counterActions = [h('button', {on: {click: app.publish('reset$')}}, 'Reset')];
const counterList = list(counter, app.on('reset$'), counterActions);
const switchList = list(switcher, 1);

const tabs = [counterList, switchList];
const activeTab = app.scanB((_, idx) => idx, 0, app.on('changeTab$'));


app.view = () => {
  const idx = activeTab(),
        tab = tabs[activeTab()];
        
  return h('div', [
    h('h1', 'tab '+idx),
    h('ul.tabs', [
      h('li', {on: {click: app.publish('changeTab$', 0)},
               class: {active: idx === 0}}, 'Counters'),
      h('li', {on: {click: app.publish('changeTab$', 1)},
               class: {active: idx === 1}}, 'Switches')
    ]),
    tab.view()
  ]);
};
  
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
