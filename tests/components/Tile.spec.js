/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect, describe } = require('@jest/globals');
const { getClassMethodNames, getClassStaticMethodNames, format } = require('../jestHelpers.js');

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

const { default: Tile } = require('../../components/Tile.js');
const { default: Board } = require('../../components/Board.js');
const { default: Coordinates } = require('../../components/Coordinates.js');

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

describe(format('Tile'), () => {
  it('has no specific constructor function', () => {
    expect(Tile.prototype.constructor.name).toBe('Tile');
  });

  it('has four static methods', () => {
    expect(getClassStaticMethodNames(Tile).length).toBe(4);
  });

  describe('\n  STATIC METHODS', () => {
    describe('\n    adjacentTiles()', () => {
      it('accepts one argument - position: Coordinates', () => {
        expect(Tile.adjacentTiles.length).toBe(1);
      });

      it('returns an object with 8 properties: top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft', () => {
        const result = Tile.adjacentTiles(new Coordinates({ row: 5, col: 5, board }));
        expect(typeof result).toBe('object');
        const allowedProps = ['top', 'topRight', 'right', 'bottomRight', 'bottom', 'bottomLeft', 'left', 'topLeft'];
        const props = Object.getOwnPropertyNames(result);
        expect(props.length).toBe(8);
        expect(props.every((x) => allowedProps.includes(x))).toBeTruthy();
      });

      it('it calls Tile.at to determine the value of each property', () => {
        const mockAt = jest.spyOn(Tile, 'at');
        const result = Tile.adjacentTiles(new Coordinates({ row: 5, col: 5, board }));
        expect(mockAt).toHaveBeenCalledTimes(8);
        const position = new Coordinates({ row: 5, col: 5, board });
        const tileAtLeft = Tile.at(position.left);
        expect(result.left).toBe(tileAtLeft);
      });
    });

    describe('\n    at()', () => {
      it('accepts one argument - position: Coordinates', () => {
        let errorMsg = '';
        let result = '';
        try {
          result = Tile.at();
        } catch (error) {
          errorMsg = error.message;
        }
        expect(errorMsg).toBeTruthy();
        expect(Tile.at(new Coordinates({ row: 5, col: 5, board }))).toBeTruthy();
      });

      it('returns a string of length = 1', () => {
        const result = Tile.at(new Coordinates({ row: 5, col: 5, board }));
        expect(typeof result).toBe('string');
        expect(result.length).toBe(1);
      });

      it('returns a character representing the character at that position in the layout', () => {
        const result = Tile.at(new Coordinates({ row: 5, col: 5, board }));
        const result2 = Tile.at(new Coordinates({ row: 0, col: 0, board }));
        const result3 = Tile.at(new Coordinates({ row: 14, col: 14, board }));
        const result4 = Tile.at(new Coordinates({ row: 12, col: 14, board }));
        expect(result).toBe('-');
        expect(result2).toBe('X');
        expect(result3).toBe('G');
        expect(result4).toBe('S');
      });

      it('returns "E" if the provided coordinates are past the edge of the board', () => {
        const result = Tile.at(new Coordinates({ row: 5, col: board.cols + 1, board }));
        const result2 = Tile.at(new Coordinates({ row: 5, col: -1, board }));
        const result3 = Tile.at(new Coordinates({ row: board.rows + 1, col: 5, board }));
        const result4 = Tile.at(new Coordinates({ row: -1, col: 5, board }));
        expect(result).toBe('E');
        expect(result2).toBe('E');
        expect(result3).toBe('E');
        expect(result4).toBe('E');
      });
    });

    describe('\n    cornerTypesAt()', () => {
      it('accepts one argument - position: Coordinates', () => {
        expect(Tile.cornerTypesAt.length).toBe(1);
      });

      it('returns an object with 4 properties: top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft', () => {
        const result = Tile.cornerTypesAt(new Coordinates({ row: 5, col: 5, board }));
        expect(typeof result).toBe('object');
        const allowedProps = ['topRight', 'bottomRight', 'bottomLeft', 'topLeft'];
        const props = Object.getOwnPropertyNames(result);
        expect(props.length).toBe(4);
        expect(props.every((x) => allowedProps.includes(x))).toBeTruthy();
      });

      it('it calls Tile.adjacentTiles to determine the value of each property', () => {
        const mockAdj = jest.spyOn(Tile, 'adjacentTiles');
        const result = Tile.cornerTypesAt(new Coordinates({ row: 5, col: 5, board }));
        expect(mockAdj).toHaveBeenCalledTimes(1);
      });
    });
  });
});
