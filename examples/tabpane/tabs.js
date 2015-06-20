import App from '../../src/app';
import h from 'snabbdom/h';


// panes : [(title: comp)]
function tabs(panes) {
  
  const app = new App();
  const titles = Object.keys(panes);
  const selected = app.scanB((_, title) => title, titles[0], app.on('select$'));

  app.view = () =>
    h('div', [
      h('ul.nav.nav-tabs',
        titles.map( title =>
          h('li', { class: { active: selected() === title}}, [
            h('a', {props: {href: '#'}, on: {click: app.publish('select$', title)}}, title)  
          ])
        )
      ),
      h('div.tab-content', [
        h('div.tab-pane.active', [ panes[selected()].view()  ])  
      ] )
    ]);
    
  return app;
}

export default tabs;
