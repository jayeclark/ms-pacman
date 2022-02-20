/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect, describe } = require('@jest/globals');
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

const { default: GhostBox } = require('../../components/GhostBox.js');
const { default: Board } = require('../../components/Board.js');

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

describe(format('GhostBox'), () => {
  const testBox = new GhostBox(board);

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(testBox.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts one argument - board: Board', () => {
    expect(testBox.constructor.length).toBe(1);
  });

  it('returns an object with three properties and three methods', () => {
    expect(typeof testBox).toBe('object');
    expect(Object.getOwnPropertyNames(testBox).length).toBe(3);
    expect(getClassMethodNames(GhostBox, testBox).length).toBe(3);
  });

  it('property "type" is a string', () => {
    expect(typeof testBox.type).toBe('string');
  });

  it('property "element" is an HTMLDivElement with two children', () => {
    expect(testBox.element.constructor.name).toBe('HTMLDivElement');
    expect(testBox.element.children.length).toBe(2);
  });

  it('property "board" is a an object of class Board', () => {
    expect(typeof testBox.board).toBe('object');
    expect(testBox.board.constructor.name).toBe('Board');
  });

  describe('\n  CLASS GETTERS', () => {
    describe('\n    get tileW()', () => {
      it('returns a number', () => {
        expect(typeof testBox.tileW).toBe('number');
      });

      it('returns the tileW property from this.board', () => {
        const { tileW } = board;
        expect(testBox.tileW).toBe(tileW);
      });
    });
  });

  describe('\n  CLASS METHODS', () => {
    game.appendChild(testBox.element);

    describe('\n    makeStyle()', () => {
      it('accepts no arguments', () => {
        expect(testBox.makeStyle.length).toBe(0);
      });

      it('returns an object with four properties', () => {
        expect(typeof testBox.makeStyle()).toBe('object');
        expect(Object.getOwnPropertyNames(testBox.makeStyle()).length).toBe(4);
      });
    });

    describe('\n    addInner()', () => {
      it('accepts no arguments', () => {
        expect(testBox.addInner.length).toBe(0);
      });

      it('appends a child element to this.element', () => {
        expect(testBox.element.children.length).toBe(2);
        testBox.addInner();
        expect(testBox.element.children.length).toBe(3);
        const addedElement = document.getElementById('inner-ghostbox');
        const { parentNode } = addedElement;
        parentNode.removeChild(addedElement);
      });
    });

    describe('\n    addGate()', () => {
      it('accepts no arguments', () => {
        expect(testBox.addInner.length).toBe(0);
      });

      it('appends a child element to this.element', () => {
        expect(testBox.element.children.length).toBe(2);
        testBox.addInner();
        expect(testBox.element.children.length).toBe(3);
        const addedElement = document.getElementById('ghost-gate');
        const { parentNode } = addedElement;
        parentNode.removeChild(addedElement);
      });
    });
  });
});
