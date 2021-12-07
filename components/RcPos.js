import { Directions } from "./Directions.js";
import { Tile } from './Tile.js';

export class RcPos {

  constructor({ row, col, board }) { this.row = row; this.col = col; this.board = board; }
  
  get left() { let { col, ...props } = this; return new RcPos({ col: --col, ...props }) }
  get right() { let { col, ...props } = this; return new RcPos({ col: ++col, ...props }) }
  get down() { let { row, ...props } = this; return new RcPos({ row: ++row, ...props }) }
  get up() { let { row, ...props } = this; return new RcPos({row: --row, ...props }) } 
  get top() { return this.up }
  get bottom() { return this.down }
  get xyCoordinates() { const { col, row, board: { tileW } } = this; return { x: col * tileW, y: row * tileW } }

  check(dir, width, height) {
    let [results, pos, { typeOf }] = [[], new RcPos(this), Tile];
    if (dir === 'right' && width > 1) { for (let i = 0; i < width; i++) { pos = pos[dir] } }
    else if (dir === 'down' && height > 1) { for (let i = 0; i < height; i++) { pos = pos[dir] } }
    else { pos = pos[dir] }
    results.push(typeOf(Tile.at(pos)));
    if (height > 1 && (dir === 'right' || dir === 'left')) {
      for (let i = 1; i < height; i++) { 
        pos = pos.down;
        results.push(typeOf(Tile.at(pos)));
      }
    }
    else if (width > 1 && (dir === 'up' || dir === 'down')) {
      for (let i = 1; i < width; i++) {
        pos = pos.right;
        results.push(typeOf(Tile.at(pos)));
      }
    }
    return results;
  }

  resolveDirection(dirA, dirB) {
    if (dirA === 'same' || dirA === 'same') { return (dirB === 'same' && dirA) || dirB; }

    const [run1, run2] = [walk(new RcPos(this), dirA), walk(new RcPos(this), dirB)];
    if (run1.canTurn !== run2.canTurn) { return (turns1 && dirA) || dirB }
    return (run1.length < run2.length && dirA) || dirB; 

    function walk(pos, direction) {
      const [{ typeOf }, d, stop, canTurn, length] = [Tile, new Directions(this.board), false, false, 0];
      let { col, board: { cols } } = pos;
      while (canTurn === false && stop === false && col.isBetween(0, cols - 1)) {
        if (pos.check(direction, 2, 2).every(tile => tile.isOpen())) {
          canTurn = true;
        }
        else if (typeOf(Tile.at(pos)).isBlocked()) {
          stop = true;
        }
        else {
          length++;
          pos.row += d[direction].row;
          pos.col += d[direction].col;
        }
      }
      return { canTurn, length};
    }
  }
}