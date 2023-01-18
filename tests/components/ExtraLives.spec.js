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

const { default: ExtraLives } = require('../../components/pieces/ExtraLives.js');
const { default: Board } = require('../../components/board/Board.js');

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

describe(format('ExtraLives'), () => {
  const sampleLives = new ExtraLives(board);

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(sampleLives.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts one argument', () => {
    expect(sampleLives.constructor.length).toBe(1);
  });

  it('returns an object with two properties and no methods', () => {
    expect(Object.getOwnPropertyNames(sampleLives).length).toBe(2);
    expect(getClassMethodNames(ExtraLives, sampleLives).length).toBe(0);
  });

  it('property "type" is a string', () => {
    expect(typeof sampleLives.type).toBe('string');
  });

  it('property "element" is an HTMLDivElement with four child elements', () => {
    expect(sampleLives.element.constructor.name).toBe('HTMLDivElement');
    expect(sampleLives.element.children.length).toBe(4);
  });
});
