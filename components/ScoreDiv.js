/* eslint-disable import/extensions */
import Element from './Element.js';

export default class ScoreDiv extends Element {
  constructor(classNames, style, id = null, innerHTML = null) {
    super();
    this.element = this.makeElement("div", classNames, style, id);
    this.element.innerHTML = innerHTML;
  }
}