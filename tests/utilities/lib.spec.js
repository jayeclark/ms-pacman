/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect, describe } = require('@jest/globals');
const { format } = require('../jestHelpers');

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

const {
  camelCase,
  kebabCase,
  ghostGateCoords,
  startEntry,
  startReshuffle,
} = require('../../utilities/lib.js');
const { default: Ghost } = require('../../components/pieces/Ghost.js');
const { default: Board } = require('../../components/board/Board.js');
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

describe(format('Shared Utilities'), () => {
  describe('\ncamelCase(str)', () => {
    it('accepts one argument of type: string', () => {
      expect(camelCase.length).toBe(1);
    });

    it('returns a string', () => {
      const result = camelCase('some-string-i-wrote');
      expect(typeof result).toBe('string');
    });

    it('throws an error if the argument provided is not a string', () => {
      let errorMsg = '';
      let result = '';
      try {
        result = camelCase('some-string-goes-here');
      } catch (error) {
        errorMsg = error.message;
      }
      expect(errorMsg).toBeFalsy();
      expect(result).toBe('someStringGoesHere');

      result = '';
      try {
        result = camelCase(120);
      } catch (error) {
        errorMsg = error.message;
      }
      expect(errorMsg).toBeTruthy();
      expect(result).toBe('');
    });

    it('converts a kebab-case string to camelCase', () => {
      const result = camelCase('sample-kebab-case-string');
      expect(result).toBe('sampleKebabCaseString');
      const result2 = camelCase('sample-kebab-case--string');
      expect(result2).toBe('sampleKebabCaseString');
    });

    it('converts a snake_case string to camelCase', () => {
      const result = camelCase('sample_snake_case_string');
      expect(result).toBe('sampleSnakeCaseString');
      const result2 = camelCase('sample_snake__case_string');
      expect(result2).toBe('sampleSnakeCaseString');
    });

    it('converts a PascalCase string to camelCase', () => {
      const result = camelCase('SamplePascalCaseString');
      expect(result).toBe('samplePascalCaseString');
    });

    it('converts a mixed string to camelCase', () => {
      const result = camelCase('Sample-horror_show-string');
      expect(result).toBe('sampleHorrorShowString');
    });
  });

  describe('\nkebabCase(str)', () => {
    it('accepts one argument of type: string', () => {
      expect(kebabCase.length).toBe(1);
    });

    it('returns a string', () => {
      const result = kebabCase('someStringIWrote');
      expect(typeof result).toBe('string');
    });

    it('throws an error if the argument provided is not a string', () => {
      let errorMsg = '';
      let result = '';
      try {
        result = kebabCase('someStringGoesHere');
      } catch (error) {
        errorMsg = error.message;
      }
      expect(errorMsg).toBeFalsy();
      expect(result).toBe('some-string-goes-here');
      errorMsg = '';
      result = '';
      try {
        result = kebabCase({ name: 'myname' });
      } catch (error) {
        errorMsg = error.message;
      }
      expect(errorMsg).toBeTruthy();
      expect(result).toBe('');
    });

    it('converts a camelCase string to kebab-case', () => {
      const result = kebabCase('sampleCamelCaseString');
      expect(result).toBe('sample-camel-case-string');
      const result2 = kebabCase('sampleCamelCaseStringIWrote');
      expect(result2).toBe('sample-camel-case-string-i-wrote');
    });

    it('converts a snake_case string to kebab-case', () => {
      const result = kebabCase('sample_snake_case_string');
      expect(result).toBe('sample-snake-case-string');
      const result2 = kebabCase('sample_snake__case_string');
      expect(result2).toBe('sample-snake-case-string');
    });

    it('converts a PascalCase string to kebab-case', () => {
      const result = kebabCase('SamplePascalCaseString');
      expect(result).toBe('sample-pascal-case-string');
    });

    it('converts a mixed string to kebab-case', () => {
      const result = kebabCase('SampleHorror_show-string');
      expect(result).toBe('sample-horror-show-string');
    });
  });

  describe('\nghostGateCoords(board)', () => {
    it('accepts one argument - board: Board', () => {
      expect(ghostGateCoords.length).toBe(1);
    });
    it('returns an object with five properties - xS: number, yS: number, yE: number, leftPos: number, rightPos: number', () => {
      const result = ghostGateCoords(board);
      expect(result.xS).toBeTruthy();
      expect(result.yS).toBeTruthy();
      expect(result.yE).toBeTruthy();
      expect(result.leftPos).toBeTruthy();
      expect(result.rightPos).toBeTruthy();
    });
  });

  describe('\nstartEntry(item)', () => {
    it('accepts one argument - item: Ghost', () => {
      expect(startEntry.length).toBe(1);
    });
    it('changes four properties on the item object and updates one DOM element', async () => {
      const ghosts = [];
      const ghost = new Ghost(
        new Coordinates({ row: 5, col: 5, board }),
        'left',
        'red',
        'testGhost',
        'free',
      );
      expect(ghost.direction).toBe('left');
      expect(ghost.position.x).toBe(5 * board.tileW);
      expect(ghost.element.style.left).toBe(`${ghost.position.x - board.tileW / 2}px`);
      expect(ghost.status.mode).toBe('free');
      expect(ghostGate.style?.backgroundColor).toBe('');

      startEntry(ghost);
      expect(ghost.direction).toBe('down');
      expect(ghost.position.x).toBe(ghostGateCoords(board).xS);
      expect(ghost.element.style.left).toBe(`${ghost.position.x}px`);
      expect(ghost.status.mode).toBe('reentering');
      expect(ghostGate.style?.backgroundColor).toBe('black');

      const gateClose = new Promise((resolve, reject) => {
        setTimeout(() => {
          expect(ghostGate.style?.backgroundColor).toBe('rgb(225, 225, 251)');
          resolve('gate closed');
        }, 1000);
      });
      const result = await gateClose;
      expect(result).toBe('gate closed');
    });
  });

  describe('\nstartReshuffle(item, direction)', () => {
    it('accepts two arguments - item: Ghost, direction: string', () => {
      expect(startReshuffle.length).toBe(2);
    });
    it('changes two properties on the item object', () => {
      const ghosts = [];
      const ghost = new Ghost(
        new Coordinates({ row: 5, col: 5, board }),
        'down',
        'red',
        'testGhost',
        'reentering',
      );
      expect(ghost.direction).toBe('down');
      expect(ghost.status.mode).toBe('reentering');

      startReshuffle(ghost, 'right');
      expect(ghost.direction).toBe('right');
      expect(ghost.status.mode).toBe('reshuffling');
    });
  });
});
