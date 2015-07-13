import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

function findMsg(id, messages) {
  for (var i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if(msg.id === id)
      return msg;
  }
}

function messageList(currentThread, allMessages) {

  const app = new App();
  
  app.view = () => {
   const thread = currentThread(),
         messages = allMessages().filter( message => message.threadID === thread.id  ),
         oldMessages = allMessages(-1);
         
    return h('div.message-section', {}, [
      h('h3.message-thread-heading', {}, thread.name),
      h('ul.message-list', {}, messages.map( (item, ind) => messageItem(item, findMsg(item.id, oldMessages))))
    ]);
  };
    
  function messageItem(message, oldMsg) {
    
    return h('li.message-list-item', {
      key: message.id,
      class: { highlight: !oldMsg || !oldMsg.isRead }
    }, [
      h('h5.message-author-name', message.authorName),
      h('div.message-time', new Date(message.timestamp).toLocaleTimeString()),
      h('div.message-text', message.text)
    ]);
  }
  
  return app;
}

export default messageList;