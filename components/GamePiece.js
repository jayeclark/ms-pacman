import { RcPos } from './board.js';
import { Element } from './Element.js';
import { Directions } from './Directions.js';
Boolean.prototype.or = function(bool2) { return this || bool2 };

export class GamePiece extends Element {

  constructor(position, startingDirection) {
    super();
    this.board = position.board;
    this.speed = new Directions(position.board)[startingDirection].speed;
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

  teleport() {
    const { position: { x }, direction, board: { cols, tileW }, speed } = this;
    if (x <= 0 && direction === 'left') {
      this.position.x = (cols - 2) * tileW - speed;
    } else if (x > (cols - 2) * tileW && direction === 'right') {
      this.position.x = 0;
    }
  }

}