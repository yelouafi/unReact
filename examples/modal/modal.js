import App from '../../src/app';
import h from 'snabbdom/h';
import attachTo from 'snabbdom/helpers/attachto';

function modal(parent) {
  const app = new App();

  app.view = vnodeArray =>
    attachTo(document.body, h('div.modal', {}, [
      h('div.modal-content', vnodeArray),
      h('div.modal-backdrop'),
    ]));
    
  return app;
  
}

export default modal;
