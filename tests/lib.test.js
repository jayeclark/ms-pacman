/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
const stylesheet = document.createElement('style');
stylesheet.id = 'header-style-sheet';
const game = document.createElement('div');
game.id = 'game';
document.head.appendChild(stylesheet);
document.body.appendChild(game);

const {
  camelCase,
  kebabCase,
  endEntry,
  ghostGateCoords,
  startEntry,
  startReshuffle,
} = require('../utilities/lib.js');
const { default: Ghost } = require('../components/Ghost.js');
const { default: Board } = require('../components/Board.js');
const { default: RcPos } = require('../components/RcPos.js');

describe('\ncamelCase:', () => {
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
    } catch (error) { errorMsg = error.message; }
    expect(errorMsg).toBeFalsy();
    expect(result).toBe('someStringGoesHere');
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

describe('\nkebabCase:', () => {
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
    } catch (error) { errorMsg = error.message; }
    expect(errorMsg).toBeFalsy();
    expect(result).toBe('some-string-goes-here');
    errorMsg = '';
    result = '';
    try {
      result = kebabCase({ name: 'myname' });
    } catch (error) { errorMsg = error.message; }
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

describe('\nendEntry:', () => {
  it('accepts two arguments - item: object, finalDirection: string', () => {
    expect(endEntry.length).toBe(2);
  });
  it('changes two properties on the item object and calls one class method', () => {
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
    const ghosts = [];
    const ghost = new Ghost(
      new RcPos({ row: 5, col: 5, board }),
      'left',
      'red',
      'testGhost',
      'free',
    );
    const spawn = jest.spyOn(ghost, 'spawn');
    expect(ghost.direction).toBe('left');
    expect(ghost.speed).toBe(-board.speed);
    expect(spawn).not.toHaveBeenCalled();
    endEntry(ghost, 'up');
    expect(ghost.direction).toBe('up');
    expect(ghost.speed).toBe(0);
    expect(spawn).toHaveBeenCalled();
  });
});
