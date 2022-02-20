/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

const { default: ArrowImg } = require('../../components/ArrowImg.js');

describe(format('ArrowImg'), () => {
  const sampleArrowImg = new ArrowImg('../../images/arrow.png', 'arrow-img', { background: 'red' }, 'my-arrow-img');

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(sampleArrowImg.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts between three and four arguments', () => {
    expect(sampleArrowImg.constructor.length).toBe(3);
  });

  it('returns an object with two properties and no methods', () => {
    expect(typeof sampleArrowImg).toBe('object');
    expect(Object.getOwnPropertyNames(sampleArrowImg).length).toBe(2);
    expect(getClassMethodNames(ArrowImg, sampleArrowImg).length).toBe(0);
  });

  it('property "type" is a string', () => {
    expect(typeof sampleArrowImg.type).toBe('string');
  });

  it('property "element" is an HTMLImageElement', () => {
    expect(sampleArrowImg.element.constructor.name).toBe('HTMLImageElement');
  });
});
