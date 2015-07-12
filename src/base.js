"use strict";


export const Const = v => _ => v;
export const Id = v => v;
export const Fn = v => isUndef(v) ? Id : (isFunction(v) ? v : Const(v));

export const isUndef = v => v === undefined || v === null;
export const isArray = Array.isArray;
export const isObject = arg => arg !== null && typeof arg === 'object';
export const isFunction = arg => typeof arg === 'function';
export const isString = arg => typeof arg === 'string';

export const eachKey = (obj, cb) => Object.keys(obj).forEach( key => cb(key, obj[key]) );
export const extend = Object.assign || 
  function (target) { 
    for (var i = 1; i < arguments.length; i++) { 
      var source = arguments[i]; 
      eachKey(source, (key, val) => target[key] = val);
    }
    return target;
  };

export const add = (arr, el) => arr.concat(el);

export const remove = (arr, el) => {
  var idx = arr.indexOf(el);
  if(idx >= 0) {
    var copy = arr.slice();
    copy.splice(idx, 1);
    return copy;
  }
  return arr;
};

