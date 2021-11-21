import { RcPos } from './board.js';
import { Element } from './Element.js';
Boolean.prototype.or = function(bool2) { return this || bool2 };

export class GamePiece extends Element {

  constructor(position, startingDirection) {
    super();
    this.board = position.board;
    this.speed = position.board.speed;
    this.position = position.xyCoordinates;
    this.direction = startingDirection;
  }

  get rcPos() {
    const { position: { x, y }, board: { tileW } } = this;
    return new RcPos(Math.floor(y / tileW), Math.floor(x / tileW), this.board);
  }

  move() {
    const { direction } = this;
    if (direction.includes('left').or(direction.includes('right'))) {
      this.position.x += this.speed;
      this.element.style.left = this.position.x;
    } else if (direction.includes('up').or(direction.includes('down'))) {
      this.position.y += this.speed;
      this.element.style.top = this.position.y;
    }
  }

}