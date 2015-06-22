import App from '../../src/app';
import h from 'snabbdom/h';

function sortableList(sItems) {

  const ITEM_AFTER = "$$after$$"
  const move = (arr, elm, srcIdx, targetIdx) => {
    let newIdx = srcIdx > targetIdx ? targetIdx : targetIdx - 1,
        copy = arr.slice();
        
    copy.splice(srcIdx, 1);
    copy.splice(newIdx, 0, elm);
    return copy;
  }
  
  const app = new App(),
  
        dragStart$ = app.on('dragStart$').tap( ev => {
          ev.domEvent.dataTransfer.effectAllowed = 'move';
          ev.domEvent.dataTransfer.setData("text/html", ev.domEvent.currentTarget); // Firefox fix
        }),
        
        dragOver$ = app.on('dragOver$').tap( ev => {
          ev.domEvent.preventDefault();
        }),
        dragEnd$ = app.on('dragEnd$'),
        
        dragSource = app.step(null, dragStart$),
        
        dragTarget = app.when(null, [
          dragOver$, (prev, ev) => {
            let target = ev.target, id = target.dataset.id;
            if(id) {
              if(id === 'placeholder')
                return prev;  
                
              const relY = ev.clientY - target.offsetTop;
              const height = target.offsetHeight / 2;
              if(relY <= height) return id;
              const itms = items(), idx = itms.indexOf(id) + 1;
              return idx < itms.length ? itms[idx] : ITEM_AFTER;    
            }
          },
        ]),
        
        isDragOver = app.when(false, [
          dragOver$, true,
          dragEnd$, false
        ]),
        
        items = app.scanB((acc, _) => {
          let source = dragSource(),
              target = dragTarget(),
              srcIdx = acc.indexOf(source),
              targetIdx = target === ITEM_AFTER ? acc.length : acc.indexOf(target)
          
          return (srcIdx !== targetIdx &&  srcIdx >= 0 && targetIdx >= 0) ?
                    move(acc, source, srcIdx, targetIdx) : acc;
        },  sItems, dragEnd$);
    
  function setDataId(oldVnode, vnode) {
    vnode.elm.dataset.id = vnode.data.key;
  }  
  
  const li = (it, i, source, isOver) =>
    h('li', { 
          key: it,
          style: { display: (it === source && isOver) ?  'none' : 'block' },
          props: { draggable: true } ,
          on: { dragstart: app.publish('dragStart$', it), dragend: app.publish('dragEnd$') },
          hook: {create: setDataId},
        },  
        it);
  
  app.view = () => {
    const aItems = items(), source = dragSource(),  target = dragTarget(), isOver = isDragOver(),
          targetIdx = target === ITEM_AFTER ? aItems.length : aItems.indexOf(target);
          
    let fstSection = targetIdx >= 0 && isOver  ? aItems.slice(0, targetIdx) : aItems,
        sndSection = targetIdx >= 0 && isOver  ? aItems.slice(targetIdx) : [];
        
    return h('ul', { on: { dragover: app.publish('dragOver$') } }, 
      fstSection.map((it, i) => li(it, i, source, isOver))
        .concat(h('li.placeholder', { 
          key: 'placeholder',
          style: { display: targetIdx < 0 || !isOver ? 'none' : 'block' },
          hook: {create: setDataId}
        }))
        .concat(sndSection.map((it, i) => li(it, i, source, isOver)))
      );
  }
    
    
  return app;
}

export default sortableList;


