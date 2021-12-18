/* eslint-disable import/extensions */
import Element from './Element.js';

export default class MessageDiv extends Element {
  constructor(style, id, innerHTML) {
    super();
    this.element = this.makeElement("div", "message", style, id);
    this.element.innerHTML = innerHTML;
  }
}
