import { App, step } from '../../src/app';
import { extend, remove } from '../../src/base';
import h from 'snabbdom/h';

import rod from './rod';


function createDisks(n) {
  let disks = [];
  for (var i = 0; i < n; i++) {
    disks[i] = { id: i, size: 150 - (n-i) *10};
  }
  return disks;
}

const app = new App();

app.tap('dragStart', ev => {
  const domEvent = ev.source;
  domEvent.dataTransfer.effectAllowed = 'move';
  domEvent.dataTransfer.setData("text/html", domEvent.currentTarget);
});

app.tap('dragOver', ev =>  {
  const disks = ev.data.disks(),
        curMove = move(-1);
  
  if(curMove.source &&  (disks.length === 0 || disks[0].size > curMove.disk.size))
    ev.source.preventDefault();
});

app.tap('dragEnd', ev => {
  if(gameFinished())
    setTimeout( () => alert('Game finished'), 4 );
})

const changeDisks$ = app.on('changeDisks').filter( _ => confirm('Are you sure you want reset ?')  );
const nbDisks = step(3, app.on('nbDisks').map( e => +e.target.value ));

const move = step({}, 
  app.on('dragStart').map( data => data.disk === data.source.disks()[0] ? data : {}  ),
  app.on('dragOver').map( target => {
    const disks = target.disks(),
          curMove = move(-1);
    
    if(!curMove.source) return curMove;  
    return extend({}, curMove,
      disks.length === 0 || disks[0].size > curMove.disk.size ?
        {target, started: true} 
      : {started: true}
    );
  }),
  app.on('dragEnd').merge(changeDisks$).map( _ => ({}))
);

const gameFinished = () => rods[1].disks().length === 3 || rods[2].disks().length === 3

const createDisksBeh = idx => {
  const start = idx === 1 ? createDisks( nbDisks() ) : [];
  const disks = step(start,
    app.on('dragEnd').map( _ => {
      let acc = disks(-1),
          curRod = rods[idx-1],
          curMove = move(-1);
          
      return curMove.source && curMove.target && curMove.source !== curMove.target ?
          ( curRod === curMove.source ? remove(acc, curMove.disk) 
          : curRod === curMove.target ? [curMove.disk].concat(acc)
          : acc)
        : acc;
    }),
    changeDisks$.map( n => idx === 1 ? createDisks( nbDisks() ) : [] ) 
  );
  return disks;
};

const rods = [1,2,3].map( idx => rod(app, idx, createDisksBeh(idx), move ) );

  
app.view = () =>
  h('div', 
    rods.map( r => r.view() )
    .concat([ 
      h('hr'), 
      h('button', { on: { click: app.publish('changeDisks') }}, 'Reset'),
      h('input', { props: { type: 'number', value: 3 }, on: { change: app.publish('nbDisks') }}),
    ])
  );
    
app.mount('#container');

