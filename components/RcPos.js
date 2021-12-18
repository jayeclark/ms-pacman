import Directions from "./Directions.js";
import Tile from "./Tile.js";

export default class RcPos {
  constructor({ row, col, board }) {
    this.row = row;
    this.col = col;
    this.board = board;
  }

  get left() {
    let { col: c, ...props } = this;
    return new RcPos({ ...props, col: c - 1 });
  }
  get right() {
    let { col: c, ...props } = this;
    return new RcPos({ ...props, col: c + 1 });
  }
  get down() {
    let { row: r, ...props } = this;
    return new RcPos({ ...props, row: r + 1 });
  }
  get up() {
    let { row: r, ...props } = this;
    return new RcPos({ ...props, row: r - 1 });
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
    let [results, pos, { typeOf }] = [[], new RcPos(this), Tile];
    if (dir === "right" && width > 1) {
      for (let i = 0; i < width; i++) {
        pos = pos[dir];
      }
    } else if (dir === "down" && height > 1) {
      for (let i = 0; i < height; i++) {
        pos = pos[dir];
      }
    } else {
      pos = pos[dir];
    }
    results.push(typeOf(Tile.at(pos)));
    if (height > 1 && (dir === "right" || dir === "left")) {
      for (let i = 1; i < height; i++) {
        pos = pos.down;
        results.push(typeOf(Tile.at(pos)));
      }
    } else if (width > 1 && (dir === "up" || dir === "down")) {
      for (let i = 1; i < width; i++) {
        pos = pos.right;
        results.push(typeOf(Tile.at(pos)));
      }
    }
    return results;
  }

  resolveDirection(dirA, dirB) {
    if (dirA === "same") {
      return dirB;
    } else if (dirB === "same") {
      return dirA;
    }
    const [run1, run2] = [
      walk(new RcPos(this), dirA, dirB),
      walk(new RcPos(this), dirB, dirA),
    ];
    if (run1.canTurn !== run2.canTurn) {
      return (run1.canTurn && dirA) || dirB;
    }
    return (run1.length < run2.length && dirA) || dirB;

    function walk(pos, direction, otherDirection) {
      let [d, stop, canTurn, length] = [
        new Directions(pos.board),
        false,
        false,
        0,
      ];
      let {
        board: { cols },
      } = pos[direction];
      while (
        canTurn === false &&
        stop === false &&
        pos.col.isBetween(0, cols - 1)
      ) {
        if (
          pos.check(otherDirection, 2, 2).every((tile) => tile.isOpen()) &&
          length > 1
        ) {
          canTurn = true;
        } else if (
          pos.check(direction, 2, 2).some((tile) => tile.isBlocked())
        ) {
          stop = true;
        } else {
          length++;
          pos.row += d[direction].row;
          pos.col += d[direction].col;
          if (pos.col < 0) {
            pos.col = cols - 1;
          } else if (pos.col > cols - 1) {
            pos.col = 1;
          }
        }
      }
      return { canTurn, length };
    }
  }
}
