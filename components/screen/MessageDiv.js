/* eslint-disable import/extensions */
import Element from '../board/Element.js';

export default class MessageDiv extends Element {
  constructor(style, id, innerHTML) {
    super();
    this.element = this.makeElement({
      tag: 'div',
      classNames: 'message',
      style,
      id,
    });
    this.element.innerHTML = innerHTML;
  }
}
