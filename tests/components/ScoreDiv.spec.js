/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */

const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');
const { getClassMethodNames, format } = require('../jestHelpers.js');

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

const { default: ScoreDiv } = require('../../components/screen/ScoreDiv.js');

describe(format('ScoreDiv'), () => {
  const sampleScore = new ScoreDiv(
    'score-div',
    { backgroundColor: 'black' },
    'test-msg',
    '<div>This is a message</div>',
  );

  it('extends class Element', () => {
    const instance = Object.getPrototypeOf(sampleScore.constructor).name;
    expect(instance).toBe('Element');
  });

  it('has a constructor that accepts two to four arguments', () => {
    expect(sampleScore.constructor.length).toBe(2);
  });

  it('returns an object with two properties and no methods', () => {
    expect(Object.getOwnPropertyNames(sampleScore).length).toBe(2);
    expect(getClassMethodNames(ScoreDiv, sampleScore).length).toBe(0);
  });

  it('property "type" is a string', () => {
    expect(typeof sampleScore.type).toBe('string');
  });

  it('property "element" is an HTMLDivElement with one or zero child elements', () => {
    expect(sampleScore.element.constructor.name).toBe('HTMLDivElement');
    expect(sampleScore.element.children.length).toBe(1);
    const sampleScore2 = new ScoreDiv(
      'score-div-2',
      { backgroundColor: 'black' },
      'test-msg',
      'This is a text node message',
    );
    expect(sampleScore2.element.children.length).toBe(0);
  });
});
