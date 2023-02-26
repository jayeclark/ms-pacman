/* eslint-disable import/extensions */
import Directions from './Directions.js';
import Tile from './board/Tile.js';
import { isOpen, isBlocked, isBetween } from '../utilities/helpers.js';

export default class Coordinates {
  constructor({ row, col, board }) {
    this.row = row;
    this.col = col;
    this.board = board;
  }

  get left() {
    const { col: c, ...props } = this;
    return new Coordinates({ ...props, col: c - 1 });
  }

  get right() {
    const { col: c, ...props } = this;
    return new Coordinates({ ...props, col: c + 1 });
  }

  get down() {
    const { row: r, ...props } = this;
    return new Coordinates({ ...props, row: r + 1 });
  }

  get up() {
    const { row: r, ...props } = this;
    return new Coordinates({ ...props, row: r - 1 });
  }

  get top() {
    return this.up;
  }

  get bottom() {
    return this.down;
  }

  get xyCoordinates() {
    const {
      col,
      row,
      board: { tileW },
    } = this;
    return { x: col * tileW, y: row * tileW };
  }

  check(dir, width = 1, height = 1) {
    let pos = new Coordinates(this);
    const [results, { typeOf }] = [[], Tile];
    if (dir === 'right' && width > 1) {
      for (let i = 0; i < width; i += 1) {
        pos = pos[dir];
      }
    } else if (dir === 'down' && height > 1) {
      for (let i = 0; i < height; i += 1) {
        pos = pos[dir];
      }
    } else {
      pos = pos[dir];
    }
    results.push(typeOf(Tile.at(pos)));
    if (height > 1 && (dir === 'right' || dir === 'left')) {
      for (let i = 1; i < height; i += 1) {
        pos = pos.down;
        results.push(typeOf(Tile.at(pos)));
      }
    } else if (width > 1 && (dir === 'up' || dir === 'down')) {
      for (let i = 1; i < width; i += 1) {
        pos = pos.right;
        results.push(typeOf(Tile.at(pos)));
      }
    }
    return results;
  }

  resolveDirection(dirA, dirB) {
    if (dirA === 'same') {
      return dirB;
    }
    if (dirB === 'same') {
      return dirA;
    }

    function walk(pos, direction, otherDirection) {
      const newPos = pos;
      const d = new Directions(pos.board);
      let [stop, canTurn, length] = [false, false, 0];
      const {
        board: { cols },
      } = pos;

      while (canTurn === false && stop === false && isBetween(newPos.col, [0, cols - 1])) {
        if (newPos.check(otherDirection, 2, 2).every((tile) => isOpen(tile)) && length > 1) {
          canTurn = true;
        } else if (newPos.check(direction, 2, 2).some((tile) => isBlocked(tile))) {
          stop = true;
        } else {
          length += 1;
          newPos.row += d[direction].row;
          newPos.col += d[direction].col;
          if (newPos.col < 0) {
            newPos.col = cols - 1;
          } else if (newPos.col > cols - 1) {
            newPos.col = 1;
          }
        }
      }
      return { canTurn, length };
    }

    const [run1, run2] = [
      walk(new Coordinates(this), dirA, dirB),
      walk(new Coordinates(this), dirB, dirA),
    ];
    if (run1.canTurn !== run2.canTurn) {
      return (run1.canTurn && dirA) || dirB;
    }
    return (run1.length < run2.length && dirA) || dirB;
  }
}
