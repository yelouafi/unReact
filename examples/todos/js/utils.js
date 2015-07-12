
export const targetProp = prop => ev => ev.target[prop];

export const targetValue = targetProp('value');
export const targetChecked = targetProp('checked');

export const konst = val => () => val;
export const kFalse = konst(false);
export const kTrue = konst(true);