
# unReact

A prototype implementation of a Pull based FRP JavaScript frontend.

The main ingredients are

- Virtual-DOM rendering (using [snabbdom](https://github.com/paldepind/snabbdom))
- *Behaviors* are dynamic values represent the application state 
- A [PubSub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) like mechanism for event subscription, **but not notification (there is no event notification in the app)**

Wait, if there is no event notification, how can we update our app state ? How can we write anything useful if we do not react to events ?

# Why *unReact* ?

React and similar frameworks use a *push* model for event handling, ie. when a DOM event is fired, the framework notifies all liseteners for that event, so the event is pushed on the application. Put simply, the process is:

1- a dom event is fired  
2- event listeners are notified (the push phase)  
3- event listeners updates the application state  
4- the system re-evaluates the view function and patches the DOM  

unReact uses a *pull* based model for events, when an event fires, the event is not forwarded to listeners (there are no listeners in unReact) but instead *published* on a central place. When the framework re-render the UI, interested subscribers, called *Behaviors* can check against the published event to decide if an update should take place. In other terms events are *pulled* during the view evaluation phase.  So the process is:

1- a DOM event is fired  
2- a message is published on the application  
3- the system re-evaluates the view function and patches the DOM (the pull phase)  

So in practice, we're not really un-reactive, we just react to event in *lazy* way.

Let's see how it works through a basic example. We have a `counter` *Behavior* and presents the user with 2 buttons, one for incrementing and the 2nd for decrementing values of the counter.

```javascript

// first create an App
const app = new App(); 

// then create our behavior(s)
const counter = app.when(0, [
  app.on('inc$'), (acc, _) => acc+1,
  app.on('dec$'), (acc, _) => acc-1
]);

// then create the view
app.view = () =>
  h('div', {style: countStyle}, [
    h('button', { on: {click: app.publish('dec$') } }, '–'),
    h('div', {style: countStyle}, counter() /* events are pulled here  */ ), 
    h('button', { on: {click: app.publish('inc$') } }, '+'),
  ]);
    
window.addEventListener('DOMContentLoaded', () => {
  app.mount('#container');
});
```

First we create an `App` instance. Apps are the basic building blocks in unReact and they can be composed together to build more sophistacted things.

Next we create the `counter` behavior. `counter` is an example of a *step* behavior (ie. changes at discrete moments of the application). It has a start value of `0`, but is senssible to 2 messages: `inc$` and `dec$`. `inc$` causes the counter to increment and `dec$` causes it to decrement.

When the user clicks for example on the `-` button, the app *publishes* the `dec$` message: there is no listeners or listener notification, the app just put the message in a central place. Then proceed immediately to the evaluation of the view function.

When the view function invokes the `counter()` getter, the `counter` behavior *matches* the current message with its 2 subscriptions, since the the current message `dec$` matches its second subscription, it'll *update* itself.

The benefit is that a behavior can invoke other behaviors during its evaluation without being forced to list explicit dependencies. The order of things is automatically maintained by the functional dependencies and there is also no memory leaks since there is no leaky references, all references are from the consumer (behavior) (as you said GC favours pull based evaluation)

For more examples of use [see here](https://github.com/yelouafi/unReact/tree/master/examples).

There is also an implementation of the canonical [Todo MVC](https://github.com/yelouafi/unReact/tree/master/examples/todos) application. Although i'm not sure if the MVC world holds for this case.

