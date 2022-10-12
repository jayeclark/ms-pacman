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

const { default: Coordinates } = require('../../components/Coordinates.js');
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

describe(format('Coordinates'), () => {
  const testPos = new Coordinates({ row: 8, col: 8, board });

  it('has a constructor that accepts one argument - { row: number, col: number, board: Board }: Object', () => {
    expect(testPos.constructor.length).toBe(1);
  });

  it('returns an object with three properties and two methods', () => {
    expect(typeof testPos).toBe('object');
    expect(Object.getOwnPropertyNames(testPos).length).toBe(3);
    const props = ['row', 'col', 'board'];
    expect(Object.getOwnPropertyNames(testPos).every((name) => props.includes(name))).toBeTruthy();
    expect(getClassMethodNames(Coordinates, testPos).length).toBe(2);
  });

  it('properties "row" and "col" are numbers', () => {
    expect(typeof testPos.row).toBe('number');
    expect(typeof testPos.col).toBe('number');
  });

  it('property "board" is a an object of class Board', () => {
    expect(typeof testPos.board).toBe('object');
    expect(testPos.board.constructor.name).toBe('Board');
  });

  describe('\n  CLASS GETTERS', () => {
    describe('\n    get left()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
    describe('\n    get right()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
    describe('\n    get down()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
    describe('\n    get up()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
    describe('\n    get bottom()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
    describe('\n    get top()', () => {
      it('returns an object of class Coordinates', () => {
        expect(typeof testPos.left).toBe('object');
        expect(testPos.left.constructor.name).toBe('Coordinates');
      });
    });
  });

  describe('\n  CLASS METHODS', () => {
    describe('\n    check()', () => {
      it('accepts one to three arguments - dir: string, width: number, height: number', () => {
        expect(testPos.check.length).toBe(1);
      });

      it('returns an array', () => {
        const result = testPos.check('left', 2, 2);
        expect(typeof result).toBe('object');
        expect(result.constructor.name).toBe('Array');
      });
    });

    describe('\n    resolveDirection(dirA, dirB)', () => {
      it('accepts two arguments', () => {
        expect(testPos.resolveDirection.length).toBe(2);
      });

      it('returns a string', () => {
        expect(typeof testPos.resolveDirection('left', 'up')).toBe('string');
      });

      it('returns one of the two initial arguments', () => {
        expect(testPos.resolveDirection('left', 'up')).toBe('left' || 'up');
      });
    });
  });
});
