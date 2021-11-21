export class Directions {
    constructor(board) {
      const { tileW, fringeW }  = board;
      this.left = { transform: 'rotateY(180deg)', reverse: 'right' };
      this.right = { transform: 'rotate(0deg)', reverse: 'left' };
      this.up = { transform: 'rotate(90deg) rotateY(180deg)', reverse: 'down' };
      this.down = { transform: 'rotate(90deg)', reverse: 'up' };
  
      for (let dir of ['left', 'right', 'up', 'down']) {
        const obj = this[dir];
        obj.row = /down/.test(dir) ? 1 : /up/.test(dir) ? -1 : 0;
        obj.col = (dir === 'up' || dir === 'down') ? 0 : dir === 'left' ? -1 : 1
        obj.speed = (dir == 'up' || dir === 'left') ? -board.speed : board.speed
        obj.eyetop = (tileW / 6 + fringeW);
        obj.eyeleft = fringeW * 2.5 + obj.col * fringeW * 0.5;
        obj.pupiltop = dir === 'down' ? (tileW / 6 + fringeW * 3 ) : (tileW / 6 + fringeW * 2.5 + obj.row * fringeW * 2)
        obj.pupilleft = (fringeW * 3 + fringeW * obj.col);
      }
    }
  }