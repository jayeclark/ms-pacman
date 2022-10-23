/* eslint-disable import/extensions */
import Coordinates from '../Coordinates.js';
import Element from '../board/Element.js';
import GamePieceType from './constants.js';

export default class GamePiece extends Element {
  constructor(position, startingDirection) {
    super();
    this.board = position.board;
    this.position = position.xyCoordinates;
    this.direction = startingDirection;
    this.type = GamePieceType.Static;
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
}
