/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect, describe } = require('@jest/globals');
const { format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

const {
  isOpen,
  isBlocked,
  isBetween,
  get,
} = require('../../utilities/helpers.js');

const testElement1 = document.createElement('div');
testElement1.id = 'test-element-id';
document.body.appendChild(testElement1);

const testElement2 = document.createElement('div');
testElement2.classList.add('test-element-class');
const testElement3 = document.createElement('div');
testElement3.classList.add('test-element-class');

document.body.appendChild(testElement2);
document.body.appendChild(testElement3);

describe(format('Helper Functions'), () => {
  describe('\nisOpen(pos)', () => {
    it('accepts one argument - pos: string', () => {
      expect(isOpen.length).toBe(1);
    });

    it('returns a boolean', () => {
      const result = isOpen('wall');
      expect(typeof result).toBe('boolean');
    });

    it('identifies string "wall" as indicating a tile is not open', () => {
      expect(isOpen('wall')).toBe(false);
    });

    it('identifies string "ghostbox" as indicating a tile is not open', () => {
      expect(isOpen('ghostbox')).toBe(false);
    });

    it('identifies strings other than "wall" and "ghostbox" as indicating a tile is open', () => {
      expect(isOpen('hall')).toBe(true);
      expect(isOpen('anystring')).toBe(true);
    });
  });

  describe('\nisBlocked(pos)', () => {
    it('accepts one argument - pos: string', () => {
      expect(isBlocked.length).toBe(1);
    });

    it('returns a boolean', () => {
      const result = isBlocked('wall');
      expect(typeof result).toBe('boolean');
    });

    it('identifies string "wall" as indicating a tile is blocked', () => {
      expect(isBlocked('wall')).toBe(true);
    });

    it('identifies string "ghostbox" as indicating a tile is blocked', () => {
      expect(isBlocked('ghostbox')).toBe(true);
    });

    it('identifies strings other than "wall" and "ghostbox" as indicating a tile is not blocked', () => {
      expect(isBlocked('hall')).toBe(false);
      expect(isBlocked('anystring')).toBe(false);
    });
  });

  describe('\nisBetween(val, [a, b]', () => {
    it('accepts two arguments - value: number, [a, b]: Array', () => {
      expect(isBetween.length).toBe(2);
    });

    it('returns a boolean', () => {
      expect(typeof isBetween(7, [4, 10])).toBe('boolean');
    });

    it('identifies when a number is between the two values a & b (inclusive)', () => {
      expect(isBetween(7, [4, 10])).toBe(true);
      expect(isBetween(7, [7, 10])).toBe(true);
      expect(isBetween(7, [4, 7])).toBe(true);
    });

    it('identifies when a number is not between the two values a & b (inclusive)', () => {
      expect(isBetween(3, [4, 10])).toBe(false);
      expect(isBetween(11, [7, 10])).toBe(false);
    });

    it('accepts floating point numbers as arguments', () => {
      expect(isBetween(3.4, [4.5, 10.1])).toBe(false);
      expect(isBetween(8.4, [7.8, 10.333])).toBe(true);
    });

    it('accepts big integers as as arguments', () => {
      const [val, a, b] = [BigInt(20), BigInt(10), BigInt(20000000)];
      expect(isBetween(val, [a, b])).toBe(true);
      expect(isBetween(BigInt(1), [a, b])).toBe(false);
    });

    it('accepts range numbers a & b in any order', () => {
      expect(isBetween(7, [10, 4])).toBe(true);
      expect(isBetween(12, [10, 7])).toBe(false);
      expect(isBetween(3, [10, 7])).toBe(false);
    });
  });

  describe('\nget(str)', () => {
    it('accepts one argument - str: string', () => {
      expect(get.length).toBe(1);
    });

    it('returns an HTML element or an array of HTML elements', () => {
      const result = get('#test-element-id');
      expect(result.constructor.toString().includes('class HTMLDivElement')).toBe(true);

      const result2 = get('.test-element-class');
      expect(result2.length).toBe(2);
      expect(result2[0].constructor.toString().includes('class HTMLDivElement')).toBe(true);
      expect(result2[1].constructor.toString().includes('class HTMLDivElement')).toBe(true);
    });

    it('searches by ID if the string starts with #', () => {
      const result = get('#test-element-id');
      expect(result).toBeTruthy();

      const result2 = get('#test-element-id-fake');
      expect(result2).toBeFalsy();
    });

    it('searches by class name if the string starts with .', () => {
      const result = get('.test-element-class');
      expect(result).toBeTruthy();

      const result2 = get('.test-element-class-fake');
      expect(result2).toBeFalsy();
    });
  });
});
