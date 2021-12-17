export class Directions {
  constructor(board) {
    this.left = this.props("left", board);
    this.right = this.props("right", board);
    this.up = this.props("up", board);
    this.down = this.props("down", board);
  }

  props(dir, { tileW: t, fringeW: f, speed }) {
    const row =  dir === "down" ? 1 : dir === "up" ? -1 : 0;
    const col =  dir === "right" ? 1 : dir === "left" ? -1 : 0;
    const [r, rY] = [row == 0 ? 0 : 90, row + col > 0 ? 0 : 180];
    const transform = `rotate(${r}deg) rotateY(${rY}deg)`;
    const reverse = 'updown'.includes(dir) ? 'updown'.replace(dir, '') : 'rightleft'.replace(dir, '');
    speed = /up|left/.test(dir) ? -speed : speed;
    const [eyeTop, eyeLeft] = [t / 6 + f, f * (5 + col) / 2];
    const pupilTop = dir !== 'down' ? t / 6 + f * 2.5 + row * f * 2 : t / 6 + f * 3;
    const pupilLeft = f * (3 + col);
    return { transform, reverse, row, col, speed, eyeTop, eyeLeft, pupilTop, pupilLeft }
  }
}
