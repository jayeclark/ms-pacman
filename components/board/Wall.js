/* eslint-disable import/extensions */
import Element from './Element.js';
import Tile from './Tile.js';
import { camelCase } from '../../utilities/lib.js';
import { HTMLTag } from '../pieces/constants.js';
import WallInnerCorner from './Wall_InnerCorner.js';

const WALL_HTML_TAG = HTMLTag.DIV;
const WALL_CLASS_NAMES = 'wall';

const game = document.getElementById('game');
let ref = 0;

export default class Wall extends Element {
  constructor(position) {
    super();
    this.position = position;
    this.htmlTag = WALL_HTML_TAG;
    this.classNames = WALL_CLASS_NAMES;
    this.style = this.makeStyle();
    this.element = Element.make(this);
    ref += 1;
    this.ref = ref;
    this.innerCorners = this.addInnerCorners(position);
  }

  get top() {
    return this.position.row * this.position.board.tileW;
  }

  get left() {
    return this.position.col * this.position.board.tileW;
  }

  makeStyle() {
    const { tileW } = this.position.board;
    const { typeOf, cornerTypesAt } = Tile;
    const style = {
      top: this.top,
      left: this.left,
      width: `${tileW + 1}px`,
      height: `${tileW + 1}px`,
    };

    // Add outer corners
    const outerCorners = Object.entries(cornerTypesAt(this.position)).filter(
      (item) => item[1] === 'outer',
    );
    outerCorners.forEach((item) => {
      style[camelCase(`border-${item[0]}-radius`)] = `${tileW / 2}px`;
    });

    // Remove unneeded borders
    ['top', 'bottom', 'left', 'right'].forEach((adjacent) => {
      if (typeOf(Tile.at(this.position[adjacent])) !== 'hall') {
        style[camelCase(`border-${adjacent}`)] = 'none';
      }
    });
    return style;
  }

  addInnerCorners() {
    const { cornerTypesAt } = Tile;
    const innerCorners = Object.entries(cornerTypesAt(this.position)).filter(
      (item) => item[1] === 'inner',
    );
    innerCorners.forEach((item) => {
      const [yDirection, xDirection] = item[0].split(/(?=[LR])/).map((x) => x.toLowerCase());
      const innerCorner = new WallInnerCorner(this.position, xDirection, yDirection, this.element);
      game.appendChild(innerCorner.element);
    });
  }
}
