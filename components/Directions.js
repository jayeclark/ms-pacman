export class Directions {
  constructor(board) {
    this.left = this.props("left", board);
    this.right = this.props("right", board);
    this.up = this.props("up", board);
    this.down = this.props("down", board);
  }

  props(dir, board) {
    const { tileW: t, fringeW: f } = board;
    const row =  /down/.test(dir) ? 1 : /up/.test(dir) ? -1 : 0;
    const col =  /right/.test(dir) ? 1 : /left/.test(dir) ? -1 : 0;
    const [r, rY] = [Math.abs(row) * 90, /down|right/.test(dir) ? 0 : 180];
    const transform = `rotate(${r}deg) rotateY(${rY}deg)`;
    const reverse = 'updown'.includes(dir) ? 'updown'.replace(dir, '') : 'rightleft'.replace(dir, '');
    const speed = /up|left/.test(dir) ? -board.speed : board.speed;
    const eyeLeft = f * (2.5 + col / 2);
    const pupilTop = dir !== 'down' ? t / 6 + f * 2.5 + row * f * 2 : t / 6 + f * 3;
    const pupilLeft = f * (3 + col);
    return { transform, reverse, row, col, speed,  eyeTop: t / 6 + f, eyeLeft, pupilTop, pupilLeft }
  }
}
