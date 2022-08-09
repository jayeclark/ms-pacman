/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { useGameState } = require('../utilities/index.js');

describe('Basic Characteristics', () => {
  test('it should return an array with two elements', () => {
    const result = useGameState(null);
    expect(result.length).toBe(2);
  });

  test('it should correctly set initial state to null', () => {
    const [getState, setState] = useGameState(null);
    expect(getState()).toBe(null);
  });

  test('calling setState should change the value of state', () => {
    const [getTestState, setTestState] = useGameState('initialState');
    expect(getTestState()).toBe('initialState');
    setTestState('anotherState');
    expect(getTestState()).toBe('anotherState');
  });

  test('it should correctly set and update state to a boolean', () => {
    const [getState, setState] = useGameState(true);
    expect(getState()).toBeTruthy();
    setState(false);
    expect(getState()).toBeFalsy();
  });

  test('it should correctly set and update state to a number', () => {
    const [getState, setState] = useGameState(1);
    expect(getState()).toBe(1);
    setState(273);
    expect(getState()).toBe(273);
  });

  test('it should correctly set and update state to a string', () => {
    const [getState, setState] = useGameState('test');
    expect(getState()).toBe('test');
    setState('second test');
    expect(getState()).toBe('second test');
  });

  test('it should correctly set and update state to an array', () => {
    const [getState, setState] = useGameState([8, 2, 3]);
    expect(getState().length).toBe(3);
    expect(getState()[0]).toBe(8);
    expect(getState()[1]).toBe(2);
    expect(getState()[2]).toBe(3);
    setState([0, 1, 2, 3]);
    expect(getState().length).toBe(4);
    expect(getState()[2]).toBe(2);
  });

  test('it should correctly set and update state to an object', () => {
    const [getState, setState] = useGameState({ value: 10, email: 'my@email.com' });
    expect(typeof getState()).toBe('object');
    expect(Object.keys(getState()).length).toBe(2);
    expect(getState().value).toBe(10);
    expect(getState().email).toBe('my@email.com');
    setState({ value: 12, email: 'my@email.com' });
    expect(getState().value).toBe(12);
  });

  test('it should throw an error when trying to change type', () => {
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

  test('it should not throw an error when trying to change type to null', () => {
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

  test('it should not throw an error when trying to change type from null', () => {
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

  test('it should handle multiple states without issue', () => {
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