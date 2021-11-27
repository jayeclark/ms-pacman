import { Directions } from "./Directions.js";
import { Tile } from './Tile.js';

export class RcPos {

  constructor(row, col, board) { this.row = row; this.col = col; this.board = board; }
  
  get left() { return (new RcPos(this.row, this.col - 1, this.board)) }
  get right() { return (new RcPos(this.row, this.col + 1, this.board)) }
  get bottom() { return (new RcPos(this.row + 1, this.col, this.board)) }
  get down() { return (new RcPos(this.row + 1, this.col, this.board)) }
  get top() { return (new RcPos(this.row - 1, this.col, this.board)) }
  get up() { return (new RcPos(this.row - 1, this.col, this.board)) } 
  get findXY() { return { x: this.col * this.board.tileW, y: this.row * this.board.tileW } }
  get xyCoordinates() { return { x: this.col * this.board.tileW, y: this.row * this.board.tileW } }

  checkRunLength(direction) {
    if (direction === 'same') {return 0;}
    const [{ typeOf }, d] = [Tile, new Directions(this.board)];
    let pos = new RcPos(this.row, this.col, this.board);
    let [hitWall, runCount] = [false, 0];
    while (hitWall === false && pos.col > 0 && pos.col < this.board.cols - 1) {
      if (typeOf(Tile.at(pos)).isBarrier()) {
        hitWall = true;
      } else {
        runCount++; 
        pos.row += d[direction].row;
        pos.col += d[direction].col;
      }
    }
    return runCount;
  }
}