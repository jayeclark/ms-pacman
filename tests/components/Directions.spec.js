/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
const stylesheet = document.createElement('style');
stylesheet.id = 'header-style-sheet';
const game = document.createElement('div');
game.id = 'game';
const ghostGate = document.createElement('div');
ghostGate.id = 'ghost-gate';
document.head.appendChild(stylesheet);
document.body.appendChild(game);
game.appendChild(ghostGate);

const { default: Directions } = require('../../components/Directions.js');
const { default: Board } = require('../../components/board/Board.js');
const { getClassStaticMethodNames } = require('../jestHelpers.js');

const array = [
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'X-------X-----------X-------X',
  'XB------X-----------X-----B-X',
  'X--XXX--X--XXXXXXX--X--XXX--X',
  'X---------------------------X',
  'X---------------------------X',
  'XXX--X--XXXX--X--XXXX--X--XXX',
  'XXX--X--XXXX--X--XXXX--X--XXX',
  '-----X--------X--------X-----',
  '-----X--------X--------X-----',
  'XXX--XXXX--XXXXXXX--XXXX--XXX',
  'SSX------SSSSSSSSSSS------XSS',
  'SSX------SSSSSSSSSSS------XSS',
  'SSX--XXXXSSGGGGGGGSSXXXX--XSS',
  'SSX--X---SSGGGGGGGSS---X--XSS',
  'SSX--X---SSGGGGGGGSS---X--XSS',
  'XXX--X--XSSGGGGGGGSSX--X--XXX',
  '-P------XSSSSSSSSSSSX--------',
  '--------XSSSSSSSSSSSX--------',
  'XXX--XXXXXXX--X--XXXXXXX--XXX',
  'SSX-----------X-----------XSS',
  'SSX-----------X-----------XSS',
  'XXX--XXXX--XXXXXXX--XXXX--XXX',
  'X---------------------------X',
  'X---------------------------X',
  'X--XXX--XXXX--X--XXXX--XXX--X',
  'X--XXX--X-----X-----X--XXX--X',
  'XB-XXX--X-----X-----X--XXXB-X',
  'X--XXX--X--XXXXXXX--X--XXX--X',
  'X---------------------------X',
  'X---------------------------X',
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
];

const board = new Board(array, 6);

describe(format('Directions'), () => {
  const sampleDirections = new Directions(board);

  it('has a constructor that accepts one argument - board: Board', () => {
    expect(sampleDirections.constructor.length).toBe(1);
  });

  it('returns an object with four properties and no instance methods', () => {
    expect(typeof sampleDirections).toBe('object');
    expect(Object.getOwnPropertyNames(sampleDirections).length).toBe(4);
    expect(getClassMethodNames(Directions, sampleDirections).length).toBe(0);
  });

  it('property "left", "right", "up", and "down" are all objects', () => {
    const props = Object.getOwnPropertyNames(sampleDirections).filter(
      (e) => typeof sampleDirections.e !== 'function',
    );
    expect(props.every((x) => typeof sampleDirections[x] === 'object')).toBeTruthy();
  });

  it('the class contains one static method, "props", which returns an object with 9 properties', () => {
    expect(getClassStaticMethodNames(Directions, sampleDirections).length).toBe(1);
    const props = Directions.props('left', board);
    expect(typeof props).toBe('object');
    expect(Object.getOwnPropertyNames(props).length).toBe(9);
  });
});
