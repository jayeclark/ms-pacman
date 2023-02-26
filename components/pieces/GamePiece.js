/* eslint-disable import/extensions */
import Coordinates from '../Coordinates.js';
import Element from '../board/Element.js';
import Directions from '../Directions.js';

export default class GamePiece extends Element {
  constructor(position, startingDirection) {
    super();
    this.board = position.board;
    this.speed = new Directions(position.board)[startingDirection].speed;
    this.position = position.xyCoordinates;
    this.direction = startingDirection;
  }

  get coordinates() {
    const {
      position: { x, y },
      board: { tileW },
    } = this;
    return new Coordinates({
      row: Math.floor(y / tileW),
      col: Math.floor(x / tileW),
      board: this.board,
    });
  }

  blink(handleReappearance) {
    function doBlink(item, callback, blinkCount = 0) {
      const {
        element: { style },
      } = item;
      if (blinkCount === 11) {
        callback(item);
        return true;
      }
      if (blinkCount % 2 === 0) {
        style.display = '';
      } else {
        style.display = 'none';
      }
      setTimeout(() => {
        if (Object.keys(item).includes('style')) {
          doBlink(item, callback, blinkCount + 1);
        }
      }, 200);

      return true;
    }

    doBlink(this, handleReappearance);
  }

  move() {
    const { direction, speed } = this;
    if (direction.includes('left') || direction.includes('right')) {
      this.position.x += parseInt(speed, 10);
      this.element.style.left = this.position.x;
    } else if (direction.includes('up') || direction.includes('down')) {
      this.position.y += parseInt(speed, 10);
      this.element.style.top = this.position.y;
    }
  }

  teleport() {
    const {
      position: { x },
      coordinates: { row },
      direction,
      board: { cols, tileW, portals },
      speed,
    } = this;
    if (x <= 0 && direction === 'left' && portals.includes(row)) {
      this.position.x = (cols - 2) * tileW - speed;
    } else if (x > (cols - 2) * tileW && direction === 'right' && portals.includes(row)) {
      this.position.x = 0;
    }
  }
}
