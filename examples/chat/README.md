A reimplementation from Reactjs/Flux [Chat application example](https://github.com/facebook/flux/tree/master/examples/flux-chat).

From the The Flux repository, the application 

>shows an example of how a Flux app is structured, and how you might use waitFor to make sure the Stores' registered callbacks are called in the correct order.

In the unReact example, Stores are replaced by Behaviors. The concept is inspired by the abstraction from Functional Reactive Programming; in unReact behaviors are simple functions of type `() => ...`. 

The reactivity is assumed by *steppers*, which can be viewed like [step functions](https://en.wikipedia.org/wiki/Step_function) whose semantical input is the actual time. They can be viewed like functions that takes events as input. 

For example, here is an example of `allMessages` behavior, which represents the list of all messages in the app

```javascript
const allMessages = step([], 
  app.on('receive_messages').map( msgs => markMsgsAsRead(allMessages(-1).concat(msgs), threadItems.currentThread()) ),
  app.on('thread.click').map( _ => markMsgsAsRead(allMessages(-1), threadItems.currentThread()))
);
```

The `allMessages` behavior is semantically a function of time which descirbes the complete evloution of the messages state in the application. So the behavior starts as an empty array, upon a `receive_messages` message, switches to a value which is the concatenation of the previous state (`allMessages(-1)`) with the new incoming messages, marking by the way messages of the current thread as read. Upon a `thread.click` message the behavior switches to a new state which is the previous state modified so all messages of the current thread are marked as read.

There is no need to `waitFor` in unReact; Behaviors are truly functions, including reactive ones; in the above example the `allMessages` depends on the `threadItems.currentThread` behavior. Simply calling `currentThread()` will return the actual value (ie after currentThread reacts to the `thread.click` message). Dependency management and unidirectional data flow are naturally ensured through normal function calls.

unReact acheives this by adopting a pull/lazy model of event handling; see [explications here](https://github.com/yelouafi/unReact)


