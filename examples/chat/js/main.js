"use strict";

import { App, step } from '../../../src/app';
import h from 'snabbdom/h';
import { extend } from '../../../src/base';
import threadList from './threadList';
import messageList from './messageList';
import { getMessages, getMessages2 } from './utils';


function markMsgsAsRead(messages, thread) {
  let msgs = messages.slice();
  for (var i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    if(msg.threadID === thread.id)
      msgs[i] = extend({}, msg, {isRead: true});
  }
  return msgs;
}

const app = new App();
const $receiveMsgs = app.publish('receive_messages');

let fetched = false;
app.tap('fecth', () => setTimeout(() => {
  if(!fetched) {
    fetched = true;
    $receiveMsgs(getMessages2());
  }
}, 2000));

const allMessages = step([], 
  app.on('receive_messages').map( msgs => markMsgsAsRead(allMessages(-1).concat(msgs), threadItems.currentThread()) ),
  app.on('thread.click').map( _ => markMsgsAsRead(allMessages(-1), threadItems.currentThread()))
);

const threadItems = threadList(app, allMessages);
const messageItems = messageList(threadItems.currentThread, allMessages, app);

app.view = () =>
  h('div.chatapp', {}, [
    threadItems.view(),
    messageItems.view(),
    h('button', { 
      props: { disabled: fetched },
      on:  { click: app.publish('fecth') }
    }, 'Check new messages')
  ]);
  
  
setTimeout(() => $receiveMsgs(getMessages()), 10);
  
app.mount('#chatapp');
