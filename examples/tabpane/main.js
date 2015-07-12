import { App } from '../../src/app';
import h from 'snabbdom/h';
import counter from './counter';
import tabs from './tabs';

const app = new App();
const myTabs = tabs({
  Counter1   : counter(),
  Counter2  : counter(),
});

app.view = () => h('div', [
  h('h1', 'Tabs'),
  myTabs.view()
])
    
app.mount('#container');
