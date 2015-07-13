
export const konst = val => () => val;

export function memo1(fn) {
  let lastArg, lastResult;
  return arg => {
    if(arg === lastArg)
      return lastResult;
    else {
      lastArg = arg;
      lastResult = fn(arg);
      return lastResult;
    }
  };
  
}

export function count(array, predicate) {
  let result = 0;
  for (var i = 0; i < array.length; i++) {
    if(predicate(array[i], i, array))
      result++;
  }
  return result;
}

export function getMessages() {

  return [
    {
      id: 'm_1',
      threadID: 't_1',
      threadName: 'Jing and Bill',
      authorName: 'Bill',
      text: 'Hey Jing, want to give a Flux talk at ForwardJS?',
      timestamp: Date.now() - 99999
    },
    {
      id: 'm_2',
      threadID: 't_1',
      threadName: 'Jing and Bill',
      authorName: 'Bill',
      text: 'Seems like a pretty cool conference.',
      timestamp: Date.now() - 89999
    },
    {
      id: 'm_3',
      threadID: 't_1',
      threadName: 'Jing and Bill',
      authorName: 'Jing',
      text: 'Sounds good.  Will they be serving dessert?',
      timestamp: Date.now() - 79999
    },
    {
      id: 'm_4',
      threadID: 't_2',
      threadName: 'Dave and Bill',
      authorName: 'Bill',
      text: 'Hey Dave, want to get a beer after the conference?',
      timestamp: Date.now() - 69999
    },
    {
      id: 'm_5',
      threadID: 't_2',
      threadName: 'Dave and Bill',
      authorName: 'Dave',
      text: 'Totally!  Meet you at the hotel bar.',
      timestamp: Date.now() - 59999
    },
    {
      id: 'm_6',
      threadID: 't_3',
      threadName: 'Functional Heads',
      authorName: 'Bill',
      text: 'Hey Brian, are you going to be talking about functional stuff?',
      timestamp: Date.now() - 49999
    },
    {
      id: 'm_7',
      threadID: 't_3',
      threadName: 'Bill and Brian',
      authorName: 'Brian',
      text: 'At ForwardJS?  Yeah, of course.  See you there!',
      timestamp: Date.now() - 39999
    }
  ];
}


export function getMessages2() {

  return [
    {
      id: 'm_8',
      threadID: 't_1',
      threadName: 'Jing and Bill',
      authorName: 'Bill',
      text: 'You you must watch out for your line',
      timestamp: Date.now() - 29999
    },
    {
      id: 'm_9',
      threadID: 't_3',
      threadName: 'Functional Heads',
      authorName: 'Bill',
      text: 'Ok, then',
      timestamp: Date.now() - 19999
    },
  ]
  
}