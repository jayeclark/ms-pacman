/* eslint-disable import/extensions */
import Element from './Element.js';
import Tile from './Tile.js';
import { camelCase } from '../../utilities/lib.js';
import { HTMLTag } from '../pieces/constants.js';
import WallInnerCorner from './Wall_InnerCorner.js';

const game = document.getElementById('game');
let ref = 0;

export default class Wall extends Element {
  constructor(position) {
    super();
    this.position = position;
    this.htmlTag = HTMLTag.DIV;
    this.classNames = 'wall';
    this.style = this.makeStyle(position);
    this.element = this.makeElement();
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

  makeStyle(position) {
    const [
      {
        board: { tileW },
      },
      { typeOf, cornerTypesAt },
    ] = [position, Tile];
    const style = {
      top: this.top,
      left: this.left,
      width: `${tileW + 1}px`,
      height: `${tileW + 1}px`,
    };

    // Add outer corners
    const outerCorners = Object.entries(cornerTypesAt(position)).filter(
      (item) => item[1] === 'outer',
    );
    outerCorners.forEach((item) => {
      style[camelCase(`border-${item[0]}-radius`)] = `${tileW / 2}px`;
    });

    // Remove unneeded borders
    ['top', 'bottom', 'left', 'right'].forEach((adjacent) => {
      if (typeOf(Tile.at(position[adjacent])) !== 'hall') {
        style[camelCase(`border-${adjacent}`)] = 'none';
      }
    });
    return style;
  }

  addInnerCorners(position) {
    const { cornerTypesAt } = Tile;
    const innerCorners = Object.entries(cornerTypesAt(position)).filter(
      (item) => item[1] === 'inner',
    );
    innerCorners.forEach((item) => {
      const [yDirection, xDirection] = item[0].split(/(?=[LR])/).map((x) => x.toLowerCase());
      const innerCorner = new WallInnerCorner(this.position, xDirection, yDirection, this.element);
      game.appendChild(innerCorner.element);
    });
  }
}
