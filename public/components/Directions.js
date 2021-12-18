export default class Directions {
  constructor(board) {
    this.left = Directions.props('left', board);
    this.right = Directions.props('right', board);
    this.up = Directions.props('up', board);
    this.down = Directions.props('down', board);
  }

  static props(dir, { tileW: t, fringeW: f, speed }) {
    let row = dir === 'down' ? 1 : 0;
    if (dir === 'up') { row = -1; }

    let col = dir === 'right' ? 1 : 0;
    if (dir === 'left') { col = -1; }

    const [r, rY] = [row === 0 ? 0 : 90, row + col > 0 ? 0 : 180];
    const dict = {
      left: 'right', down: 'up', right: 'left', up: 'down',
    };
    return {
      row,
      col,
      reverse: dict[dir],
      transform: `rotate(${r}deg) rotateY(${rY}deg)`,
      speed: /up|left/.test(dir) ? -speed : speed,
      eyeTop: t / 6 + f,
      eyeLeft: (f * (5 + col)) / 2,
      pupilTop: dir !== 'down' ? t / 6 + f * (2.5 + row * 2) : t / 6 + f * 3,
      pupilLeft: f * (3 + col),
    };
  }
}
