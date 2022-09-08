/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { useGameState } = require('../../utilities/gameState.js');

describe('\nuseGameState(init)', () => {
  test('accepts one argument of any type', () => {
    expect(useGameState.length).toBe(1);
  });

  test('returns an array with two elements', () => {
    const result = useGameState(null);
    expect(result.length).toBe(2);
  });

  test('the returned function at element 0 gets the current value of the defined gameState', () => {
    const [element0, element1] = useGameState('initialState');
    expect(element0()).toBe('initialState');
  });

  test('the returned function at element 1 sets the value of the defined gameState', () => {
    const [element0, element1] = useGameState('initialState');
    expect(element0()).toBe('initialState');
    element1('anotherState');
    expect(element0()).toBe('anotherState');
  });

  test('sets and updates state to null', () => {
    let [getState, setState] = useGameState(null);
    expect(getState()).toBe(null);
    [getState, setState] = useGameState('test');
    setState(null);
    expect(getState()).toBe(null);
  });

  test('sets and updates state to a boolean', () => {
    const [getState, setState] = useGameState(true);
    expect(getState()).toBeTruthy();
    setState(false);
    expect(getState()).toBeFalsy();
  });

  test('sets and updates state to a number', () => {
    const [getState, setState] = useGameState(1);
    expect(getState()).toBe(1);
    setState(273);
    expect(getState()).toBe(273);
  });

  test('sets and updates state to a string', () => {
    const [getState, setState] = useGameState('test');
    expect(getState()).toBe('test');
    setState('second test');
    expect(getState()).toBe('second test');
  });

  test('sets and updates state to an array', () => {
    const [getState, setState] = useGameState([8, 2, 3]);
    expect(getState().length).toBe(3);
    expect(getState()[0]).toBe(8);
    expect(getState()[1]).toBe(2);
    expect(getState()[2]).toBe(3);
    setState([0, 1, 2, 3]);
    expect(getState().length).toBe(4);
    expect(getState()[2]).toBe(2);
  });

  test('sets and updates state to an object', () => {
    const [getState, setState] = useGameState({ value: 10, email: 'my@email.com' });
    expect(typeof getState()).toBe('object');
    expect(Object.keys(getState()).length).toBe(2);
    expect(getState().value).toBe(10);
    expect(getState().email).toBe('my@email.com');
    setState({ value: 12, email: 'my@email.com' });
    expect(getState().value).toBe(12);
  });

  test('throws an error if trying to change the type of the state variable', () => {
    const [getState, setState] = useGameState('mySampleString');
    let errorMsg = '';
    expect(getState()).toBe('mySampleString');
    try {
      setState({ value: 12, email: 'my@email.com' });
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBeTruthy();
    expect(getState()).toBe('mySampleString');
  });

  test('does not throw an error when trying to change type to null', () => {
    const [getState, setState] = useGameState('mySampleString');
    let errorMsg = '';
    expect(getState()).toBe('mySampleString');
    try {
      setState(null);
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBeFalsy();
    expect(getState()).toBe(null);
  });

  test('does not throw an error when trying to change type from null', () => {
    const [getState, setState] = useGameState(null);
    let errorMsg = '';
    try {
      setState('mySecondString');
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBeFalsy();
    expect(getState()).toBe('mySecondString');
  });

  test('handles multiple states without issue', () => {
    const [getState, setState] = useGameState('state 1');
    const [getMode, setMode] = useGameState('state 2');
    let errorMsg1 = '';
    let errorMsg2 = '';
    expect(getState()).toBe('state 1');
    expect(getMode()).toBe('state 2');
    try {
      setState('state 3');
    } catch (error) {
      errorMsg1 = error.message;
    }
    try {
      setMode('state 4');
    } catch (error) {
      errorMsg2 = error.message;
    }
    expect(errorMsg1).toBeFalsy();
    expect(getState()).toBe('state 3');

    expect(errorMsg2).toBeFalsy();
    expect(getMode()).toBe('state 4');
  });
});
