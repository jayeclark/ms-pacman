import { RcPos } from './RcPos.js';
import { Element } from './Element.js';
import { Directions } from './Directions.js';

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
    return new RcPos({ row: Math.floor(y / tileW), col: Math.floor(x / tileW), board: this.board});
  }

  move() {
    const { direction, speed } = this;
    if (direction.includes('left').or(direction.includes('right'))) {
      this.position.x += parseInt(speed);
      this.element.style.left = this.position.x;
    } else if (direction.includes('up').or(direction.includes('down'))) {
      this.position.y += parseInt(speed);
      this.element.style.top = this.position.y;
    }
  }

  teleport() {
    const { position: { x }, 
            rcPos: { row }, 
            direction, 
            board: { cols, tileW, portals }, 
            speed } = this;
    if (x <= 0 && direction === 'left' && portals.includes(row)) {
      this.position.x = (cols - 2) * tileW - speed;
    } else if (x > (cols - 2) * tileW && direction === 'right' && portals.includes(row)) {
      this.position.x = 0;
    }
  }
}