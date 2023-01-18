/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect, describe } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
const game = document.createElement('div');
game.id = 'game';
const body = document.getElementsByTagName('body')[0];
body.appendChild(game);

const { default: Element } = require('../../components/board/Element.js');

describe(format('Element'), () => {
  const testElement = new Element();

  it('has a constructor that accepts no arguments', () => {
    expect(testElement.constructor.length).toBe(0);
  });

  it('returns an object with two properties and two methods', () => {
    expect(typeof testElement).toBe('object');
    expect(Object.getOwnPropertyNames(testElement).length).toBe(2);
    expect(getClassMethodNames(Element, testElement).length).toBe(2);
  });

  it('property "type" is a string', () => {
    expect(typeof testElement.type).toBe('string');
  });

  describe('\n  CLASS METHODS:', () => {
    describe('\n    makeElement({tag, classNames, style[, id]})', () => {
      it('accepts one argument - {tag: string, classNames: string or Array, style: object[, id: string]}', () => {
        expect(testElement.makeElement.length).toBe(1);
      });

      it('returns an HTMLElement', () => {
        const divElement = testElement.makeElement({
          tag: 'div',
          classNames: 'my-class',
          style: { color: 'red' },
        });
        expect(divElement.constructor.name).toBe('HTMLDivElement');
        const imgElement = testElement.makeElement({
          tag: 'img',
          classNames: 'my-class',
          style: { color: 'red' },
        });
        expect(imgElement.constructor.name).toBe('HTMLImageElement');
        expect(Object.getPrototypeOf(divElement.constructor).name).toBe('HTMLElement');
        expect(Object.getPrototypeOf(imgElement.constructor).name).toBe('HTMLElement');
      });
    });
    describe('\n    addTo(id)', () => {
      it('accepts one argument - id: string', () => {
        expect(testElement.addTo.length).toBe(1);
      });

      it('returns true if an element with the provided id exists in the document', () => {
        testElement.element = testElement.makeElement({
          tag: 'div',
          classNames: 'my-class',
          style: { color: 'red' },
        });
        expect(testElement.addTo('game')).toBeTruthy();
      });

      it('throws an error and returns false if an element with the provided id does not exist in the document', () => {
        testElement.element = testElement.makeElement({
          tag: 'div',
          classNames: 'my-class',
          style: { color: 'red' },
        });
        let errorMsg = '';
        let result = '';
        try {
          result = testElement.addTo('nonexistent-id');
        } catch (error) {
          errorMsg = error.message;
        }
        expect(errorMsg).toBeTruthy();
        expect(result).toBeFalsy();
      });
    });
  });
});
