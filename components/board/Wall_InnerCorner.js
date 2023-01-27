/* eslint-disable import/extensions */
import Element from './Element.js';
import { HTMLTag } from '../pieces/constants.js';

const WALL_INNER_CORNER_HTML_TAG = HTMLTag.DIV;
const WALL_INNER_CORNER_BASE_CLASS_NAMES = ['inner-corner'];
const WALL_INNER_CORNER_BASE_STYLE = {
  margin: '-1px',
};

let ref = 0;

export default class WallInnerCorner extends Element {
  constructor(position, xDirection, yDirection, parentElement) {
    super();
    this.position = position;
    this.htmlTag = WALL_INNER_CORNER_HTML_TAG;
    this.parentElement = parentElement;
    this.xDirection = xDirection;
    this.yDirection = yDirection;
    this.classNames = this.makeClassNames();
    this.style = this.makeStyle();
    this.element = Element.make(this);

    ref += 1;
    this.ref = ref;
  }

  makeClassNames() {
    return [...WALL_INNER_CORNER_BASE_CLASS_NAMES, `inner-${this.yDirection}-${this.xDirection}`];
  }

  makeStyle() {
    const {
      board: { tileW },
    } = this.position;

    const top = parseInt(this.parentElement.style.top, 10);
    const left = parseInt(this.parentElement.style.left, 10);

    const style = {
      ...WALL_INNER_CORNER_BASE_STYLE,
      top: this.yDirection === 'top' ? `${top - tileW / 2 + 3}px` : `${top + tileW - 2}px`,
      left: this.xDirection === 'left' ? `${left - tileW / 2 + 3}px` : `${left + tileW - 2}px`,
    };
    return style;
  }
}
