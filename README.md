
## Note : This is not a ready-to-use library. It's an Exploratory project for lazy event handling 
# unReact

A prototype implementation of a Pull based FRP JavaScript frontend.

The main ingredients are

- Virtual-DOM rendering (using [snabbdom](https://github.com/paldepind/snabbdom))
- *Behaviors* are dynamic values represent the application state 
- A [PubSub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) like mechanism for event subscription, **but not notification (there is no event notification in the app)**

But, if there is no event notification, how can we update our app state ? How can we write anything useful if we do not react to events ?

# Why *unReact* ?

React and similar frameworks use a *push* model for event handling, ie. when a DOM event is fired, the framework notifies all liseteners for that event, so the event is pushed on the application. Put simply, the process is:

1- a dom event is fired  
2- event listeners are notified (the push phase)  
3- event listeners updates the application state (possibly via an intermediate layer like Flux or Redux)
4- the system re-evaluates the view function and patches the DOM  

unReact uses a *pull* based model for events, when an event fires, the event is not forwarded to listeners but instead *published* on a central place. When the framework re-render the UI, interested subscribers, called *Behaviors* can check against the published event to decide if an update should take place. In other terms events are *pulled* during the view evaluation phase.  So the process is:

1- a DOM event is fired  
2- a message is published on the application  
3- the system re-evaluates the view function and patches the DOM (the pull phase)  

So in practice, we're not really un-reactive, we just react to event in *lazy* way.

Let's see how it works through a basic example. We have a `counter` *Behavior* and presents the user with 2 buttons, one for incrementing and the 2nd for decrementing values of the counter.

```javascript
import { App, step } from '../../../src/app';
import h from 'snabbdom/h';

//1- create the App
const app = new App();

//2- define the Behaviors
let counter = step(0, 
  app.on('inc').map( _ => counter(-1) + 1),
  app.on('dec').map( _ => counter(-1) - 1 )  
);

//3- define the View
app.view = () =>
  h('div', {}, [
    h('button', { on: {click: app.publish('dec') } }, '–'),
    h('div', counter() ),
    h('button', { on: {click: app.publish('inc') } }, '+'),
  ]);
    
app.mount('#container');
```

First we create an `App` instance. Apps are the basic building blocks in unReact and they can be composed together to build more sophistacted things.

Next we create the `counter` *behavior*. A behavior is just like a getter function `() => ...`. The concept is borrowed from Functional Reactive Programming: in FRP behaviors are simply functions from time, or a time varying value.

```
Behavior : time => value
```

The unReact idea is to use the Behavior abstraction to model changing state in the application, except in unReact you don't provide the time parameter, it's always assumed to be `Date.now()`. 

`counter` is an example of a [step behavior](https://en.wikipedia.org/wiki/Step_function) (ie. changes at discrete moments of time). It has a start value of `0`, but is senssible to 2 messages: `inc` and `dec`. `inc` causes the counter to increment and `dec` causes it to decrement. It's important to note that `counter` is not a variable but truly a function who can be asked for its latest value by simple call `counter()`.

So in an unReact app, all application state is composed of multiples functions. Functions are the simplest and the most powerful concept in programming. They have automatic dependency management: order of things is automatically maintained by the functional dependencies, and they can scale at arbitrary complexity by simple composition.

But the problem with functions is that they are a *pull* based concept; ie you must call them to get something, while events are a *push* concept; ie they can't be called to get their values, instead we provide them a callback and they call it an undefined moment. So how do we reconcile the 2 modes.

unReact adresses this by adopting a lazy model of events; in the example above, when the user clicks for example on the `-` button, the app *publishes* the `dec` message: there is no listeners or listener notification, the app just put the message in a central place. Then proceed immediately to the evaluation of the app view function. that's the main function on your application.

When the view function invokes the `counter()` getter, the `counter` behavior *matches* the current message with its 2 subscriptions, since the the current message `dec` matches its second subscription, it'll *update* itself.

So in simple words, an unReact application is just a single big function that gets reevaluated on each interesting event. events are considered like changing inputs to that function.

For more examples of use [see here](https://github.com/yelouafi/unReact/tree/master/examples).

There is an implementation of the canonical [Todo MVC](https://github.com/yelouafi/unReact/tree/master/examples/todos) application. Although i'm not sure if the MVC world holds for this case.

Also you may be ineterested in the [Chat demo](https://github.com/yelouafi/unReact/tree/master/examples/chat); this is an adaptaion from the [React/Flux demo app](https://github.com/facebook/flux/tree/master/examples/flux-chat). You can see how unReact compares to React Flux.

