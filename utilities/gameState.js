/* eslint-disable import/prefer-default-export */
const states = {};
let ref = 0;

function createState(init) {
  ref += 1;
  states[`state${ref}`] = { state: init, name: `state${ref}` };
  return states[`state${ref}`];
}

export function useGameState(init) {
  const newState = createState(init);
  return [
    () => states[newState.name].state,
    (val) => {
      const { state } = states[newState.name];
      if (typeof state === typeof val || state === null || val === null) {
        states[newState.name].state = val;
      } else {
        throw Error('You cannot change the type of variable when updating state!');
      }
    },
  ];
}
