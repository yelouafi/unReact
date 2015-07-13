import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import { count } from './utils';

function addThreads(threads, rawMessages) {
  let result = threads.slice();
  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i];
    let thread = getThread(result, msg.threadID);
    if(!thread) {
      result.push(thread = {id: msg.threadID, name: msg.threadName});
    }
    if(!thread.lastMessage || thread.lastMessage.timestamp < msg.timestamp )
      thread.lastMessage = msg;
  }
  
  return result;
}

function getThread(threads, id) {
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    if(thread.id === id)
      return thread;
  }
}

function lastMessage(thread, messages) {
  let result;
  for (var i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if(msg.threadID === thread.id && (!result || result.timestamp < msg.timestamp))
      result = msg;
  }
  return result;
}

const EMPTY_THREAD = {};

function threadList(channel, allMessages) {
  
  const app = new App();
  
  app.threads = step([], 
    channel.on('receive_messages').map( msgs => addThreads(app.threads(-1), msgs))
  );
  
  app.unreadCount = () => count( app.threads(), thread => !lastMessage(thread, allMessages()).isRead );
  app.currentThread = step( app.threads()[0] || EMPTY_THREAD, 
    channel.on('receive_messages').map( _ => app.currentThread(-1) === EMPTY_THREAD ? app.threads()[0] : app.currentThread(-1)  ),
    channel.on('thread.click') 
  );
  
  app.view = () => {
    
    const unreadCount = app.unreadCount();
    const currentThread = app.currentThread();
    
    return h('div.thread-section', {}, [
      h('div.thread-count', {
        class: { hide: unreadCount === 0 },
      }, [
        h('span', `Unread threads: ${unreadCount}`)  
      ]),
      h('ul.thread-list', app.threads().map(item => threadItem(item, currentThread === item)))
    ]);
  };
  
  return app;
  
  function threadItem(thread, isCurrent) {
    const lastMsg = lastMessage(thread, allMessages());
    
    return h('li.thread-list-item', {
      key: thread.id,
      class: { active: isCurrent },
      on : {
        click: channel.publish('thread.click', thread)
      }
    }, [
      h('h5.thread-name', thread.name),
      h('div.thread-time', new Date(lastMsg.timestamp).toLocaleTimeString()),
      h('div.thread-last-message', lastMsg.text)
    ]);
  }
  
}

export default threadList;