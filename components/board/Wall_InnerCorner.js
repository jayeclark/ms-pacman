/* eslint-disable import/extensions */
import Element from './Element.js';
import { HTMLTag } from '../pieces/constants.js';

let ref = 0;

export default class WallInnerCorner extends Element {
  constructor(position, xDirection, yDirection, parentElement) {
    super();
    this.position = position;
    this.htmlTag = HTMLTag.DIV;
    this.parentElement = parentElement;
    this.xDirection = xDirection;
    this.yDirection = yDirection;
    this.classNames = ['inner-corner', `inner-${yDirection}-${xDirection}`];
    this.style = this.makeStyle();
    this.element = this.makeElement();

    ref += 1;
    this.ref = ref;
  }

  makeStyle() {
    const {
      board: { tileW },
    } = this.position;

    const top = parseInt(this.parentElement.style.top, 10);
    const left = parseInt(this.parentElement.style.left, 10);

    const style = {
      margin: '-1px',
      top: this.yDirection === 'top' ? `${top - tileW / 2 + 3}px` : `${top + tileW - 2}px`,
      left: this.xDirection === 'left' ? `${left - tileW / 2 + 3}px` : `${left + tileW - 2}px`,
    };
    return style;
  }
}
