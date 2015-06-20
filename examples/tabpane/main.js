import App from '../../src/app';
import h from 'snabbdom/h';
import counter from './counter';
import switcher from './switcher';
import tabs from './tabs';

const app = new App();
const myTabs = tabs({
  Counter   : counter(),
  Switcher  : switcher(),
});

app.view = () => h('div', [
  h('h1', 'Tabs'),
  myTabs.view()
])
    
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
