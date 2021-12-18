/* eslint-disable import/extensions */
import Element from './Element.js';

export default class ArrowImg extends Element {
  constructor(src, classNames, style, id = null) {
    super();
    this.element = this.makeElement("img", classNames, style, id);
    this.element.src = src;
  }
}
