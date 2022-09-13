/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

const { default: MessageDiv } = require('../../components/MessageDiv.js');

describe(format('MessageDiv'), () => {
  const sampleMsg = new MessageDiv({ backgroundColor: 'black' }, 'test-msg', '<div>This is a message</div>');

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(sampleMsg.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts three arguments', () => {
    expect(sampleMsg.constructor.length).toBe(3);
  });

  it('returns an object with two properties and no methods', () => {
    expect(Object.getOwnPropertyNames(sampleMsg).length).toBe(2);
    expect(getClassMethodNames(MessageDiv, sampleMsg).length).toBe(0);
  });

  it('property "type" is a string', () => {
    expect(typeof sampleMsg.type).toBe('string');
  });

  it('property "element" is an HTMLDivElement with one or zero child elements', () => {
    expect(sampleMsg.element.constructor.name).toBe('HTMLDivElement');
    expect(sampleMsg.element.children.length).toBe(1);
    const sampleMsg2 = new MessageDiv({ backgroundColor: 'black' }, 'test-msg', 'This is a text node message');
    expect(sampleMsg2.element.children.length).toBe(0);
  });
});
