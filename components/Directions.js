export class Directions {
  constructor(board) {
    const { tileW: t, fringeW: f } = board;
    this.left = { transform: "rotateY(180deg)", reverse: "right" };
    this.right = { transform: "rotate(0deg)", reverse: "left" };
    this.up = { transform: "rotate(90deg) rotateY(180deg)", reverse: "down" };
    this.down = { transform: "rotate(90deg)", reverse: "up" };

    for (let dir of ["left", "right", "up", "down"]) {
      const obj = this[dir];
      obj.row = /down/.test(dir) ? 1 : /up/.test(dir) ? -1 : 0;
      obj.col = dir === "up" || dir === "down" ? 0 : dir === "left" ? -1 : 1;
      obj.speed = dir == "up" || dir === "left" ? -board.speed : board.speed;
      obj.eyetop = t / 6 + f;
      obj.eyeleft = f * 2.5 + obj.col * f * 0.5;
      obj.pupiltop =
        dir === "down" ? t / 6 + f * 3 : t / 6 + f * 2.5 + obj.row * f * 2;
      obj.pupilleft = f * 3 + f * obj.col;
    }
  }
}
