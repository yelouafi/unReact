import { App } from '../../src/app';
import h from 'snabbdom/h';
import sortableList from './sortableList';

const app = new App(), 
      colors = ["Red","Green","Blue","Yellow","Black","White","Orange"],
      colorList = sortableList(colors);


app.view = () =>
  h('div', [
    colorList.view()
  ]);
  
app.mount('#container');
