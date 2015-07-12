import { App, step } from '../../src/app';
import h from 'snabbdom/h';

function sortableList(sItems) {

  const move = (arr, elm, targetIdx) => {
    const srcIdx = arr.indexOf(elm);
    if (srcIdx === targetIdx || srcIdx <0 || targetIdx < 0)
      return arr;
    let newIdx = srcIdx > targetIdx ? targetIdx : targetIdx - 1,
        copy = arr.slice();
        
    copy.splice(srcIdx, 1);
    copy.splice(newIdx, 0, elm);
    return copy;
  };
  
  const app = new App();
  
  app.tap('dragStart', ev => {
    const domEvent = ev.source;
    domEvent.dataTransfer.effectAllowed = 'move';
    domEvent.dataTransfer.setData("text/html", domEvent.currentTarget);
  });
  
  app.tap('dragOver',  ev => ev.source.preventDefault() );
  
  const dragSource = step(null, app.on('dragStart') );
  
  const yAdjust = ev => 
      ev.clientY - ev.target.offsetTop <= ev.target.offsetHeight / 2 ? 0 : 1;
  
  const dropIndex = step(null,
    app.on('dragOver').map( (item, ev) =>
      item === 'placeholder' ? 
        dropIndex(-1)  
      : items().indexOf(item) + yAdjust(ev)
    )
  ),
        
  isDragOver = step(false,
    app.on('dragOver').map( _ => true),
    app.on('dragEnd').map( _ => false)
  ),
      
  items = step(sItems,
    app.on('dragEnd').map( _ => move(items(-1), dragSource(), dropIndex()) )
  );
  
  const li = (it, i, source, isOver) =>
    h('li', { 
      key: it,
      style: { display: (it === source && isOver) ?  'none' : 'block' },
      props: { draggable: true } ,
      on: { 
        dragstart: app.publish('dragStart', it), 
        dragover : app.publish('dragOver', it), 
        dragend: app.publish('dragEnd') 
      }
    },  
    it);
  
  app.view = () => {
    const aItems      = items(), 
          source      = dragSource(),  
          isOver      = isDragOver(),
          targetIdx   = dropIndex(),
          fstSection  = targetIdx >= 0 && isOver  ? aItems.slice(0, targetIdx) : aItems,
          sndSection  = targetIdx >= 0 && isOver  ? aItems.slice(targetIdx) : [];
        
    return h('ul',
    
    fstSection.map((it, i) => li(it, i, source, isOver))
    .concat(
      h('li.placeholder', { 
        key: 'placeholder',
        style: { display: !isOver ? 'none' : 'block' },
        on: { dragover: app.publish('dragOver', 'placeholder') }
      }))
      .concat(sndSection.map((it, i) => li(it, i, source, isOver)))
    );
  };
    
    
  return app;
}

export default sortableList;


