import { App } from '../../src/app';
import h from 'snabbdom/h';


function rod(channel, id, disks, move) {
  
  const app = new App();
  app.id = id;
  app.disks = disks;
  
  const diskview = (disk, idx) => h('li.disk', { 
      key: disk.id,
      props: { draggable: true } ,
      style: { 
        width: `${disk.size}px` ,
        display: disk === move().disk && move().started ? 'none' : 'block'
      },
      on: { 
        dragstart: channel.publish('dragStart', {source: app, disk}),
        dragend: channel.publish('dragEnd')
      }
    })
  
  app.view = () =>
    h('div.rod', {
      on: { 
        dragover: channel.publish('dragOver', app),
      },
    }, [
      h('ul', disks().map(diskview))
    ]);  
    
  return app;
  
}

export default rod;