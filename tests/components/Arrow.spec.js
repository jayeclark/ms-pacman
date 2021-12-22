/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

const { default: Arrow } = require('../../components/Arrow.js');

describe(format('Arrow'), () => {
  const sampleArrow = new Arrow('test-class', { background: 'red' }, 'my-arrow', 'test');

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(sampleArrow.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts two to four arguments', () => {
    expect(sampleArrow.constructor.length).toBe(2);
  });

  it('returns an object with two properties and no methods', () => {
    expect(Object.getOwnPropertyNames(sampleArrow).length).toBe(2);
    expect(getClassMethodNames(Arrow, sampleArrow).length).toBe(0);
  });

  it('property "type" is a string', () => {
    expect(typeof sampleArrow.type).toBe('string');
  });

  it('property "element" is an HTMLDivElement', () => {
    expect(sampleArrow.element.constructor.name).toBe('HTMLDivElement');
  });
});
